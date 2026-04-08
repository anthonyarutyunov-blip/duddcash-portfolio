import { AnimatePresence, motion } from "motion/react"
import { useState, useEffect, useCallback } from "react"
import { LiquidButton } from "../ui/liquid-glass-button"
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
        padding: "var(--space-xl) 3.9vw var(--space-3xl)",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
        <p
          style={{
            fontSize: "var(--text-sm)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--color-muted)",
            marginBottom: "var(--space-md)",
          }}
        >
          Portfolio
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-2xl)",
            fontWeight: 400,
            letterSpacing: "-0.03em",
          }}
        >
          Our Work
        </h2>
      </div>

      {/* Filter tabs */}
      <div className="portfolio-filter-bar">
        {categories.map((cat) => (
          <LiquidButton
            key={cat}
            size="default"
            onClick={() => setFilter(cat)}
            style={{
              background: filter === cat ? "rgba(0,0,0,0.08)" : undefined,
              fontFamily: "var(--font-display)",
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
              fontSize: 12,
              paddingLeft: "1.25rem",
              paddingRight: "1.25rem",
              flexShrink: 0,
            }}
          >
            {cat}
          </LiquidButton>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "var(--space-lg)",
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredItems
            .filter((item) => !expandedId || expandedId === item.id)
            .map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: expandedId ? 0 : index * 0.04 }}
              style={{
                gridColumn:
                  expandedId === item.id ? "1 / -1" : undefined,
              }}
            >
              <PortfolioCard
                item={item}
                isExpanded={expandedId === item.id}
                onExpand={() => handleExpand(item.id)}
                onCollapse={handleCollapse}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .portfolio-filter-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-bottom: var(--space-xl);
        }

        .portfolio-card__overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(2px);
          opacity: 0;
          transition: opacity 0.25s ease;
          z-index: 2;
        }

        .portfolio-card:hover .portfolio-card__overlay {
          opacity: 1;
        }

        .portfolio-card:hover img {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .portfolio-filter-bar {
            flex-wrap: nowrap;
            justify-content: flex-start;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 8px;
            mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%);
          }

          .portfolio-card__overlay {
            opacity: 1;
            background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%);
            backdrop-filter: none;
            justify-content: flex-end;
            padding-bottom: 16px;
          }

          .portfolio-card__overlay svg:first-child {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}
