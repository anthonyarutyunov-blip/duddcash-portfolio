import { useEffect, useRef, useState } from "react"
import { TextEffect } from "../ui/text-effect"

/* ------------------------------------------------------------------ */
/*  Photo data — artistically arranged for color & mood flow          */
/* ------------------------------------------------------------------ */

type Size = "sm" | "md" | "lg" | "xl"

interface Photo {
  src: string
  alt: string
  size: Size
  objectPosition?: string
}

const SIZE_MAP: Record<Size, number> = {
  sm: 140,
  md: 195,
  lg: 260,
  xl: 340,
}

/* ------------------------------------------------------------------ */
/*  Column 1 — Cool Blues/Greens → Warm (16 images)                    */
/* ------------------------------------------------------------------ */

const col1: Photo[] = [
  { src: "/gallery/dscf1784.jpg", alt: "Marina at dusk with sailboat reflections", size: "md" },
  { src: "/gallery/shaq-still-2.jpg", alt: "Steel structure silhouette against teal sky", size: "lg" },
  { src: "/gallery/dscf0954.jpg", alt: "Bare tree branches against winter sky", size: "sm" },
  { src: "/gallery/zara-4.jpg", alt: "Clock tower with autumn leaves and teal sky", size: "xl" },
  { src: "/gallery/dscf1719.jpg", alt: "Historic pier and waterfront", size: "md" },
  { src: "/gallery/venice-bw.jpg", alt: "Venice canal with gondola in black and white", size: "md" },
  { src: "/gallery/api-still-1.jpg", alt: "Golf ball at night in high contrast", size: "md" },
  { src: "/gallery/dscf1817.jpg", alt: "Ocean view through a cave opening", size: "lg" },
  { src: "/gallery/tiff-1.jpg", alt: "Person reading by tree at night", size: "lg" },
  { src: "/gallery/dscf1323.jpg", alt: "Tropical foliage framing stone architecture", size: "md" },
  { src: "/gallery/plant-shadows.jpg", alt: "Plant with dramatic cast shadows in golden light", size: "lg" },
  { src: "/gallery/dscf1943.jpg", alt: "Performance with pink stage lighting", size: "lg" },
  { src: "/gallery/dscf3618.jpg", alt: "Aerial view of turquoise swimming pool", size: "xl" },
  { src: "/gallery/dscf1218.jpg", alt: "Silhouette figure at sunset on water", size: "xl", objectPosition: "67% 53%" },
  { src: "/gallery/lulu-neon.jpg", alt: "Lululemon Yet neon sign installation", size: "lg" },
  { src: "/gallery/ridge-sunset.jpg", alt: "Hillside ridge against dramatic orange sunset", size: "md" },
]

/* ------------------------------------------------------------------ */
/*  Column 2 — Cityscapes → Fashion/Editorial (15 images)              */
/* ------------------------------------------------------------------ */

const col2: Photo[] = [
  { src: "/gallery/dscf0945.jpg", alt: "Urban cityscape from street level", size: "md" },
  { src: "/gallery/tiff-3.jpg", alt: "Figure sitting against tree in cinematic night", size: "lg" },
  { src: "/gallery/dscf1187.jpg", alt: "Dense foliage by water at night", size: "md" },
  { src: "/gallery/zara-8.jpg", alt: "Three people fashion editorial golden hour", size: "xl" },
  { src: "/gallery/dscf1849.jpg", alt: "Vintage red vehicle under golden canopy", size: "md" },
  { src: "/gallery/api-still-2.jpg", alt: "Golfer with ball overlay vintage style", size: "lg" },
  { src: "/gallery/lulu-exterior.jpg", alt: "Lululemon Studio Yet exterior in orange light", size: "xl" },
  { src: "/gallery/tiff-4.jpg", alt: "Silhouette in dramatic blue backlight", size: "lg" },
  { src: "/gallery/city-fence.jpg", alt: "City skyline through metal fence at sunset", size: "xl" },
  { src: "/gallery/tiff-10.jpg", alt: "Boxer with heavy bag in dramatic light", size: "md" },
  { src: "/gallery/dsc00477.jpg", alt: "Silhouette against warm golden lights", size: "xl" },
  { src: "/gallery/redcarpet-1.jpg", alt: "Red carpet couple portrait at media event", size: "md", objectPosition: "51% 30%" },
  { src: "/gallery/new-2.jpg", alt: "Purple haze stage performance with crowd", size: "md" },
  { src: "/gallery/dscf3101.jpg", alt: "Night filming with camera rig under spotlight", size: "xl" },
  { src: "/gallery/nyc-still-2.jpg", alt: "NYC building silhouette with teal sky", size: "md", objectPosition: "42% 52%" },
]

