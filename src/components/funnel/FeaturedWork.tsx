import { useState } from "react"
import { BlurRevealText } from "../ui/blur-reveal-text"
import { PortfolioCard } from "../portfolio/PortfolioCard"
import { portfolioItems, type PortfolioItem } from "../../data/portfolio"

// Curated for the /apply funnel (Anthony 2026-07-13): Wynn Nightlife,
// Wynn Las Vegas (F1 race week), Forward Hospitality for sure; brand work
// rounds it out. No Insomniac/ACL, no Chipotle.
// span = grid columns out of 12 on desktop (same bento as the homepage grid)
const FEATURED: { id: string; span: number }[] = [
  { id: "wynn-nightlife", span: 6 },
  { id: "nike-boxing-spec", span: 6 },
  { id: "wynn-f1-race-week", span: 3 },
  { id: "fwd-hospitality", span: 3 },
  { id: "lululemon-yet", span: 3 },
  { id: "arnold-palmer-mastercard", span: 3 },
]

/**
 * Featured work section for the funnel page. Identical look and behavior to
 * the homepage "Our Work" grid (dark rounded container, Bunny thumbnails,
 * hover video previews, click-to-expand), minus filters and admin/edit mode.
 */
export default function FeaturedWork() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const items = FEATURED.map((f) => ({
    ...f,
    item: portfolioItems.find((p) => p.id === f.id) as PortfolioItem,
  })).filter((f) => f.item)

  const display = expandedId ? items.filter((f) => f.id === expandedId) : items

  return (
    <section
      id="featured-work"
      style={{ padding: "var(--space-xl) 0 var(--space-3xl)", maxWidth: 1280, margin: "0 auto" }}
    >
      <div className="portfolio-container">
        <h2 className="portfolio-heading">
          <BlurRevealText
            text="FEATURED WORK"
            charDelay={0.05}
            charDuration={0.7}
            blurAmount={14}
            delay={0.3}
          />
        </h2>

        <div className="portfolio-bento-grid">
          {display.map(({ id, span, item }) => (
            <div
              key={id}
              className={`portfolio-card-wrapper${expandedId === id ? " portfolio-card-wrapper--expanded" : ""}`}
              style={{ gridColumn: expandedId === id ? "1 / -1" : `span ${span}` }}
            >
              <PortfolioCard
                item={item}
                isExpanded={expandedId === id}
                onExpand={() => setExpandedId(id)}
                onCollapse={() => setExpandedId(null)}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .portfolio-container {
          background: #1c1c1e;
          border-radius: 32px;
          margin: 0 24px;
          padding: 48px 32px 32px;
          overflow: hidden;
        }

        .portfolio-heading {
          font-family: var(--font-display);
          font-size: max(5.5vw, 44px);
          font-weight: 500;
          letter-spacing: 0.05em;
          line-height: 1.0;
          text-align: center;
          margin: 0 0 var(--space-xl);
          color: #fff;
        }

        .portfolio-bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 12px;
          align-items: start;
          grid-auto-flow: dense;
        }

        .portfolio-card-wrapper {
          transition: transform 0.5s cubic-bezier(.165, .84, .44, 1),
                      box-shadow 0.5s cubic-bezier(.165, .84, .44, 1);
          border-radius: 12px;
          position: relative;
        }

        .portfolio-card-wrapper:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.3);
        }

        .portfolio-card:hover img {
          transform: scale(1.05);
        }

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

        @media (max-width: 1024px) {
          .portfolio-container {
            margin: 0 16px;
            border-radius: 24px;
            padding: 40px 24px 24px;
          }
        }

        @media (max-width: 860px) {
          .portfolio-bento-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @media (max-width: 768px) {
          .portfolio-container {
            margin: 0 12px;
            border-radius: 20px;
            padding: 36px 16px 20px;
          }

          .portfolio-bento-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .portfolio-card-wrapper {
            grid-column: span 1 !important;
            transition: none !important;
          }

          .portfolio-card-wrapper--expanded {
            grid-column: 1 / -1 !important;
          }

          .portfolio-container:has(.portfolio-card-wrapper--expanded) {
            padding: 12px 6px 6px;
          }

          .portfolio-card {
            aspect-ratio: 4/5 !important;
          }

          .portfolio-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .portfolio-card__hover-overlay {
            display: none;
          }

          .portfolio-card-wrapper:hover {
            transform: none;
            box-shadow: none;
          }

          .portfolio-card__info {
            padding: 28px 10px 10px;
          }

          .portfolio-card__title {
            font-size: 13px;
          }

          .portfolio-card__client {
            font-size: 10px;
          }

          .portfolio-heading {
            font-size: max(9vw, 32px);
            margin-bottom: 20px;
          }

          #featured-work {
            padding-bottom: 1.5rem !important;
          }
        }
      `}</style>
    </section>
  )
}
