import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { SpecialText } from "./special-text"

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Work", href: "/#portfolio" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export function HeroNav() {
  const [isScrolling, setIsScrolling] = useState(false)
  const [introPhase, setIntroPhase] = useState<"waiting" | "entering" | "ready">("waiting")
  const [hasIntro, setHasIntro] = useState(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect intro state and manage entrance
  useEffect(() => {
    const hero = document.getElementById("hero")
    const introPlayed = hero?.classList.contains("hero--with-intro") ?? false
    setHasIntro(introPlayed)

    if (introPlayed) {
      // Wait for intro to be mostly done, then enter
      const enterTimer = setTimeout(() => setIntroPhase("entering"), 6200)
      const readyTimer = setTimeout(() => setIntroPhase("ready"), 7400)
      return () => {
        clearTimeout(enterTimer)
        clearTimeout(readyTimer)
      }
    } else {
      // No intro — enter immediately, ready after decipher
      setIntroPhase("entering")
      const readyTimer = setTimeout(() => setIntroPhase("ready"), 1500)
      return () => clearTimeout(readyTimer)
    }
  }, [])

  // Scroll listener — only active once ready
  useEffect(() => {
    if (introPhase !== "ready") return

    const handleScroll = () => {
      setIsScrolling(true)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 250)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [introPhase])

  const handleClick = () => {
    try {
      sessionStorage.setItem("duddcash_nav", "1")
    } catch {}
  }

  // Compute SpecialText delays
  const getDelay = (index: number): number => {
    if (hasIntro) {
      return 6.5 + index * 0.2
    }
    return 0.2 + index * 0.2
  }

  // Determine motion animate target
  const getAnimate = () => {
    if (introPhase === "waiting") {
      return { opacity: 0, y: 20, filter: "blur(0px)" }
    }
    if (introPhase === "entering") {
      return { opacity: 1, y: 0, filter: "blur(0px)" }
    }
    // ready — respond to scroll
    if (isScrolling) {
      return { opacity: 0, y: -30, filter: "blur(3px)" }
    }
    return { opacity: 1, y: 0, filter: "blur(0px)" }
  }

  return (
    <motion.nav
      className="hero__nav"
      initial={{ opacity: 0, y: 20, filter: "blur(0px)" }}
      animate={getAnimate()}
      transition={{
        duration: introPhase === "entering" ? 0.9 : 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
      }}
    >
      {NAV_ITEMS.map((item, i) => (
        <a
          key={item.label}
          href={item.href}
          className="hero__nav-link"
          onClick={handleClick}
        >
          <SpecialText
            text={item.label}
            speed={25}
            delay={getDelay(i)}
          />
        </a>
      ))}
    </motion.nav>
  )
}

export default HeroNav
