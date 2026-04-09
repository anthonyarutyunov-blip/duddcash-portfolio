/**
 * ContentEditor — modal form for editing item metadata
 *
 * Edit: title, client, description, role, categories
 */

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import type { PortfolioItem, Category } from "../../data/portfolio"
import { categories as allCategories } from "../../data/portfolio"
import {
  loadOverrides,
  saveOverrides,
  setContentEdit,
} from "../../lib/layout-store"
import { ThumbnailUpload } from "./ThumbnailUpload"

interface ContentEditorProps {
  item: PortfolioItem
  onClose: () => void
  onSaved: () => void
}

export function ContentEditor({ item, onClose, onSaved }: ContentEditorProps) {
  const [title, setTitle] = useState(item.title)
  const [client, setClient] = useState(
    "client" in item ? (item.client ?? "") : ""
  )
  const [description, setDescription] = useState(item.description ?? "")
  const [role, setRole] = useState(item.role ?? "")
  const [customThumbnail, setCustomThumbnail] = useState(
    item.customThumbnail ?? ""
  )
  const [thumbPreviewError, setThumbPreviewError] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const handleSave = () => {
    const ov = loadOverrides()

    if (title !== item.title) setContentEdit(ov, item.id, "title", title)
    if ("client" in item && client !== (item.client ?? ""))
      setContentEdit(ov, item.id, "client", client)
    if (description !== (item.description ?? ""))
      setContentEdit(ov, item.id, "description", description)
    if (role !== (item.role ?? ""))
      setContentEdit(ov, item.id, "role", role)
    if (customThumbnail !== (item.customThumbnail ?? ""))
      setContentEdit(ov, item.id, "customThumbnail", customThumbnail)

    saveOverrides(ov)
    onSaved()
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1c1c1e",
          borderRadius: 16,
          padding: "28px 24px",
          width: "min(480px, 92vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 500,
              color: "#fff",
              margin: 0,
            }}
          >
            Edit Content
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "50%",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Title">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </FormField>

          {"client" in item && (
            <FormField label="Client">
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                style={inputStyle}
              />
            </FormField>
          )}

          <FormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 60,
              }}
            />
          </FormField>

          <FormField label="Role">
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={inputStyle}
            />
          </FormField>

          <FormField label="Custom Thumbnail">
            <ThumbnailUpload
              value={customThumbnail}
              onChange={(val) => {
                setCustomThumbnail(val)
                setThumbPreviewError(false)
              }}
            />
          </FormField>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 24,
            justifyContent: "flex-end",
          }}
        >
          <button onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <button onClick={handleSave} style={saveBtnStyle}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s ease",
}

const cancelBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "rgba(255,255,255,0.5)",
  fontSize: 13,
  cursor: "pointer",
}

const saveBtnStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "#fff",
  border: "none",
  borderRadius: 8,
  color: "#111",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}
