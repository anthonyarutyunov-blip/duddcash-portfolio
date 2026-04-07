import { useEffect, useRef, useState } from "react"

const images = {
  col1: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop",
  ],
  col2: [
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&auto=format&fit=crop",
  ],
  col3: [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop",
  ],
  col4: [
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop&q=90",
  ],
  col5: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&auto=format&fit=crop&q=90",
  ],
}

function GalleryImage({ src, index }: { src: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="gallery-img-wrap"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${index * 0.04}s, transform 0.5s ease ${index * 0.04}s`,
      }}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  )
}

function ScrollColumn({ images: imgs, sticky = false }: { images: string[]; sticky?: boolean }) {
  if (sticky) {
    return (
      <div className="gallery-col gallery-col--sticky">
        {imgs.map((src, i) => (
          <div key={i} className="gallery-img-wrap">
            <img
              src={src}
              alt=""
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="gallery-col">
      {imgs.map((src, i) => (
        <GalleryImage key={i} src={src} index={i} />
      ))}
    </div>
  )
}

export default function StickyScrollGallery() {
  return (
    <section className="sticky-gallery">
      <div className="sticky-gallery-grid">
        <ScrollColumn images={images.col1} />
        <ScrollColumn images={images.col2} />
        <ScrollColumn images={images.col3} sticky />
        <ScrollColumn images={images.col4} />
        <ScrollColumn images={images.col5} />
      </div>

      <style>{`
        .sticky-gallery {
          padding: 0;
        }
        .sticky-gallery-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          padding: 6px;
        }
        .gallery-col {
          display: grid;
          gap: 6px;
        }
        .gallery-col--sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          display: grid;
          grid-template-rows: repeat(3, 1fr);
          gap: 6px;
        }
        .gallery-img-wrap {
          overflow: hidden;
          border-radius: 4px;
          border: 2px solid rgba(0, 0, 0, 0.06);
          background: rgba(0, 0, 0, 0.03);
        }
        .gallery-col:not(.gallery-col--sticky) .gallery-img-wrap img {
          height: 130px;
        }
        .gallery-col--sticky .gallery-img-wrap img {
          height: 100%;
        }
        .gallery-img-wrap img {
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease;
          filter: saturate(0.9);
        }
        .gallery-img-wrap:hover img {
          transform: scale(1.05);
          filter: saturate(1.1);
        }
        @media (max-width: 1024px) {
          .sticky-gallery-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .gallery-col--sticky {
            position: relative !important;
            height: auto !important;
            grid-template-rows: auto !important;
          }
          .gallery-col:not(.gallery-col--sticky) .gallery-img-wrap img {
            height: 120px;
          }
        }
        @media (max-width: 640px) {
          .sticky-gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .gallery-col:not(.gallery-col--sticky) .gallery-img-wrap img {
            height: 100px;
          }
        }
      `}</style>
    </section>
  )
}
