/**
 * InlineEdit — click-to-edit text component for admin mode
 *
 * Shows plain text normally. In edit mode, text gets a dashed underline.
 * Click to switch to an input/textarea. On blur/Enter saves and reverts to text.
 */

import { useState, useRef, useEffect, useCallback } from "react"
import {
  loadOverrides,
  saveOverrides,
  setContentEdit,
} from "../../lib/layout-store"

interface InlineEditProps {
  /** Current text value */
  value: string
  /** Field name for contentEdit (e.g. "title", "description") */
  field: string
  /** Item ID for the content edit */
  itemId: string
  /** Whether edit mode is active */
  editMode: boolean
  /** Render as input or textarea */
  as?: "input" | "textarea"
  /** Pass-through styles for the display text */
  style?: React.CSSProperties
  /** Placeholder when value is empty */
  placeholder?: string
  /** Custom save handler — overrides default setContentEdit behavior */
  onSave?: (value: string) => void
  /** Tag to render in view mode */
  tag?: "span" | "p" | "h3"
}

export function InlineEdit({
  value,
  field,
  itemId,
  editMode,
  as = "input",
  style = {},
  placeholder,
  onSave,
  tag = "span",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Sync if parent value changes
  useEffect(() => {
    if (!editing) setText(value)
  }, [value, editing])

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      // Select all text for easy replacement
      inputRef.current?.select()
    }
  }, [editing])

  const save = useCallback(() => {
    setEditing(false)
    const trimmed = text.trim()
    if (trimmed === value) return // No change

    if (onSave) {
      onSave(trimmed)
    } else {
      const ov = loadOverrides()
      setContentEdit(ov, itemId, field, trimmed)
      saveOverrides(ov)
    }
    window.dispatchEvent(new CustomEvent("editmode:content-changed"))
  }, [text, value, onSave, itemId, field])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && as === "input") {
        e.preventDefault()
        save()
      } else if (e.key === "Escape") {
        setText(value)
        setEditing(false)
      }
    },
    [save, value, as]
  )

  // Not in edit mode — render plain text
  if (!editMode) {
    const Tag = tag
    return <Tag style={style}>{value}</Tag>
  }

  // Editing state — show input/textarea
  if (editing) {
    const inputStyle: React.CSSProperties = {
      ...style,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(74,222,128,0.4)",
      borderRadius: 4,
      padding: "4px 8px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "inherit",
      resize: as === "textarea" ? "vertical" : undefined,
    }

    if (as === "textarea") {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          rows={3}
          style={{ ...inputStyle, minHeight: 60 }}
        />
      )
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        style={inputStyle}
      />
    )
  }

  // Edit mode but not clicked — show text with edit indicator
  const Tag = tag
  return (
    <Tag
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        setEditing(true)
      }}
      style={{
        ...style,
        cursor: "pointer",
        borderBottom: "1px dashed rgba(74,222,128,0.35)",
        paddingBottom: 2,
        transition: "border-color 0.2s ease",
      }}
      onMouseEnter={(e: React.MouseEvent) => {
        ;(e.currentTarget as HTMLElement).style.borderBottomColor =
          "rgba(74,222,128,0.7)"
      }}
      onMouseLeave={(e: React.MouseEvent) => {
        ;(e.currentTarget as HTMLElement).style.borderBottomColor =
          "rgba(74,222,128,0.35)"
      }}
      title={`Click to edit ${field}`}
    >
      {value || placeholder || `Add ${field}...`}
    </Tag>
  )
}
