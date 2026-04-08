import React from "react"
import { motion } from "motion/react"
import { X } from "lucide-react"
import { VideoPlayer } from "./VideoPlayer"
import type { PortfolioItem } from "../../data/portfolio"

interface ExpandedProjectProps {
  item: PortfolioItem
  onClose: () => void
}

/**
 * Full expanded view that replaces the card in-place.
 * Shows metadata + video grid for projects, single video for singles.
 * Supports optional image galleries below the videos.
 */
export function ExpandedProject({ item, onClose }: ExpandedProjectProps) {
  const videos =
    item.type === "project" ? item.videos : [item.video]

  // Check if videos are portrait (9/16 or 4/5) to constrain width
  const isPortrait = videos.some(
    (v) => v.aspectRatio === "9/16" || v.aspectRatio === "4/5"
  )

  // Check if videos are narrower than 16/9 (e.g. 4/3, 1/1) to constrain width
  const isNarrow = videos.some(
    (v) => v.aspectRatio === "4/3" || v.aspectRatio === "1/1"
  )

  const role = item.role
  const credits = item.credits
  const galleries = item.galleries

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        padding: "28px 24px 24px",
        background: "#111",
        borderRadius: 6,
        position: "relative",
      }}
    >
      {/* Close button */}
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

      {/* Header: metadata */}
      <div style={{ marginBottom: 20, maxWidth: 600 }}>
        {item.client && (
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
        )}

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

        {item.description && (
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
        )}

        {role && (
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
        )}

        {/* Credits */}
        {credits && credits.length > 0 && (
          <details
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
              {credits.map((credit: any, i: number) => (
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
        )}

        {/* Category badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 12,
          }}
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

      {/* Video grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            videos.length === 1 && isPortrait
              ? "1fr"
              : videos.length === 1
              ? "1fr"
              : isPortrait
              ? "repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
              : "repeat(auto-fill, minmax(min(100%, 400px), 1fr))",
          gap: 12,
          maxWidth: videos.length === 1 && isPortrait ? 360 : videos.length === 1 && isNarrow ? 640 : undefined,
          margin: videos.length === 1 && (isPortrait || isNarrow) ? "0 auto" : undefined,
        }}
      >
        {videos.map((video) => (
          <VideoPlayer
            key={video.videoId}
            videoId={video.videoId}
            title={video.title}
            description={video.description}
            aspectRatio={video.aspectRatio || "16/9"}
          />
        ))}
      </div>

      {/* Image galleries */}
      {galleries && galleries.length > 0 && galleries.map((gallery, gi) => (
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
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: 8,
            }}
          >
            {gallery.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${gallery.title} ${i + 1}`}
                loading="lazy"
                style={{
                  width: "100%",
                  borderRadius: 6,
                  display: "block",
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  )
}