/* ------------------------------------------------------------------ */
/*  Column 3 — Mixed Editorial → Dramatic (15 images)                  */
/* ------------------------------------------------------------------ */

const col3: Photo[] = [
  { src: "/gallery/dscf1841.jpg", alt: "Modern building facade with vegetation", size: "lg" },
  { src: "/gallery/api-still-8.jpg", alt: "Golfer lifting trophy against blue sky", size: "lg", objectPosition: "54% 65%" },
  { src: "/gallery/dscf3630.jpg", alt: "Modern waterfront venue", size: "lg" },
  { src: "/gallery/lulu-interior.jpg", alt: "Lululemon studio interior in purple and blue", size: "xl" },
  { src: "/gallery/feet-shadow.jpg", alt: "Silhouetted feet walking in amber light", size: "lg" },
  { src: "/gallery/dscf1897.jpg", alt: "Golden hour riverside cityscape", size: "lg" },
  { src: "/gallery/crescent-moon.jpg", alt: "Crescent moon against deep night sky", size: "sm" },
  { src: "/gallery/dscf2401.jpg", alt: "Polaroid photographs on dark surface", size: "lg" },
  { src: "/gallery/silhouette-sunset.jpg", alt: "Person profile silhouetted against red sunset", size: "xl" },
  { src: "/gallery/new-1.jpg", alt: "Red LED stage performance", size: "lg" },
  { src: "/gallery/cocktail.jpg", alt: "Red cocktail glass with dramatic lighting", size: "lg" },
  { src: "/gallery/dscf3500.jpg", alt: "Golden hillside overlooking distant city", size: "lg" },
  { src: "/gallery/dscf1981.jpg", alt: "Close-up silhouette with bokeh lights", size: "lg" },
  { src: "/gallery/dscf3636.jpg", alt: "Scene with warm atmospheric tones", size: "lg" },
  { src: "/gallery/birds-sky.jpg", alt: "Two birds in flight against pale sky", size: "md", objectPosition: "50% 32%" },
]

/* ------------------------------------------------------------------ */
/*  Column 4 — Warm/Golden → Brand → Dramatic (16 images)             */
/* ------------------------------------------------------------------ */

const col4: Photo[] = [
  { src: "/gallery/dscf1559.jpg", alt: "Modern curved apartment building", size: "md" },
  { src: "/gallery/tiff-15.jpg", alt: "Nike boxing glove close-up with cross necklace", size: "lg" },
  { src: "/gallery/dscf1699.jpg", alt: "Ornate domed ceiling interior", size: "lg" },
  { src: "/gallery/zara-19.jpg", alt: "Woman in blue against painted sky backdrop", size: "xl", objectPosition: "51% 7%" },
  { src: "/gallery/dscf1795.jpg", alt: "Ornate cathedral facade with palm trees", size: "md", objectPosition: "52% 74%" },
  { src: "/gallery/rc25-graphic.jpg", alt: "Reserve Cup RC25 Miami event graphic", size: "md" },
  { src: "/gallery/lulu-lounge.jpg", alt: "Lululemon outdoor lounge in warm light", size: "xl" },
  { src: "/gallery/cover-main.jpg", alt: "Encore hotel EDC Week projection", size: "lg" },
  { src: "/gallery/dscf2989.jpg", alt: "Chicago skyline panorama", size: "md", objectPosition: "50% 60%" },
  { src: "/gallery/captain-stage.jpg", alt: "Performer in captain hat with megaphone on stage", size: "lg" },
  { src: "/gallery/dscf3026.jpg", alt: "Neoclassical colonnaded building", size: "md" },
  { src: "/gallery/dscf1653.jpg", alt: "Roman Colosseum facade", size: "lg" },
  { src: "/gallery/modern-palms.jpg", alt: "Modern building with palm trees at dusk", size: "md" },
  { src: "/gallery/aftermovie-3.jpg", alt: "Dark concert crowd with stage lights", size: "xl" },
  { src: "/gallery/canopy-light.jpg", alt: "Architectural canopy with golden illumination", size: "md" },
  { src: "/gallery/dscf2429.jpg", alt: "Figure with Mitchell and Ness hat on dark stage", size: "md", objectPosition: "61% 85%" },
]

