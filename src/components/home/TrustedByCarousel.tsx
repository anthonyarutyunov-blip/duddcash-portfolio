import { useState } from "react"
import { ShimmerText } from "../ui/shimmer-text"

const brands = [
  { name: "Lululemon", logo: "/logos/lululemon.png" },
  { name: "Mastercard", logo: "/logos/mastercard.png" },
  { name: "MoneyGram", logo: "/logos/moneygram.png" },
  { name: "Wynn", logo: "/logos/wynn.png" },
  { name: "Tao Group Hospitality", logo: "/logos/tao-group.png" },
  { name: "Chipotle", logo: "/logos/chipotle.png" },
  { name: "Pringles", logo: "/logos/pringles.png" },
  { name: "Republic Records", logo: "/logos/republic-records.svg" },
  { name: "PrizePicks", logo: "/logos/prizepicks.svg" },
  { name: "Marine Layer", logo: "/logos/marine-layer.png" },
  { name: "Academy Sports + Outdoors", logo: "/logos/academy-sports.png" },
  { name: "Insomniac", logo: "/logos/insomniac.png" },
  { name: "Austin City Limits", logo: "/logos/austin-city-limits.png" },
  { name: "Dwayne Johnson", logo: "/logos/dwayne-johnson.svg" },
  { name: "Sebastian Maniscalco", logo: "/logos/sebastian-maniscalco.svg" },
  { name: "Evian", logo: "/logos/evian.png" },
]

interface TrustedByCarouselProps {
  darkMode?: boolean
}

export default function TrustedByCarousel({ darkMode = false }: TrustedByCarouselProps) {
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  const textColor = darkMode ? "rgba(255,255,255,0.92)" : "var(--color-text)"
  const mutedColor = darkMode ? "rgba(255,255,255,0.4)" : "var(--color-muted)"
  const logoFilter = darkMode
    ? "grayscale(100%) brightness(10) opacity(0.3)"
    : "grayscale(100%) opacity(0.5)"
  const logoHoverFilter = darkMode
    ? "grayscale(0%) brightness(10) opacity(0.8)"
    : "grayscale(0%) opacity(1)"

  // Duplicate brands for seamless loop
  const track = [...brands, ...brands]
  const duration = isMobile ? 30 : 40

  return (
    <section style={{ padding: "clamp(4rem, 8vh, 8rem) 0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 4vh, 4rem)" }}>
        <ShimmerText
          duration={3}
          delay={0.2}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: textColor,
          }}
        >
          Trusted by the best.
        </ShimmerText>
        <p
          style={{
            fontSize: "var(--text-base)",
            color: mutedColor,
            marginTop: "var(--space-sm)",
            letterSpacing: "0.04em",
          }}
        >
          300+ projects.
        </p>
      </div>

      <div className="trusted-scroll-mask">
        <div className="trusted-scroll-track" style={{ animationDuration: `${duration}s` }}>
          {track.map((brand, i) => (
            <div key={i} className="trusted-scroll-item">
              <img
                src={brand.logo}
                alt={brand.name}
                loading="lazy"
                draggable={false}
                className="trusted-scroll-logo"
                style={{ filter: logoFilter }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = logoHoverFilter
                  e.currentTarget.style.transform = "scale(1.08)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = logoFilter
                  e.currentTarget.style.transform = "scale(1)"
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .trusted-scroll-mask {
          position: relative;
          mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
          overflow: hidden;
        }

        .trusted-scroll-track {
          display: flex;
          width: max-content;
          animation: trustedScroll linear infinite;
          will-change: transform;
        }

        @keyframes trustedScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .trusted-scroll-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 clamp(28px, 4vw, 60px);
          height: 80px;
        }

        .trusted-scroll-logo {
          height: auto;
          width: auto;
          max-height: 40px;
          max-width: 160px;
          object-fit: contain;
          transition: filter 0.4s ease, transform 0.4s ease;
        }

        @media (max-width: 768px) {
          .trusted-scroll-item {
            padding: 0 20px;
            height: 60px;
          }

          .trusted-scroll-logo {
            max-height: 30px;
            max-width: 120px;
          }
        }
      `}</style>
    </section>
  )
}
