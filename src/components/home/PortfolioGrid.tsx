import { AnimatePresence, motion } from "motion/react"
import { useState, useEffect, useCallback, useRef } from "react"
import { PortfolioCard } from "../portfolio/PortfolioCard"
import {
  portfolioItems,
  categories,
  type PortfolioItem,
  type Category,
} from "../../data/portfolio"

export default function PortfolioGrid() {
  const [filter, setFilter] = useState<"All" | Category>("Featured")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [headingVisible, setHeadingVisible] = useState(false)

  // Heading stroke-fill reveal on scroll
  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadingVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Read filter from URL query param (e.g. ?filter=Events)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlFilter = params.get("filter")
    if (urlFilter && categories.includes(urlFilter as any)) {
      setFilter(urlFilter as "All" | Category)
      setTimeout(() => {
        const el = document.getElementById("portfolio")
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 300)
    }
  }, [])

  // Close expanded card when filter changes
  useEffect(() => {
    setExpandedId(null)
  }, [filter])

  const filteredItems: PortfolioItem[] =
    filter === "All"
      ? [...portfolioItems].sort((a, b) => a.order - b.order)
      : portfolioItems
          .filter((item) => item.categories.includes(filter))
          .sort((a, b) => a.order - b.order)

  const handleExpand = useCallback((id: string) => {
    setExpandedId(id)
  }, [])

  const handleCollapse = useCallback(() => {
    setExpandedId(null)
  }, [])

  return (
    <section
      id="portfolio"
      style={{
        padding: "var(--space-xl) 0 var(--space-3xl)",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      {/* Dark inset container */}
      <div className="portfolio-container">
        {/* Header */}
        <h2
          ref={headingRef}
          className={`portfolio-heading ${headingVisible ? "portfolio-heading--revealed" : ""}`}
        >
          Our Work
        </h2>

        {/* Filter tabs */}
        <div className="portfolio-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`portfolio-filter-pill ${filter === cat ? "portfolio-filter-pill--active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bento Grid — whole-grid crossfade on filter/expand change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${expandedId || 'grid'}`}
            className="portfolio-bento-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filteredItems
              .filter((item) => !expandedId || expandedId === item.id)
              .map((item, index) => {
                const isBentoWide = !expandedId && item.featured && index === 0

                return (
                  <div
                    key={item.id}
                    className={`portfolio-card-wrapper ${isBentoWide ? "portfolio-bento-wide" : ""}`}
                    style={{
                      gridColumn:
                        expandedId === item.id ? "1 / -1" : undefined,
                    }}
                  >
                    <PortfolioCard
                      item={item}
                      isExpanded={expandedId === item.id}
                      isBentoWide={isBentoWide}
                      onExpand={() => handleExpand(item.id)}
                      onCollapse={handleCollapse}
                    />
                  </div>
                )
              })}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        /* Dark inset container */
        .portfolio-container {
          background: #1c1c1e;
          border-radius: 32px;
          margin: 0 24px;
          padding: 48px 32px 32px;
          overflow: hidden;
        }

        /* Heading: stroke-fill reveal */
        .portfolio-heading {
          font-family: var(--font-display);
          font-size: max(5.5vw, 44px);
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 1.0;
          text-align: center;
          margin: 0 0 var(--space-xl);
          -webkit-text-stroke: 1.5px #fff;
          color: transparent;
          background: linear-gradient(to right, #fff 50%, transparent 50%);
          background-size: 200% 100%;
          background-position: 100% 0;
          -webkit-background-clip: text;
          background-clip: text;
          transition: background-position 1.2s cubic-bezier(.165, .84, .44, 1),
                      -webkit-text-stroke 0.4s ease 0.8s;
        }

        .portfolio-heading--revealed {
          background-position: 0% 0;
          -webkit-text-stroke: 0px transparent;
        }

        /* Filter pills */
        .portfolio-filter-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-bottom: var(--space-xl);
        }

        .portfolio-filter-pill {
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 8px 20px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: background 0.3s cubic-bezier(.165, .84, .44, 1),
                      color 0.3s cubic-bezier(.165, .84, .44, 1);
          flex-shrink: 0;
          white-space: nowrap;
        }

        .portfolio-filter-pill:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
        }

        .portfolio-filter-pill--active {
          background: #fff;
          color: #111;
        }

        .portfolio-filter-pill--active:hover {
          background: rgba(255,255,255,0.9);
          color: #111;
        }

        /* Bento grid */
        .portfolio-bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .portfolio-bento-wide {
          grid-column: span 2;
        }

        /* Card wrapper hover lift + glow */
        .portfolio-card-wrapper {
          transition: transform 0.5s cubic-bezier(.165, .84, .44, 1),
                      box-shadow 0.5s cubic-bezier(.165, .84, .44, 1);
          will-change: transform;
          border-radius: 12px;
        }

        .portfolio-card-wrapper:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.3);
        }

        /* Card image zoom */
        .portfolio-card:hover img {
          transform: scale(1.05);
        }

        /* Always-visible bottom info */
        .portfolio-card__info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 40px 16px 14px;
          background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          z-index: 2;
          pointer-events: none;
        }

        .portfolio-card__title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .portfolio-card__client {
          font-size: 11px;
          color: rgba(255,255,255,0.55);
          margin-top: 2px;
          letter-spacing: 0.02em;
        }

        /* Hover overlay with play + badges */
        .portfolio-card__hover-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.35);
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(.165, .84, .44, 1);
          z-index: 3;
          border-radius: 12px;
        }

        .portfolio-card:hover .portfolio-card__hover-overlay {
          opacity: 1;
        }

        .portfolio-card__badge {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 999px;
          padding: 2px 8px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .portfolio-container {
            margin: 0 16px;
            border-radius: 24px;
            padding: 40px 24px 24px;
          }

          .portfolio-bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .portfolio-container {
            margin: 0 12px;
            border-radius: 20px;
            padding: 32px 16px 16px;
          }

          .portfolio-bento-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .portfolio-bento-wide {
            grid-column: span 1;
          }

          .portfolio-filter-bar {
            flex-wrap: nowrap;
            justify-content: flex-start;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 8px;
            mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%);
          }

          .portfolio-card__hover-overlay {
            display: none;
          }

          .portfolio-card-wrapper:hover {
            transform: none;
            box-shadow: none;
          }
        }
      `}</style>
    </section>
  )
}
