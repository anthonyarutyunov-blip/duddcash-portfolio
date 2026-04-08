import { MeshGradient } from "@paper-design/shaders-react"

interface BackgroundMeshProps {
  className?: string
  style?: React.CSSProperties
  speed?: number
  colors?: [string, string, string, string]
}

export function BackgroundMesh({
  className,
  style,
  speed = 0.4,
  colors = ["#eae6df", "#d4cfc6", "#c8c0b4", "#ddd8cf"],
}: BackgroundMeshProps) {
  return (
    <MeshGradient
      className={className}
      style={style}
      colors={colors}
      speed={speed}
    />
  )
}
