import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const liquidbuttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium disabled:pointer-events-none disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-105 duration-300 transition text-primary",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 text-xs px-5",
        lg: "h-12 px-20 text-sm tracking-wide",
        xl: "h-12 px-12",
        xxl: "h-14 px-14",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
)

function GlassFilter({ id }: { id: string }) {
  return (
    <svg className="hidden" aria-hidden="true">
      <defs>
        <filter
          id={id}
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

const glassShadow =
  "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15),0_0_28px_rgba(200,180,140,0.20),0_0_56px_rgba(200,180,140,0.10)]"

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof liquidbuttonVariants> & {
    asChild?: boolean
  }) {
  const rawId = React.useId()
  const filterId = `lgf-${rawId.replace(/:/g, "")}`
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn("relative", liquidbuttonVariants({ variant, size, className }))}
      {...props}
    >
      <div className={cn("absolute top-0 left-0 z-0 h-full w-full rounded-full transition-all", glassShadow)} />
      <div
        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full"
        style={{ backdropFilter: `url("#${filterId}")` }}
      />
      <div className="pointer-events-none z-10">{children}</div>
      <GlassFilter id={filterId} />
    </Comp>
  )
}

function LiquidLink({
  href,
  children,
  className,
  size,
}: {
  href: string
  children: React.ReactNode
  className?: string
  size?: VariantProps<typeof liquidbuttonVariants>["size"]
}) {
  const rawId = React.useId()
  const filterId = `lgf-${rawId.replace(/:/g, "")}`

  return (
    <a
      href={href}
      className={cn("relative", liquidbuttonVariants({ size, className }))}
      style={{ fontFamily: "var(--font-display)", letterSpacing: "0.03em", paddingLeft: "1.75rem", paddingRight: "1.75rem" }}
    >
      <div className={cn("absolute top-0 left-0 z-0 h-full w-full rounded-full transition-all", glassShadow)} />
      <div
        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full"
        style={{ backdropFilter: `url("#${filterId}")` }}
      />
      <div className="pointer-events-none z-10">{children}</div>
      <GlassFilter id={filterId} />
    </a>
  )
}

export { LiquidButton, LiquidLink, liquidbuttonVariants }
