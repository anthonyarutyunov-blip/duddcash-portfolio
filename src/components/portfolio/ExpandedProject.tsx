import React, { useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "motion/react"
import { X, Plus, GripVertical, Link } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { VideoPlayer } from "./VideoPlayer"
import type {
  PortfolioItem,
  VideoSection,
  Credit,
  ImageGallery,
  BunnyVideo,
} from "../../data/portfolio"
import { useEditMode } from "../../lib/edit-mode"
import {
  loadOverrides,
  saveOverrides,
  setVideoLayout,
  setVideoSize,
  setVideoEdit,
  setContentEdit,
  removeVideo,
  type SizeTier,
} from "../../lib/layout-store"
import { getMergedVideos, SIZE_TO_SPAN } from "../../lib/layout-merge"
import { SizeSelector } from "../admin/SizeSelector"
import { AddVideoForm } from "../admin/AddVideoForm"
import { InlineEdit } from "../admin/InlineEdit"

interface ExpandedProjectProps {
  item: PortfolioItem
  onClose: () => void
}

/** Sortable video wrapper — drag handle only */
function SortableVideoItem({
  id,
  children,
  gridColumn,
}: {
  id: string
  children: React.ReactNode
  gridColumn?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      className="video-grid-item"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: undefined,
        opacity: isDragging ? 0.3 : 1,
        outline: isDragging ? "2px dashed rgba(255,255,255,0.2)" : "none",
        zIndex: isDragging ? 100 : undefined,
        position: "relative",
        gridColumn,
      }}
      {...attributes}
    >
      {children}
      {/* Drag handle */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          width: 24,
          height: 24,
          borderRadius: 6,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.5)",
          zIndex: 5,
          cursor: "grab",
        }}
      >
        <GripVertical size={12} />
      </div>
    </div>
  )
}

/** Renders a credits block — editable in edit mode */
function CreditsBlock({
  credits,
  editMode,
  itemId,
  sectionTitle,
}: {
  credits: Credit[]
  editMode: boolean
  itemId: string
  sectionTitle?: string
}) {
  const [localCredits, setLocalCredits] = useState<Credit[]>(credits)
  const [isOpen, setIsOpen] = useState(false)

  // Sync localCredits when parent passes updated credits (e.g., after content-changed event)
  useEffect(() => {
    setLocalCredits(credits)
  }, [credits])

  const field = sectionTitle
    ? `section:${sectionTitle}:credits`
    : "credits"

  const saveCredits = useCallback(
    (updated: Credit[]) => {
      setLocalCredits(updated)
      const ov = loadOverrides()
      setContentEdit(ov, itemId, field, JSON.stringify(updated))
      saveOverrides(ov)
      window.dispatchEvent(new CustomEvent("editmode:content-changed"))
    },
    [itemId, field]
  )

  const handleLabelChange = (index: number, label: string) => {
    const updated = [...localCredits]
    updated[index] = { ...updated[index], label }
    saveCredits(updated)
  }

  const handleValueChange = (index: number, value: string) => {
    const updated = [...localCredits]
    updated[index] = { ...updated[index], value }
    saveCredits(updated)
  }

  const handleRemove = (index: number) => {
    const updated = localCredits.filter((_, i) => i !== index)
    saveCredits(updated)
  }

  const handleAdd = () => {
    const updated = [...localCredits, { label: "", value: "" }]
    saveCredits(updated)
  }

  if (!localCredits.length && !editMode) return null

  // Edit mode — render editable credit rows
  if (editMode) {
    return (
      <div style={{ marginTop: 12 }}>
        <p
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.55)",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Credits
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {localCredits.map((credit, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 6, alignItems: "center" }}
            >
              <input
                type="text"
                value={credit.label}
                onChange={(e) => handleLabelChange(i, e.target.value)}
                placeholder="Role..."
                style={{
                  ...creditInputStyle,
                  width: 120,
                  flexShrink: 0,
                }}
              />
              <input
                type="text"
                value={credit.value}
                onChange={(e) => handleValueChange(i, e.target.value)}
                placeholder="Name..."
                style={{ ...creditInputStyle, flex: 1 }}
              />
              <button
                onClick={() => handleRemove(i)}
                style={{
                  background: "rgba(255,80,80,0.15)",
                  border: "none",
                  borderRadius: 4,
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,80,80,0.7)",
                  flexShrink: 0,
                }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <button
            onClick={handleAdd}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px dashed rgba(74,222,128,0.3)",
              borderRadius: 6,
              padding: "6px 12px",
              color: "rgba(74,222,128,0.7)",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              alignSelf: "flex-start",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(74,222,128,0.6)"
              e.currentTarget.style.background = "rgba(255,255,255,0.06)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)"
              e.currentTarget.style.background = "rgba(255,255,255,0.04)"
            }}
          >
            + Add Credit
          </button>
        </div>
      </div>
    )
  }

  // View mode — collapsible credits
  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      style={{
        marginTop: 12,
        fontSize: 12,
        color: "rgba(255,255,255,0.45)",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          color: "rgba(255,255,255,0.55)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        Credits
      </summary>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "3px 12px",
          paddingTop: 4,
        }}
      >
        {localCredits.map((credit, i) => (
          <React.Fragment key={i}>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>
              {credit.label}
            </span>
            <span style={{ color: "rgba(255,255,255,0.55)" }}>
              {credit.value}
            </span>
          </React.Fragment>
        ))}
      </div>
    </details>
  )
}

