/**
 * SizeSelector — XS / S / M / L / XL segmented control
 *
 * Overlaid on each portfolio card in edit mode.
 * Clicking a size updates the layout store and triggers a re-render.
 */

import type { SizeTier } from "../../lib/layout-store"

const SIZES: { tier: SizeTier; label: string }[] = [
  { tier: "xs", label: "XS" },
  { tier: "s", label: "S" },
  { tier: "m", label: "M" },
  { tier: "l", label: "L" },
  { tier: "xl", label: "XL" },
]

interface SizeSelectorProps {
  currentSize: SizeTier
  onChange: (size: SizeTier) => void
}

export function SizeSelector({ currentSize, onChange }: SizeSelectorProps) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 10,
        display: "flex",
        gap: 2,
        padding: 3,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      {SIZES.map(({ tier, label }) => (
        <button
          key={tier}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onChange(tier)
          }}
          style={{
            padding: "3px 7px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            transition: "all 0.15s ease",
            background:
              currentSize === tier
                ? "#fff"
                : "transparent",
            color:
              currentSize === tier
                ? "#111"
                : "rgba(255,255,255,0.5)",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