/* ------------------------------------------------------------------ */
/*  Column 5 — Silhouettes/Contrast → Night Crescendo (16 images)     */
/* ------------------------------------------------------------------ */

const col5: Photo[] = [
  { src: "/gallery/dscf3449.jpg", alt: "Geometric shadow patterns through architecture", size: "md" },
  { src: "/gallery/tiff-19.jpg", alt: "Boxer throwing punch in blue and red light", size: "lg" },
  { src: "/gallery/dscf1809.jpg", alt: "Silhouettes against dusk sky", size: "lg" },
  { src: "/gallery/zara-37.jpg", alt: "Three people seated with ZARA text overlay", size: "xl" },
  { src: "/gallery/fountain-night.jpg", alt: "Fountain with water droplets and blue green bokeh", size: "md", objectPosition: "44% 46%" },
  { src: "/gallery/lambo-badge.jpg", alt: "Lamborghini badge close-up with gold bokeh", size: "md" },
  { src: "/gallery/dscf0753.jpg", alt: "Silhouetted figure in a spotlight", size: "md" },
  { src: "/gallery/getlucked-2.jpg", alt: "Crowd surfing at GetLucked festival event", size: "xl" },
  { src: "/gallery/stone-texture.jpg", alt: "Stones lit through vertical bars in golden light", size: "xl" },
  { src: "/gallery/getlucked-1.jpg", alt: "GetLucked festival entrance with green balloons", size: "md" },
  { src: "/gallery/green-spotlight.jpg", alt: "Solo performer under dramatic green spotlights", size: "lg", objectPosition: "42% 84%" },
  { src: "/gallery/tao-brand.jpg", alt: "TAO restaurant branding in dark red and gold", size: "md" },
  { src: "/gallery/new-4.jpg", alt: "Massive concert crowd from above", size: "xl" },
  { src: "/gallery/bunt-title.jpg", alt: "BUNT text poster with silhouette figure", size: "sm", objectPosition: "50% 33%" },
  { src: "/gallery/dscf2961.jpg", alt: "Gym scene with friends and training equipment", size: "md" },
  { src: "/gallery/still2.jpg", alt: "Cinematic still frame", size: "md" },
]

/* ------------------------------------------------------------------ */
/*  Split columns into top/bottom halves for editorial break           */
/*  Optimized split points for balanced heights across halves          */
/* ------------------------------------------------------------------ */

const col1_top = col1.slice(0, 9)
const col1_bottom = col1.slice(9)

const col2_top = col2.slice(0, 8)
const col2_bottom = col2.slice(8)

const col3_top = col3.slice(0, 8)
const col3_bottom = col3.slice(8)

const col4_top = col4.slice(0, 8)
const col4_bottom = col4.slice(8)

const col5_top = col5.slice(0, 8)
const col5_bottom = col5.slice(8)

/* ------------------------------------------------------------------ */
/*  Blur + Slide animation variants for the editorial text             */
/* ------------------------------------------------------------------ */

const blurSlideVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 20,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
}

/* ------------------------------------------------------------------ */
/*  Shared IntersectionObserver — one instance for all gallery images  */
/* ------------------------------------------------------------------ */

const observerCallbacks = new WeakMap<Element, () => void>()
let sharedObserver: IntersectionObserver | null = null

function getSharedObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cb = observerCallbacks.get(entry.target)
            if (cb) {
              cb()
              observerCallbacks.delete(entry.target)
              sharedObserver!.unobserve(entry.target)
            }
          }
        })
      },
      { threshold: 0.01, rootMargin: "200px 0px 200px 0px" }
    )
  }
  return sharedObserver
}

/* ------------------------------------------------------------------ */
/*  Gallery Image — lazy-loaded with shared IntersectionObserver      */
/* ------------------------------------------------------------------ */

