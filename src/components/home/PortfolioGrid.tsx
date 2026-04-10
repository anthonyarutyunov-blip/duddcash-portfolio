import { AnimatePresence, motion } from "motion/react"
import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { GripVertical, Plus, FolderPlus, Film } from "lucide-react"
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
import { PortfolioCard } from "../portfolio/PortfolioCard"
import {
  portfolioItems,
  categories,
  type PortfolioItem,
  type Category,
} from "../../data/portfolio"
import { useEditMode } from "../../lib/edit-mode"
import {
  loadOverrides,
  loadDefaultOverrides,
  saveOverrides,
  setTabItems,
  setItemSize,
  type SizeTier,
  type LayoutOverrides,
} from "../../lib/layout-store"
import {
  getMergedItems,
  SIZE_TO_SPAN,
  type MergedItem,
} from "../../lib/layout-merge"
import { AddVideoForm } from "../admin/AddVideoForm"

/**
 * Sortable card wrapper — only the drag handle activates dragging.
 * The rest of the card (size selector, edit, open) stays fully interactive.
 */
function SortableCard({
  id,
  children,
  gridColumn,
}: {
  id: string
  children: React.ReactNode
  gridColumn: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: undefined, // No transition — DragOverlay handles the visual
    opacity: isDragging ? 0.3 : 1,
    outline: isDragging ? "2px dashed rgba(255,255,255,0.2)" : "none",
    zIndex: isDragging ? 100 : undefined,
    position: "relative" as const,
    gridColumn,
    borderRadius: 12,
  }

  return (
    <div ref={setNodeRef} style={style} className="portfolio-card-wrapper" {...attributes}>
      {children}
      {/* Dedicated drag handle — only this activates dragging */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 12px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.5)",
          cursor: "grab",
          userSelect: "none",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
        }}
      >
        <GripVertical size={12} />
        Drag
      </div>
    </div>
  )
}

