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
 * The screening room — client-facing pitch page experience.
 *
 * Mounted client:only on /pitch-viewer/ (served rewritten at /p/<slug>).
 * Reads the pitch JSON injected into #__PITCH_DATA__ by the pitch-page
 * function. Handles the veil→hero handoff, the film program, and the
 * closing CTA. Native scroll; zero scroll hijacking.
 */
export function PitchViewer() {
  const [pitch, setPitch] = useState<Pitch | null | undefined>(undefined)

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
    if (!veil) return
    const isIAB =
      /Instagram|FBAN|FBAV|FB_IAB|Messenger|MicroMessenger|Snapchat|TikTok|musical_ly|LinkedInApp|Twitter|Line\//i.test(
        navigator.userAgent
      )
    const hold = pitch === null ? 0 : isIAB ? 250 : 1400
    const t = setTimeout(() => {
      veil.classList.add("pitch-veil--hidden")
      // Remove from the tree once faded so it can never intercept input
      setTimeout(() => veil.remove(), 1000)
    }, hold)
    return () => clearTimeout(t)
  }, [pitch])

  // IO scroll reveals for .pitch-reveal elements
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
    return () => io.disconnect()
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

  const preparedFor = pitch.clientName
    ? `Prepared for ${pitch.clientName}`
    : "A private screening"
  const dateLabel = new Date(
    pitch.updatedAt || pitch.createdAt || Date.now()
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div ref={rootRef}>
      {/* ── Hero ── */}
      <header className="pitch-hero">
        <div className="pitch-container">
          <p className="pitch-eyebrow pitch-reveal">
            {preparedFor} · {dateLabel}
          </p>
          <h1 className="pitch-title pitch-reveal">{pitch.title}</h1>
          {pitch.note && (
            <p className="pitch-note pitch-reveal">{pitch.note}</p>
          )}
        </div>
        <div className="pitch-container">
          <hr className="pitch-hero__rule" />
        </div>
      </header>

      {/* ── Program ── */}
      <section className="pitch-program">
        <div className="pitch-container">
          <FilmBlock item={hero} index={1} />
          {rest.map((item, i) => (
            <FilmBlock key={item.videoId} item={item} index={i + 2} />
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
  return (
    <article className="pitch-film pitch-reveal">
      <div className="pitch-film__head">
        <span className="pitch-film__index">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="pitch-film__title">{item.title}</h2>
      </div>
      {item.description ? (
        <p className="pitch-film__desc">{item.description}</p>
      ) : (
        <div className="pitch-film__desc pitch-film__desc--empty" />
      )}
      <div
        className={`pitch-film__stage${portrait ? " pitch-film__stage--portrait" : ""}`}
      >
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
