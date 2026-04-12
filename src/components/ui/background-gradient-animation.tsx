import { cn } from "../../lib/utils";
import { useEffect, useRef, useState } from "react";

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const curRef = useRef({ x: 0, y: 0 });
  const tgRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    document.body.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    document.body.style.setProperty("--gradient-background-end", gradientBackgroundEnd);
    document.body.style.setProperty("--first-color", firstColor);
    document.body.style.setProperty("--second-color", secondColor);
    document.body.style.setProperty("--third-color", thirdColor);
    document.body.style.setProperty("--fourth-color", fourthColor);
    document.body.style.setProperty("--fifth-color", fifthColor);
    document.body.style.setProperty("--pointer-color", pointerColor);
    document.body.style.setProperty("--size", size);
    document.body.style.setProperty("--blending-value", blendingValue);
  }, []);

  // Detect Safari and mobile synchronously first — used to gate effects below
  const [isSafari] = useState(() =>
    typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  );
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && (window.innerWidth <= 768 || "ontouchstart" in window)
  );
  const isLite = isSafari || isMobile;

  // Animation loop using refs — stops when pointer converges (idle)
  useEffect(() => {
    if (!interactive || isMobile) return;

    function animate() {
      const cur = curRef.current;
      const tg = tgRef.current;
      const dx = tg.x - cur.x;
      const dy = tg.y - cur.y;
      cur.x += dx / 20;
      cur.y += dy / 20;

      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate(${Math.round(cur.x)}px, ${Math.round(cur.y)}px)`;
      }

      // Stop RAF when position converges (mouse idle)
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        rafRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [interactive, isMobile]);

  // Global mouse listener — restarts RAF when mouse moves
  useEffect(() => {
    if (!interactive || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (interactiveRef.current) {
        const rect = interactiveRef.current.getBoundingClientRect();
        tgRef.current.x = e.clientX - rect.left;
        tgRef.current.y = e.clientY - rect.top;
      }
      // Restart RAF loop if it was idle
      if (rafRef.current === 0) {
        function animate() {
          const cur = curRef.current;
          const tg = tgRef.current;
          const dx = tg.x - cur.x;
          const dy = tg.y - cur.y;
          cur.x += dx / 20;
          cur.y += dy / 20;
          if (interactiveRef.current) {
            interactiveRef.current.style.transform = `translate(${Math.round(cur.x)}px, ${Math.round(cur.y)}px)`;
          }
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            rafRef.current = 0;
            return;
          }
          rafRef.current = requestAnimationFrame(animate);
        }
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive, isMobile]);

  // Mobile: static gradient only — no animated blobs, no blur, no compositing layers
  if (isMobile) {
    return (
      <div
        className={cn(
          "h-screen w-screen relative overflow-hidden top-0 left-0 bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
          containerClassName
        )}
      >
        <div className={cn("", className)}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-screen w-screen relative overflow-hidden top-0 left-0 bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
    >
      <div className={cn("", className)}>{children}</div>
      <div
        className={cn(
          "gradients-container h-full w-full",
          isSafari ? "blur-sm" : "blur-[30px]"
        )}
      >
        {/* Blob 1 — always rendered */}
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_var(--first-color)_0,_var(--first-color)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:center_center]`,
            `animate-first`,
            `opacity-100`
          )}
        />
        {/* Blob 2 — skip on Safari to reduce compositing layers */}
        {!isSafari && (
          <div
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
              `[transform-origin:calc(50%-400px)]`,
              `animate-second`,
              `opacity-100`
            )}
          />
        )}
        {/* Blob 3 — skip on mobile/Safari */}
        {!isLite && (
          <div
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
              `[transform-origin:calc(50%+400px)]`,
              `animate-third`,
              `opacity-100`
            )}
          />
        )}
        {/* Blob 4 — desktop Chrome/Firefox only */}
        {!isLite && (
          <div
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
              `[transform-origin:calc(50%-200px)]`,
              `animate-fourth`,
              `opacity-70`
            )}
          />
        )}
        {/* Blob 5 — desktop Chrome/Firefox only */}
        {!isLite && (
          <div
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
              `[transform-origin:calc(50%-800px)_calc(50%+800px)]`,
              `animate-fifth`,
              `opacity-100`
            )}
          />
        )}

        {/* Interactive pointer blob — desktop Chrome/Firefox only */}
        {interactive && !isLite && (
          <div
            ref={interactiveRef}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2`,
              `opacity-70`
            )}
          />
        )}
      </div>
    </div>
  );
};
