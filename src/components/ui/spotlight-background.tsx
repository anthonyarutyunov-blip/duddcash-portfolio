import React, { useState, useEffect, useRef } from "react";

const SpotlightBackground = () => {
  const [mouse, setMouse] = useState({ x: -999, y: -999 });
  const [isMoving, setIsMoving] = useState(false);
  const moveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
      setIsMoving(true);

      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      moveTimeout.current = setTimeout(() => {
        setIsMoving(false);
      }, 150);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[2]">
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: mouse.x,
          top: mouse.y,
          width: isMoving ? "180px" : "220px",
          height: isMoving ? "180px" : "220px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(210, 185, 155, 0.08) 0%, transparent 70%)",
          transition: "width 0.4s ease, height 0.4s ease",
          mixBlendMode: "soft-light" as const,
        }}
      />
    </div>
  );
};

export default SpotlightBackground;
