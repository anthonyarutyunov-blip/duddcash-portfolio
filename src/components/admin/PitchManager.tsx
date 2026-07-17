/**
 * PitchManager — internal pitch builder (edit mode → "Pitches" button).
 *
 * Views: secret prompt → list → editor → published.
 * Library = every video on the site via the merge layer (base data +
 * editor-added). Publishing SNAPSHOTS titles/posters/aspect into the pitch
 * so client pages never depend on site data or localStorage.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  X,
  Plus,
  Search,
  GripVertical,
  Star,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { portfolioItems, categories as siteCategories } from "../../data/portfolio"
import { getMergedItems, getMergedVideos } from "../../lib/layout-merge"
import { thumbnailUrl, normalizeVideoId } from "../../lib/bunny"
import {
  listPitches,
  getPitch,
  createPitch,
  updatePitch,
  deletePitch,
  getPitchSecret,
  setPitchSecret,
  PitchAuthError,
  type PitchSummary,
  type PitchItem,
  type PitchDraft,
} from "../../lib/pitch-api"

/* ── Library entry: one selectable video ── */
interface LibraryVideo {
  videoId: string
  title: string
  aspectRatio: string
  posterUrl: string
  projectTitle: string
  projectRef: string
  sectionTitle?: string
  /** Site tabs the parent project lives in (for the library tab filter) */
  categories: string[]
}

function buildLibrary(): LibraryVideo[] {
  const out: LibraryVideo[] = []
  const seen = new Set<string>()
  const merged = getMergedItems(portfolioItems, "All")
  for (const m of merged) {
    const item = m.item as any
    if (item.type === "single" && item.video) {
      pushVideo(out, seen, item.video, item, undefined)
    } else if (item.type === "project") {
      if (item.sections && item.sections.length > 0) {
        for (const s of item.sections) {
          for (const v of getMergedVideos(item.id, s.title, s.videos)) {
            pushVideo(out, seen, v, item, s.title)
          }
        }
      } else {
        for (const v of getMergedVideos(item.id, undefined, item.videos || [])) {
          pushVideo(out, seen, v, item, undefined)
        }
      }
    }
  }
  return out
}

function pushVideo(
  out: LibraryVideo[],
  seen: Set<string>,
  v: any,
  item: any,
  sectionTitle?: string
) {
  const id = normalizeVideoId(String(v.videoId || ""))
  if (!id || seen.has(id) || !/^[0-9a-f-]{36}$/i.test(id)) return
  seen.add(id)
  out.push({
    videoId: id,
    title: v.title || item.title || "Untitled",
    aspectRatio: v.aspectRatio || "16/9",
    posterUrl: item.customThumbnail && item.thumbnailVideoId === v.videoId
      ? item.customThumbnail
      : thumbnailUrl(id),
    projectTitle: item.title || "",
    projectRef: item.id || "",
    sectionTitle,
    categories: Array.isArray(item.categories) ? item.categories : [],
  })
}

type View = "secret" | "list" | "editor" | "published"

