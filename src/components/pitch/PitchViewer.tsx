import { useEffect, useRef, useState } from "react"
import { ArrowDownToLine } from "lucide-react"
import { PitchPlayer } from "./PitchPlayer"
import type { Pitch, PitchItem } from "../../lib/pitch-api"

/** Instagram glyph — the installed lucide version has no brand icons */
function InstagramIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

/**
 * Per-character hero title reveal — letters rise and settle with a stagger.
 * CSS-only motion (transform/opacity), wrap-safe (no clipping), with a CSS
 * failsafe that forces visibility if JS state never flips.
 */
function HeroTitle({ text, on }: { text: string; on: boolean }) {
  let charIndex = 0
  return (
    <h1
      className={`pitch-title${on ? " pitch-title--on" : ""}`}
      aria-label={text}
    >
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="pitch-title__word" aria-hidden="true">
          {word.split("").map((ch) => {
            const d = charIndex++
            return (
              <span
                key={d}
                className="pitch-title__ch"
                style={{ transitionDelay: `${0.05 + d * 0.03}s` }}
              >
                {ch}
              </span>
            )
          })}
          {wi < text.split(" ").length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  )
}

/**
 * The screening room — client-facing pitch page experience.
 *
 * Mounted client:only on /pitch-viewer/ (served rewritten at /p/<slug>).
 * Reads the pitch JSON injected into #__PITCH_DATA__ by the pitch-page
 * function. Native scroll; zero scroll hijacking.
 */
export function PitchViewer() {
  const [pitch, setPitch] = useState<Pitch | null | undefined>(undefined)
  const [revealed, setRevealed] = useState(false)
  const [activeFilm, setActiveFilm] = useState(0)

  useEffect(() => {
    let data: Pitch | null = null
    try {
      const el = document.getElementById("__PITCH_DATA__")
      if (el?.textContent) data = JSON.parse(el.textContent)
    } catch {}
    setPitch(data && Array.isArray(data.items) && data.items.length > 0 ? data : null)
  }, [])

  // Veil handoff: fade the arrival veil once we know what we're showing.
  // In-app browsers get a near-instant reveal (heavy intros read as "slow").
  useEffect(() => {
    if (pitch === undefined) return
    const veil = document.getElementById("pitch-veil")
    const isIAB =
      /Instagram|FBAN|FBAV|FB_IAB|Messenger|MicroMessenger|Snapchat|TikTok|musical_ly|LinkedInApp|Twitter|Line\//i.test(
        navigator.userAgent
      )
    const hold = pitch === null ? 0 : isIAB ? 250 : 1400
    const t = setTimeout(() => {
      setRevealed(true)
      if (veil) {
        veil.classList.add("pitch-veil--hidden")
        // Remove from the tree once faded so it can never intercept input
        setTimeout(() => veil.remove(), 1000)
      }
    }, hold)
    return () => clearTimeout(t)
  }, [pitch])

  // IO scroll reveals for .pitch-reveal elements + active-film tracking
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!pitch) return
    const root = rootRef.current
    if (!root) return
    const els = root.querySelectorAll(".pitch-reveal")
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    )
    els.forEach((el) => io.observe(el))

    // Which film currently has the room — drives the side rail
    const films = root.querySelectorAll("[data-film-idx]")
    const filmIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.filmIdx || 0
            )
            setActiveFilm(idx)
          }
        })
      },
      { threshold: 0.35 }
    )
    films.forEach((el) => filmIo.observe(el))

    return () => {
      io.disconnect()
      filmIo.disconnect()
    }
  }, [pitch])

  if (pitch === undefined) return null

  if (pitch === null) {
    return (
      <div className="pitch-invalid">
        <div className="pitch-invalid__eyebrow">Duddcash Studios</div>
        <div className="pitch-invalid__title">
          This screening link is invalid
        </div>
        <div className="pitch-invalid__sub">
          Double-check the link you were sent, or visit{" "}
          <a href="https://duddcashstudios.com">duddcashstudios.com</a>
        </div>
      </div>
    )
  }

  const heroId = pitch.heroVideoId || pitch.items[0].videoId
  const hero =
    pitch.items.find((it) => it.videoId === heroId) || pitch.items[0]
  const rest = pitch.items.filter((it) => it !== hero)
  const program = [hero, ...rest]

  const preparedFor = pitch.clientName
    ? `Prepared for ${pitch.clientName}`
    : "A private screening"
  const dateLabel = new Date(
    pitch.updatedAt || pitch.createdAt || Date.now()
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const watermark = (pitch.clientName || "DUDDCASH").toUpperCase()

  const jumpToFilm = (idx: number) => {
    const el = rootRef.current?.querySelector(`[data-film-idx="${idx}"]`)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div ref={rootRef}>
      {/* ── Now-screening side rail (desktop) ── */}
      {program.length > 1 && (
        <nav className="pitch-rail" aria-label="Films">
          {program.map((it, i) => (
            <button
              key={it.videoId}
              className={`pitch-rail__stop${activeFilm === i ? " pitch-rail__stop--active" : ""}`}
              onClick={() => jumpToFilm(i)}
              aria-label={`Go to film ${i + 1}: ${it.title}`}
            >
              <span className="pitch-rail__num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pitch-rail__line" />
            </button>
          ))}
        </nav>
      )}

      {/* ── Hero ── */}
      <header className="pitch-hero">
        <span className="pitch-hero__watermark" aria-hidden="true">
          {watermark}
        </span>
        <div className="pitch-container">
          <p
            className={`pitch-eyebrow pitch-hero-el${revealed ? " is-on" : ""}`}
          >
            {preparedFor} · {dateLabel}
          </p>
          <HeroTitle text={pitch.title} on={revealed} />
          {pitch.note && (
            <p
              className={`pitch-note pitch-hero-el${revealed ? " is-on" : ""}`}
              style={{ transitionDelay: "0.55s" }}
            >
              {pitch.note}
            </p>
          )}
        </div>
        <div className="pitch-container">
          <hr
            className={`pitch-hero__rule pitch-hero-el${revealed ? " is-on" : ""}`}
            style={{ transitionDelay: "0.7s" }}
          />
        </div>
      </header>

      {/* ── Program ── */}
      <section className="pitch-program">
        <div className="pitch-container">
          {program.map((item, i) => (
            <FilmBlock key={item.videoId} item={item} index={i + 1} />
          ))}
        </div>
      </section>

      {/* ── Closing ── */}
      <footer className="pitch-closing">
        <div className="pitch-container">
          <h2 className="pitch-closing__headline pitch-reveal">
            Let's make this.
          </h2>
          <div className="pitch-closing__contact pitch-reveal">
            <a
              className="pitch-closing__link"
              href="mailto:action@duddcashstudios.com"
            >
              action@duddcashstudios.com
            </a>
            <a
              className="pitch-closing__link"
              href="https://duddcashstudios.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              duddcashstudios.com
            </a>
            <a
              className="pitch-closing__link"
              href="https://instagram.com/duddcash"
              target="_blank"
              rel="noopener noreferrer"
            >
              @duddcash
            </a>
          </div>
          <p className="pitch-closing__private">
            This screening was prepared privately
            {pitch.clientName ? ` for ${pitch.clientName}` : ""}. Please don't
            share this link.
          </p>
          <div className="pitch-closing__wordmark">DUDDCASH STUDIOS</div>
        </div>
      </footer>
    </div>
  )
}

