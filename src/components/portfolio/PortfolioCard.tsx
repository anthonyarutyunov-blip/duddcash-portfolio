import { useState, useRef, useCallback } from "react"
import { Play } from "lucide-react"
import { SpotlightCard } from "../ui/spotlight-card"
import { CardPreview } from "./CardPreview"
import { ExpandedProject } from "./ExpandedProject"
import { thumbnailUrl } from "../../lib/bunny"
import { getCardAspectRatio, type PortfolioItem } from "../../data/portfolio"

interface PortfolioCardProps {
  item: PortfolioItem
  isExpanded: boolean
  isBentoWide?: boolean
  onExpand: () => void
  onCollapse: () => void
}

/**
 * Portfolio card with:
 * - Static thumbnail by default
 * - Hover: plays short muted video preview (desktop only)
 * - Click: expands in-place to show full project
 * - Bento: featured cards span 2 columns with ultrawide aspect ratio
 */
export function PortfolioCard({
  item,
  isExpanded,
  isBentoWide = false,
  onExpand,
  onCollapse,
}: PortfolioCardProps) {
  const [hovered, setHovered] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Get the video ID for thumbnail/preview
  const primaryVideoId =
    item.type === "project" ? item.thumbnailVideoId : item.video.videoId
  const customThumb = item.customThumbnail
  const nativeAspectRatio = getCardAspectRatio(item)

  // Debounced hover — 150ms delay to skip quick mouse-throughs
  const handleMouseEnter = useCallback(() => {
    hoverTimer.current = setTimeout(() => setHovered(true), 150)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHovered(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!isExpanded) {
      onExpand()
      // Scroll into view after layout animation
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
        // Notify Lenis to recalculate
        ;(window as any).__lenis?.resize()
      }, 400)
    }
  }, [isExpanded, onExpand])

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
              cursor: "pointer",
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

            {/* Hover video preview (desktop only) */}
            <CardPreview videoId={primaryVideoId} active={hovered} />

            {/* Layer 1: Always-visible bottom info */}
            <div className="portfolio-card__info">
              <span className="portfolio-card__title">{item.title}</span>
              {item.client && (
                <span className="portfolio-card__client">{item.client}</span>
              )}
            </div>

            {/* Layer 2: Hover overlay with play + badges */}
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
          </div>
        )}
      </SpotlightCard>
    </div>
  )
}
