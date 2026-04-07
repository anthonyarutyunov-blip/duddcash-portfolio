import React, { useRef, useEffect, useId } from "react"
import { cn } from "../../lib/utils"
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
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

  const mouseX = useMotionValue(-999)
  const mouseY = useMotionValue(-999)

  // Use window-level mouse tracking so it works even when behind other content
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const gridOffsetX = useMotionValue(0)
  const gridOffsetY = useMotionValue(0)

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + speedX) % 40)
    gridOffsetY.set((gridOffsetY.get() + speedY) % 40)
  })

  const maskImage = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, black, transparent)`

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ height, pointerEvents: "none" }}
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
