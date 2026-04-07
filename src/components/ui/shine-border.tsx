import { cn } from "../../lib/utils"

type TColorProp = string | string[]

interface ShineBorderProps {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: TColorProp
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className,
  style,
  children,
}: ShineBorderProps) {
  const colorStr = color instanceof Array ? color.join(",") : color

  return (
    <div
      style={{
        borderRadius: `${borderRadius}px`,
        position: "relative",
        ...style,
      }}
      className={cn("min-h-[60px] w-fit place-items-center p-3", className)}
    >
      {/* Shine border layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: `${borderRadius}px`,
          padding: `${borderWidth}px`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          backgroundImage: `radial-gradient(transparent, transparent, ${colorStr}, transparent, transparent)`,
          backgroundSize: "300% 300%",
          animation: `shine ${duration}s infinite linear`,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  )
}