const creditInputStyle: React.CSSProperties = {
  padding: "5px 8px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 4,
  color: "#fff",
  fontSize: 12,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
}

/** Video grid with DnD, size selectors, inline editing, share, and thumbnails in edit mode */
function VideoGrid({
  videos,
  projectId,
  sectionTitle,
}: {
  videos: BunnyVideo[]
  projectId: string
  sectionTitle?: string
}) {
  const { editMode } = useEditMode()
  const [orderedVideos, setOrderedVideos] = useState(() =>
    getMergedVideos(projectId, sectionTitle, videos)
  )
  const [videoSizes, setVideoSizes] = useState<Record<string, SizeTier>>(
    () => {
      const ov = loadOverrides()
      const layout = ov.videoLayouts.find(
        (v) =>
          v.projectId === projectId &&
          (v.sectionTitle || undefined) === sectionTitle
      )
      const sizes: Record<string, SizeTier> = {}
      if (layout) {
        for (const v of layout.videos) {
          if (v.size) sizes[v.videoId] = v.size
        }
      }
      return sizes
    }
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  // Pagination — only render a subset of videos at a time
  // On mobile, videos go full-width so show fewer per page
  const [isMobileView] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  const VIDEOS_PER_PAGE = isMobileView ? 4 : 6
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = Math.ceil(orderedVideos.length / VIDEOS_PER_PAGE)
  const needsPagination = orderedVideos.length > VIDEOS_PER_PAGE && !editMode
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const handlePageChange = useCallback((page: number) => {
    const grid = gridRef.current
    const lenis = (window as any).__lenis

    // Lock the grid height at its current value to prevent scroll jump
    if (grid) {
      grid.style.minHeight = `${grid.offsetHeight}px`
    }

    setCurrentPage(page)

    // After React commits new videos, scroll to top of grid container and unlock.
    requestAnimationFrame(() => {
      if (isMobileView && gridContainerRef.current) {
        // Mobile: use Lenis scrollTo with numeric position to keep internal state in sync.
        // Native scrollIntoView doesn't update Lenis, causing scroll corrections.
        const scrollTarget = gridContainerRef.current.getBoundingClientRect().top + window.scrollY - 20
        if (lenis) {
          lenis.scrollTo(scrollTarget, { immediate: true, force: true })
        } else {
          window.scrollTo(0, scrollTarget)
        }
        setTimeout(() => {
          if (grid) grid.style.minHeight = ""
          void document.body.offsetHeight
          if (lenis) lenis.resize()
        }, 200)
      } else {
        // Desktop: Lenis handles everything
        if (lenis && gridContainerRef.current) {
          lenis.scrollTo(gridContainerRef.current, { offset: -20, immediate: true })
        }
        setTimeout(() => {
          if (grid) grid.style.minHeight = ""
          if (lenis) lenis.resize()
        }, 100)
      }
    })
  }, [isMobileView])

  // Refresh videos from overrides whenever content changes (e.g., inline edits, adds, removes)
  useEffect(() => {
    const handler = () => {
      setOrderedVideos(getMergedVideos(projectId, sectionTitle, videos))
      // Also refresh video sizes
      const ov = loadOverrides()
      const layout = ov.videoLayouts.find(
        (v) =>
          v.projectId === projectId &&
          (v.sectionTitle || undefined) === sectionTitle
      )
      if (layout) {
        const sizes: Record<string, SizeTier> = {}
        for (const v of layout.videos) {
          if (v.size) sizes[v.videoId] = v.size
        }
        setVideoSizes(sizes)
      }
    }
    window.addEventListener("editmode:content-changed", handler)
    return () => window.removeEventListener("editmode:content-changed", handler)
  }, [projectId, sectionTitle, videos])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = orderedVideos.findIndex(
        (v) => v.videoId === active.id
      )
      const newIndex = orderedVideos.findIndex(
        (v) => v.videoId === over.id
      )
      if (oldIndex < 0 || newIndex < 0) return

      const reordered = arrayMove(orderedVideos, oldIndex, newIndex)
      setOrderedVideos(reordered)

      const ov = loadOverrides()
      setVideoLayout(
        ov,
        projectId,
        sectionTitle,
        reordered.map((v, i) => ({
          videoId: v.videoId,
          order: i,
          size: videoSizes[v.videoId],
        }))
      )
      saveOverrides(ov)
    },
    [orderedVideos, projectId, sectionTitle, videoSizes]
  )

  const handleVideoSizeChange = useCallback(
    (videoId: string, size: SizeTier) => {
      setVideoSizes((prev) => ({ ...prev, [videoId]: size }))
      const ov = loadOverrides()
      setVideoSize(ov, projectId, sectionTitle, videoId, size)
      saveOverrides(ov)
    },
    [projectId, sectionTitle]
  )

  const handleShare = useCallback(
    (videoId: string) => {
      const url = `${window.location.origin}/?project=${projectId}&video=${videoId}`
      navigator.clipboard.writeText(url).then(() => {
        setCopiedVideoId(videoId)
        setTimeout(() => setCopiedVideoId(null), 2000)
      })
    },
    [projectId]
  )

  const handleRemoveVideo = useCallback(
    (videoId: string) => {
      const ov = loadOverrides()
      removeVideo(ov, videoId)
      saveOverrides(ov)
      setOrderedVideos((prev) => prev.filter((v) => v.videoId !== videoId))
      setConfirmRemoveId(null)
      window.dispatchEvent(new CustomEvent("editmode:content-changed"))
    },
    []
  )

  if (!orderedVideos.length && !editMode) return null

  // Always use 12-column grid so visitor layout matches editor layout.
  // On mobile, reduce gap for tighter layout.
  const isMobileGrid = typeof window !== 'undefined' && window.innerWidth <= 768
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: isMobileGrid ? 6 : 12,
    alignItems: "start",
    gridAutoFlow: "dense",
  }

  const displayedVideos = needsPagination
    ? orderedVideos.slice(currentPage * VIDEOS_PER_PAGE, (currentPage + 1) * VIDEOS_PER_PAGE)
    : orderedVideos

  const videoElements = displayedVideos.map((video) => {
    // Default size: landscape → L (2 per row), portrait/square → M (4 per row)
    const defaultSize: SizeTier =
      video.aspectRatio === "16/9" ? "l" : "m"
    const size = videoSizes[video.videoId] || defaultSize
    const colSpan = SIZE_TO_SPAN[size]

    // Load custom thumbnail from video edits
    const ov = loadOverrides()
    const customThumb = (ov.videoEdits || []).find(
      (e) => e.videoId === video.videoId && e.field === "customThumbnail"
    )?.value

    const player = (
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 8 }} data-video-id={video.videoId}>
        <VideoPlayer
          key={video.videoId}
          videoId={video.videoId}
          title={editMode ? undefined : video.title}
          description={editMode ? undefined : video.description}
          aspectRatio={video.aspectRatio || "16/9"}
          customThumbnail={customThumb}
        />
        {/* Size selector on each video in edit mode */}
        {editMode && (
          <SizeSelector
            currentSize={size}
            onChange={(s) => handleVideoSizeChange(video.videoId, s)}
          />
        )}

        {/* Share button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleShare(video.videoId)
          }}
          style={{
            position: "absolute",
            bottom: 40,
            left: 8,
            zIndex: 10,
            width: 28,
            height: 28,
            borderRadius: 7,
            background:
              copiedVideoId === video.videoId
                ? "rgba(74,222,128,0.9)"
                : "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color:
              copiedVideoId === video.videoId ? "#000" : "rgba(255,255,255,0.6)",
            transition: "all 0.2s ease",
            padding: 0,
          }}
          title="Copy share link"
          onMouseEnter={(e) => {
            if (copiedVideoId !== video.videoId) {
              e.currentTarget.style.background = "rgba(0,0,0,0.85)"
              e.currentTarget.style.color = "#fff"
            }
          }}
          onMouseLeave={(e) => {
            if (copiedVideoId !== video.videoId) {
              e.currentTarget.style.background = "rgba(0,0,0,0.6)"
              e.currentTarget.style.color = "rgba(255,255,255,0.6)"
            }
          }}
        >
          {copiedVideoId === video.videoId ? (
            <span style={{ fontSize: 9, fontWeight: 700 }}>OK</span>
          ) : (
            <Link size={12} />
          )}
        </button>

        {/* Remove video button (edit mode only) */}
        {editMode && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setConfirmRemoveId(video.videoId)
            }}
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              zIndex: 10,
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "rgba(255,60,60,0.8)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              transition: "all 0.15s ease",
              padding: 0,
            }}
            title="Remove video"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,40,40,1)"
              e.currentTarget.style.transform = "scale(1.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,60,60,0.8)"
              e.currentTarget.style.transform = "scale(1)"
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>
    )

    const content = (
      <>
        {player}

        {/* Inline title/description editing in edit mode */}
        {editMode && (
          <div style={{ padding: "6px 2px 0" }}>
            <InlineEdit
              value={video.title}
              field="title"
              itemId={video.videoId}
              editMode
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#fff",
                display: "block",
                lineHeight: 1.3,
              }}
              placeholder="Video title..."
              onSave={(val) => {
                const o = loadOverrides()
                setVideoEdit(o, video.videoId, "title", val)
                saveOverrides(o)
                window.dispatchEvent(
                  new CustomEvent("editmode:content-changed")
                )
              }}
            />
            <InlineEdit
              value={video.description || ""}
              field="description"
              itemId={video.videoId}
              editMode
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
                display: "block",
                marginTop: 2,
                lineHeight: 1.4,
              }}
              placeholder="Description..."
              onSave={(val) => {
                const o = loadOverrides()
                setVideoEdit(o, video.videoId, "description", val)
                saveOverrides(o)
                window.dispatchEvent(
                  new CustomEvent("editmode:content-changed")
                )
              }}
            />
          </div>
        )}
      </>
    )

    if (editMode) {
      return (
        <SortableVideoItem
          key={video.videoId}
          id={video.videoId}
          gridColumn={`span ${colSpan}`}
        >
          {content}
        </SortableVideoItem>
      )
    }

    return (
      <div key={video.videoId} className="video-grid-item" style={{ gridColumn: `span ${colSpan}` }}>
        {content}
      </div>
    )
  })

  return (
    <>
      {editMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(e: DragStartEvent) =>
            setActiveVideoId(e.active.id as string)
          }
          onDragEnd={(e: DragEndEvent) => {
            setActiveVideoId(null)
            handleDragEnd(e)
          }}
          onDragCancel={() => setActiveVideoId(null)}
        >
          <SortableContext
            items={orderedVideos.map((v) => v.videoId)}
            strategy={rectSortingStrategy}
          >
            <div style={gridStyle}>{videoElements}</div>
          </SortableContext>

          <DragOverlay adjustScale={false} dropAnimation={null}>
            {activeVideoId
              ? (() => {
                  const found = orderedVideos.find(
                    (v) => v.videoId === activeVideoId
                  )
                  if (!found) return null
                  return (
                    <div
                      style={{
                        opacity: 1,
                        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                        transform: "scale(1.03)",
                        borderRadius: 8,
                        overflow: "hidden",
                        pointerEvents: "none",
                      }}
                    >
                      <VideoPlayer
                        videoId={found.videoId}
                        title={found.title}
                        aspectRatio={found.aspectRatio || "16/9"}
                      />
                    </div>
                  )
                })()
              : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div ref={gridContainerRef}>
          {needsPagination && totalPages > 1 && (
            <div
              style={{
                display: "flex",
                gap: 0,
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                marginBottom: isMobileView ? 14 : 20,
              }}
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePageChange(i)
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom:
                      currentPage === i
                        ? "2px solid #fff"
                        : "2px solid transparent",
                    padding: isMobileView ? "8px 14px" : "10px 18px",
                    fontSize: isMobileView ? 12 : 13,
                    fontFamily: "var(--font-display)",
                    fontWeight: currentPage === i ? 500 : 400,
                    letterSpacing: "0.01em",
                    color: currentPage === i ? "#fff" : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    transition: "color 0.2s ease, border-color 0.2s ease",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Page {i + 1}
                </button>
              ))}
            </div>
          )}
          <div ref={gridRef} style={gridStyle}>{videoElements}</div>
        </div>
      )}

      {editMode && (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: "14px 16px",
            marginTop: 12,
            background: "rgba(255,255,255,0.04)",
            border: "2px dashed rgba(74,222,128,0.3)",
            borderRadius: 8,
            color: "rgba(74,222,128,0.7)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)"
            e.currentTarget.style.borderColor = "rgba(74,222,128,0.5)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)"
            e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)"
          }}
        >
          <Plus size={16} />
          Add Video
        </button>
      )}

      {showAddForm && (
        <AddVideoForm
          projectId={projectId}
          sectionTitle={sectionTitle}
          onClose={() => setShowAddForm(false)}
          onAdded={() => {
            setOrderedVideos(
              getMergedVideos(projectId, sectionTitle, videos)
            )
          }}
        />
      )}

      {/* Confirm remove modal — portaled to body to escape stacking context */}
      {confirmRemoveId && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setConfirmRemoveId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1c1c1e",
              borderRadius: 14,
              padding: "28px 24px",
              width: "min(380px, 88vw)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 500,
                margin: "0 0 8px",
                fontFamily: "var(--font-display)",
              }}
            >
              Remove this video?
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              "{orderedVideos.find((v) => v.videoId === confirmRemoveId)?.title || "Untitled"}" will be removed from this project. You can restore it by discarding changes.
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => setConfirmRemoveId(null)}
                style={{
                  padding: "9px 20px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveVideo(confirmRemoveId)}
                style={{
                  padding: "9px 20px",
                  background: "rgba(255,60,60,0.9)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,40,40,1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,60,60,0.9)")
                }
              >
                Remove
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

/** Renders image galleries */
function GalleryBlock({ galleries }: { galleries: ImageGallery[] }) {
  if (!galleries.length) return null
  return (
    <>
      {galleries.map((gallery, gi) => (
        <div key={gi} style={{ marginTop: 24 }}>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.45)",
              marginBottom: 12,
            }}
          >
            {gallery.title}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: 8,
            }}
          >
            {gallery.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${gallery.title} ${i + 1}`}
                loading="lazy"
                style={{ width: "100%", borderRadius: 6, display: "block" }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

/** Section content */
function SectionContent({
  section,
  projectId,
  editMode,
  itemId,
}: {
  section: VideoSection
  projectId: string
  editMode: boolean
  itemId: string
}) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        {editMode ? (
          <InlineEdit
            value={section.description || ""}
            field={`section:${section.title}:description`}
            itemId={itemId}
            editMode
            as="textarea"
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.55)",
              display: "block",
              margin: "0 0 4px",
            }}
            placeholder="Section description..."
          />
        ) : (
          section.description && (
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.55)",
                margin: "0 0 4px",
              }}
            >
              {section.description}
            </p>
          )
        )}
        {editMode ? (
          <InlineEdit
            value={section.role || ""}
            field={`section:${section.title}:role`}
            itemId={itemId}
            editMode
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              fontStyle: "italic",
              display: "block",
            }}
            placeholder="Role..."
          />
        ) : (
          section.role && (
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                fontStyle: "italic",
                margin: 0,
              }}
            >
              Role: {section.role}
            </p>
          )
        )}
        {(section.credits?.length || editMode) && (
          <CreditsBlock
            credits={section.credits || []}
            editMode={editMode}
            itemId={itemId}
            sectionTitle={section.title}
          />
        )}
      </div>

      {section.videos.length > 0 ? (
        <VideoGrid
          videos={section.videos}
          projectId={projectId}
          sectionTitle={section.title}
        />
      ) : (
        <div
          style={{
            padding: "40px 16px",
            border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: 8,
            textAlign: "center",
            color: "rgba(255,255,255,0.3)",
            fontSize: 13,
          }}
        >
          Coming soon
        </div>
      )}

      {section.galleries && section.galleries.length > 0 && (
        <GalleryBlock galleries={section.galleries} />
      )}
    </div>
  )
}

/** Tabbed sections */
function SectionTabs({
  sections,
  projectId,
  editMode,
  itemId,
}: {
  sections: VideoSection[]
  projectId: string
  editMode: boolean
  itemId: string
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [isMobileTabs] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  const contentRef = useRef<HTMLDivElement>(null)
  const tabBarRef = useRef<HTMLDivElement>(null)

  // Handle tab switch — on mobile, use native scroll (bypass Lenis)
  const handleTabSwitch = useCallback((tabIndex: number) => {
    if (tabIndex === activeTab) return
    setActiveTab(tabIndex)

    if (isMobileTabs && tabBarRef.current) {
      requestAnimationFrame(() => {
        const lenis = (window as any).__lenis
        const scrollTarget = tabBarRef.current!.getBoundingClientRect().top + window.scrollY - 20
        if (lenis) {
          lenis.scrollTo(scrollTarget, { immediate: true, force: true })
        } else {
          window.scrollTo(0, scrollTarget)
        }
      })
    }
  }, [activeTab, isMobileTabs])

  return (
    <div>
      <div
        ref={tabBarRef}
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          marginBottom: isMobileTabs ? 14 : 20,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {sections.map((section, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              handleTabSwitch(i)
            }}
            style={{
              background: "none",
              border: "none",
              borderBottom:
                activeTab === i
                  ? "2px solid #fff"
                  : "2px solid transparent",
              padding: isMobileTabs ? "8px 12px" : "10px 18px",
              fontSize: isMobileTabs ? 11 : 13,
              fontFamily: "var(--font-display)",
              fontWeight: activeTab === i ? 500 : 400,
              letterSpacing: "0.01em",
              color:
                activeTab === i ? "#fff" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "color 0.2s ease, border-color 0.2s ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== i)
                e.currentTarget.style.color = "rgba(255,255,255,0.65)"
            }}
            onMouseLeave={(e) => {
              if (activeTab !== i)
                e.currentTarget.style.color = "rgba(255,255,255,0.4)"
            }}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div ref={contentRef}>
        <AnimatePresence mode={isMobileTabs ? "sync" : "wait"}>
          <motion.div
            key={activeTab}
            initial={isMobileTabs ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={isMobileTabs ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: isMobileTabs ? 0 : 0.2 }}
          >
            <SectionContent
              section={sections[activeTab]}
              projectId={projectId}
              editMode={editMode}
              itemId={projectId}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Full expanded view */
export function ExpandedProject({ item, onClose }: ExpandedProjectProps) {
  const { editMode } = useEditMode()
  const hasSections =
    item.type === "project" && item.sections && item.sections.length > 0
  const flatVideos = item.type === "project" ? item.videos : [item.video]
  const role = item.role
  const credits = item.credits
  const galleries = item.galleries

  return (
    <motion.div
      className="expanded-project"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      style={{
        padding: "28px 24px 24px",
        background: "#111",
        borderRadius: 6,
        position: "relative",
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Close project"
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          background: "rgba(255,255,255,0.1)",
          border: "none",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          zIndex: 2,
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
        }
      >
        <X size={16} />
      </button>

      {/* Project header — inline editable in edit mode */}
      <div style={{ marginBottom: 20, maxWidth: 600 }}>
        {item.client != null && (
          editMode ? (
            <InlineEdit
              value={typeof item.client === "string" ? item.client : ""}
              field="client"
              itemId={item.id}
              editMode
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.45)",
                display: "block",
                marginBottom: 6,
              }}
              placeholder="Client name..."
            />
          ) : (
            <p
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.45)",
                marginBottom: 6,
              }}
            >
              {item.client}
            </p>
          )
        )}

        {editMode ? (
          <InlineEdit
            value={item.title}
            field="title"
            itemId={item.id}
            editMode
            tag="h3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#fff",
              margin: "0 0 8px",
              display: "block",
            }}
          />
        ) : (
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#fff",
              margin: "0 0 8px",
            }}
          >
            {item.title}
          </h3>
        )}

        {editMode ? (
          <InlineEdit
            value={item.description || ""}
            field="description"
            itemId={item.id}
            editMode
            as="textarea"
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.65)",
              display: "block",
              margin: "0 0 8px",
            }}
            placeholder="Project description..."
          />
        ) : (
          item.description && (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.65)",
                margin: "0 0 8px",
              }}
            >
              {item.description}
            </p>
          )
        )}

        {editMode ? (
          <InlineEdit
            value={role || ""}
            field="role"
            itemId={item.id}
            editMode
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              fontStyle: "italic",
              display: "block",
            }}
            placeholder="Role (e.g. Cam Op, Editor)..."
          />
        ) : (
          role && (
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                fontStyle: "italic",
                margin: 0,
              }}
            >
              Role: {role}
            </p>
          )
        )}

        <CreditsBlock
          credits={credits || []}
          editMode={editMode}
          itemId={item.id}
        />

        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}
        >
          {item.categories.map((cat) => (
            <span
              key={cat}
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 999,
                padding: "3px 10px",
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {hasSections ? (
        <SectionTabs
          sections={item.type === "project" ? item.sections! : []}
          projectId={item.id}
          editMode={editMode}
          itemId={item.id}
        />
      ) : (
        <>
          <VideoGrid videos={flatVideos} projectId={item.id} />
          {galleries && galleries.length > 0 && (
            <GalleryBlock galleries={galleries} />
          )}
        </>
      )}
    </motion.div>
  )
}
