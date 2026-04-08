import { motion, useInView } from "motion/react"
import { useRef } from "react"

interface BlurRevealTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
  /** Delay between each character (seconds) */
  charDelay?: number
  /** Duration of each character's reveal (seconds) */
  charDuration?: number
  /** Initial delay before animation starts (seconds) */
  delay?: number
  /** Blur amount in px for the starting state */
  blurAmount?: number
  /** Whether to trigger on scroll into view (default: true) */
  triggerOnView?: boolean
}

export function BlurRevealText({
  text,
  className,
  style,
  charDelay = 0.04,
  charDuration = 0.6,
  delay = 0.2,
  blurAmount = 12,
  triggerOnView = true,
}: BlurRevealTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const shouldAnimate = triggerOnView ? isInView : true

  // Split text into characters, preserving spaces
  const chars = text.split("")

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: "inline-block",
        ...style,
      }}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden="true"
          initial={{
            filter: `blur(${blurAmount}px)`,
            opacity: 0,
            y: 4,
          }}
          animate={
            shouldAnimate
              ? {
                  filter: "blur(0px)",
                  opacity: 1,
                  y: 0,
                }
              : {
                  filter: `blur(${blurAmount}px)`,
                  opacity: 0,
                  y: 4,
                }
          }
          transition={{
            duration: charDuration,
            delay: delay + i * charDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : "normal",
            willChange: "filter, opacity, transform",
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

export default BlurRevealText