export default function PortfolioGrid() {
  const [filter, setFilter] = useState<"All" | Category>("Featured")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [headingVisible, setHeadingVisible] = useState(false)
  const { editMode } = useEditMode()
  const [overrides, setOverrides] = useState<LayoutOverrides | null>(null)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Load overrides on mount and when edit mode changes
  useEffect(() => {
    const ov = loadOverrides()
    // If localStorage was empty, loadOverrides returns empty — fetch defaults
    if (Object.keys(ov.tabLayouts).length === 0) {
      loadDefaultOverrides().then((defaults) => setOverrides(defaults))
    } else {
      setOverrides(ov)
    }
  }, [editMode])

  // Reload overrides when content is edited
  useEffect(() => {
    const handler = () => setOverrides(loadOverrides())
    window.addEventListener("editmode:content-changed", handler)
    return () => window.removeEventListener("editmode:content-changed", handler)
  }, [])

  // Heading stroke-fill reveal on scroll
  useEffect(() => {
    const el = headingRef.current
    if (!el) return

    // If already visible in viewport on mount, reveal immediately
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setHeadingVisible(true)
      return
    }

    // Safety fallback — never stay stuck on outline
    const fallback = setTimeout(() => setHeadingVisible(true), 2000)

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadingVisible(true)
          clearTimeout(fallback)
          obs.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => { obs.disconnect(); clearTimeout(fallback) }
  }, [])

  // Read filter and project/video from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlFilter = params.get("filter")
    if (urlFilter && categories.includes(urlFilter as any)) {
      setFilter(urlFilter as "All" | Category)
      setTimeout(() => {
        const el = document.getElementById("portfolio")
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 300)
    }

    // Auto-expand project from share link: ?project=wynn-nightlife&video=abc123
    const projectParam = params.get("project")
    if (projectParam) {
      const match = portfolioItems.find((p) => p.id === projectParam)
      if (match) {
        // Switch to All tab to ensure project is visible
        setFilter("All")
        setTimeout(() => {
          setExpandedId(projectParam)
          const videoParam = params.get("video")
          if (videoParam) {
            // After expand animation, scroll to the specific video
            setTimeout(() => {
              const videoEl = document.querySelector(
                `[data-video-id="${videoParam}"]`
              )
              videoEl?.scrollIntoView({ behavior: "smooth", block: "center" })
            }, 600)
          }
        }, 400)
      }
    }
  }, [])

  // Close expanded card when filter changes
  useEffect(() => {
    setExpandedId(null)
  }, [filter])

  // Get merged items (applies overrides to base data)
  const mergedItems: MergedItem[] = getMergedItems(
    portfolioItems,
    filter,
    overrides
  )

  // DnD sensor — only drag handle activates, so no distance constraint needed
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  // Handle drag end — reorder items and persist
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = mergedItems.findIndex(
        (m) => m.item.id === active.id
      )
      const newIndex = mergedItems.findIndex(
        (m) => m.item.id === over.id
      )
      if (oldIndex < 0 || newIndex < 0) return

      const reordered = arrayMove(mergedItems, oldIndex, newIndex)

      const ov = loadOverrides()
      setTabItems(
        ov,
        filter,
        reordered.map((m, i) => ({
          itemId: m.item.id,
          order: i,
          size: m.size,
        }))
      )
      saveOverrides(ov)
      setOverrides({ ...ov })
    },
    [mergedItems, filter]
  )

  // Handle size change from SizeSelector
  const handleSizeChange = useCallback(
    (itemId: string, size: SizeTier) => {
      const ov = loadOverrides()
      setItemSize(ov, filter, itemId, size)
      const tabLayout = ov.tabLayouts[filter]
      if (!tabLayout || tabLayout.items.length === 0) {
        setTabItems(
          ov,
          filter,
          mergedItems.map((m, i) => ({
            itemId: m.item.id,
            order: i,
            size: m.item.id === itemId ? size : m.size,
          }))
        )
      }
      saveOverrides(ov)
      setOverrides({ ...ov })
    },
    [filter, mergedItems]
  )

  const handleExpand = useCallback((id: string) => {
    setExpandedId(id)
  }, [])

  const handleCollapse = useCallback(() => {
    setExpandedId(null)
  }, [])

  // Items to display (filter out non-expanded when one is expanded)
  const displayItems = expandedId
    ? mergedItems.filter((m) => m.item.id === expandedId)
    : mergedItems

  const gridContent = displayItems.map((merged, index) => {
    const { item, size, colSpan } = merged
    const isBentoWide =
      !expandedId && !editMode && item.featured && index === 0 && size === "m"
    const finalSpan = isBentoWide ? 6 : colSpan
    const gridCol =
      expandedId === item.id ? "1 / -1" : `span ${finalSpan}`

    const card = (
      <PortfolioCard
        item={item}
        isExpanded={expandedId === item.id}
        isBentoWide={isBentoWide}
        onExpand={() => handleExpand(item.id)}
        onCollapse={handleCollapse}
        editMode={editMode}
        currentSize={size}
        onSizeChange={(s) => handleSizeChange(item.id, s)}
      />
    )

    if (editMode && !expandedId) {
      return (
        <SortableCard key={item.id} id={item.id} gridColumn={gridCol}>
          {card}
        </SortableCard>
      )
    }

    return (
      <div
        key={item.id}
        className="portfolio-card-wrapper"
        style={{ gridColumn: gridCol }}
      >
        {card}
      </div>
    )
  })

  const gridElement = (
    <motion.div
      key={`${filter}-${expandedId || "grid"}`}
      className={`portfolio-bento-grid${activeId ? " portfolio-grid--dragging" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {gridContent}

      {/* Add content buttons in edit mode */}
      {editMode && !expandedId && (
        <>
          <button
            onClick={() => setShowAddVideo(true)}
            className="portfolio-add-btn"
          >
            <Film size={16} />
            <span>Add Video</span>
          </button>
          <button
            onClick={() => setShowAddProject(true)}
            className="portfolio-add-btn"
          >
            <FolderPlus size={16} />
            <span>Add Project</span>
          </button>
        </>
      )}
    </motion.div>
  )

  return (
    <section
      id="portfolio"
      style={{
        padding: "var(--space-xl) 0 var(--space-3xl)",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      <div className="portfolio-container">
        <h2
          ref={headingRef}
          className={`portfolio-heading ${headingVisible ? "portfolio-heading--revealed" : ""}`}
        >
          OUR WORK
        </h2>

        <div className="portfolio-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`portfolio-filter-pill ${filter === cat ? "portfolio-filter-pill--active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {editMode && !expandedId ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={(e: DragStartEvent) =>
                setActiveId(e.active.id as string)
              }
              onDragEnd={(e: DragEndEvent) => {
                setActiveId(null)
                handleDragEnd(e)
              }}
              onDragCancel={() => setActiveId(null)}
            >
              <SortableContext
                items={displayItems.map((m) => m.item.id)}
                strategy={rectSortingStrategy}
              >
                {gridElement}
              </SortableContext>

              <DragOverlay adjustScale={false} dropAnimation={null}>
                {activeId
                  ? (() => {
                      const found = mergedItems.find(
                        (m) => m.item.id === activeId
                      )
                      if (!found) return null
                      return (
                        <div
                          style={{
                            opacity: 1,
                            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                            transform: "scale(1.03)",
                            borderRadius: 12,
                            overflow: "hidden",
                            pointerEvents: "none",
                          }}
                        >
                          <PortfolioCard
                            item={found.item}
                            isExpanded={false}
                            onExpand={() => {}}
                            onCollapse={() => {}}
                            editMode={false}
                            currentSize={found.size}
                          />
                        </div>
                      )
                    })()
                  : null}
              </DragOverlay>
            </DndContext>
          ) : (
            gridElement
          )}
        </AnimatePresence>
      </div>

      {/* Add single video to current tab */}
      {showAddVideo && (
        <AddVideoForm
          projectId="__new_single__"
          currentTab={filter}
          onClose={() => setShowAddVideo(false)}
          onAdded={() => {
            setOverrides(loadOverrides())
            setShowAddVideo(false)
          }}
        />
      )}

      {/* Add new project/folder */}
      {showAddProject && (
        <AddProjectModal
          currentTab={filter}
          onClose={() => setShowAddProject(false)}
          onAdded={() => {
            setOverrides(loadOverrides())
            setShowAddProject(false)
          }}
        />
      )}

      <style>{`
        .portfolio-container {
          background: #1c1c1e;
          border-radius: 32px;
          margin: 0 24px;
          padding: 48px 32px 32px;
          overflow: hidden;
        }

        .portfolio-heading {
          font-family: var(--font-display);
          font-size: max(5.5vw, 44px);
          font-weight: 500;
          letter-spacing: 0.05em;
          line-height: 1.0;
          text-align: center;
          margin: 0 0 var(--space-xl);
          -webkit-text-stroke: 1.5px #fff;
          color: transparent;
          background: linear-gradient(to right, #fff 50%, transparent 50%);
          background-size: 200% 100%;
          background-position: 100% 0;
          -webkit-background-clip: text;
          background-clip: text;
          transition: background-position 1.2s cubic-bezier(.165, .84, .44, 1),
                      -webkit-text-stroke 0.4s ease 0.8s;
        }

        .portfolio-heading--revealed {
          background-position: 0% 0;
          -webkit-text-stroke: 0px transparent;
        }

        .portfolio-filter-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-bottom: var(--space-xl);
        }

        .portfolio-filter-pill {
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 8px 20px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: background 0.3s cubic-bezier(.165, .84, .44, 1),
                      color 0.3s cubic-bezier(.165, .84, .44, 1);
          flex-shrink: 0;
          white-space: nowrap;
        }

        .portfolio-filter-pill:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
        }

        .portfolio-filter-pill--active {
          background: #fff;
          color: #111;
        }

        .portfolio-filter-pill--active:hover {
          background: rgba(255,255,255,0.9);
          color: #111;
        }

        .portfolio-bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 12px;
          align-items: start;
          grid-auto-flow: dense;
        }

        .portfolio-card-wrapper {
          transition: transform 0.5s cubic-bezier(.165, .84, .44, 1),
                      box-shadow 0.5s cubic-bezier(.165, .84, .44, 1);
          border-radius: 12px;
          position: relative;
        }

        .portfolio-card-wrapper:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.3);
        }

        /* Disable transitions during active drag — prevents jank */
        .portfolio-grid--dragging .portfolio-card-wrapper {
          transition: none !important;
        }

        .portfolio-grid--dragging .portfolio-card-wrapper:hover {
          transform: none !important;
          box-shadow: none !important;
        }

        .portfolio-card:hover img {
          transform: scale(1.05);
        }

        .portfolio-card__info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 40px 16px 14px;
          background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          z-index: 2;
          pointer-events: none;
        }

        .portfolio-card__title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .portfolio-card__client {
          font-size: 11px;
          color: rgba(255,255,255,0.55);
          margin-top: 2px;
          letter-spacing: 0.02em;
        }

        .portfolio-card__hover-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.35);
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(.165, .84, .44, 1);
          z-index: 3;
          border-radius: 12px;
        }

        .portfolio-card:hover .portfolio-card__hover-overlay {
          opacity: 1;
        }

        .portfolio-card__badge {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 999px;
          padding: 2px 8px;
        }

        /* Add content buttons in edit mode */
        .portfolio-add-btn {
          grid-column: span 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 120px;
          background: rgba(255,255,255,0.03);
          border: 2px dashed rgba(74,222,128,0.25);
          border-radius: 12px;
          color: rgba(74,222,128,0.6);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .portfolio-add-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(74,222,128,0.5);
          color: rgba(74,222,128,0.9);
        }

        @media (max-width: 1024px) {
          .portfolio-container {
            margin: 0 16px;
            border-radius: 24px;
            padding: 40px 24px 24px;
          }

          .portfolio-bento-grid {
            grid-template-columns: repeat(9, 1fr);
          }
        }

        @media (max-width: 860px) {
          .portfolio-bento-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @media (max-width: 768px) {
          .portfolio-container {
            margin: 0 12px;
            border-radius: 20px;
            padding: 32px 16px 16px;
          }

          .portfolio-bento-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .portfolio-card-wrapper {
            grid-column: span 1 !important;
          }

          .portfolio-add-btn {
            grid-column: span 1 !important;
          }

          .portfolio-filter-bar {
            flex-wrap: nowrap;
            justify-content: flex-start;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 8px;
            mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%);
          }

          .portfolio-card__hover-overlay {
            display: none;
          }

          .portfolio-card-wrapper:hover {
            transform: none;
            box-shadow: none;
          }
        }
      `}</style>
    </section>
  )
}

