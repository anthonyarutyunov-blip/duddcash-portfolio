// Funnel lead capture: appends one event row per submission step to the
// "Duddcash Funnel Leads" Google Sheet. Append-only event log; the nurture
// engine (outreach_batch/funnel_nurture.py) derives lead state from the
// latest event per email/lead_id.
//
// Env vars (set in Netlify):
//   GOOGLE_SA_EMAIL        service account client_email
//   GOOGLE_SA_PRIVATE_KEY  service account private_key (PEM, \n-escaped ok)
//   FUNNEL_SHEET_ID        spreadsheet id (shared with the service account)
//
// No npm deps: signs the OAuth JWT with node:crypto directly.

import { createSign } from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

let cachedToken: { token: string; exp: number } | null = null;

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 60) return cachedToken.token;

  const email = process.env.GOOGLE_SA_EMAIL;
  let key = process.env.GOOGLE_SA_PRIVATE_KEY || '';
  key = key.replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Missing service account env vars');

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = b64url(signer.sign(key));
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

const COLUMNS = [
  'timestamp',
  'lead_id',
  'event',
  'name',
  'email',
  'phone',
  'company',
  'business_type',
  'role',
  'budget',
  'timeline',
  'notes',
  'utm_source',
  'utm_medium',
  'utm_content',
  'utm_campaign',
  'el',
  'referrer',
  'page',
] as const;

const VALID_EVENTS = new Set(['partial', 'qualified', 'disqualified', 'booked']);

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 10_000) return new Response('Payload too large', { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // Honeypot: pretend success, write nothing.
  if (typeof body.honeypot === 'string' && body.honeypot.trim() !== '') {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const event = String(body.event || '');
  if (!VALID_EVENTS.has(event)) {
    return new Response('Bad request', { status: 400 });
  }

  const clean = (v: unknown): string =>
    String(v ?? '')
      .replace(/[\r\n\t]+/g, ' ')
      .slice(0, 500)
      .trim();

  const row = COLUMNS.map((col) => {
    if (col === 'timestamp') return new Date().toISOString();
    return clean((body as Record<string, unknown>)[col]);
  });

  try {
    const sheetId = process.env.FUNNEL_SHEET_ID;
    if (!sheetId) throw new Error('Missing FUNNEL_SHEET_ID');
    const token = await getAccessToken();
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Leads!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [row] }),
      }
    );
    if (!res.ok) {
      console.error('Sheets append failed', res.status, await res.text());
      return new Response(JSON.stringify({ ok: false }), { status: 502 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('capture-lead error', err);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
};
