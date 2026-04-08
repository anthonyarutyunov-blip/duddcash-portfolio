import React, { useEffect, useRef, useState, type ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  /** Disable spotlight glow effect (e.g. when card is expanded) */
  disabled?: boolean;
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  disabled = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (disabled) return;

    const syncPointer = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - rect.left).toFixed(2));
      card.style.setProperty('--y', (e.clientY - rect.top).toFixed(2));
    };

    card.addEventListener('pointermove', syncPointer);
    return () => card.removeEventListener('pointermove', syncPointer);
  }, [disabled]);

  const { base, spread } = glowColorMap[glowColor];

  return (
    <div
      ref={cardRef}
      className={className}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'border-color 0.3s ease',
        borderColor: isHovered ? `hsl(${base} 60% 60% / 0.3)` : 'rgba(0,0,0,0.08)',
      }}
    >
      {/* Spotlight gradient — only visible on hover */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(
            300px 300px at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
            hsl(${base} 80% 65% / 0.06),
            transparent 70%
          )`,
          opacity: isHovered && !disabled ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {children}
    </div>
  );
};

export { SpotlightCard };