function FilmBlock({ item, index }: { item: PitchItem; index: number }) {
  const portrait =
    item.aspectRatio === "9/16" ||
    item.aspectRatio === "3/4" ||
    item.aspectRatio === "4/5"
  const num = String(index).padStart(2, "0")
  return (
    <article className="pitch-film pitch-reveal" data-film-idx={index - 1}>
      <div className="pitch-film__head">
        <span className="pitch-film__ghost" aria-hidden="true">
          {num}
        </span>
        <div className="pitch-film__headText">
          <span className="pitch-film__kicker">
            <span className="pitch-film__kicker-line" />
            Film {num}
          </span>
          <h2 className="pitch-film__title">{item.title}</h2>
          {item.description && (
            <p className="pitch-film__desc">{item.description}</p>
          )}
        </div>
      </div>
      <div
        className={`pitch-film__stage${portrait ? " pitch-film__stage--portrait" : ""}`}
      >
        <span className="pitch-corner pitch-corner--tl" aria-hidden="true" />
        <span className="pitch-corner pitch-corner--tr" aria-hidden="true" />
        <span className="pitch-corner pitch-corner--bl" aria-hidden="true" />
        <span className="pitch-corner pitch-corner--br" aria-hidden="true" />
        <PitchPlayer
          videoId={item.videoId}
          posterUrl={item.posterUrl}
          aspectRatio={item.aspectRatio}
          title={item.title}
        />
      </div>
      {(item.masterDownloadUrl || item.instagramUrl) && (
        <div className="pitch-film__links">
          {item.masterDownloadUrl && (
            <a
              className="pitch-film__master"
              href={item.masterDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowDownToLine size={13} />
              Download master
            </a>
          )}
          {item.instagramUrl && (
            <a
              className="pitch-film__master"
              href={item.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <InstagramIcon size={13} />
              View on Instagram
            </a>
          )}
        </div>
      )}
    </article>
  )
}
