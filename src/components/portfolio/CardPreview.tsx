import { useEffect, useRef, useState } from "react"
import { videoUrl } from "../../lib/bunny"

interface CardPreviewProps {
  videoId: string
  active: boolean
}

/**
 * Netflix-style hover video preview.
 * Loads a low-res MP4 on hover, auto-plays muted+looped.
 * Fades in over the thumbnail when ready.
 */
export function CardPreview({ videoId, active }: CardPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const hasLoaded = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (active) {
      // Only set src on first hover (lazy load)
      if (!hasLoaded.current) {
        video.src = videoUrl(videoId, "480p")
        hasLoaded.current = true
      }
      video.play().catch(() => {})
    } else {
      video.pause()
      if (hasLoaded.current) {
        video.currentTime = 0
      }
    }
  }, [active, videoId])

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      onCanPlayThrough={() => setReady(true)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: active && ready ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      }}
    />
  )
}
