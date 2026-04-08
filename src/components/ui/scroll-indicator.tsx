import { useEffect, useState } from "react"
import { motion } from "motion/react"

export function ScrollIndicator() {
  const [entered, setEntered] = useState(false)
  const [visible, setVisible] = useState(true)

  // Handle intro timing
  useEffect(() => {
    const hero = document.getElementById("hero")
    const introPlayed = hero?.classList.contains("hero--with-intro") ?? false

    const delay = introPlayed ? 6800 : 400
    const timer = setTimeout(() => setEntered(true), delay)
    return () => clearTimeout(timer)
  }, [])

  // Fade out once user scrolls
  useEffect(() => {
    if (!entered) return
    const handleScroll = () => {
      if (window.scrollY > 60) setVisible(false)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [entered])

  return (
    <motion.div
      className="hero__scroll-indicator"
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: entered && visible ? 1 : 0,
        y: entered && visible ? 0 : 12,
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "3.5rem",
        pointerEvents: "none",
      }}
    >
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          width="32"
          height="56"
          viewBox="0 0 32 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem */}
          <line
            x1="16"
            y1="0"
            x2="16"
            y2="42"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Arrow head */}
          <path
            d="M6 34L16 48L26 34"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

export default ScrollIndicator
