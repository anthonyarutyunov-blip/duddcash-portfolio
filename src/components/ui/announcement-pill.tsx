import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { announcement } from "../../data/announcement"

const DISMISS_KEY = "duddcash_announcement_dismissed"

/**
 * Small dismissible "new work" pill, bottom-left on desktop / bottom-center
 * on mobile. Deliberately NOT a modal — it never blocks the hero.
 *
 * Show rules:
 *  - hidden if announcement.enabled is false
 *  - hidden if this announcement id was already dismissed (localStorage)
 *  - hidden on share-link visits (?project=) — those users already have a target
 *  - waits for the intro animation when it plays
 */
export function AnnouncementPill() {
  const [visible, setVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (!announcement.enabled) return
    try {
      if (localStorage.getItem(DISMISS_KEY) === announcement.id) return
      // Deep-linked visitors are already headed somewhere specific
      if (new URLSearchParams(window.location.search).has("project")) return
    } catch {}

    // If the intro is playing, wait for it to finish (~6.3s) + a beat
    const withIntro = document
      .getElementById("hero")
      ?.classList.contains("hero--with-intro")
    const delay = withIntro ? 7200 : 1800
    const t = setTimeout(() => {
      // Measure at show-time, not hydration — some webviews report a 0-width
      // viewport during early hydration, which would freeze the wrong mode
      const w = window.innerWidth
      setIsMobile(w > 0 && w <= 768)
      setVisible(true)
    }, delay)
    return () => clearTimeout(t)
  }, [])

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, announcement.id)
    } catch {}
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={announcement.href}
          data-astro-reload
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => {
            // Force a full-page navigation. Astro's ClientRouter treats a
            // same-path ?query link as an in-page navigation and swallows it
            // (Safari especially — clicks appeared to do nothing / need
            // multiple taps). location.assign is deterministic everywhere.
            e.preventDefault()
            try {
              localStorage.setItem(DISMISS_KEY, announcement.id)
            } catch {}
            window.location.assign(announcement.href)
          }}
          style={{
            position: "fixed",
            bottom: isMobile ? 14 : 28,
            // No transform-based centering — framer-motion owns `transform`
            // for the entrance animation and would overwrite it.
            left: isMobile ? 14 : 28,
            right: isMobile ? 14 : "auto",
            margin: isMobile ? "0 auto" : undefined,
            width: "fit-content",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 8 : 12,
            padding: isMobile ? "6px 10px 6px 6px" : "10px 14px 10px 10px",
            maxWidth: isMobile ? "min(300px, calc(100vw - 28px))" : 380,
            background: "rgba(17,17,17,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: isMobile ? 10 : 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            textDecoration: "none",
            cursor: "pointer",
            // Kill the 300ms tap delay / double-tap requirement on touch
            touchAction: "manipulation",
          }}
        >
          {announcement.image && (
            <img
              src={announcement.image}
              alt=""
              width={isMobile ? 34 : 52}
              height={isMobile ? 25 : 38}
              loading="lazy"
              decoding="async"
              style={{
                width: isMobile ? 34 : 52,
                height: isMobile ? 25 : 38,
                objectFit: "cover",
                borderRadius: isMobile ? 5 : 8,
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: isMobile ? 7 : 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(120,160,255,0.9)",
                marginBottom: isMobile ? 2 : 3,
              }}
            >
              {announcement.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: isMobile ? 10.5 : 13,
                fontWeight: 500,
                color: "#fff",
                lineHeight: 1.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {announcement.title}
            </div>
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: isMobile ? 13 : 16,
              flexShrink: 0,
              marginLeft: 2,
            }}
            aria-hidden="true"
          >
            &rarr;
          </span>
          <button
            onClick={dismiss}
            aria-label="Dismiss announcement"
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(40,40,42,0.95)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.6)",
              padding: 0,
              touchAction: "manipulation",
            }}
          >
            <X size={11} />
          </button>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
