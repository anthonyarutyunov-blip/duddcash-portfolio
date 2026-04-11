/**
 * Layout Merge — applies layout overrides to base portfolio data at runtime
 *
 * This is the bridge between the read-only portfolio.ts and the admin's
 * localStorage overrides. When edit mode is off, it behaves identically
 * to the original getCardSize / order sort. When overrides exist, they
 * take precedence.
 */

import type { PortfolioItem, BunnyVideo } from "../data/portfolio"
import { getCardAspectRatio } from "../data/portfolio"
import type { LayoutOverrides, SizeTier } from "./layout-store"
import { loadOverrides } from "./layout-store"

/** Column span for each size tier in the 12-column grid */
export const SIZE_TO_SPAN: Record<SizeTier, number> = {
  xs: 2,
  s: 3,
  m: 3,
  l: 6,
  xl: 12,
}

export interface MergedItem {
  item: PortfolioItem
  order: number
  size: SizeTier
  colSpan: number
}

/**
 * Returns items for a given tab with overrides applied.
 * Falls back to base data ordering + default "m" size when no overrides exist.
 */
export function getMergedItems(
  baseItems: PortfolioItem[],
  currentTab: string,
  overrides?: LayoutOverrides | null
): MergedItem[] {
  const ov = overrides ?? loadOverrides()
  const tabLayout = ov.tabLayouts[currentTab]

  // Apply content edits to items
  const editedItems = baseItems.map((item) => {
    const edits = ov.contentEdits.filter((e) => e.itemId === item.id)
    if (edits.length === 0) return item

    // Deep clone to avoid mutating original portfolio data
    const clone = { ...item } as any
    // Deep clone sections array so section-level edits don't mutate originals
    if (clone.sections) {
      clone.sections = clone.sections.map((s: any) => ({ ...s }))
    }
    for (const edit of edits) {
      if (edit.field === "title") clone.title = edit.value
      else if (edit.field === "description") clone.description = edit.value
      else if (edit.field === "role") clone.role = edit.value
      else if (edit.field === "client" && "client" in clone) clone.client = edit.value
      else if (edit.field === "customThumbnail") clone.customThumbnail = edit.value || undefined
      else if (edit.field === "credits") {
        try { clone.credits = JSON.parse(edit.value) } catch {}
      } else if (edit.field.startsWith("section:") && clone.type === "project" && clone.sections) {
        // Handle section-level edits: field = "section:{sectionTitle}:{subfield}"
        const parts = edit.field.split(":")
        if (parts.length === 3) {
          const sectionTitle = parts[1]
          const subfield = parts[2]
          const section = clone.sections.find((s: any) => s.title === sectionTitle)
          if (section) {
            if (subfield === "credits") {
              try { section.credits = JSON.parse(edit.value) } catch {}
            } else if (subfield === "description") {
              section.description = edit.value
            } else if (subfield === "role") {
              section.role = edit.value
            }
          }
        }
      }
    }
    return clone as PortfolioItem
  })

  // Convert newProjects into PortfolioItem-shaped objects
  const newProjectItems: PortfolioItem[] = ov.newProjects.map((np) => {
    if (np.type === "single") {
      return {
        id: np.id,
        type: "single" as const,
        title: np.title,
        client: np.client,
        description: np.description,
        role: np.role,
        categories: np.categories as any,
        order: 9999,
        video: {
          videoId: np.videoId,
          title: np.title,
          aspectRatio: np.aspectRatio,
        },
        customThumbnail: np.customThumbnail,
      } as any
    }
    // project type
    return {
      id: np.id,
      type: "project" as const,
      title: np.title,
      client: np.client,
      description: np.description,
      role: np.role,
      categories: np.categories as any,
      order: 9999,
      thumbnailVideoId: np.videoId,
      videos: [{ videoId: np.videoId, title: np.title, aspectRatio: np.aspectRatio }],
      customThumbnail: np.customThumbnail,
    } as any
  })

  // Apply content edits to new projects too (same logic as base items)
  const editedNewItems = newProjectItems.map((item) => {
    const edits = ov.contentEdits.filter((e) => e.itemId === item.id)
    if (edits.length === 0) return item

    const clone = { ...item } as any
    for (const edit of edits) {
      if (edit.field === "title") clone.title = edit.value
      else if (edit.field === "description") clone.description = edit.value
      else if (edit.field === "role") clone.role = edit.value
      else if (edit.field === "client" && "client" in clone) clone.client = edit.value
      else if (edit.field === "customThumbnail") clone.customThumbnail = edit.value || undefined
      else if (edit.field === "credits") {
        try { clone.credits = JSON.parse(edit.value) } catch {}
      }
    }
    return clone as PortfolioItem
  })

  // Deduplicate: if a newProject's ID already exists in base data, skip it
  const baseIds = new Set(editedItems.map((item) => item.id))
  const dedupedNewItems = editedNewItems.filter((item) => !baseIds.has(item.id))
  const allItems = [...editedItems, ...dedupedNewItems]

  // Filter items for this tab
  const filtered =
    currentTab === "All"
      ? [...allItems]
      : allItems.filter((item) => item.categories.includes(currentTab as any))

  // Build merged list
  const merged: MergedItem[] = filtered.map((item) => {
    const layoutItem = tabLayout?.items.find((i) => i.itemId === item.id)
    return {
      item,
      order: layoutItem?.order ?? item.order,
      size: layoutItem?.size ?? "m",
      colSpan: SIZE_TO_SPAN[layoutItem?.size ?? "m"],
    }
  })

  // Sort by order
  merged.sort((a, b) => a.order - b.order)

  return merged
}

