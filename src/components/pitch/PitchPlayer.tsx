import { useCallback, useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"
import { hlsUrl, videoUrl, normalizeVideoId } from "../../lib/bunny"

interface PitchPlayerProps {
  videoId: string
  posterUrl: string
  aspectRatio?: string
  title?: string
}

/**
 * Screening-room player: poster-first, click-to-play WITH SOUND.
 *
 * The opposite lifecycle of the grid's VideoPlayer (muted loop wallpaper):
 * a pitch film plays deliberately, once, with audio. Zero video bandwidth
 * until the visitor taps play.
 *
 * Quality: HLS master playlist = the highest rendition Bunny has for the
 * video (2160p automatically once the library encodes it).
 *   - Safari / all iOS browsers: native HLS on the <video> element
 *   - Chrome / Firefox / Edge: hls.js, lazy-imported on first play,
 *     capLevelToPlayerSize:false so it always climbs to the top rendition
 *   - Any fatal error: fall back to the 1080p MP4
 *
 * `pitch:play-others-pause` — one film has the floor at a time.
 */
export function PitchPlayer({
  videoId: rawVideoId,
  posterUrl,
  aspectRatio = "16/9",
  title,
}: PitchPlayerProps) {
  const videoId = normalizeVideoId(rawVideoId)
  const videoRef = useRef<HTMLVideoElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const handleDotRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<any>(null)
  const seekingRef = useRef(false)
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const instanceId = useRef(
    `pp-${videoId}-${Math.random().toString(36).slice(2, 8)}`
  )

  const [phase, setPhase] = useState<
    "poster" | "loading" | "playing" | "paused" | "ended"
  >("poster")
  const [isMuted, setIsMuted] = useState(false)
  const [isMobile] = useState(() => {
    if (typeof window === "undefined") return false
    const w = window.innerWidth || window.screen?.width || 1024
    return w <= 768
  })

  /** Attach the best source for this browser (called once, on first play).
   *  Quality-first: hls.js pinned to the TOP rendition wherever MSE exists
   *  (Chrome/Firefox/Edge AND Safari desktop). Native HLS ABR is never used —
   *  verified parking at 240p indefinitely on good connections. iOS WebKit
   *  (no MSE) gets the direct 1080p MP4: deterministic full quality. */
  const attachSource = useCallback(async (): Promise<void> => {
    const video = videoRef.current
    if (!video || video.dataset.attached) return
    video.dataset.attached = "1"

    const src = hlsUrl(videoId)

    try {
      const { default: Hls } = await import("hls.js")
      if (Hls.isSupported()) {
        const hls = new Hls({
          // Never cap quality to the element size — a 1100px frame should
          // still receive the 2160p rendition when it exists
          capLevelToPlayerSize: false,
          // Assume a fast pipe so the FIRST fragment is already high quality
          // (the default conservative estimate started screenings at 480p)
          abrEwmaDefaultEstimate: 10_000_000,
          maxBufferLength: 45,
        })
        hlsRef.current = hls
        // A screening is quality-first: pin playback to the TOP rendition
        // (1080p today, 2160p automatically once the library encodes it)
        // instead of letting ABR coast at a low level.
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const top = hls.levels.length - 1
          hls.startLevel = top
          hls.currentLevel = top
        })
        let recovered = false
        hls.on(Hls.Events.ERROR, (_evt: any, data: any) => {
          if (!data?.fatal) return
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recovered) {
            recovered = true
            hls.recoverMediaError()
            return
          }
          // Fatal and unrecoverable — fall back to the 1080p MP4
          try {
            hls.destroy()
          } catch {}
          hlsRef.current = null
          video.src = videoUrl(videoId, "1080p")
          video.play().catch(() => {})
        })
        hls.loadSource(src)
        hls.attachMedia(video)
        return
      }
    } catch {
      // hls.js failed to load — fall through to MP4
    }
    // iOS WebKit or any environment without MSE: top-quality MP4 directly
    video.src = videoUrl(videoId, "1080p")
  }, [videoId])

  const handlePlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    setPhase("loading")
    // Take the floor — pause every other pitch player
    window.dispatchEvent(
      new CustomEvent("pitch:play-others-pause", {
        detail: { except: instanceId.current },
      })
    )
    await attachSource()
    video.muted = false
    setIsMuted(false)
    try {
      await video.play()
    } catch {
      // Autoplay-with-sound rejected outside a trusted gesture — retry muted
      // so at least the picture starts, visitor can unmute
      video.muted = true
      setIsMuted(true)
      video.play().catch(() => setPhase("poster"))
    }
  }, [attachSource])

  // One film has the floor at a time
  useEffect(() => {
    const onOthersPlay = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.except === instanceId.current) return
      const video = videoRef.current
      if (video && !video.paused) {
        video.pause()
      }
    }
    window.addEventListener("pitch:play-others-pause", onOthersPlay)
    return () =>
      window.removeEventListener("pitch:play-others-pause", onOthersPlay)
  }, [])

  // Video element event wiring
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onPlaying = () => setPhase("playing")
    const onPause = () => {
      // `pause` also fires right before `ended`
      if (!video.ended) setPhase("paused")
    }
    const onEnded = () => setPhase("ended")
    const onWaiting = () => setPhase((p) => (p === "playing" ? "loading" : p))
    video.addEventListener("playing", onPlaying)
    video.addEventListener("pause", onPause)
    video.addEventListener("ended", onEnded)
    video.addEventListener("waiting", onWaiting)
    return () => {
      video.removeEventListener("playing", onPlaying)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("ended", onEnded)
      video.removeEventListener("waiting", onWaiting)
    }
  }, [])

  // Cleanup hls.js on unmount
  useEffect(() => {
    return () => {
      try {
        hlsRef.current?.destroy()
      } catch {}
    }
  }, [])

  // Progress bar via refs (timeupdate ~4Hz is visually sufficient)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const update = () => {
      if (video.duration && !seekingRef.current) {
        const pct = (video.currentTime / video.duration) * 100
        if (fillRef.current) fillRef.current.style.width = `${pct}%`
        if (handleDotRef.current) handleDotRef.current.style.left = `${pct}%`
      }
    }
    video.addEventListener("timeupdate", update)
    return () => video.removeEventListener("timeupdate", update)
  }, [])

  const showBar = useCallback(() => {
    const bar = barRef.current
    const dot = handleDotRef.current
    if (bar) bar.style.height = "6px"
    if (dot) dot.style.opacity = "1"
    if (controlsTimer.current) clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => {
      if (!seekingRef.current) {
        if (bar) bar.style.height = "3px"
        if (dot) dot.style.opacity = "0"
      }
    }, 2200)
  }, [])

  const seekTo = useCallback((clientX: number) => {
    const bar = barRef.current
    const video = videoRef.current
    if (!bar || !video || !video.duration) return
    const rect = bar.getBoundingClientRect()
    const pct = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100)
    )
    if (fillRef.current) fillRef.current.style.width = `${pct}%`
    if (handleDotRef.current) handleDotRef.current.style.left = `${pct}%`
    video.currentTime = (pct / 100) * video.duration
  }, [])

  const handleSeekStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation()
      e.preventDefault()
      seekingRef.current = true
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      seekTo(clientX)
      const move = (ev: MouseEvent | TouchEvent) => {
        const x =
          "touches" in ev
            ? (ev as TouchEvent).touches[0]?.clientX ?? 0
            : (ev as MouseEvent).clientX
        seekTo(x)
      }
      const end = () => {
        seekingRef.current = false
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", end)
        window.removeEventListener("touchmove", move)
        window.removeEventListener("touchend", end)
      }
      window.addEventListener("mousemove", move)
      window.addEventListener("mouseup", end)
      window.addEventListener("touchmove", move)
      window.addEventListener("touchend", end)
    },
    [seekTo]
  )

  const handleSurfaceClick = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (phase === "poster" || phase === "ended") {
      if (phase === "ended") video.currentTime = 0
      handlePlay()
      return
    }
    if (video.paused) {
      window.dispatchEvent(
        new CustomEvent("pitch:play-others-pause", {
          detail: { except: instanceId.current },
        })
      )
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [phase, handlePlay])

  const handleMuteToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const video = videoRef.current
      if (!video) return
      const next = !isMuted
      video.muted = next
      setIsMuted(next)
    },
    [isMuted]
  )

  const handleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    if (video.requestFullscreen) video.requestFullscreen()
    else if ((video as any).webkitEnterFullscreen)
      (video as any).webkitEnterFullscreen()
    else if ((video as any).webkitRequestFullscreen)
      (video as any).webkitRequestFullscreen()
  }, [])

  const showPoster = phase === "poster" || phase === "ended"
  const isLoading = phase === "loading"
  const hasStarted = phase !== "poster"

  return (
    <div
      className="pitch-player"
      style={{ aspectRatio }}
      onClick={handleSurfaceClick}
      onMouseMove={hasStarted ? showBar : undefined}
      onTouchStart={hasStarted ? showBar : undefined}
      role="button"
      aria-label={
        showPoster ? `Play ${title || "film"}` : `Pause ${title || "film"}`
      }
    >
      <video
        ref={videoRef}
        poster={posterUrl}
        playsInline
        preload="none"
        controlsList="nodownload"
        style={{ aspectRatio }}
      />

      {/* Poster layer */}
      <img
        src={posterUrl}
        alt=""
        decoding="async"
        className={`pitch-player__poster${showPoster ? " pitch-player__poster--armed" : ""}`}
        style={{ opacity: showPoster ? 1 : 0, pointerEvents: "none" }}
      />
      <div
        className="pitch-player__scrim"
        style={{ opacity: showPoster ? 1 : 0 }}
      />

      {/* Play / replay affordance */}
      <div
        className={`pitch-player__play${showPoster ? " pitch-player__play--armed" : ""}`}
        style={{
          opacity: showPoster ? 1 : 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        {phase === "ended" ? (
          <RotateCcw size={22} strokeWidth={1.8} />
        ) : (
          <Play
            size={24}
            strokeWidth={1.5}
            fill="rgba(255,255,255,0.9)"
            style={{ marginLeft: 3 }}
          />
        )}
      </div>

      {/* Buffering spinner (delayed fade-in so it never flashes) */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 4,
            pointerEvents: "none",
            opacity: 0,
            animation: "pp-spin-fade 0.3s ease 0.5s forwards",
          }}
        >
          <div
            style={{
              width: isMobile ? 30 : 38,
              height: isMobile ? 30 : 38,
              borderRadius: "50%",
              border: "2.5px solid rgba(255,255,255,0.22)",
              borderTopColor: "rgba(255,255,255,0.92)",
              animation: "pp-spin 0.8s linear infinite",
            }}
          />
          <style>{`
            @keyframes pp-spin { to { transform: rotate(360deg); } }
            @keyframes pp-spin-fade { to { opacity: 1; } }
          `}</style>
        </div>
      )}

      {/* Paused indicator */}
      {phase === "paused" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 4,
            width: isMobile ? 48 : 60,
            height: isMobile ? 48 : 60,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            pointerEvents: "none",
          }}
        >
          <Play size={isMobile ? 18 : 22} fill="#fff" style={{ marginLeft: 2 }} />
        </div>
      )}

      {/* Corner controls — only once playback has started */}
      {hasStarted && !showPoster && (
        <div
          style={{
            position: "absolute",
            bottom: isMobile ? 14 : 18,
            right: isMobile ? 10 : 14,
            display: "flex",
            gap: 8,
            zIndex: 5,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            onClick={handleMuteToggle}
            role="button"
            aria-label={isMuted ? "Unmute" : "Mute"}
            style={cornerBtnStyle(isMobile)}
          >
            {isMuted ? (
              <VolumeX size={isMobile ? 14 : 16} color="#fff" />
            ) : (
              <Volume2 size={isMobile ? 14 : 16} color="#fff" />
            )}
          </div>
          <div
            onClick={handleFullscreen}
            role="button"
            aria-label="Fullscreen"
            style={cornerBtnStyle(isMobile)}
          >
            <Maximize size={isMobile ? 14 : 16} color="#fff" />
          </div>
        </div>
      )}

      {/* Seek bar */}
      {hasStarted && !showPoster && (
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
            background: "rgba(255,255,255,0.16)",
            cursor: "pointer",
            transition: "height 0.2s ease",
            zIndex: 6,
          }}
        >
          <div
            ref={fillRef}
            style={{
              height: "100%",
              width: "0%",
              background: "rgba(255,255,255,0.85)",
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
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 0 4px rgba(0,0,0,0.4)",
              opacity: 0,
              transition: "opacity 0.2s ease",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
    </div>
  )
}

function cornerBtnStyle(isMobile: boolean): React.CSSProperties {
  return {
    width: isMobile ? 34 : 38,
    height: isMobile ? 34 : 38,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s ease",
  }
}
