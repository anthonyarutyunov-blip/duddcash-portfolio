// Shared pitch types + validation + slug helpers for the pitch functions.
// Twin of the client-side types in src/lib/pitch-api.ts — keep in sync.

import { randomBytes } from 'node:crypto';

export interface PitchItem {
  /** Bare Bunny GUID (normalized before save) */
  videoId: string;
  /** Snapshot of the merged title at publish time */
  title: string;
  description?: string;
  /** e.g. "16/9" | "9/16" | "4/3" | "1/1" | "4/5" */
  aspectRatio: string;
  /** Absolute or site-relative poster URL snapshotted at publish */
  posterUrl: string;
  /** Portfolio item id this film came from (informational) */
  projectRef?: string;
  /** Optional link to the full-quality master file (Dropbox/Bunny storage/…) */
  masterDownloadUrl?: string;
  /** Optional link to the piece on Instagram */
  instagramUrl?: string;
}

export interface Pitch {
  version: 1;
  slug: string;
  title: string;
  clientName?: string;
  note?: string;
  heroVideoId?: string;
  /** Absolute OG image URL resolved at publish (hero poster) */
  ogImage: string;
  items: PitchItem[];
  createdAt: string;
  updatedAt: string;
}

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Extract a bare GUID from a raw id or a full player URL */
export function normalizeVideoId(videoId: string): string {
  const m = String(videoId).match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return m ? m[0] : String(videoId);
}

function cleanStr(v: unknown, max: number): string {
  // Strip control characters only; keep all printable text intact
  return String(v ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);
}

const ASPECTS = new Set(['16/9', '9/16', '4/3', '3/4', '1/1', '4/5', '21/9']);

/**
 * Validate + sanitize an incoming pitch payload (without slug/timestamps —
 * those are assigned by the API). Returns the clean pitch body or throws
 * an Error whose message is safe to return as a 400.
 */
export function validatePitchBody(raw: any): Omit<Pitch, 'slug' | 'createdAt' | 'updatedAt'> {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid payload');

  const title = cleanStr(raw.title, 120);
  if (!title) throw new Error('Title is required');

  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    throw new Error('At least one film is required');
  }
  if (raw.items.length > 40) throw new Error('Too many films (max 40)');

  const items: PitchItem[] = raw.items.map((it: any, i: number) => {
    const videoId = normalizeVideoId(cleanStr(it?.videoId, 200));
    if (!GUID_RE.test(videoId)) {
      throw new Error(`Film ${i + 1}: invalid video id`);
    }
    const aspectRatio = ASPECTS.has(String(it?.aspectRatio))
      ? String(it.aspectRatio)
      : '16/9';
    const posterUrl = cleanStr(it?.posterUrl, 500);
    const item: PitchItem = {
      videoId,
      title: cleanStr(it?.title, 160) || `Film ${i + 1}`,
      aspectRatio,
      posterUrl:
        posterUrl ||
        `https://vz-4fcbca30-3f7.b-cdn.net/${videoId}/thumbnail.jpg`,
    };
    const description = cleanStr(it?.description, 500);
    if (description) item.description = description;
    const projectRef = cleanStr(it?.projectRef, 120);
    if (projectRef) item.projectRef = projectRef;
    const master = cleanStr(it?.masterDownloadUrl, 800);
    if (master && /^https?:\/\//i.test(master)) item.masterDownloadUrl = master;
    const insta = cleanStr(it?.instagramUrl, 800);
    if (insta && /^https?:\/\//i.test(insta)) item.instagramUrl = insta;
    return item;
  });

  const heroRaw = normalizeVideoId(cleanStr(raw.heroVideoId, 200));
  const heroVideoId = items.some((it) => it.videoId === heroRaw)
    ? heroRaw
    : items[0].videoId;

  const hero = items.find((it) => it.videoId === heroVideoId)!;
  const ogImage = /^https?:\/\//i.test(hero.posterUrl)
    ? hero.posterUrl
    : `https://duddcashstudios.com${hero.posterUrl.startsWith('/') ? '' : '/'}${hero.posterUrl}`;

  const body: Omit<Pitch, 'slug' | 'createdAt' | 'updatedAt'> = {
    version: 1,
    title,
    heroVideoId,
    ogImage,
    items,
  };
  const clientName = cleanStr(raw.clientName, 120);
  if (clientName) body.clientName = clientName;
  const note = cleanStr(raw.note, 2000);
  if (note) body.note = note;
  return body;
}

/** URL-safe slug: kebab(title) + "-" + 4 unambiguous random chars */
export function generateSlug(title: string): string {
  const kebab = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '') || 'pitch';
  const charset = '23456789abcdefghjkmnpqrstuvwxyz';
  const bytes = randomBytes(4);
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += charset[bytes[i] % charset.length];
  return `${kebab}-${suffix}`;
}