/**
 * Get merged videos for a project (handles both flat and sectioned).
 * Returns the videos in override order, or original order if no overrides.
 */
export function getMergedVideos(
  projectId: string,
  sectionTitle: string | undefined,
  baseVideos: BunnyVideo[],
  overrides?: LayoutOverrides | null
): BunnyVideo[] {
  const ov = overrides ?? loadOverrides()

  const videoLayout = ov.videoLayouts.find(
    (v) =>
      v.projectId === projectId &&
      (v.sectionTitle || undefined) === sectionTitle
  )

  // Filter removed videos even when no layout overrides exist
  const removed = new Set(ov.removedVideos || [])

  // Include any new videos added for this project/section
  const newVideos = ov.newVideos
    .filter(
      (nv) =>
        nv.projectId === projectId &&
        (nv.sectionTitle || undefined) === sectionTitle
    )
    .map((nv) => ({
      videoId: nv.videoId,
      title: nv.title,
      description: nv.description,
      aspectRatio: nv.aspectRatio,
    }))

  // Deduplicate: if a newVideo's ID already exists in base data, skip it
  const baseVideoIds = new Set(baseVideos.map((v) => v.videoId))
  const dedupedNewVideos = newVideos.filter((v) => !baseVideoIds.has(v.videoId))

  // Filter out removed videos and combine with new videos
  const allVideos = [...baseVideos, ...dedupedNewVideos].filter(
    (v) => !removed.has(v.videoId)
  )

  // Apply per-video content edits (title, description) — always, regardless of layout overrides
  const editedVideos = allVideos.map((v) => {
    const edits = (ov.videoEdits || []).filter((e) => e.videoId === v.videoId)
    if (edits.length === 0) return v
    const clone = { ...v }
    for (const edit of edits) {
      if (edit.field === "title") clone.title = edit.value
      else if (edit.field === "description") clone.description = edit.value
    }
    return clone
  })

  if (!videoLayout) {
    return editedVideos
  }

  // Sort base videos according to override order
  const orderMap = new Map(
    videoLayout.videos.map((v) => [v.videoId, v.order])
  )

  return editedVideos.sort((a, b) => {
    const orderA = orderMap.get(a.videoId) ?? 9999
    const orderB = orderMap.get(b.videoId) ?? 9999
    return orderA - orderB
  })
}

/**
 * Get column span for an item given current tab and overrides.
 * Used by PortfolioGrid to set grid-column CSS.
 */
export function getColSpan(
  itemId: string,
  currentTab: string,
  overrides?: LayoutOverrides | null
): number {
  const ov = overrides ?? loadOverrides()
  const tabLayout = ov.tabLayouts[currentTab]
  const layoutItem = tabLayout?.items.find((i) => i.itemId === itemId)
  return SIZE_TO_SPAN[layoutItem?.size ?? "m"]
}

/**
 * Get size tier for an item on a given tab.
 */
export function getItemSize(
  itemId: string,
  currentTab: string,
  overrides?: LayoutOverrides | null
): SizeTier {
  const ov = overrides ?? loadOverrides()
  const tabLayout = ov.tabLayouts[currentTab]
  const layoutItem = tabLayout?.items.find((i) => i.itemId === itemId)
  return layoutItem?.size ?? "m"
}

/**
 * Get the merged aspect ratio for a project card on the main grid.
 * If videos have been reordered via overrides, uses the new first video's
 * aspect ratio. Otherwise falls back to base data.
 */
export function getMergedCardAspectRatio(
  item: PortfolioItem,
  overrides?: LayoutOverrides | null
): string {
  const ov = overrides ?? loadOverrides()

  if (item.type === "project") {
    // Determine which section (or flat videos) to check
    const sectionTitle = item.sections?.[0]?.title
    const videoLayout = ov.videoLayouts.find(
      (v) =>
        v.projectId === item.id &&
        (v.sectionTitle || undefined) === (sectionTitle || undefined)
    )

    if (videoLayout && videoLayout.videos.length > 0) {
      // Find the video with the lowest order (first in the reordered list)
      const sorted = [...videoLayout.videos].sort((a, b) => a.order - b.order)
      const firstVideoId = sorted[0].videoId

      // Look up aspect ratio from base data + new videos
      const allBaseVideos = item.sections
        ? item.sections.flatMap((s) => s.videos)
        : item.videos
      const newVids = ov.newVideos
        .filter((nv) => nv.projectId === item.id)
        .map((nv) => ({ videoId: nv.videoId, aspectRatio: nv.aspectRatio }))
      const allVids = [...allBaseVideos, ...newVids]
      const match = allVids.find((v) => v.videoId === firstVideoId)
      if (match?.aspectRatio) return match.aspectRatio
    }
  }

  // Fallback to base data logic
  return getCardAspectRatio(item)
}
