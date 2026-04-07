import { AnimatePresence, motion } from "motion/react"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { useState } from "react"
import type { KeyboardEvent } from "react"
import { SpotlightCard } from "../ui/spotlight-card"
import { LiquidButton } from "../ui/liquid-glass-button"

const galleryImages = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop",
    title: "Live Event Production",
    category: "Events",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&auto=format&fit=crop",
    title: "Club Visuals",
    category: "Nightlife",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&auto=format&fit=crop",
    title: "Main Stage",
    category: "Entertainment",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop",
    title: "Social Content",
    category: "Branded & Social",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop",
    title: "Spec Ad",
    category: "Spec Creative",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&auto=format&fit=crop",
    title: "Destination Shoot",
    category: "Travel",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop",
    title: "Festival Recap",
    category: "Featured",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&auto=format&fit=crop",
    title: "Concert Film",
    category: "Events",
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop",
    title: "Venue Promo",
    category: "Nightlife",
  },
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop",
    title: "Brand Campaign",
    category: "Featured",
  },
  {
    id: 11,
    url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&auto=format&fit=crop",
    title: "Show Production",
    category: "Entertainment",
  },
  {
    id: 12,
    url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop",
    title: "Travel Film",
    category: "Travel",
  },
]

const categories = [
  "All",
  "Featured",
  "Events",
  "Nightlife",
  "Entertainment",
  "Branded & Social",
  "Spec Creative",
  "Travel",
]

export default function PortfolioGrid() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [filter, setFilter] = useState("Featured")

  const filteredImages =
    filter === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === filter)

  const handleNext = () => {
    if (selectedImage === null) return
    const idx = galleryImages.findIndex((img) => img.id === selectedImage)
    setSelectedImage(galleryImages[(idx + 1) % galleryImages.length].id)
  }

  const handlePrev = () => {
    if (selectedImage === null) return
    const idx = galleryImages.findIndex((img) => img.id === selectedImage)
    setSelectedImage(
      galleryImages[(idx - 1 + galleryImages.length) % galleryImages.length].id
    )
  }

  const selectedData = galleryImages.find((img) => img.id === selectedImage)

  const handleCardKey = (e: KeyboardEvent<HTMLDivElement>, id: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setSelectedImage(id)
    }
  }

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

      {/* Filter — liquid glass buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
          marginBottom: "var(--space-xl)",
        }}
      >
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
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <SpotlightCard glowColor="blue">
                <div
                  onClick={() => setSelectedImage(image.id)}
                  onKeyDown={(e) => handleCardKey(e, image.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${image.title}`}
                  style={{
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  className="portfolio-card"
                >
                  <div style={{ position: "relative", aspectRatio: "1" }}>
                    <img
                      src={image.url}
                      alt={image.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.4s ease",
                      }}
                    />
                    <div className="portfolio-card__overlay">
                      <ZoomIn size={24} style={{ marginBottom: 8, color: "#fff" }} />
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#fff",
                          marginBottom: 4,
                        }}
                      >
                        {image.title}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          borderRadius: 999,
                          padding: "3px 10px",
                        }}
                      >
                        {image.category}
                      </span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && selectedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.9)",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: "relative", maxHeight: "90vh", maxWidth: "90vw" }}
            >
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: "absolute",
                  top: -40,
                  right: 0,
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
                aria-label="Close"
              >
                <X size={24} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handlePrev() }}
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
                aria-label="Previous"
              >
                <ChevronLeft size={32} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleNext() }}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
                aria-label="Next"
              >
                <ChevronRight size={32} />
              </button>

              <motion.img
                key={selectedImage}
                src={selectedData.url.replace("w=600", "w=1200")}
                alt={selectedData.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  maxHeight: "80vh",
                  maxWidth: "85vw",
                  borderRadius: 4,
                  display: "block",
                }}
              />

              <div
                style={{
                  textAlign: "center",
                  marginTop: 16,
                  color: "#fff",
                }}
              >
                <p style={{ fontSize: 18, fontWeight: 500 }}>{selectedData.title}</p>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {selectedData.category}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
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
        }
        .portfolio-card:hover .portfolio-card__overlay {
          opacity: 1;
        }
        .portfolio-card:hover img {
          transform: scale(1.05);
        }
        @media (max-width: 768px) {
          .portfolio-card__overlay {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}
