// Serves client-facing pitch pages at /p/<slug> (netlify.toml 200 rewrite).
//
// Flow: slug from path → pitch JSON from Blobs → fetch the statically-built
// viewer shell at /pitch-viewer/ (stable URL; its hashed /_astro assets are
// already correct for the current deploy) → replace sentinels:
//   <title>…</title>                       → pitch title
//   <script id="__PITCH_DATA__">null</script> → pitch JSON
//   __PITCH_TITLE__ / __PITCH_CLIENT__     → veil text (pre-hydration)
//   </head>                                → OG/meta block + </head>
//
// NOTE: [[headers]] blocks in netlify.toml do NOT apply to function
// responses — all headers are set here.

import { getStore } from '@netlify/blobs';
import type { Pitch } from './lib/pitch-types.mts';

// Module-scope cache of the viewer shell (per warm lambda). Cold starts —
// which follow every deploy — refetch, so new hashed assets are picked up.
let shellCache: { origin: string; html: string; fetchedAt: number } | null = null;
const SHELL_TTL_MS = 5 * 60 * 1000;

const HTML_HEADERS: Record<string, string> = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-cache',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function getShell(origin: string): Promise<string | null> {
  const now = Date.now();
  if (
    shellCache &&
    shellCache.origin === origin &&
    now - shellCache.fetchedAt < SHELL_TTL_MS
  ) {
    return shellCache.html;
  }
  try {
    const res = await fetch(`${origin}/pitch-viewer/`, {
      headers: { 'x-pitch-shell-fetch': '1' },
    });
    if (!res.ok) throw new Error(`shell fetch ${res.status}`);
    const html = await res.text();
    if (!html.includes('__PITCH_DATA__')) throw new Error('shell missing sentinel');
    shellCache = { origin, html, fetchedAt: now };
    return html;
  } catch (err) {
    console.error('pitch-page shell fetch failed:', err);
    // Serve stale on failure if we have anything
    return shellCache?.origin === origin ? shellCache.html : null;
  }
}

function notFoundPage(): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Screening unavailable | Duddcash Studios</title>
<style>html,body{margin:0;height:100%;background:#141414;color:#f2f2f2;font-family:system-ui,-apple-system,sans-serif}
.w{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100svh;gap:10px;text-align:center;padding:0 24px}
.t{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45)}
.h{font-size:22px;font-weight:500}.s{font-size:13px;color:rgba(255,255,255,.4)}
a{color:rgba(255,255,255,.7)}</style></head><body><div class="w">
<div class="t">Duddcash Studios</div>
<div class="h">This screening is no longer available</div>
<div class="s">The link may have expired or been replaced. <a href="https://duddcashstudios.com">duddcashstudios.com</a></div>
</div></body></html>`;
  return new Response(html, { status: 404, headers: HTML_HEADERS });
}

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  // /p/<slug> path (preserved by the 200 rewrite), ?slug= fallback
  const pathMatch = url.pathname.match(/^\/p\/([a-z0-9-]+)\/?$/i);
  const slug = (pathMatch?.[1] || url.searchParams.get('slug') || '').trim();
  if (!slug) return notFoundPage();

  const store = getStore({ name: 'pitches', consistency: 'strong' });
  const pitch = (await store.get(slug, { type: 'json' }).catch(() => null)) as Pitch | null;
  if (!pitch) return notFoundPage();

  const shell = await getShell(url.origin);
  if (!shell) {
    return new Response('Temporarily unavailable', {
      status: 503,
      headers: { ...HTML_HEADERS, 'Retry-After': '5', 'Content-Type': 'text/plain' },
    });
  }

  const pageTitle = `${pitch.title} | Duddcash Studios`;
  const description =
    pitch.note?.slice(0, 200) ||
    `A private screening prepared by Duddcash Studios${pitch.clientName ? ` for ${pitch.clientName}` : ''}.`;
  const canonical = `${url.origin}/p/${pitch.slug}`;

  const metaBlock = `
    <link rel="canonical" href="${esc(canonical)}" />
    <meta property="og:type" content="video.other" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:title" content="${esc(pageTitle)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(pitch.ogImage)}" />
    <meta property="og:image:width" content="1280" />
    <meta property="og:image:height" content="720" />
    <meta property="og:site_name" content="Duddcash Studios" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(pageTitle)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(pitch.ogImage)}" />
  `;

  // <-escape so pitch text can never break out of the script tag
  const dataJson = JSON.stringify(pitch).replace(/</g, '\\u003c');

  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(pageTitle)}</title>`)
    .replace(
      /(<script type="application\/json" id="__PITCH_DATA__">)[\s\S]*?(<\/script>)/,
      `$1${dataJson}$2`
    )
    .replace(/__PITCH_TITLE__/g, esc(pitch.title))
    .replace(
      /__PITCH_CLIENT__/g,
      esc(pitch.clientName ? `Prepared for ${pitch.clientName}` : 'A private screening')
    )
    .replace('</head>', `${metaBlock}</head>`);

  return new Response(html, { status: 200, headers: HTML_HEADERS });
};
