import { useState, useRef, useCallback } from "react"
import { Play, Pencil, FolderOpen } from "lucide-react"
import { SpotlightCard } from "../ui/spotlight-card"
import { CardPreview } from "./CardPreview"
import { ExpandedProject } from "./ExpandedProject"
import { thumbnailUrl } from "../../lib/bunny"
import { type PortfolioItem } from "../../data/portfolio"
import { getMergedCardAspectRatio } from "../../lib/layout-merge"
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

  const handleClick = useCallback(() => {
    if (editMode) return // In edit mode, use the Open button instead
    if (!isExpanded) {
      onExpand()
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
        ;(window as any).__lenis?.resize()
      }, 400)
    }
  }, [isExpanded, onExpand, editMode])

  // Separate expand handler for edit mode (via the Open button)
  const handleEditModeExpand = useCallback(() => {
    onExpand()
    setTimeout(() => {
      cardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
      ;(window as any).__lenis?.resize()
    }, 400)
  }, [onExpand])

  const handleCollapse = useCallback(() => {
    onCollapse()
    // Re-sync Lenis after collapse
    setTimeout(() => {
      ;(window as any).__lenis?.resize()
    }, 400)
  }, [onCollapse])

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
                        ? `${item.sections.length} campaigns`
                        : `${item.videos.length} videos`}
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
