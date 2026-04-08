import { useState, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Play } from "lucide-react"
import { SpotlightCard } from "../ui/spotlight-card"
import { CardPreview } from "./CardPreview"
import { ExpandedProject } from "./ExpandedProject"
import { thumbnailUrl } from "../../lib/bunny"
import type { PortfolioItem } from "../../data/portfolio"

interface PortfolioCardProps {
  item: PortfolioItem
  isExpanded: boolean
  onExpand: () => void
  onCollapse: () => void
}

/**
 * Portfolio card with:
 * - Static thumbnail by default
 * - Hover: plays short muted video preview (desktop only)
 * - Click: expands in-place to show full project
 */
export function PortfolioCard({
  item,
  isExpanded,
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
    <motion.div
      ref={cardRef}
      layout
      style={{
        gridColumn: isExpanded ? "1 / -1" : undefined,
      }}
      transition={{
        layout: { type: "spring", damping: 25, stiffness: 200 },
      }}
    >
      <SpotlightCard glowColor="blue" disabled={isExpanded}>
        <AnimatePresence mode="wait" initial={false}>
          {isExpanded ? (
            <ExpandedProject
              key="expanded"
              item={item}
              onClose={handleCollapse}
            />
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
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
                aspectRatio: "1",
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

              {/* Hover overlay with info */}
              <div className="portfolio-card__overlay">
                <Play
                  size={28}
                  style={{ marginBottom: 8, color: "#fff" }}
                  fill="rgba(255,255,255,0.9)"
                />
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#fff",
                    marginBottom: 2,
                    textAlign: "center",
                    padding: "0 12px",
                  }}
                >
                  {item.title}
                </span>
                {((item.type === "project" && item.client) ||
                  (item.type === "single" && item.client)) && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: 6,
                    }}
                  >
                    {item.type === "project" ? item.client : item.client}
                  </span>
                )}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                  {item.categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.65)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: 999,
                        padding: "2px 8px",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                  {item.type === "project" && (
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.65)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: 999,
                        padding: "2px 8px",
                      }}
                    >
                      {item.videos.length} videos
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SpotlightCard>
    </motion.div>
  )
}
