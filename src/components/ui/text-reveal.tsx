import { motion } from "motion/react"

interface TextRevealProps {
  text: string
  className?: string
  style?: React.CSSProperties
  staggerDelay?: number
  initialDelay?: number
  animateOnMount?: boolean
}

export function TextReveal({
  text,
  className,
  style,
  staggerDelay = 0.08,
  initialDelay = 0.2,
  animateOnMount = false,
}: TextRevealProps) {
  if (!text) return null
  const words = text.split(" ")

  return (
    <span className={className} style={{ ...style, display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.3em" }}>
      {words.map((word, i) => (
        <span key={i} style={{ overflow: "hidden", display: "inline-block" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "100%", opacity: 0 }}
            {...(animateOnMount
              ? { animate: { y: "0%", opacity: 1 } }
              : { whileInView: { y: "0%", opacity: 1 }, viewport: { once: true, margin: "-50px" } }
            )}
            transition={{
              duration: 0.6,
              delay: initialDelay + i * staggerDelay,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
