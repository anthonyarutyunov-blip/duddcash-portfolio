import React from 'react'
import { motion } from 'motion/react'

type GradientDotsProps = {
  dotSize?: number
  spacing?: number
  duration?: number
  backgroundColor?: string
  className?: string
  style?: React.CSSProperties
  colors?: [string, string, string, string]
}

export function GradientDots({
  dotSize = 8,
  spacing = 10,
  duration = 30,
  backgroundColor = 'transparent',
  className,
  style,
  colors = [
    'rgba(190, 175, 150, 0.9)',
    'rgba(170, 185, 165, 0.8)',
    'rgba(180, 170, 195, 0.7)',
    'rgba(195, 180, 160, 0.85)',
  ],
}: GradientDotsProps) {
  const hexSpacing = spacing * 1.732

  return (
    <motion.div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor,
        backgroundImage: `
          radial-gradient(circle at 50% 50%, transparent 1.5px, ${backgroundColor} 0 ${dotSize}px, transparent ${dotSize}px),
          radial-gradient(circle at 50% 50%, transparent 1.5px, ${backgroundColor} 0 ${dotSize}px, transparent ${dotSize}px),
          radial-gradient(circle at 50% 50%, ${colors[0]}, transparent 60%),
          radial-gradient(circle at 50% 50%, ${colors[1]}, transparent 60%),
          radial-gradient(circle at 50% 50%, ${colors[2]}, transparent 60%),
          radial-gradient(ellipse at 50% 50%, ${colors[3]}, transparent 60%)
        `,
        backgroundSize: `
          ${spacing}px ${hexSpacing}px,
          ${spacing}px ${hexSpacing}px,
          200% 200%,
          200% 200%,
          200% 200%,
          200% ${hexSpacing}px
        `,
        backgroundPosition: `
          0px 0px, ${spacing / 2}px ${hexSpacing / 2}px,
          0% 0%,
          0% 0%,
          0% 0px
        `,
        transition: 'opacity 0.5s ease, filter 0.5s ease',
        ...style,
      }}
      animate={{
        backgroundPosition: [
          `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 800% 400%, 1000% -400%, -1200% -600%, 400% ${hexSpacing}px`,
          `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 0% 0%, 0% 0%, 0% 0%, 0% 0%`,
        ],
      }}
      transition={{
        backgroundPosition: {
          duration: duration,
          ease: 'linear',
          repeat: Infinity,
        },
      }}
    />
  )
}
