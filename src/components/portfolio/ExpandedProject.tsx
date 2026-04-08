import React from "react"
import { motion } from "motion/react"
import { X } from "lucide-react"
import { VideoPlayer } from "./VideoPlayer"
import type { PortfolioItem, VideoSection, Credit, ImageGallery, BunnyVideo } from "../../data/portfolio"

interface ExpandedProjectProps {
  item: PortfolioItem
  onClose: () => void
}

/** Renders a credits block */
function CreditsBlock({ credits }: { credits: Credit[] }) {
  if (!credits.length) return null
  return (
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
        {credits.map((credit, i) => (
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

/** Renders a video grid */
function VideoGrid({ videos }: { videos: BunnyVideo[] }) {
  if (!videos.length) return null

  const isPortrait = videos.some(
    (v) => v.aspectRatio === "9/16" || v.aspectRatio === "4/5"
  )
  const isNarrow = videos.some(
    (v) => v.aspectRatio === "4/3" || v.aspectRatio === "1/1"
  )

  return (
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
        maxWidth:
          videos.length === 1 && isPortrait
            ? 360
            : videos.length === 1 && isNarrow
            ? 640
            : undefined,
        margin:
          videos.length === 1 && (isPortrait || isNarrow)
            ? "0 auto"
            : undefined,
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
    </>
  )
}

/** Renders a single section within a multi-section project */
function SectionBlock({ section, index }: { section: VideoSection; index: number }) {
  return (
    <div
      style={{
        marginTop: index === 0 ? 0 : 32,
        paddingTop: index === 0 ? 0 : 24,
        borderTop: index === 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h4
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: "#fff",
            margin: "0 0 6px",
          }}
        >
          {section.title}
        </h4>
        {section.description && (
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
        )}
        {section.role && (
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
        )}
        {section.credits && section.credits.length > 0 && (
          <CreditsBlock credits={section.credits} />
        )}
      </div>

      {section.videos.length > 0 ? (
        <VideoGrid videos={section.videos} />
      ) : (
        <div
          style={{
            padding: "32px 16px",
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

/**
 * Full expanded view that replaces the card in-place.
 * Shows metadata + video grid for projects, single video for singles.
 * Supports sections for multi-campaign projects and optional image galleries.
 */
export function ExpandedProject({ item, onClose }: ExpandedProjectProps) {
  const hasSections =
    item.type === "project" && item.sections && item.sections.length > 0
  const flatVideos =
    item.type === "project" ? item.videos : [item.video]

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

        {credits && credits.length > 0 && (
          <CreditsBlock credits={credits} />
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

      {/* Sections mode (multi-campaign projects like Prize Picks) */}
      {hasSections ? (
        <div>
          {item.type === "project" &&
            item.sections!.map((section, si) => (
              <SectionBlock key={si} section={section} index={si} />
            ))}
        </div>
      ) : (
        <>
          {/* Flat video grid */}
          <VideoGrid videos={flatVideos} />

          {/* Image galleries */}
          {galleries && galleries.length > 0 && (
            <GalleryBlock galleries={galleries} />
          )}
        </>
      )}
    </motion.div>
  )
}
