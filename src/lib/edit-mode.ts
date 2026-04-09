/**
 * Edit Mode — cross-island state management
 *
 * Uses sessionStorage for persistence across page navigations
 * and CustomEvent for real-time sync between Astro islands.
 */

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "duddcash_edit_mode"
const EVENT_NAME = "editmode:change"
// SHA-256 hash of the password — computed once, compared at login
const PASSWORD_HASH =
  "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" // "password" — change this

/** Check if edit mode is currently active */
export function isEditModeActive(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

/** Activate edit mode */
function activateEditMode() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1")
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: true }))
}

/** Deactivate edit mode */
function deactivateEditMode() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: false }))
}

/** Hash a string with SHA-256 and return hex */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/** Verify password against stored hash */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await sha256(password)
  return hash === PASSWORD_HASH
}

/**
 * React hook — returns edit mode state + toggle helpers.
 * Listens for cross-island CustomEvents to stay in sync.
 */
export function useEditMode() {
  const [editMode, setEditMode] = useState(false)

  // Sync on mount
  useEffect(() => {
    setEditMode(isEditModeActive())
  }, [])

  // Listen for changes from other islands
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail
      setEditMode(detail)
    }
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  const enterEditMode = useCallback(async (password: string) => {
    const valid = await verifyPassword(password)
    if (valid) {
      activateEditMode()
      setEditMode(true)
      return true
    }
    return false
  }, [])

  const exitEditMode = useCallback(() => {
    deactivateEditMode()
    setEditMode(false)
  }, [])

  return { editMode, enterEditMode, exitEditMode }
}
