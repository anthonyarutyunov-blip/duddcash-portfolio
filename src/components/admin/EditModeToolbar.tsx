/**
 * EditModeToolbar — fixed bottom bar during edit mode
 *
 * Actions: Save, Export JSON, Discard Changes, Exit Edit Mode
 */

import { useState, useCallback } from "react"
import {
  loadOverrides,
  saveOverrides,
  clearOverrides,
  exportOverrides,
  hasOverrides,
} from "../../lib/layout-store"
import { Save, Download, Trash2, X, CheckCircle } from "lucide-react"

interface EditModeToolbarProps {
  onExit: () => void
}

export function EditModeToolbar({ onExit }: EditModeToolbarProps) {
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(() => {
    const ov = loadOverrides()
    saveOverrides(ov)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const handleExport = useCallback(() => {
    const ov = loadOverrides()
    exportOverrides(ov)
  }, [])

  const handleDiscard = useCallback(() => {
    if (
      window.confirm(
        "Discard all layout changes? This cannot be undone."
      )
    ) {
      clearOverrides()
      // Force reload to reset everything
      window.location.reload()
    }
  }, [])

  const handleExit = useCallback(() => {
    onExit()
  }, [onExit])

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99998,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 10px",
        background: "rgba(20,20,22,0.95)",
        backdropFilter: "blur(12px)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* Edit mode indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 10px 0 6px",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          marginRight: 4,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 8px rgba(74,222,128,0.5)",
            animation: "editPulse 2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            whiteSpace: "nowrap",
          }}
        >
          Edit Mode
        </span>
      </div>

      <ToolbarButton
        icon={saved ? <CheckCircle size={14} /> : <Save size={14} />}
        label={saved ? "Saved!" : "Save"}
        onClick={handleSave}
        variant={saved ? "success" : "default"}
      />
      <ToolbarButton
        icon={<Download size={14} />}
        label="Export"
        onClick={handleExport}
        variant="default"
      />
      <ToolbarButton
        icon={<Trash2 size={14} />}
        label="Discard"
        onClick={handleDiscard}
        variant="danger"
      />
      <ToolbarButton
        icon={<X size={14} />}
        label="Exit"
        onClick={handleExit}
        variant="default"
      />

      <style>{`
        @keyframes editPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

function ToolbarButton({
  icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: "default" | "danger" | "success"
}) {
  const colors = {
    default: {
      bg: "rgba(255,255,255,0.06)",
      bgHover: "rgba(255,255,255,0.12)",
      text: "rgba(255,255,255,0.7)",
    },
    danger: {
      bg: "rgba(255,80,80,0.08)",
      bgHover: "rgba(255,80,80,0.15)",
      text: "rgba(255,120,120,0.8)",
    },
    success: {
      bg: "rgba(74,222,128,0.1)",
      bgHover: "rgba(74,222,128,0.15)",
      text: "rgba(74,222,128,0.9)",
    },
  }

  const c = colors[variant]

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        background: c.bg,
        border: "none",
        borderRadius: 8,
        color: c.text,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 0.2s ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = c.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = c.bg)}
    >
      {icon}
      {label}
    </button>
  )
}
