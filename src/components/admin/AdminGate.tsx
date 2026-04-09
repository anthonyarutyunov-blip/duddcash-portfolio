/**
 * AdminGate — invisible component that listens for the secret
 * triple-click on the footer copyright text, shows a password
 * modal, and mounts the edit mode toolbar when authenticated.
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { useEditMode } from "../../lib/edit-mode"
import { EditModeToolbar } from "./EditModeToolbar"

export function AdminGate() {
  const { editMode, enterEditMode, exitEditMode } = useEditMode()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Listen for triple-click on the footer copyright element
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Match the copyright span in the footer
      if (
        !target.closest(".footer__copy") &&
        !target.classList.contains("footer__copy")
      )
        return

      clickCount.current++

      if (clickTimer.current) clearTimeout(clickTimer.current)
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0
      }, 600)

      if (clickCount.current >= 3) {
        clickCount.current = 0
        if (!editMode) {
          setShowPasswordModal(true)
          setPassword("")
          setError("")
        }
      }
    }

    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [editMode])

  // Focus input when modal opens
  useEffect(() => {
    if (showPasswordModal) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [showPasswordModal])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError("")
      const ok = await enterEditMode(password)
      setLoading(false)
      if (ok) {
        setShowPasswordModal(false)
        setPassword("")
      } else {
        setError("Wrong password")
        setPassword("")
        inputRef.current?.focus()
      }
    },
    [password, enterEditMode]
  )

  return (
    <>
      {/* Password modal */}
      {showPasswordModal && (
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
          onClick={() => setShowPasswordModal(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1c1c1e",
              borderRadius: 16,
              padding: "32px 28px",
              width: "min(360px, 90vw)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 500,
                color: "#fff",
                margin: "0 0 6px",
                letterSpacing: "-0.01em",
              }}
            >
              Edit Mode
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                margin: "0 0 20px",
              }}
            >
              Enter admin password to continue
            </p>

            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="off"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.06)",
                border: error
                  ? "1px solid rgba(255,80,80,0.5)"
                  : "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                if (!error) e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"
              }}
              onBlur={(e) => {
                if (!error)
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
              }}
            />

            {error && (
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,80,80,0.8)",
                  margin: "8px 0 0",
                }}
              >
                {error}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                style={{
                  padding: "8px 20px",
                  background: loading || !password ? "rgba(255,255,255,0.08)" : "#fff",
                  border: "none",
                  borderRadius: 8,
                  color: loading || !password ? "rgba(255,255,255,0.3)" : "#111",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading || !password ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Checking..." : "Enter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit mode toolbar */}
      {editMode && <EditModeToolbar onExit={exitEditMode} />}
    </>
  )
}
