import React, { useRef, useEffect, useId, useState } from "react"
import { cn } from "../../lib/utils"
import {
  motion,
  useMotionValue,
  useMotionTemplate,
} from "motion/react"

interface InfiniteGridProps {
  className?: string
  children?: React.ReactNode
  height?: string
  speedX?: number
  speedY?: number
  spotlightSize?: number
}

export function InfiniteGrid({
  className,
  children,
  height = "100vh",
  speedX = 0.5,
  speedY = 0.5,
  spotlightSize = 300,
}: InfiniteGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const patternId = useId().replace(/:/g, "")
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && (window.innerWidth <= 768 || "ontouchstart" in window)
  )
  const [isSafari] = useState(() =>
    typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  )
  const rafRef = useRef<number | null>(null)

  const mouseX = useMotionValue(-999)
  const mouseY = useMotionValue(-999)

  // Pause when off-screen
  useEffect(() => {
    if (isMobile || isSafari) return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isMobile])

  // Use window-level mouse tracking so it works even when behind other content
  useEffect(() => {
    if (isMobile || isSafari || !isVisible) return
    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isMobile, isVisible, mouseX, mouseY])

  const gridOffsetX = useMotionValue(0)
  const gridOffsetY = useMotionValue(0)

  // Manual RAF loop that fully stops when not visible (instead of useAnimationFrame which always ticks)
  useEffect(() => {
    if (isMobile || isSafari || !isVisible) return
    function tick() {
      gridOffsetX.set((gridOffsetX.get() + speedX) % 40)
      gridOffsetY.set((gridOffsetY.get() + speedY) % 40)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [isMobile, isVisible, speedX, speedY, gridOffsetX, gridOffsetY])

  const maskImage = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, black, transparent)`

  // Mobile: no grid at all. Safari: static grid only (no RAF, no mousemove)
  if (isMobile) {
    return (
      <div
        className={cn("relative w-full overflow-hidden", className)}
        style={{ height }}
      >
        {children && (
          <div className="relative z-10">
            {children}
          </div>
        )}
      </div>
    )
  }

  if (isSafari) {
    return (
      <div
        ref={containerRef}
        className={cn("relative w-full overflow-hidden", className)}
        style={{ height, pointerEvents: "none" }}
      >
        {/* Static background grid — no animation, no cursor mask */}
        <div className="absolute inset-0 z-0 opacity-[0.04]">
          <StaticGridPattern patternId={`${patternId}-static`} />
        </div>
        {children && (
          <div className="relative z-10" style={{ pointerEvents: "auto" }}>
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ height, pointerEvents: "none", contain: "layout style paint" }}
    >
      {/* Subtle background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.04]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} patternId={`${patternId}-bg`} />
      </div>

      {/* Cursor-revealed bright grid */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} patternId={`${patternId}-fg`} />
      </motion.div>

      {/* Content */}
      {children && (
        <div className="relative z-10" style={{ pointerEvents: "auto" }}>
          {children}
        </div>
      )}
    </div>
  )
}

function StaticGridPattern({ patternId }: { patternId: string }) {
  return (
    <svg className="w-full h-full">
      <defs>
        <pattern
          id={patternId}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            style={{ color: "var(--color-muted)" }}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

function GridPattern({
  offsetX,
  offsetY,
  patternId,
}: {
  offsetX: ReturnType<typeof useMotionValue>
  offsetY: ReturnType<typeof useMotionValue>
  patternId: string
}) {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id={patternId}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            style={{ color: "var(--color-muted)" }}
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
