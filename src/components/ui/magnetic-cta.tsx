import { useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

interface MagneticCTAProps {
  href: string
  children: React.ReactNode
  variant?: "default" | "outline"
}

export function MagneticCTA({ href, children, variant = "default" }: MagneticCTAProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)

  // Detect Safari synchronously — skip spring physics on Safari
  const [isSafari] = useState(() =>
    typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  )

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const rotateX = useTransform(springY, [-20, 20], [8, -8])
  const rotateY = useTransform(springX, [-20, 20], [-8, 8])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      x.set((e.clientX - cx) * 0.3)
      y.set((e.clientY - cy) * 0.3)
    },
    [x, y]
  )

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setHovered(false)
  }

  const className = `magnetic-cta${variant === "outline" ? " magnetic-cta--outline" : ""}`

  const sharedStyles = (
    <style>{`
      .magnetic-cta {
        position: relative;
        display: inline-flex;
        align-items: center;
        padding: 18px 40px;
        border-radius: 60px;
        background: rgba(0, 0, 0, 0.03);
        cursor: pointer;
        text-decoration: none;
        overflow: hidden;
        isolation: isolate;
        transition: background 0.4s ease;
      }

      .magnetic-cta:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      .magnetic-cta__border {
        position: absolute;
        inset: 0;
        border-radius: 60px;
        padding: 1.5px;
        background: linear-gradient(
          135deg,
          rgba(0, 0, 0, 0.15),
          rgba(0, 0, 0, 0.05),
          rgba(120, 100, 80, 0.3),
          rgba(0, 0, 0, 0.05),
          rgba(0, 0, 0, 0.15)
        );
        background-size: 300% 300%;
        animation: borderRotate 4s linear infinite;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }

      @keyframes borderRotate {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .magnetic-cta__shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 30%,
          rgba(200, 180, 140, 0.15) 45%,
          rgba(255, 255, 255, 0.25) 50%,
          rgba(200, 180, 140, 0.15) 55%,
          transparent 70%
        );
        background-size: 250% 100%;
        animation: shimmerSweep 2s ease-in-out infinite;
        border-radius: 60px;
        pointer-events: none;
        transition: opacity 0.4s ease;
      }

      @keyframes shimmerSweep {
        0% { background-position: 200% 0; }
        100% { background-position: -50% 0; }
      }

      .magnetic-cta__glow {
        position: absolute;
        inset: -20px;
        background: radial-gradient(
          ellipse at center,
          rgba(200, 180, 140, 0.15) 0%,
          transparent 70%
        );
        pointer-events: none;
        transition: opacity 0.5s ease;
        filter: blur(20px);
        z-index: -1;
      }

      .magnetic-cta__text {
        position: relative;
        z-index: 1;
        font-family: var(--font-display);
        font-size: clamp(14px, 1vw, 16px);
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color-text);
      }

      .magnetic-cta--outline {
        background: transparent;
      }

      .magnetic-cta--outline:hover {
        background: rgba(0, 0, 0, 0.03);
      }

      .magnetic-cta--outline .magnetic-cta__border {
        background: linear-gradient(
          135deg,
          rgba(0, 0, 0, 0.1),
          rgba(0, 0, 0, 0.06),
          rgba(0, 0, 0, 0.1)
        );
        background-size: 100% 100%;
        animation: none;
      }

      /* Safari: disable expensive animations and blur */
      :global(.safari) .magnetic-cta__border {
        animation: none;
      }

      :global(.safari) .magnetic-cta__shimmer {
        animation: none;
      }

      :global(.safari) .magnetic-cta__glow {
        filter: none;
        display: none;
      }
    `}</style>
  )

  // Safari: plain <a> tag — no spring physics, no 3D transforms
  if (isSafari) {
    return (
      <a
        ref={ref}
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={className}
      >
        <span className="magnetic-cta__border" />
        <span className="magnetic-cta__text">{children}</span>
        {sharedStyles}
      </a>
    )
  }

  // Chrome/Firefox: full magnetic effect with spring physics
  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
      className={className}
    >
      <span className="magnetic-cta__border" />
      <span
        className="magnetic-cta__shimmer"
        style={{ opacity: hovered ? 1 : 0 }}
      />
      <span
        className="magnetic-cta__glow"
        style={{ opacity: hovered ? 1 : 0 }}
      />
      <span className="magnetic-cta__text">{children}</span>
      {sharedStyles}
    </motion.a>
  )
}
