/**
 * Pitch API client — talks to /.netlify/functions/pitches with the
 * x-pitch-secret header. The secret is entered once in the admin UI and
 * kept in localStorage; a 401 clears it so the prompt reappears.
 *
 * Types are a twin of netlify/functions/lib/pitch-types.mts — keep in sync.
 */

export interface PitchItem {
  videoId: string
  title: string
  description?: string
  aspectRatio: string
  posterUrl: string
  projectRef?: string
  masterDownloadUrl?: string
}

export interface Pitch {
  version: 1
  slug: string
  title: string
  clientName?: string
  note?: string
  heroVideoId?: string
  ogImage: string
  items: PitchItem[]
  createdAt: string
  updatedAt: string
}

export interface PitchSummary {
  slug: string
  title: string
  clientName?: string
  itemCount: number
  createdAt: string
  updatedAt: string
}

/** Body sent on create/update (server assigns slug + timestamps + ogImage) */
export type PitchDraft = {
  title: string
  clientName?: string
  note?: string
  heroVideoId?: string
  items: Omit<PitchItem, never>[]
}

const API = "/.netlify/functions/pitches"
const SECRET_KEY = "duddcash_pitch_secret"

export class PitchAuthError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "PitchAuthError"
  }
}

export function getPitchSecret(): string | null {
  try {
    return localStorage.getItem(SECRET_KEY)
  } catch {
    return null
  }
}

export function setPitchSecret(secret: string): void {
  try {
    localStorage.setItem(SECRET_KEY, secret.trim())
  } catch {}
}

export function clearPitchSecret(): void {
  try {
    localStorage.removeItem(SECRET_KEY)
  } catch {}
}

async function call<T>(
  method: string,
  params: Record<string, string> = {},
  body?: unknown
): Promise<T> {
  const secret = getPitchSecret()
  if (!secret) throw new PitchAuthError()
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${API}${qs ? `?${qs}` : ""}`, {
    method,
    headers: {
      "x-pitch-secret": secret,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    clearPitchSecret()
    throw new PitchAuthError()
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as any)?.error || `Request failed (${res.status})`)
  }
  return data as T
}

export function listPitches(): Promise<{ pitches: PitchSummary[] }> {
  return call("GET")
}

export function getPitch(slug: string): Promise<Pitch> {
  return call("GET", { slug })
}

export function createPitch(
  draft: PitchDraft
): Promise<{ slug: string; url: string }> {
  return call("POST", {}, draft)
}

export function updatePitch(
  slug: string,
  draft: PitchDraft
): Promise<{ slug: string; url: string }> {
  return call("PUT", { slug }, draft)
}

export function deletePitch(slug: string): Promise<{ deleted: string }> {
  return call("DELETE", { slug })
}
