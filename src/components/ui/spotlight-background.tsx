import React, { useEffect, useRef } from "react";

const SpotlightBackground = () => {
  const spotRef = useRef<HTMLDivElement>(null);
  const moveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = spotRef.current;
      if (!el) return;
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.width = el.style.height = "180px";

      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      moveTimeout.current = setTimeout(() => {
        if (spotRef.current) {
          spotRef.current.style.width = spotRef.current.style.height = "220px";
        }
      }, 150);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[2]">
      <div
        ref={spotRef}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: -999,
          top: -999,
          width: "220px",
          height: "220px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(210, 185, 155, 0.08) 0%, transparent 70%)",
          transition: "width 0.4s ease, height 0.4s ease",
          mixBlendMode: "soft-light" as const,
          willChange: "left, top",
        }}
      />
    </div>
  );
};

export default SpotlightBackground;
