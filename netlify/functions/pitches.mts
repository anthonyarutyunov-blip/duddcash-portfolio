// Pitch CRUD API — admin-only, gated by the PITCH_SECRET env var.
//
//   GET    /.netlify/functions/pitches           → list (summaries)
//   GET    /.netlify/functions/pitches?slug=x    → one full pitch
//   POST   /.netlify/functions/pitches           → create  { slug, url }
//   PUT    /.netlify/functions/pitches?slug=x    → update (slug never changes)
//   DELETE /.netlify/functions/pitches?slug=x    → delete
//
// Auth: request header `x-pitch-secret` must match env var PITCH_SECRET
// (timing-safe compare). Env vars are set in the Netlify UI; changes take
// effect on the next deploy.
//
// Storage: Netlify Blobs, store "pitches", key = slug, strong consistency
// so a freshly published link works immediately.

import { getStore } from '@netlify/blobs';
import { createHash, timingSafeEqual } from 'node:crypto';
import {
  validatePitchBody,
  generateSlug,
  type Pitch,
} from './lib/pitch-types.mts';

const MAX_BODY_BYTES = 200 * 1024;

function pitchStore() {
  return getStore({ name: 'pitches', consistency: 'strong' });
}

function authorized(req: Request): boolean {
  const secret = process.env.PITCH_SECRET;
  if (!secret) return false;
  const given = req.headers.get('x-pitch-secret') || '';
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(secret).digest();
  return timingSafeEqual(a, b);
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export default async (req: Request): Promise<Response> => {
  if (!process.env.PITCH_SECRET) {
    return json(500, { error: 'Pitch system not configured (PITCH_SECRET missing)' });
  }
  if (!authorized(req)) {
    return json(401, { error: 'Unauthorized' });
  }

  const url = new URL(req.url);
  const slug = (url.searchParams.get('slug') || '').trim();
  const store = pitchStore();

  try {
    switch (req.method) {
      case 'GET': {
        if (slug) {
          const pitch = (await store.get(slug, { type: 'json' })) as Pitch | null;
          if (!pitch) return json(404, { error: 'Not found' });
          return json(200, pitch);
        }
        // List all — summaries, newest first
        const { blobs } = await store.list();
        const pitches = (
          await Promise.all(
            blobs.map(async (b) => {
              const p = (await store.get(b.key, { type: 'json' })) as Pitch | null;
              if (!p) return null;
              return {
                slug: p.slug,
                title: p.title,
                clientName: p.clientName,
                itemCount: p.items?.length ?? 0,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
              };
            })
          )
        ).filter(Boolean) as Array<Record<string, unknown>>;
        pitches.sort((a, b) =>
          String(b.updatedAt).localeCompare(String(a.updatedAt))
        );
        return json(200, { pitches });
      }

      case 'POST': {
        const raw = await readBody(req);
        const body = validatePitchBody(raw);
        // Slug: collision-checked, up to 3 attempts
        let newSlug = '';
        for (let i = 0; i < 3; i++) {
          const candidate = generateSlug(body.title);
          const existing = await store.get(candidate);
          if (existing === null) {
            newSlug = candidate;
            break;
          }
        }
        if (!newSlug) return json(500, { error: 'Could not allocate slug' });
        const now = new Date().toISOString();
        const pitch: Pitch = {
          ...body,
          slug: newSlug,
          createdAt: now,
          updatedAt: now,
        };
        await store.setJSON(newSlug, pitch);
        return json(201, { slug: newSlug, url: `${url.origin}/p/${newSlug}` });
      }

      case 'PUT': {
        if (!slug) return json(400, { error: 'slug required' });
        const existing = (await store.get(slug, { type: 'json' })) as Pitch | null;
        if (!existing) return json(404, { error: 'Not found' });
        const raw = await readBody(req);
        const body = validatePitchBody(raw);
        const pitch: Pitch = {
          ...body,
          slug, // slug NEVER changes — sent links keep working after edits
          createdAt: existing.createdAt,
          updatedAt: new Date().toISOString(),
        };
        await store.setJSON(slug, pitch);
        return json(200, { slug, url: `${url.origin}/p/${slug}` });
      }

      case 'DELETE': {
        if (!slug) return json(400, { error: 'slug required' });
        await store.delete(slug);
        return json(200, { deleted: slug });
      }

      default:
        return json(405, { error: 'Method not allowed' });
    }
  } catch (err: any) {
    const msg = String(err?.message || 'Error');
    // Validation errors → 400; size cap → 413; anything else → 500
    if (msg === '__TOO_LARGE__') return json(413, { error: 'Payload too large' });
    if (
      /required|invalid|too many|film \d+/i.test(msg)
    ) {
      return json(400, { error: msg });
    }
    console.error('pitches function error:', err);
    return json(500, { error: 'Internal error' });
  }
};

async function readBody(req: Request): Promise<unknown> {
  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    throw new Error('__TOO_LARGE__');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid payload');
  }
}
