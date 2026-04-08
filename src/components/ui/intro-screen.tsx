import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { SpecialText } from "./special-text"
import { FallingPattern } from "./falling-pattern"

const INTRO_DURATION = 5000

/**
 * Play logic:
 *   - First visit (no "duddcash_visited" key)        → play
 *   - Refresh / typed URL (no "duddcash_nav" flag)    → play
 *   - Internal navigation ("duddcash_nav" flag set)   → skip
 *
 * The "duddcash_nav" flag is set by a global click listener (in BaseLayout)
 * whenever the user clicks an internal link. It gets consumed here on load.
 * A refresh never sets that flag (no click happens), so it plays.
 */
function shouldPlayIntro(): boolean {
  if (typeof window === "undefined") return false

  // First visit ever this session
  if (!sessionStorage.getItem("duddcash_visited")) {
    sessionStorage.setItem("duddcash_visited", "1")
    return true
  }

  // Returning to page — check if we came from an internal link click
  const cameFromNav = sessionStorage.getItem("duddcash_nav")
  if (cameFromNav) {
    sessionStorage.removeItem("duddcash_nav")
    return false // internal navigation → skip
  }

  // No nav flag = refresh, typed URL, bookmark, etc → play
  return true
}

export function IntroScreen() {
  const [shouldPlay, setShouldPlay] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"loading" | "flash" | "settle" | "done">("loading")
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    setShouldPlay(shouldPlayIntro())
  }, [])

  const tick = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp
    const elapsed = timestamp - startTimeRef.current
    const pct = Math.min(elapsed / INTRO_DURATION, 1)
    setProgress(pct)

    if (pct < 1) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      setTimeout(() => setPhase("flash"), 250)
    }
  }, [])

  useEffect(() => {
    if (shouldPlay !== true) return
    const delay = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick)
    }, 200)
    return () => {
      clearTimeout(delay)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [shouldPlay, tick])

  useEffect(() => {
    if (phase === "flash") {
      const t = setTimeout(() => setPhase("settle"), 150)
      return () => clearTimeout(t)
    }
    if (phase === "settle") {
      const t = setTimeout(() => setPhase("done"), 900)
      return () => clearTimeout(t)
    }
  }, [phase])

  if (shouldPlay !== true) return null
  if (phase === "done") return null

  return (
    <>
      <AnimatePresence>
        {phase === "loading" && (
          <motion.div
            key="intro-dark"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, ease: "easeIn" },
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0a0a0a",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", inset: 0 }}>
              <FallingPattern
                color="rgba(255,255,255,0.06)"
                backgroundColor="transparent"
                duration={80}
                blurIntensity="0.8em"
                density={1}
                className="h-full w-full"
              />
            </div>

            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "28px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "max(0.85vw, 13px)",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  color: "#fff",
                  whiteSpace: "pre",
                }}
              >
                <SpecialText text="DUDDCASH STUDIO" speed={40} delay={0.3} />
              </div>

              <div
                style={{
                  width: "180px",
                  height: "1px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "1px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "rgba(255,255,255,0.6)",
                    borderRadius: "1px",
                    width: `${progress * 100}%`,
                    transition: "width 0.05s linear",
                  }}
                />
              </div>

              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  fontWeight: 400,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.3)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(Math.round(progress * 100)).padStart(3, "0")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(phase === "flash" || phase === "settle") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                phase === "flash"
                  ? "radial-gradient(ellipse at 52% 48%, #fff 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.3) 100%)"
                  : "transparent",
              opacity: phase === "flash" ? 1 : 0,
              transition:
                phase === "settle"
                  ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 52% 48%, rgba(255,255,255,0.6) 0%, transparent 65%)",
              opacity: phase === "flash" ? 1 : 0,
              transition:
                phase === "settle"
                  ? "opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s"
                  : "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: phase === "flash" ? 0.12 : 0,
              transition:
                phase === "settle"
                  ? "opacity 0.6s ease-out 0.3s"
                  : "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
    </>
  )
}