function GalleryImage({ photo, index }: { photo: Photo; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = getSharedObserver()
    observerCallbacks.set(el, () => setVisible(true))
    obs.observe(el)
    return () => {
      observerCallbacks.delete(el)
      obs.unobserve(el)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="gallery-img-wrap"
      style={{
        height: SIZE_MAP[photo.size],
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${index * 0.06}s, transform 0.6s ease ${index * 0.06}s`,
      }}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: photo.objectPosition || "center",
          display: "block",
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Photo Column — renders a vertical stack of images                  */
/* ------------------------------------------------------------------ */

function PhotoColumn({ photos }: { photos: Photo[] }) {
  return (
    <div className="gallery-col">
      {photos.map((p, i) => (
        <GalleryImage key={p.src} photo={p} index={i} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Editorial Break — animated text between photo halves               */
/* ------------------------------------------------------------------ */

function EditorialBreak() {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="editorial-break">
      <TextEffect
        per="char"
        as="h2"
        trigger={triggered}
        variants={blurSlideVariants}
        className="editorial-break__text"
      >
        Where cinematic isn't just a buzz word.
      </TextEffect>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Gallery Component                                             */
/* ------------------------------------------------------------------ */

export default function StickyScrollGallery() {
  return (
    <section className="gallery-container">
      {/* Top half of photo grid */}
      <div className="sticky-gallery-grid">
        <div className="gallery-cell">
          <PhotoColumn photos={col1_top} />
        </div>
        <div className="gallery-cell">
          <PhotoColumn photos={col2_top} />
        </div>
        <div className="gallery-cell">
          <PhotoColumn photos={col3_top} />
        </div>
        <div className="gallery-cell">
          <PhotoColumn photos={col4_top} />
        </div>
        <div className="gallery-cell">
          <PhotoColumn photos={col5_top} />
        </div>
      </div>

      {/* Editorial break — cinematic statement */}
      <EditorialBreak />

      {/* Bottom half of photo grid */}
      <div className="sticky-gallery-grid">
        <div className="gallery-cell">
          <PhotoColumn photos={col1_bottom} />
        </div>
        <div className="gallery-cell">
          <PhotoColumn photos={col2_bottom} />
        </div>
        <div className="gallery-cell">
          <PhotoColumn photos={col3_bottom} />
        </div>
        <div className="gallery-cell">
          <PhotoColumn photos={col4_bottom} />
        </div>
        <div className="gallery-cell">
          <PhotoColumn photos={col5_bottom} />
        </div>
      </div>

      <style>{`
        /* ---- Dark container ---- */
        .gallery-container {
          background: #1a1a1a;
          border-radius: 32px;
          margin: 0 24px;
          padding: 40px 20px 20px;
          overflow: hidden;
        }

        /* ---- Photo grid ---- */
        .sticky-gallery-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
        }

        .gallery-cell {
          min-width: 0;
        }

        .gallery-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gallery-img-wrap {
          overflow: hidden;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }

        .gallery-img-wrap img {
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease;
          filter: saturate(0.92);
        }

        .gallery-img-wrap:hover img {
          transform: scale(1.04);
          filter: saturate(1.1);
        }

        /* ---- Editorial break ---- */
        .editorial-break {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: clamp(3rem, 8vh, 6rem) clamp(2rem, 4vw, 4rem);
        }

        .editorial-break__text {
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 3vw, 3.5rem);
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: #fff;
          text-align: center;
          max-width: 800px;
        }

        /* ---- Responsive: Tablet ---- */
        @media (max-width: 1024px) {
          .gallery-container {
            margin: 0 16px;
            border-radius: 24px;
            padding: 32px 16px 16px;
          }

          .sticky-gallery-grid {
            grid-template-columns: repeat(6, 1fr);
          }

          /* Row 1: 3 columns × span-2 each = fills all 6 tracks */
          .gallery-cell:nth-child(1) { order: 1; grid-column: span 2; }
          .gallery-cell:nth-child(2) { order: 2; grid-column: span 2; }
          .gallery-cell:nth-child(3) { order: 3; grid-column: span 2; }

          /* Row 2: 2 columns × span-3 each = fills all 6 tracks */
          .gallery-cell:nth-child(4) { order: 5; grid-column: span 3; }
          .gallery-cell:nth-child(5) { order: 6; grid-column: span 3; }
        }

        /* ---- Responsive: Mobile ---- */
        @media (max-width: 640px) {
          .gallery-container {
            margin: 0 12px;
            border-radius: 20px;
            padding: 24px 12px 12px;
          }

          .sticky-gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          /* Reset tablet span overrides */
          .gallery-cell {
            grid-column: span 1 !important;
            order: unset !important;
          }

          .editorial-break {
            min-height: 50vh;
          }

          .gallery-img-wrap {
            height: auto !important;
          }

          .gallery-img-wrap img {
            height: 120px;
          }
        }
      `}</style>
    </section>
  )
}
