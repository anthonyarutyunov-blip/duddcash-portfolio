/**
 * Layout Store — localStorage-backed CRUD for layout overrides
 *
 * All admin edits (reorder, resize, content changes, new items) live here.
 * Completely separate from portfolio.ts base data.
 */

export type SizeTier = "xs" | "s" | "m" | "l" | "xl"

export interface ItemLayout {
  itemId: string
  order: number
  size: SizeTier
}

export interface TabLayout {
  items: ItemLayout[]
}

export interface VideoLayoutOverride {
  projectId: string
  sectionTitle?: string
  videos: { videoId: string; order: number; size?: SizeTier }[]
}

export interface ContentEdit {
  itemId: string
  field: string
  value: string
}

export interface VideoEdit {
  videoId: string
  field: "title" | "description" | "customThumbnail"
  value: string
}

export interface NewVideo {
  projectId: string
  sectionTitle?: string
  videoId: string
  title: string
  description?: string
  aspectRatio: string
}

export interface NewProject {
  id: string
  type: "project" | "single"
  title: string
  client?: string
  description?: string
  role?: string
  categories: string[]
  videoId: string
  aspectRatio: string
  customThumbnail?: string
}

export interface LayoutOverrides {
  version: 1
  timestamp: string
  tabLayouts: Record<string, TabLayout>
  videoLayouts: VideoLayoutOverride[]
  contentEdits: ContentEdit[]
  videoEdits: VideoEdit[]
  newVideos: NewVideo[]
  newProjects: NewProject[]
  removedVideos: string[]
}

const STORAGE_KEY = "duddcash_layout_overrides"

/** Create a fresh empty overrides object */
export function createEmptyOverrides(): LayoutOverrides {
  return {
    version: 1,
    timestamp: new Date().toISOString(),
    tabLayouts: {},
    videoLayouts: [],
    contentEdits: [],
    videoEdits: [],
    newVideos: [],
    newProjects: [],
    removedVideos: [],
  }
}

/** Load overrides from localStorage (or return empty) */
export function loadOverrides(): LayoutOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as LayoutOverrides
      if (parsed.version === 1) {
        // Backward compat: older overrides may lack newer fields
        if (!parsed.videoEdits) parsed.videoEdits = []
        if (!parsed.removedVideos) parsed.removedVideos = []
        return parsed
      }
    }
  } catch {}
  return createEmptyOverrides()
}

/** Save overrides to localStorage */
export function saveOverrides(overrides: LayoutOverrides) {
  overrides.timestamp = new Date().toISOString()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch (e) {
    console.error("Failed to save layout overrides:", e)
  }
}

/** Clear all overrides */
export function clearOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

/** Check if there are any overrides saved */
export function hasOverrides(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

// ── Tab Layout Operations ────────────────────────────────────

/** Get or create tab layout */
export function getTabLayout(
  overrides: LayoutOverrides,
  tab: string
): TabLayout {
  if (!overrides.tabLayouts[tab]) {
    overrides.tabLayouts[tab] = { items: [] }
  }
  return overrides.tabLayouts[tab]
}

/** Set item order + size for a given tab */
export function setItemLayout(
  overrides: LayoutOverrides,
  tab: string,
  itemId: string,
  order: number,
  size: SizeTier
) {
  const tabLayout = getTabLayout(overrides, tab)
  const existing = tabLayout.items.find((i) => i.itemId === itemId)
  if (existing) {
    existing.order = order
    existing.size = size
  } else {
    tabLayout.items.push({ itemId, order, size })
  }
}

/** Bulk-set items for a tab (after drag-and-drop reorder) */
export function setTabItems(
  overrides: LayoutOverrides,
  tab: string,
  items: ItemLayout[]
) {
  overrides.tabLayouts[tab] = { items }
}

/** Change just the size of one item on a tab */
export function setItemSize(
  overrides: LayoutOverrides,
  tab: string,
  itemId: string,
  size: SizeTier
) {
  const tabLayout = getTabLayout(overrides, tab)
  const existing = tabLayout.items.find((i) => i.itemId === itemId)
  if (existing) {
    existing.size = size
  } else {
    // Add with a high order number — the merge layer will handle it
    tabLayout.items.push({ itemId, order: 9999, size })
  }
}

// ── Video Layout Operations ────────────────────────────────────

/** Set video order within a project */
export function setVideoLayout(
  overrides: LayoutOverrides,
  projectId: string,
  sectionTitle: string | undefined,
  videos: { videoId: string; order: number; size?: SizeTier }[]
) {
  const idx = overrides.videoLayouts.findIndex(
    (v) =>
      v.projectId === projectId &&
      (v.sectionTitle || undefined) === sectionTitle
  )
  const entry: VideoLayoutOverride = { projectId, sectionTitle, videos }
  if (idx >= 0) {
    overrides.videoLayouts[idx] = entry
  } else {
    overrides.videoLayouts.push(entry)
  }
}

/** Set the size of a specific video within a project's video layout */
export function setVideoSize(
  overrides: LayoutOverrides,
  projectId: string,
  sectionTitle: string | undefined,
  videoId: string,
  size: SizeTier
) {
  // Find or create the video layout entry
  let entry = overrides.videoLayouts.find(
    (v) => v.projectId === projectId && (v.sectionTitle || undefined) === sectionTitle
  )
  if (!entry) {
    entry = { projectId, sectionTitle, videos: [] }
    overrides.videoLayouts.push(entry)
  }
  const existing = entry.videos.find((v) => v.videoId === videoId)
  if (existing) {
    existing.size = size
  } else {
    entry.videos.push({ videoId, order: 9999, size })
  }
}

// ── Content Edit Operations ────────────────────────────────────

/** Set a content edit */
export function setContentEdit(
  overrides: LayoutOverrides,
  itemId: string,
  field: string,
  value: string
) {
  const existing = overrides.contentEdits.find(
    (e) => e.itemId === itemId && e.field === field
  )
  if (existing) {
    existing.value = value
  } else {
    overrides.contentEdits.push({ itemId, field, value })
  }
}

// ── Video Edit Operations ────────────────────────────────────

/** Set a per-video content edit (title, description, or customThumbnail) */
export function setVideoEdit(
  overrides: LayoutOverrides,
  videoId: string,
  field: "title" | "description" | "customThumbnail",
  value: string
) {
  const existing = overrides.videoEdits.find(
    (e) => e.videoId === videoId && e.field === field
  )
  if (existing) {
    existing.value = value
  } else {
    overrides.videoEdits.push({ videoId, field, value })
  }
}

// ── Video Removal ────────────────────────────────────────────

/** Mark a video as removed (hides it from merged output) */
export function removeVideo(overrides: LayoutOverrides, videoId: string) {
  if (!overrides.removedVideos.includes(videoId)) {
    overrides.removedVideos.push(videoId)
  }
  // Also remove from newVideos if it was a user-added video
  overrides.newVideos = overrides.newVideos.filter(
    (v) => v.videoId !== videoId
  )
}

// ── Export ────────────────────────────────────────────────────

/** Download overrides as a JSON file */
export function exportOverrides(overrides: LayoutOverrides) {
  const json = JSON.stringify(overrides, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `duddcash-layout-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
