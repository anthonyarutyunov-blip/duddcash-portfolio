import AutoScroll from "embla-carousel-auto-scroll"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel"
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
  const fadeBg = darkMode ? "rgba(0,0,0,0.95)" : "var(--color-bg)"
  const textColor = darkMode ? "rgba(255,255,255,0.92)" : "var(--color-text)"
  const mutedColor = darkMode ? "rgba(255,255,255,0.4)" : "var(--color-muted)"
  const logoFilter = darkMode
    ? "grayscale(100%) brightness(10) opacity(0.3)"
    : "grayscale(100%) opacity(0.5)"
  const logoHoverFilter = darkMode
    ? "grayscale(0%) brightness(10) opacity(0.8)"
    : "grayscale(0%) opacity(1)"

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
          50+ projects. 16 brands. One standard.
        </p>
      </div>

      <div
        style={{
          position: "relative",
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <Carousel
          opts={{ loop: true, dragFree: true }}
          plugins={[AutoScroll({ playOnInit: true, speed: 1.2, stopOnInteraction: false })]}
        >
          <CarouselContent className="ml-0">
            {brands.map((brand, i) => (
              <CarouselItem
                key={i}
                className="flex basis-auto justify-center pl-0"
              >
                <div
                  style={{
                    padding: "0 clamp(28px, 4vw, 60px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    height: 80,
                  }}
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    loading="lazy"
                    draggable={false}
                    style={{
                      height: "auto",
                      width: "auto",
                      maxHeight: 40,
                      maxWidth: 160,
                      objectFit: "contain",
                      filter: logoFilter,
                      transition: "filter 0.4s ease, transform 0.4s ease",
                    }}
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
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