/** Simple modal to add a new project / folder */
function AddProjectModal({
  currentTab,
  onClose,
  onAdded,
}: {
  currentTab: string
  onClose: () => void
  onAdded: () => void
}) {
  const [title, setTitle] = useState("")
  const [client, setClient] = useState("")
  const [description, setDescription] = useState("")
  const [videoId, setVideoId] = useState("")
  const [aspectRatio, setAspectRatio] = useState("16/9")

  const isValid = title.trim().length > 0 && videoId.trim().length > 8

  const handleSave = () => {
    if (!isValid) return

    const ov = loadOverrides()
    const id = `new-project-${Date.now()}`
    ov.newProjects.push({
      id,
      type: "project",
      title: title.trim(),
      client: client.trim() || undefined,
      description: description.trim() || undefined,
      categories: currentTab === "All" ? ["Featured"] : [currentTab],
      videoId: videoId.trim(),
      aspectRatio,
    })
    saveOverrides(ov)
    window.dispatchEvent(new CustomEvent("editmode:content-changed"))
    onAdded()
  }

  const ASPECT_OPTIONS = [
    { value: "16/9", label: "16:9" },
    { value: "9/16", label: "9:16" },
    { value: "4/5", label: "4:5" },
    { value: "4/3", label: "4:3" },
    { value: "1/1", label: "1:1" },
  ]

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
          padding: "28px 24px",
          width: "min(480px, 92vw)",
          maxHeight: "85vh",
          overflowY: "auto",
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
            margin: "0 0 20px",
          }}
        >
          New Project
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ModalField label="Project Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FWD Hospitality Group"
              style={modalInputStyle}
              autoFocus
            />
          </ModalField>

          <ModalField label="Client">
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Client name"
              style={modalInputStyle}
            />
          </ModalField>

          <ModalField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description..."
              style={{ ...modalInputStyle, resize: "vertical", minHeight: 50 }}
            />
          </ModalField>

          <ModalField label="Cover Video (Bunny ID)">
            <input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="e.g. ba823cf7-8001-4ed9-bf4b-ba292ab1c4e4"
              style={modalInputStyle}
            />
          </ModalField>

          <ModalField label="Cover Aspect Ratio">
            <div style={{ display: "flex", gap: 4 }}>
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
                    background: aspectRatio === opt.value ? "#fff" : "rgba(255,255,255,0.06)",
                    color: aspectRatio === opt.value ? "#111" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </ModalField>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={modalCancelStyle}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            style={{ ...modalSaveStyle, opacity: isValid ? 1 : 0.4, cursor: isValid ? "pointer" : "not-allowed" }}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const modalInputStyle: React.CSSProperties = {
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

const modalCancelStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "rgba(255,255,255,0.5)",
  fontSize: 13,
  cursor: "pointer",
}

const modalSaveStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "#fff",
  border: "none",
  borderRadius: 8,
  color: "#111",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}
