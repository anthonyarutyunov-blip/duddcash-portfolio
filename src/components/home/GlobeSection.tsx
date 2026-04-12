import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

interface CityMarker {
  name: string
  location: [number, number]
  size: number
}

const cities: CityMarker[] = [
  // Home bases
  { name: "Chicago", location: [41.88, -87.63], size: 0.12 },
  { name: "Cleveland", location: [41.50, -81.69], size: 0.10 },
  // US
  { name: "New York", location: [40.71, -74.01], size: 0.08 },
  { name: "Miami", location: [25.76, -80.19], size: 0.07 },
  { name: "Los Angeles", location: [34.05, -118.24], size: 0.07 },
  { name: "Las Vegas", location: [36.17, -115.14], size: 0.07 },
  { name: "Nashville", location: [36.16, -86.78], size: 0.06 },
  { name: "Atlanta", location: [33.75, -84.39], size: 0.06 },
  { name: "Detroit", location: [42.33, -83.05], size: 0.06 },
  { name: "Orlando", location: [28.54, -81.38], size: 0.06 },
  { name: "Austin", location: [30.27, -97.74], size: 0.06 },
  { name: "Columbus", location: [39.96, -82.99], size: 0.06 },
  { name: "Asheville", location: [35.60, -82.55], size: 0.05 },
  { name: "Norfolk", location: [36.85, -76.29], size: 0.05 },
  { name: "San Francisco", location: [37.77, -122.42], size: 0.06 },
  { name: "Seattle", location: [47.61, -122.33], size: 0.06 },
  // Canada
  { name: "Winnipeg", location: [49.90, -97.14], size: 0.05 },
  // Europe
  { name: "Rome", location: [41.90, 12.50], size: 0.06 },
  { name: "Venice", location: [45.44, 12.32], size: 0.05 },
  { name: "Monaco", location: [43.73, 7.42], size: 0.05 },
  { name: "St. Tropez", location: [43.27, 6.64], size: 0.05 },
  { name: "Barcelona", location: [41.39, 2.17], size: 0.06 },
  { name: "Ibiza", location: [38.91, 1.43], size: 0.05 },
  // Middle East
  { name: "Dubai", location: [25.20, 55.27], size: 0.07 },
  { name: "Abu Dhabi", location: [24.45, 54.65], size: 0.06 },
  { name: "Riyadh", location: [24.71, 46.68], size: 0.06 },
]

// Convert lat/lng to 3D point on sphere
function latLngToXYZ(lat: number, lng: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return [
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ]
}

// Check if point is visible (facing camera) given current globe rotation
function isVisible(lat: number, lng: number, globePhi: number, globeTheta: number): number {
  const [x, y, z] = latLngToXYZ(lat, lng)
  const cosPhi = Math.cos(-globePhi)
  const sinPhi = Math.sin(-globePhi)
  const cosTheta = Math.cos(-globeTheta)
  const sinTheta = Math.sin(-globeTheta)
  const rx = x * cosPhi + z * sinPhi
  const ry = y * cosTheta - (-x * sinPhi + z * cosPhi) * sinTheta
  const rz = y * sinTheta + (-x * sinPhi + z * cosPhi) * cosTheta
  return rz
}

export default function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const currentPhiRef = useRef(0)
  const sectionVisibleRef = useRef(true)
  const animateFnRef = useRef<(() => void) | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visibleCities, setVisibleCities] = useState<string[]>([])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  // Pause globe when off-screen
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = sectionVisibleRef.current
        sectionVisibleRef.current = entry.isIntersecting
        // Restart RAF loop when coming back into view
        if (!wasVisible && entry.isIntersecting && animateFnRef.current) {
          requestAnimationFrame(animateFnRef.current)
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Update visible city labels periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!sectionVisibleRef.current) return
      const phi = currentPhiRef.current
      const theta = 0.25 + thetaOffsetRef.current + dragOffset.current.theta
      const visible = cities
        .filter((c) => isVisible(c.location[0], c.location[1], phi, theta) > 0.15)
        .map((c) => c.name)
      setVisibleCities(visible)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    // Safari & mobile get fewer samples for better performance
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isMobileDevice = window.innerWidth <= 768
    const samples = isSafari || isMobileDevice ? 12000 : 20000
    const dpr = isSafari ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2)

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 3,
        mapSamples: samples,
        mapBrightness: 3.5,
        baseColor: [0.18, 0.18, 0.22],
        markerColor: [0.5, 0.7, 1.0],
        glowColor: [0.04, 0.04, 0.08],
        markerElevation: 0,
        markers: cities.map((c) => ({ location: c.location, size: c.size * 0.5 })),
        scale: 1.05,
        offset: [0, 0],
        opacity: 0.85,
      })

      function animate() {
        if (!sectionVisibleRef.current) return
        if (!isPausedRef.current) phi += 0.002
        const currentPhi = phi + phiOffsetRef.current + dragOffset.current.phi
        currentPhiRef.current = currentPhi
        globe!.update({
          phi: currentPhi,
          theta: 0.25 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animateFnRef.current = animate
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [])

  return (
    <section ref={sectionRef} className="globe-section">
      <div className="globe-section__inner">
        <div className="globe-section__header">
          <p className="globe-section__eyebrow">Global Reach</p>
          <h2 className="globe-section__title">
            Based in Chicago.<br />Working everywhere.
          </h2>
        </div>

        <div className="globe-section__canvas-wrap">
          <div className="globe-section__ring" />
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            style={{
              width: "100%",
              height: "100%",
              cursor: "grab",
              opacity: 0,
              transition: "opacity 1.2s ease",
              touchAction: "none",
            }}
          />

          {/* Floating city labels */}
          <div className="globe-section__labels">
            {cities.map((city) => (
              <span
                key={city.name}
                className="globe-section__label"
                style={{
                  color: visibleCities.includes(city.name)
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(255,255,255,0)",
                }}
              >
                {city.name}
              </span>
            ))}
          </div>
        </div>

        {/* City count stat */}
        <div className="globe-section__stats">
          <div className="globe-section__stat">
            <span className="globe-section__stat-number">{cities.length}+</span>
            <span className="globe-section__stat-label">Cities & Counting</span>
          </div>
        </div>
      </div>

      <style>{`
        .globe-section {
          background: #0b0b0b;
          padding: var(--space-3xl) 3.9vw;
          overflow: hidden;
          margin-top: -1px;
        }

        .globe-section__inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xl);
        }

        .globe-section__header {
          text-align: center;
        }

        .globe-section__eyebrow {
          font-size: var(--text-sm);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.35);
          margin-bottom: var(--space-md);
        }

        .globe-section__title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 3.5vw + 0.5rem, 3.5rem);
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: #fff;
        }

        .globe-section__canvas-wrap {
          width: 100%;
          max-width: 520px;
          aspect-ratio: 1;
          position: relative;
        }

        .globe-section__ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
          pointer-events: none;
        }

        .globe-section__labels {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          flex-wrap: wrap;
          align-content: center;
          justify-content: center;
          gap: 5px 10px;
          padding: 25%;
        }

        .globe-section__label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: color 0.6s ease;
          white-space: nowrap;
        }

        .globe-section__stats {
          display: flex;
          gap: var(--space-xl);
        }

        .globe-section__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .globe-section__stat-number {
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 2.5vw, 2.5rem);
          font-weight: 500;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .globe-section__stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.4);
        }

        @media (max-width: 768px) {
          .globe-section {
            padding: 2rem 3.9vw;
          }

          .globe-section__inner {
            gap: 1.25rem;
          }

          .globe-section__eyebrow {
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </section>
  )
}
