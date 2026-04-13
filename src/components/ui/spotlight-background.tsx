import React, { useEffect, useRef, useState } from "react";

const SpotlightBackground = () => {
  const spotRef = useRef<HTMLDivElement>(null);
  const moveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafPending = useRef(false);
  const posRef = useRef({ x: -999, y: -999 });

  const [isSafari] = useState(() =>
    typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  );

  useEffect(() => {
    // Safari: skip entirely — the 8% opacity soft-light spotlight costs a full-viewport
    // compositing pass on every mouse move for a barely-visible effect
    if (isSafari) return;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;

      // Batch position updates into RAF to avoid per-event style mutations
      if (!rafPending.current) {
        rafPending.current = true;
        requestAnimationFrame(() => {
          const el = spotRef.current;
          if (el) {
            // Use transform instead of left/top — compositor-only, skips layout
            el.style.transform = `translate(${posRef.current.x - 110}px, ${posRef.current.y - 110}px) scale(0.82)`;
          }
          rafPending.current = false;
        });
      }

      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      moveTimeout.current = setTimeout(() => {
        if (spotRef.current) {
          // Grow effect when idle — use scale instead of width/height to avoid layout
          spotRef.current.style.transform = `translate(${posRef.current.x - 110}px, ${posRef.current.y - 110}px) scale(1)`;
        }
      }, 150);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isSafari]);

  // Safari: render nothing
  if (isSafari) return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[2]">
      <div
        ref={spotRef}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: 0,
          top: 0,
          width: "220px",
          height: "220px",
          transform: "translate(-999px, -999px) scale(1)",
          background: "radial-gradient(circle, rgba(210, 185, 155, 0.08) 0%, transparent 70%)",
          transition: "transform 0.4s ease",
          mixBlendMode: "soft-light" as const,
          willChange: "transform",
        }}
      />
    </div>
  );
};

export default SpotlightBackground;
