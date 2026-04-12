import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react"
import { Play, Pencil, FolderOpen } from "lucide-react"
import { SpotlightCard } from "../ui/spotlight-card"
import { CardPreview } from "./CardPreview"
import { ExpandedProject } from "./ExpandedProject"
import { thumbnailUrl } from "../../lib/bunny"
import { type PortfolioItem } from "../../data/portfolio"
import { getMergedCardAspectRatio, getMergedVideos } from "../../lib/layout-merge"
import { SizeSelector } from "../admin/SizeSelector"
import { ContentEditor } from "../admin/ContentEditor"
import type { SizeTier } from "../../lib/layout-store"

interface PortfolioCardProps {
  item: PortfolioItem
  isExpanded: boolean
  isBentoWide?: boolean
  onExpand: () => void
  onCollapse: () => void
  editMode?: boolean
  currentSize?: SizeTier
  onSizeChange?: (size: SizeTier) => void
}

/**
 * Portfolio card with:
 * - Static thumbnail by default
 * - Hover: plays short muted video preview (desktop only)
 * - Click: expands in-place to show full project
 * - Edit mode: drag handle, size selector, edit button
 */
export function PortfolioCard({
  item,
  isExpanded,
  isBentoWide = false,
  onExpand,
  onCollapse,
  editMode = false,
  currentSize = "m",
  onSizeChange,
}: PortfolioCardProps) {
  const [hovered, setHovered] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)

  // Get the video ID for thumbnail/preview
  const primaryVideoId =
    item.type === "project" ? item.thumbnailVideoId : item.video.videoId
  const customThumb = item.customThumbnail
  const nativeAspectRatio = getMergedCardAspectRatio(item)

  // Debounced hover — 150ms delay to skip quick mouse-throughs
  const handleMouseEnter = useCallback(() => {
    hoverTimer.current = setTimeout(() => setHovered(true), 150)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHovered(false)
  }, [])

  // ── Expand / Collapse scroll management ──
  //
  // The problem: when a card expands, all OTHER cards are removed from the DOM
  // (displayItems filters to just the expanded one). This can shrink page height
  // drastically. If the user's scroll position is now beyond the new page bottom,
  // the browser clamps to the footer.
  //
  // The fix: LOCK the portfolio section's height before React removes cards,
  // then use useLayoutEffect (runs before browser paint) to scroll to the
  // card's new position, then release the height lock.

  const lockHeight = useCallback(() => {
    const section = document.getElementById("portfolio")
    if (section) section.style.minHeight = `${section.offsetHeight}px`
  }, [])

  const handleClick = useCallback(() => {
    if (editMode) return
    if (!isExpanded) {
      lockHeight()
      onExpand()
    }
  }, [isExpanded, onExpand, editMode, lockHeight])

  const handleEditModeExpand = useCallback(() => {
    lockHeight()
    onExpand()
  }, [onExpand, lockHeight])

  // Runs synchronously AFTER React commits DOM changes but BEFORE browser paints.
  // This eliminates the single visible frame at the wrong scroll position.
  //
  // IMPORTANT: Lenis IS active on mobile too, so we must check isMobile FIRST.
  // On mobile we scroll to the stable #portfolio section (not the card, whose
  // position is unreliable during the DOM churn of expand/collapse).
  useLayoutEffect(() => {
    if (!isExpanded || !cardRef.current) return
    const section = document.getElementById("portfolio")
    const lenis = (window as any).__lenis

    if (isMobile && section) {
      // Mobile: use Lenis scrollTo with NUMERIC position so Lenis's internal
      // scroll state stays in sync. Native scrollIntoView doesn't update Lenis,
      // causing it to "correct" back to the old deep position on next RAF.
      const scrollTarget = section.getBoundingClientRect().top + window.scrollY
      if (lenis) {
        lenis.scrollTo(scrollTarget, { immediate: true, force: true })
      } else {
        window.scrollTo(0, scrollTarget)
      }
      // Release height lock and sync Lenis with new page dimensions
      const unlockTimer = setTimeout(() => {
        if (section) section.style.minHeight = ""
        void document.body.offsetHeight
        if (lenis) lenis.resize()
      }, 200)
      return () => {
        clearTimeout(unlockTimer)
        if (section) section.style.minHeight = ""
      }
    }

    // Desktop: use Lenis
    if (lenis) {
      lenis.resize()
      lenis.scrollTo(cardRef.current, { offset: -100, immediate: true })
    }
    const unlockTimer = setTimeout(() => {
      if (section) section.style.minHeight = ""
      if (lenis) lenis.resize()
    }, 60)
    return () => {
      clearTimeout(unlockTimer)
      if (section) section.style.minHeight = ""
    }
  }, [isExpanded, isMobile])

  // Keep Lenis synced as expanded content loads (videos, images change height).
  // SKIP on mobile — Lenis delegates to native scroll on touch devices, which
  // handles resize automatically. Calling lenis.resize() on mobile during content
  // loading causes scroll-position corrections that manifest as scroll jumps.
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!isExpanded || !cardRef.current || isMobile) return
    const lenis = (window as any).__lenis
    if (!lenis) return

    const ro = new ResizeObserver(() => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current)
      resizeTimer.current = setTimeout(() => lenis.resize(), 80)
    })
    ro.observe(cardRef.current)

    const timer = setTimeout(() => ro.disconnect(), 3000)
    return () => {
      ro.disconnect()
      clearTimeout(timer)
      if (resizeTimer.current) clearTimeout(resizeTimer.current)
    }
  }, [isExpanded, isMobile])

  const handleCollapse = useCallback(() => {
    // On collapse, page gets TALLER (all cards return) — no height clamping risk.
    // Lock height so the transition is smooth, then scroll to card in grid.
    lockHeight()
    onCollapse()
  }, [onCollapse, lockHeight])

  // Collapse scroll management — same isMobile-first pattern.
  const prevExpandedRef = useRef(isExpanded)
  useLayoutEffect(() => {
    const wasExpanded = prevExpandedRef.current
    prevExpandedRef.current = isExpanded

    if (wasExpanded && !isExpanded) {
      const section = document.getElementById("portfolio")
      const lenis = (window as any).__lenis

      if (isMobile && section) {
        // Mobile: use Lenis scrollTo with numeric position to keep internal state in sync
        const scrollTarget = section.getBoundingClientRect().top + window.scrollY
        if (lenis) {
          lenis.scrollTo(scrollTarget, { immediate: true, force: true })
        } else {
          window.scrollTo(0, scrollTarget)
        }
        setTimeout(() => {
          if (section) section.style.minHeight = ""
          void document.body.offsetHeight
          if (lenis) lenis.resize()
        }, 200)
      } else {
        // Desktop: use Lenis to scroll to card's grid position
        if (lenis && cardRef.current) {
          lenis.resize()
          lenis.scrollTo(cardRef.current, { offset: -100, immediate: true })
        }
        setTimeout(() => {
          if (section) section.style.minHeight = ""
          if (lenis) lenis.resize()
        }, 60)
      }
    }
  }, [isExpanded, isMobile])

  return (
    <div
      ref={cardRef}
      style={{
        gridColumn: isExpanded ? "1 / -1" : undefined,
      }}
    >
      <SpotlightCard glowColor="blue" disabled={isExpanded}>
        {isExpanded ? (
          <ExpandedProject item={item} onClose={handleCollapse} />
        ) : (
          <div
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            aria-label={`View ${item.title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleClick()
              }
            }}
            style={{
              cursor: editMode ? "grab" : "pointer",
              overflow: "hidden",
              position: "relative",
              aspectRatio: nativeAspectRatio,
              borderRadius: 12,
            }}
            className="portfolio-card"
          >
            {/* Static thumbnail */}
            <img
              src={customThumb || thumbnailUrl(primaryVideoId)}
              alt={item.title}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.5s ease",
              }}
            />

            {/* Hover video preview (desktop only, not in edit mode) */}
            {!editMode && (
              <CardPreview videoId={primaryVideoId} active={hovered} />
            )}

            {/* Edit mode overlays */}
            {editMode && (
              <>
                {/* Size selector */}
                {onSizeChange && (
                  <SizeSelector
                    currentSize={currentSize}
                    onChange={onSizeChange}
                  />
                )}

                {/* Top-right button row: Edit + Open */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {/* Edit content button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setShowEditor(true)
                    }}
                    title="Edit content"
                    style={editModeBtnStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.9)"
                      e.currentTarget.style.color = "#fff"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.75)"
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)"
                    }}
                  >
                    <Pencil size={12} />
                  </button>

                  {/* Open / expand button (for projects with videos inside) */}
                  {(item.type === "project" ||
                    (item.type === "single" && item.video)) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleEditModeExpand()
                      }}
                      title="Open project"
                      style={editModeBtnStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.9)"
                        e.currentTarget.style.color = "#fff"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.75)"
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)"
                      }}
                    >
                      <FolderOpen size={12} />
                    </button>
                  )}
                </div>

                {/* Drag handle is rendered by SortableCard wrapper */}

                {/* Edit mode border */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 12,
                    border: "2px dashed rgba(74,222,128,0.3)",
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                />
              </>
            )}

            {/* Layer 1: Always-visible bottom info */}
            <div className="portfolio-card__info">
              <span className="portfolio-card__title">{item.title}</span>
              {item.client && (
                <span className="portfolio-card__client">{item.client}</span>
              )}
            </div>

            {/* Layer 2: Hover overlay with play + badges (hidden in edit mode) */}
            {!editMode && (
              <div className="portfolio-card__hover-overlay">
                <Play
                  size={32}
                  style={{ color: "#fff" }}
                  fill="rgba(255,255,255,0.85)"
                />
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginTop: 8,
                  }}
                >
                  {item.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="portfolio-card__badge">
                      {cat}
                    </span>
                  ))}
                  {item.type === "project" && (
                    <span className="portfolio-card__badge">
                      {item.sections && item.sections.length > 0
                        ? `${item.sections.reduce((total, s) => total + getMergedVideos(item.id, s.title, s.videos).length, 0)} videos`
                        : `${getMergedVideos(item.id, undefined, item.videos).length} videos`}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SpotlightCard>

      {/* Content editor modal */}
      {showEditor && (
        <ContentEditor
          item={item}
          onClose={() => setShowEditor(false)}
          onSaved={() => {
            window.dispatchEvent(new CustomEvent("editmode:content-changed"))
          }}
        />
      )}
    </div>
  )
}

/** Shared style for small edit-mode icon buttons */
const editModeBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 7,
  background: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "rgba(255,255,255,0.6)",
  transition: "all 0.15s ease",
  padding: 0,
}
