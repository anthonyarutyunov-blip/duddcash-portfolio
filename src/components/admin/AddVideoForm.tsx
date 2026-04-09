/**
 * AddVideoForm — modal to add a new video to a project
 *
 * Enter Bunny video ID, title, aspect ratio, optional description.
 * Shows thumbnail preview from Bunny CDN.
 */

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { thumbnailUrl } from "../../lib/bunny"
import {
  loadOverrides,
  saveOverrides,
  type NewVideo,
} from "../../lib/layout-store"

interface AddVideoFormProps {
  projectId: string
  sectionTitle?: string
  currentTab?: string
  onClose: () => void
  onAdded: () => void
}

const ASPECT_OPTIONS = [
  { value: "16/9", label: "16:9 (Landscape)" },
  { value: "9/16", label: "9:16 (Portrait)" },
  { value: "4/5", label: "4:5 (Social)" },
  { value: "4/3", label: "4:3 (Standard)" },
  { value: "1/1", label: "1:1 (Square)" },
  { value: "5/4", label: "5:4 (Wide)" },
]

export function AddVideoForm({
  projectId,
  sectionTitle,
  currentTab,
  onClose,
  onAdded,
}: AddVideoFormProps) {
  const isNewSingle = projectId === "__new_single__"
  const [videoId, setVideoId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [aspectRatio, setAspectRatio] = useState("16/9")
  const [thumbError, setThumbError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Reset thumb error when video ID changes
  useEffect(() => {
    setThumbError(false)
  }, [videoId])

  const isValid = videoId.trim().length > 8 && title.trim().length > 0

  const handleSave = () => {
    if (!isValid) return

    const ov = loadOverrides()

    if (isNewSingle) {
      // Create a new standalone single video on the main grid
      ov.newProjects.push({
        id: `new-single-${Date.now()}`,
        type: "single",
        title: title.trim(),
        description: description.trim() || undefined,
        categories: currentTab && currentTab !== "All" ? [currentTab] : ["Featured"],
        videoId: videoId.trim(),
        aspectRatio,
      })
    } else {
      // Add video to an existing project
      const newVideo: NewVideo = {
        projectId,
        sectionTitle,
        videoId: videoId.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        aspectRatio,
      }
      ov.newVideos.push(newVideo)
    }

    saveOverrides(ov)
    // Notify all components that content changed
    window.dispatchEvent(new CustomEvent("editmode:content-changed"))
    onAdded()
    onClose()
  }

  return createPortal(
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
          width: "min(480px, 92vw)",
          maxHeight: "85vh",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header — fixed */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 24px 16px",
            flexShrink: 0,
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
            Add Video
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

        {/* Scrollable body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            padding: "0 24px",
          }}
        >
          {/* Thumbnail Preview — constrained height */}
          {videoId.trim().length > 8 && (
            <div
              style={{
                marginBottom: 16,
                borderRadius: 8,
                overflow: "hidden",
                background: "rgba(255,255,255,0.04)",
                maxHeight: 150,
                maxWidth: 280,
              }}
            >
              {thumbError ? (
                <div
                  style={{
                    width: "100%",
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 12,
                  }}
                >
                  No preview available
                </div>
              ) : (
                <img
                  src={thumbnailUrl(videoId.trim())}
                  alt="Video thumbnail preview"
                  style={{
                    width: "100%",
                    maxHeight: 150,
                    objectFit: "contain",
                    display: "block",
                  }}
                  onError={() => setThumbError(true)}
                />
              )}
            </div>
          )}

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FormField label="Bunny Video ID">
              <input
                ref={inputRef}
                type="text"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="e.g. ba823cf7-8001-4ed9-bf4b-ba292ab1c4e4"
                style={inputStyle}
              />
            </FormField>

            <FormField label="Title">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Video title"
                style={inputStyle}
              />
            </FormField>

            <FormField label="Aspect Ratio">
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {ASPECT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAspectRatio(opt.value)}
                    style={{
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 500,
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      background:
                        aspectRatio === opt.value
                          ? "#fff"
                          : "rgba(255,255,255,0.06)",
                      color:
                        aspectRatio === opt.value
                          ? "#111"
                          : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Description (optional)">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description..."
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 50,
                }}
              />
            </FormField>
          </div>
        </div>

        {/* Actions — fixed footer, always visible */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "16px 24px 24px",
            justifyContent: "flex-end",
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            style={{
              ...saveBtnStyle,
              opacity: isValid ? 1 : 0.4,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            Add Video
          </button>
        </div>
      </div>
    </div>,
    document.body
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