export function PitchManager({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>(() =>
    getPitchSecret() ? "list" : "secret"
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // List state
  const [pitches, setPitches] = useState<PitchSummary[] | null>(null)

  // Editor state
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [clientName, setClientName] = useState("")
  const [note, setNote] = useState("")
  const [items, setItems] = useState<PitchItem[]>([])
  const [heroVideoId, setHeroVideoId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [libTab, setLibTab] = useState<string>("All")
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Published state
  const [publishedUrl, setPublishedUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const library = useMemo(buildLibrary, [])

  // Lenis (the site's smooth-scroll engine on desktop) intercepts wheel
  // events globally and scrolls the PAGE — inside this modal that meant the
  // library pane never received wheel input (page moved behind the popup
  // instead). Stop Lenis while the modal is open; the data-lenis-prevent
  // attribute on the overlay lets native wheel scrolling through to the
  // modal's own scroll containers.
  useEffect(() => {
    const lenis = (window as any).__lenis
    lenis?.stop?.()
    document.body.style.overflow = "hidden"
    return () => {
      lenis?.start?.()
      document.body.style.overflow = ""
    }
  }, [])

  const refreshList = useCallback(async () => {
    setError(null)
    try {
      const { pitches } = await listPitches()
      setPitches(pitches)
    } catch (e: any) {
      if (e instanceof PitchAuthError) setView("secret")
      else setError(e.message)
    }
  }, [])

  useEffect(() => {
    if (view === "list" && pitches === null) refreshList()
  }, [view, pitches, refreshList])

  const startNew = () => {
    setEditingSlug(null)
    setTitle("")
    setClientName("")
    setNote("")
    setItems([])
    setHeroVideoId(null)
    setSearch("")
    setView("editor")
  }

  const startEdit = async (slug: string) => {
    setBusy(true)
    setError(null)
    try {
      const p = await getPitch(slug)
      setEditingSlug(slug)
      setTitle(p.title)
      setClientName(p.clientName || "")
      setNote(p.note || "")
      setItems(p.items)
      setHeroVideoId(p.heroVideoId || p.items[0]?.videoId || null)
      setSearch("")
      setView("editor")
    } catch (e: any) {
      if (e instanceof PitchAuthError) setView("secret")
      else setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Delete this pitch? The client link /p/${slug} will stop working.`)) return
    setBusy(true)
    try {
      await deletePitch(slug)
      setPitches((prev) => prev?.filter((p) => p.slug !== slug) ?? null)
    } catch (e: any) {
      if (e instanceof PitchAuthError) setView("secret")
      else setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExportAll = async () => {
    setBusy(true)
    try {
      const { pitches: summaries } = await listPitches()
      const all = await Promise.all(summaries.map((s) => getPitch(s.slug)))
      const blob = new Blob([JSON.stringify(all, null, 2)], {
        type: "application/json",
      })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `duddcash-pitches-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const addVideo = (v: LibraryVideo) => {
    if (items.some((it) => it.videoId === v.videoId)) return
    const item: PitchItem = {
      videoId: v.videoId,
      title: v.title,
      aspectRatio: v.aspectRatio,
      posterUrl: v.posterUrl,
      projectRef: v.projectRef,
    }
    setItems((prev) => [...prev, item])
    if (!heroVideoId) setHeroVideoId(v.videoId)
  }

  const removeItem = (videoId: string) => {
    setItems((prev) => prev.filter((it) => it.videoId !== videoId))
    if (heroVideoId === videoId) setHeroVideoId(null)
  }

  const patchItem = (videoId: string, patch: Partial<PitchItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.videoId === videoId ? { ...it, ...patch } : it))
    )
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const from = prev.findIndex((it) => it.videoId === active.id)
      const to = prev.findIndex((it) => it.videoId === over.id)
      if (from < 0 || to < 0) return prev
      return arrayMove(prev, from, to)
    })
  }

  const canPublish = title.trim().length > 0 && items.length > 0 && !busy

  const handlePublish = async () => {
    if (!canPublish) return
    setBusy(true)
    setError(null)
    const draft: PitchDraft = {
      title: title.trim(),
      clientName: clientName.trim() || undefined,
      note: note.trim() || undefined,
      heroVideoId: heroVideoId || undefined,
      items,
    }
    try {
      const res = editingSlug
        ? await updatePitch(editingSlug, draft)
        : await createPitch(draft)
      setPublishedUrl(res.url)
      setPitches(null) // refresh list next visit
      setView("published")
    } catch (e: any) {
      if (e instanceof PitchAuthError) setView("secret")
      else setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const filteredLibrary = useMemo(() => {
    const q = search.trim().toLowerCase()
    return library.filter((v) => {
      if (libTab !== "All" && !v.categories.includes(libTab)) return false
      if (!q) return true
      return (
        v.title.toLowerCase().includes(q) ||
        v.projectTitle.toLowerCase().includes(q) ||
        (v.sectionTitle || "").toLowerCase().includes(q)
      )
    })
  }, [library, search, libTab])

  return createPortal(
    <div
      data-lenis-prevent
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overscrollBehavior: "contain",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1c1c1e",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          width: view === "editor" ? "min(1100px, 96vw)" : "min(620px, 94vw)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 500,
              color: "#fff",
              margin: 0,
            }}
          >
            {view === "editor"
              ? editingSlug
                ? "Edit Pitch"
                : "New Pitch"
              : view === "published"
                ? "Pitch Live"
                : "Pitches"}
          </h3>
          <button onClick={onClose} style={iconBtn} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {error && (
          <div
            style={{
              margin: "12px 22px 0",
              padding: "9px 14px",
              background: "rgba(255,80,80,0.1)",
              border: "1px solid rgba(255,80,80,0.25)",
              borderRadius: 8,
              color: "rgba(255,140,140,0.95)",
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {error}
          </div>
        )}

        {/* ── Secret prompt ── */}
        {view === "secret" && (
          <SecretPrompt
            onSubmit={(s) => {
              setPitchSecret(s)
              setError(null)
              setPitches(null)
              setView("list")
            }}
          />
        )}

        {/* ── List ── */}
        {view === "list" && (
          <div style={{ padding: 22, overflowY: "auto", flex: 1, minHeight: 0 }}>
            <button onClick={startNew} style={primaryBtn}>
              <Plus size={14} /> New Pitch
            </button>

            {pitches === null ? (
              <p style={mutedText}>Loading…</p>
            ) : pitches.length === 0 ? (
              <p style={mutedText}>
                No pitches yet. Build your first one — pick films, name it,
                and send the link.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                {pitches.map((p) => (
                  <div
                    key={p.slug}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.title}
                        {p.clientName && (
                          <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
                            {" "}· {p.clientName}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                        /p/{p.slug} · {p.itemCount} film{p.itemCount === 1 ? "" : "s"} ·{" "}
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => copyUrl(`${window.location.origin}/p/${p.slug}`)}
                      style={iconBtn}
                      title="Copy link"
                    >
                      {copied ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
                    </button>
                    <a
                      href={`/p/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...iconBtn, display: "flex", textDecoration: "none" }}
                      title="Open"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <button onClick={() => startEdit(p.slug)} style={iconBtn} title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.slug)}
                      style={{ ...iconBtn, color: "rgba(255,110,110,0.7)" }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pitches !== null && pitches.length > 0 && (
              <button onClick={handleExportAll} style={{ ...ghostBtn, marginTop: 16 }}>
                <Download size={12} /> Export all (backup)
              </button>
            )}
          </div>
        )}

        {/* ── Editor ── */}
        {view === "editor" && (
          <div
            style={{
              display: "flex",
              flex: 1,
              minHeight: 0,
              flexDirection: window.innerWidth <= 860 ? "column" : "row",
            }}
          >
            {/* Library pane */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                borderRight: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                minHeight: 200,
              }}
            >
              <div style={{ padding: "14px 16px 10px", flexShrink: 0 }}>
                {/* Tab filter — same tabs as the site's work section */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    marginBottom: 10,
                  }}
                >
                  {siteCategories.map((cat) => {
                    const active = libTab === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => setLibTab(cat)}
                        style={{
                          padding: "5px 11px",
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          border: "none",
                          borderRadius: 999,
                          cursor: "pointer",
                          background: active ? "#fff" : "rgba(255,255,255,0.06)",
                          color: active ? "#111" : "rgba(255,255,255,0.5)",
                          transition: "background 0.15s ease, color 0.15s ease",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
                <div style={{ position: "relative" }}>
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${filteredLibrary.length} video${filteredLibrary.length === 1 ? "" : "s"}…`}
                    style={{ ...inputStyle, paddingLeft: 30 }}
                  />
                </div>
              </div>
              <div
                style={{
                  // flex:1 + minHeight:0 makes THIS the scroll container —
                  // without them it grows to content height, the modal clips
                  // it, and the pane can never scroll
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  padding: "0 16px 16px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  // Explicit row sizing — with plain "auto" rows this scroll
                  // container resolved every row to 2px (tiles collapsed to
                  // slivers) even though tiles measure 133px outside the grid
                  gridAutoRows: "max-content",
                  gap: 8,
                  alignContent: "start",
                }}
              >
                {filteredLibrary.map((v) => {
                  const added = items.some((it) => it.videoId === v.videoId)
                  return (
                    <button
                      key={v.videoId}
                      onClick={() => (added ? removeItem(v.videoId) : addVideo(v))}
                      style={{
                        position: "relative",
                        border: added
                          ? "1px solid rgba(74,222,128,0.6)"
                          : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        overflow: "hidden",
                        padding: 0,
                        background: "#111",
                        cursor: "pointer",
                        opacity: added ? 0.75 : 1,
                        textAlign: "left",
                      }}
                      title={added ? "Remove from pitch" : "Add to pitch"}
                    >
                      <img
                        src={v.posterUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          aspectRatio: "16/9",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      {added && (
                        <div
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "rgba(74,222,128,0.9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check size={12} color="#000" />
                        </div>
                      )}
                      <div style={{ padding: "6px 8px 8px" }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#fff",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {v.title}
                        </div>
                        <div
                          style={{
                            fontSize: 9.5,
                            color: "rgba(255,255,255,0.35)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: 1,
                          }}
                        >
                          {v.projectTitle}
                          {v.sectionTitle ? ` · ${v.sectionTitle}` : ""}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Pitch pane */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                minHeight: 240,
              }}
            >
              <div style={{ padding: "14px 16px", overflowY: "auto", flex: 1, minHeight: 0 }}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Pitch title (e.g. Mercedes Pitch)"
                  style={{ ...inputStyle, fontSize: 15, fontWeight: 500, marginBottom: 8 }}
                />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name (shown as 'Prepared for …')"
                  style={{ ...inputStyle, marginBottom: 8 }}
                />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Intro note to the client (optional)…"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 56, marginBottom: 14 }}
                />

                {items.length === 0 ? (
                  <p style={mutedText}>
                    Pick films from the library — they'll appear here in
                    screening order.
                  </p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={items.map((it) => it.videoId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {items.map((it, i) => (
                          <SortablePitchRow
                            key={it.videoId}
                            item={it}
                            index={i}
                            isHero={heroVideoId === it.videoId}
                            expanded={expandedItem === it.videoId}
                            onToggleExpand={() =>
                              setExpandedItem(
                                expandedItem === it.videoId ? null : it.videoId
                              )
                            }
                            onSetHero={() => setHeroVideoId(it.videoId)}
                            onRemove={() => removeItem(it.videoId)}
                            onPatch={(patch) => patchItem(it.videoId, patch)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setView("list")}
                  style={ghostBtn}
                >
                  Back
                </button>
                <button
                  onClick={handlePublish}
                  disabled={!canPublish}
                  style={{
                    ...primaryBtn,
                    margin: 0,
                    opacity: canPublish ? 1 : 0.4,
                    cursor: canPublish ? "pointer" : "not-allowed",
                  }}
                >
                  {busy
                    ? "Publishing…"
                    : editingSlug
                      ? "Update Pitch"
                      : "Publish Pitch"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Published ── */}
        {view === "published" && (
          <div style={{ padding: 26, textAlign: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "6px auto 16px",
              }}
            >
              <Check size={20} color="#4ade80" />
            </div>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 500, margin: "0 0 4px" }}>
              Your pitch is live
            </p>
            <p style={{ ...mutedText, margin: "0 0 18px" }}>
              The link works right now and never expires. Send it to your
              client.
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  flex: 1,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 13,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                }}
              >
                {publishedUrl}
              </span>
              <button onClick={() => copyUrl(publishedUrl)} style={iconBtn} title="Copy">
                {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...primaryBtn, margin: 0, textDecoration: "none" }}
              >
                <ExternalLink size={13} /> Open pitch
              </a>
              <button
                onClick={() => {
                  setPitches(null)
                  setView("list")
                }}
                style={ghostBtn}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

/* ── Sortable film row in the pitch pane ── */
function SortablePitchRow({
  item,
  index,
  isHero,
  expanded,
  onToggleExpand,
  onSetHero,
  onRemove,
  onPatch,
}: {
  item: PitchItem
  index: number
  isHero: boolean
  expanded: boolean
  onToggleExpand: () => void
  onSetHero: () => void
  onRemove: () => void
  onPatch: (patch: Partial<PitchItem>) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.videoId })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          style={{ cursor: "grab", color: "rgba(255,255,255,0.3)", display: "flex", flexShrink: 0 }}
        >
          <GripVertical size={14} />
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", width: 18, flexShrink: 0 }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <img
          src={item.posterUrl}
          alt=""
          loading="lazy"
          style={{ width: 46, height: 28, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
        />
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 12.5,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.title}
        </span>
        <button
          onClick={onSetHero}
          style={{
            ...iconBtn,
            color: isHero ? "#facc15" : "rgba(255,255,255,0.3)",
          }}
          title={isHero ? "Hero film (opens the pitch)" : "Make hero film"}
        >
          <Star size={13} fill={isHero ? "#facc15" : "none"} />
        </button>
        <button onClick={onToggleExpand} style={iconBtn} title="Details">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <button
          onClick={onRemove}
          style={{ ...iconBtn, color: "rgba(255,110,110,0.7)" }}
          title="Remove"
        >
          <X size={13} />
        </button>
      </div>
      {expanded && (
        <div style={{ padding: "0 10px 10px 40px", display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            type="text"
            value={item.title}
            onChange={(e) => onPatch({ title: e.target.value })}
            placeholder="Film title shown to the client"
            style={inputStyle}
          />
          <input
            type="text"
            value={item.description || ""}
            onChange={(e) => onPatch({ description: e.target.value })}
            placeholder="One-line description (optional)"
            style={inputStyle}
          />
          <input
            type="url"
            value={item.masterDownloadUrl || ""}
            onChange={(e) => onPatch({ masterDownloadUrl: e.target.value })}
            placeholder="Master download URL (optional — Dropbox etc.)"
            style={inputStyle}
          />
          <input
            type="url"
            value={item.instagramUrl || ""}
            onChange={(e) => onPatch({ instagramUrl: e.target.value })}
            placeholder="Instagram link (optional — post/reel URL)"
            style={inputStyle}
          />
        </div>
      )}
    </div>
  )
}

/* ── Secret prompt ── */
function SecretPrompt({ onSubmit }: { onSubmit: (secret: string) => void }) {
  const [value, setValue] = useState("")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSubmit(value)
      }}
      style={{ padding: 26 }}
    >
      <p style={{ ...mutedText, marginTop: 0 }}>
        Enter the pitch secret (the PITCH_SECRET value set in Netlify). It's
        remembered on this device. If it was rotated, enter the new one.
      </p>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Pitch secret"
        autoFocus
        style={{ ...inputStyle, marginBottom: 14 }}
      />
      <button type="submit" style={{ ...primaryBtn, margin: 0 }} disabled={!value.trim()}>
        Continue
      </button>
    </form>
  )
}

/* ── Shared styles ── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
}

const iconBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 7,
  background: "rgba(255,255,255,0.06)",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "rgba(255,255,255,0.6)",
  flexShrink: 0,
  padding: 0,
}

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 18px",
  background: "#fff",
  border: "none",
  borderRadius: 9,
  color: "#111",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}

const ghostBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 16px",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 9,
  color: "rgba(255,255,255,0.6)",
  fontSize: 12.5,
  cursor: "pointer",
}

const mutedText: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.45)",
  lineHeight: 1.6,
}
