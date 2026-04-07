import React, { useState, useRef, useEffect } from "react"
import { FileTree } from "./file-tree"
import { navData } from "./file-tree-nav"

const TITLE_H = 36
const MIN_W = 220
const MIN_H = 120

type Pos = { x: number; y: number }
type Size = { w: number; h: number }

export default function MacFileWindow() {
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 })
  const [size, setSize] = useState<Size>({ w: 300, h: 440 })
  const [minimized, setMinimized] = useState(true)   // starts as title-bar only
  const [maximized, setMaximized] = useState(false)
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState<"red" | "yellow" | "green" | null>(null)

  const saved = useRef<{ pos: Pos; size: Size } | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const resizing = useRef<string | null>(null)
  const d0 = useRef({ mx: 0, my: 0, wx: 0, wy: 0 })
  const r0 = useRef({ mx: 0, my: 0, wx: 0, wy: 0, w: 0, h: 0 })

  useEffect(() => {
    if (!windowRef.current) return
    const rect = windowRef.current.getBoundingClientRect()
    setPos({ x: rect.left, y: rect.top })
    setReady(true)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        setPos({
          x: Math.max(0, d0.current.wx + e.clientX - d0.current.mx),
          y: Math.max(0, d0.current.wy + e.clientY - d0.current.my),
        })
      }
      if (resizing.current) {
        const hnd = resizing.current
        const dx = e.clientX - r0.current.mx
        const dy = e.clientY - r0.current.my
        let nw = r0.current.w, nh = r0.current.h
        let nx = r0.current.wx, ny = r0.current.wy
        if (hnd.includes("e")) nw = Math.max(MIN_W, r0.current.w + dx)
        if (hnd.includes("s")) nh = Math.max(MIN_H, r0.current.h + dy)
        if (hnd.includes("w")) { nw = Math.max(MIN_W, r0.current.w - dx); nx = r0.current.wx + (r0.current.w - nw) }
        if (hnd.includes("n")) { nh = Math.max(MIN_H, r0.current.h - dy); ny = r0.current.wy + (r0.current.h - nh) }
        setSize({ w: nw, h: nh })
        setPos({ x: nx, y: ny })
      }
    }
    const onUp = () => { dragging.current = false; resizing.current = null }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp) }
  }, [])

  const startDrag = (e: React.MouseEvent) => {
    if (maximized) return
    e.preventDefault()
    dragging.current = true
    d0.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y }
  }

  const startResize = (e: React.MouseEvent, hnd: string) => {
    e.preventDefault(); e.stopPropagation()
    resizing.current = hnd
    r0.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y, w: size.w, h: size.h }
  }

  const green = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (maximized) {
      if (saved.current) { setPos(saved.current.pos); setSize(saved.current.size) }
      setMaximized(false)
    } else {
      saved.current = { pos, size }
      setMaximized(true)
      setMinimized(false)
    }
  }

  // macOS-accurate traffic light icons on hover
  const btnIcon = (btn: "red" | "yellow" | "green") => {
    if (hoveredBtn !== btn) return null
    const color = btn === "red" ? "rgba(110,15,8,0.75)" : btn === "yellow" ? "rgba(90,50,0,0.75)" : "rgba(0,70,15,0.75)"
    return (
      <span style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        {btn === "red" && (
          // × close
          <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
            <path d="M1 1l5 5M6 1L1 6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        )}
        {btn === "yellow" && (
          // − minimize
          <svg width="7" height="2" viewBox="0 0 7 2" fill="none">
            <path d="M0.5 1h6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        )}
        {btn === "green" && (
          // ↗↙ fullscreen — two diagonal arrows pointing to opposite corners
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4.5 1H7v2.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 1L4.5 3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M3.5 7H1V4.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 7l2.5-2.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        )}
      </span>
    )
  }

  if (!visible) return null

  const W = maximized ? window.innerWidth : size.w
  const H = minimized ? TITLE_H : maximized ? window.innerHeight : size.h
  // Align with header: var(--space-lg) = 1.5rem = 24px
  const headerTop = 24
  const posStyle: React.CSSProperties = ready
    ? { left: maximized ? 0 : pos.x, top: maximized ? 0 : pos.y }
    : { right: 62, top: headerTop, visibility: "hidden" }

  const btnBase: React.CSSProperties = {
    position: "relative", width: 12, height: 12, borderRadius: "50%",
    border: "none", cursor: "pointer", flexShrink: 0,
  }

  return (
    <div
      ref={windowRef}
      style={{
        position: "fixed", ...posStyle, width: W, height: H,
        zIndex: 150, userSelect: "none",
        transition: maximized ? "all 0.28s cubic-bezier(.165,.84,.44,1)" : "none",
      }}
    >
      {/* Window chrome */}
      <div style={{
        width: "100%", height: "100%",
        background: "rgba(238, 236, 232, 0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: maximized ? 0 : 10,
        border: "1px solid rgba(0,0,0,0.10)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Title bar */}
        <div
          onMouseDown={startDrag}
          style={{
            height: TITLE_H, flexShrink: 0,
            display: "flex", alignItems: "center", padding: "0 12px",
            borderBottom: minimized ? "none" : "1px solid rgba(0,0,0,0.07)",
            cursor: maximized ? "default" : "grab",
            position: "relative",
          }}
        >
          {/* Traffic lights */}
          <div
            style={{ display: "flex", gap: 6 }}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <button
              title="Close"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseEnter={() => setHoveredBtn("red")}
              style={{ ...btnBase, background: "oklch(0.65 0.2 25)", cursor: "default" }}
            >
              {btnIcon("red")}
            </button>
            <button
              title="Minimize"
              onClick={(e) => { e.stopPropagation(); setMinimized(m => !m) }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseEnter={() => setHoveredBtn("yellow")}
              style={{ ...btnBase, background: "oklch(0.75 0.18 85)" }}
            >
              {btnIcon("yellow")}
            </button>
            <button
              title="Zoom"
              onClick={green}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseEnter={() => setHoveredBtn("green")}
              style={{ ...btnBase, background: "oklch(0.65 0.18 150)" }}
            >
              {btnIcon("green")}
            </button>
          </div>

          {/* "explorer" label — click to toggle minimize */}
          <span
            onClick={(e) => { e.stopPropagation(); setMinimized(m => !m) }}
            style={{
              position: "absolute", left: "50%", transform: "translateX(-50%)",
              fontSize: 11, color: "#999", fontFamily: "monospace",
              cursor: maximized ? "default" : "grab",
            }}
          >
            explorer
          </span>
        </div>

        {/* Tree content */}
        {!minimized && (
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 4px" }}>
            <FileTree data={navData} showHeader={false} />
          </div>
        )}
      </div>

      {/* Resize handles */}
      {!maximized && !minimized && (<>
        <div onMouseDown={(e) => startResize(e, "nw")} style={{ position: "absolute", top: 0, left: 0, width: 14, height: 14, cursor: "nwse-resize", zIndex: 10 }} />
        <div onMouseDown={(e) => startResize(e, "ne")} style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, cursor: "nesw-resize", zIndex: 10 }} />
        <div onMouseDown={(e) => startResize(e, "sw")} style={{ position: "absolute", bottom: 0, left: 0, width: 14, height: 14, cursor: "nesw-resize", zIndex: 10 }} />
        <div onMouseDown={(e) => startResize(e, "se")} style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, cursor: "nwse-resize", zIndex: 10 }} />
        <div onMouseDown={(e) => startResize(e, "n")} style={{ position: "absolute", top: 0, left: 14, right: 14, height: 4, cursor: "ns-resize", zIndex: 9 }} />
        <div onMouseDown={(e) => startResize(e, "s")} style={{ position: "absolute", bottom: 0, left: 14, right: 14, height: 4, cursor: "ns-resize", zIndex: 9 }} />
        <div onMouseDown={(e) => startResize(e, "w")} style={{ position: "absolute", top: 14, bottom: 14, left: 0, width: 4, cursor: "ew-resize", zIndex: 9 }} />
        <div onMouseDown={(e) => startResize(e, "e")} style={{ position: "absolute", top: 14, bottom: 14, right: 0, width: 4, cursor: "ew-resize", zIndex: 9 }} />
      </>)}
    </div>
  )
}
