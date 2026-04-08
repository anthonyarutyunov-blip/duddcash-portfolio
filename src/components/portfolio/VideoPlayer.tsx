import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "motion/react"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"
import { videoUrl, thumbnailUrl } from "../../lib/bunny"

interface VideoPlayerProps {
  videoId: string
  title?: string
  description?: string
  aspectRatio?: string
}

/**
 * Video player: autoplay muted, click to pause/play, corner button to mute/unmute.
 * Uses IntersectionObserver to only play when visible.
 * Coordinates with other players via custom events (only one has sound at a time).
 * Seek bar updates via refs for smooth 60fps.
 */
export function VideoPlayer({
  videoId,
  title,
  description,
  aspectRatio = "16/9",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const handleDotRef = useRef<HTMLDivElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showPlayIcon, setShowPlayIcon] = useState(false)
  const iconTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const seekingRef = useRef(false)
  const userPausedRef = useRef(false)
  const instanceId = useRef(`vp-${videoId}-${Math.random().toString(36).slice(2, 8)}`)

  // Intersection Observer — only autoplay when visible
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Play/pause based on visibility (respects user pause)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isVisible && !userPausedRef.current) {
      video.play().catch(() => {})
      setIsPaused(false)
    } else {
      video.pause()
    }
  }, [isVisible])

  // Track progress — direct DOM updates, no React state
  useEffect(() => {
    const video = videoRef.current
    const fill = fillRef.current
    const handle = handleDotRef.current
    if (!video || !fill) return

    const tick = () => {
      if (video.duration && !seekingRef.current) {
        const pct = (video.currentTime / video.duration) * 100
        fill.style.width = `${pct}%`
        if (handle) handle.style.left = `${pct}%`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Listen for mute-others events from sibling VideoPlayers
  useEffect(() => {
    const handleMuteOthers = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.except !== instanceId.current && videoRef.current) {
        videoRef.current.muted = true
        setIsMuted(true)
      }
    }

    window.addEventListener("portfolio:mute-others", handleMuteOthers)
    return () =>
      window.removeEventListener("portfolio:mute-others", handleMuteOthers)
  }, [])

  // Click video area = toggle play/pause
  const handleClick = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().catch(() => {})
      userPausedRef.current = false
      setIsPaused(false)
    } else {
      video.pause()
      userPausedRef.current = true
      setIsPaused(true)
    }

    // Flash the play/pause icon
    setShowPlayIcon(true)
    if (iconTimer.current) clearTimeout(iconTimer.current)
    iconTimer.current = setTimeout(() => setShowPlayIcon(false), 800)
  }, [])

  // Mute button click (corner) — separate from play/pause
  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger play/pause
    const video = videoRef.current
    if (!video) return

    const newMuted = !isMuted
    video.muted = newMuted
    setIsMuted(newMuted)

    // If unmuting, tell all other players to mute
    if (!newMuted) {
      window.dispatchEvent(
        new CustomEvent("portfolio:mute-others", {
          detail: { except: instanceId.current },
        })
      )
    }
  }, [isMuted])

  // Show/hide expanded bar on hover
  const showBar = useCallback(() => {
    const bar = barRef.current
    const handle = handleDotRef.current
    if (bar) bar.style.height = "6px"
    if (handle) handle.style.opacity = "1"
    if (controlsTimer.current) clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => {
      if (!seekingRef.current) {
        if (bar) bar.style.height = "3px"
        if (handle) handle.style.opacity = "0"
      }
    }, 2500)
  }, [])

  // Seek helpers — direct DOM, no state
  const seekTo = useCallback((clientX: number) => {
    const bar = barRef.current
    const fill = fillRef.current
    const handle = handleDotRef.current
    const video = videoRef.current
    if (!bar || !fill || !video || !video.duration) return

    const rect = bar.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    fill.style.width = `${pct}%`
    if (handle) handle.style.left = `${pct}%`
    video.currentTime = (pct / 100) * video.duration
  }, [])

  const handleSeekStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation()
      e.preventDefault()
      seekingRef.current = true

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      seekTo(clientX)

      const bar = barRef.current
      const handle = handleDotRef.current
      if (bar) bar.style.height = "6px"
      if (handle) handle.style.opacity = "1"

      const handleMove = (ev: MouseEvent | TouchEvent) => {
        const x = "touches" in ev
          ? (ev as TouchEvent).touches[0].clientX
          : (ev as MouseEvent).clientX
        seekTo(x)
      }

      const handleEnd = () => {
        seekingRef.current = false
        window.removeEventListener("mousemove", handleMove)
        window.removeEventListener("mouseup", handleEnd)
        window.removeEventListener("touchmove", handleMove)
        window.removeEventListener("touchend", handleEnd)
        if (controlsTimer.current) clearTimeout(controlsTimer.current)
        controlsTimer.current = setTimeout(() => {
          if (bar) bar.style.height = "3px"
          if (handle) handle.style.opacity = "0"
        }, 1500)
      }

      window.addEventListener("mousemove", handleMove)
      window.addEventListener("mouseup", handleEnd)
      window.addEventListener("touchmove", handleMove)
      window.addEventListener("touchend", handleEnd)
    },
    [seekTo]
  )

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={showBar}
      onMouseEnter={showBar}
      onTouchStart={showBar}
      style={{
        position: "relative",
        aspectRatio,
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        background: "#111",
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl(videoId, "1080p")}
        poster={thumbnailUrl(videoId)}
        muted
        loop
        playsInline
        preload="none"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Center play/pause flash indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: showPlayIcon ? 1 : 0,
          scale: showPlayIcon ? 1 : 0.5,
        }}
        transition={{ duration: 0.15 }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          borderRadius: "50%",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        {isPaused ? <Play size={24} fill="#fff" /> : <Pause size={24} />}
      </motion.div>

      {/* Mute/unmute button (bottom-right corner, always clickable) */}
      <div
        onClick={handleMuteToggle}
        role="button"
        aria-label={isMuted ? "Unmute" : "Mute"}
        style={{
          position: "absolute",
          bottom: 40,
          right: 8,
          background: "rgba(0,0,0,0.5)",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 4,
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.7)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.5)")
        }
      >
        {isMuted ? (
          <VolumeX size={15} color="#fff" />
        ) : (
          <Volume2 size={15} color="#fff" />
        )}
      </div>

      {/* Seek / progress bar */}
      <div
        ref={barRef}
        onMouseDown={handleSeekStart}
        onTouchStart={handleSeekStart}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.15)",
          cursor: "pointer",
          transition: "height 0.2s ease",
          zIndex: 5,
        }}
      >
        <div
          ref={fillRef}
          style={{
            height: "100%",
            width: "0%",
            background: "rgba(255,255,255,0.75)",
            pointerEvents: "none",
          }}
        />
        <div
          ref={handleDotRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "0%",
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
            opacity: 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Title + description overlay at bottom */}
      {title && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px 12px 14px",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <p
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                margin: 0,
              }}
            >
              {title}
            </p>
            {description && (
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 11,
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
