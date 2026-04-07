import AutoScroll from "embla-carousel-auto-scroll"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel"

const brands = [
  "Lululemon",
  "Mastercard",
  "F1 x MoneyGram",
  "Wynn",
  "Tao Group Hospitality",
  "Chipotle",
  "Pringles",
  "SharkNinja",
  "Republic Records",
  "PrizePicks",
  "Marine Layer",
  "Academy Sports + Outdoors",
  "Insomniac",
  "Austin City Limits",
  "Dwayne Johnson",
  "Sebastian Maniscalco",
  "Evian Water",
]

export default function TrustedByCarousel() {
  return (
    <section style={{ padding: "var(--space-3xl) 0", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
        <p
          style={{
            fontSize: "var(--text-sm)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--color-muted)",
          }}
        >
          Trusted by
        </p>
      </div>

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
        <Carousel
          opts={{ loop: true, dragFree: true }}
          plugins={[AutoScroll({ playOnInit: true, speed: 0.5 })]}
        >
          <CarouselContent className="ml-0">
            {brands.map((brand, i) => (
              <CarouselItem
                key={i}
                className="flex basis-auto justify-center pl-0"
              >
                <div
                  style={{
                    padding: "0 clamp(24px, 4vw, 56px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    height: 60,
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(0.75rem, 0.65rem + 0.4vw, 1rem)",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(0, 0, 0, 0.3)",
                      whiteSpace: "nowrap",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {brand}
                  </span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Fade edges — wider, smoother gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 120,
            background: "linear-gradient(to right, var(--color-bg) 10%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: 120,
            background: "linear-gradient(to left, var(--color-bg) 10%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      </div>
    </section>
  )
}
