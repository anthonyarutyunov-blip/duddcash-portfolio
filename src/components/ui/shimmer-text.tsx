import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  delay?: number;
}

export function ShimmerText({
  children,
  className,
  style: customStyle,
  duration = 2,
  delay = 1,
}: ShimmerTextProps) {
  return (
    <div className="overflow-hidden">
      <motion.div
        className={cn("inline-block", className)}
        style={{
          ...customStyle,
          WebkitTextFillColor: "transparent",
          background:
            "currentColor linear-gradient(to right, currentColor 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.6) 60%, currentColor 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          backgroundRepeat: "no-repeat",
          backgroundSize: "50% 200%",
        } as React.CSSProperties}
        initial={{
          backgroundPositionX: "250%",
        }}
        animate={{
          backgroundPositionX: ["-100%", "250%"],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: "linear",
        }}
      >
        <span>{children}</span>
      </motion.div>
    </div>
  );
}

export default ShimmerText;
