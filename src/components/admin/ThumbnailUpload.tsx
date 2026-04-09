/**
 * ThumbnailUpload — URL input + file upload for custom thumbnails
 *
 * Supports both pasting a URL and uploading a local image file.
 * Uploaded images are resized to max 800px wide and stored as base64.
 */

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { resizeAndCompress } from "../../lib/image-utils"

interface ThumbnailUploadProps {
  value: string
  onChange: (value: string) => void
  /** Compact mode — smaller preview, fewer labels */
  compact?: boolean
}

export function ThumbnailUpload({
  value,
  onChange,
  compact = false,
}: ThumbnailUploadProps) {
  const [previewError, setPreviewError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const dataUrl = await resizeAndCompress(file, 800)
      onChange(dataUrl)
      setPreviewError(false)
    } catch (err) {
      console.error("Failed to process image:", err)
    } finally {
      setUploading(false)
      // Reset file input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleClear = () => {
    onChange("")
    setPreviewError(false)
  }

  return (
    <div>
      {/* URL input + Upload button row */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="text"
          value={value.startsWith("data:") ? "(uploaded image)" : value}
          onChange={(e) => {
            onChange(e.target.value)
            setPreviewError(false)
          }}
          placeholder="URL or upload an image..."
          disabled={value.startsWith("data:")}
          style={{
            flex: 1,
            padding: "8px 10px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6,
            color: "#fff",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "8px 12px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 6,
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            fontWeight: 500,
            cursor: uploading ? "wait" : "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)"
            e.currentTarget.style.color = "#fff"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)"
            e.currentTarget.style.color = "rgba(255,255,255,0.6)"
          }}
        >
          <Upload size={12} />
          {uploading ? "..." : "Upload"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: "none" }}
          />
        </label>
        {value && (
          <button
            onClick={handleClear}
            style={{
              background: "rgba(255,80,80,0.15)",
              border: "none",
              borderRadius: 6,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,80,80,0.7)",
              flexShrink: 0,
            }}
            title="Remove thumbnail"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Preview */}
      {value && (
        <div
          style={{
            marginTop: 8,
            borderRadius: 6,
            overflow: "hidden",
            maxWidth: compact ? 120 : 200,
            maxHeight: compact ? 80 : 150,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {previewError ? (
            <div
              style={{
                padding: "12px 8px",
                fontSize: 11,
                color: "rgba(255,80,80,0.7)",
                textAlign: "center",
              }}
            >
              Can't load preview
            </div>
          ) : (
            <img
              src={value}
              alt="Thumbnail preview"
              style={{
                width: "100%",
                maxHeight: compact ? 80 : 150,
                objectFit: "contain",
                display: "block",
              }}
              onError={() => setPreviewError(true)}
            />
          )}
        </div>
      )}
    </div>
  )
}
