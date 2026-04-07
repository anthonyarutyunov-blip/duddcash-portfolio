import { useEffect, useRef, useState } from "react"

interface SpecialTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

const RANDOM_CHARS = "_!X$0-+*#"

function getRandomChar(prevChar?: string): string {
  let char: string
  do {
    char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)]
  } while (char === prevChar)
  return char
}

export function SpecialText({ text, speed = 20, delay = 0, className = "" }: SpecialTextProps) {
  const [displayText, setDisplayText] = useState<string>("\u00A0".repeat(text.length))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepRef = useRef(0)
  const phaseRef = useRef<"phase1" | "phase2">("phase1")

  useEffect(() => {
    const startAnim = () => {
      stepRef.current = 0
      phaseRef.current = "phase1"
      setDisplayText("\u00A0".repeat(text.length))

      if (intervalRef.current) clearInterval(intervalRef.current)

      intervalRef.current = setInterval(() => {
        const step = stepRef.current
        const phase = phaseRef.current

        if (phase === "phase1") {
          const maxSteps = text.length * 2
          const currentLength = Math.min(step + 1, text.length)
          const chars: string[] = []
          for (let i = 0; i < currentLength; i++) {
            chars.push(getRandomChar(i > 0 ? chars[i - 1] : undefined))
          }
          for (let i = currentLength; i < text.length; i++) {
            chars.push("\u00A0")
          }
          setDisplayText(chars.join(""))
          if (step < maxSteps - 1) {
            stepRef.current = step + 1
          } else {
            phaseRef.current = "phase2"
            stepRef.current = 0
          }
        } else {
          const revealedCount = Math.floor(step / 2)
          const chars: string[] = []
          for (let i = 0; i < revealedCount && i < text.length; i++) {
            chars.push(text[i])
          }
          if (revealedCount < text.length) {
            chars.push(step % 2 === 0 ? "_" : getRandomChar())
          }
          for (let i = chars.length; i < text.length; i++) {
            chars.push(getRandomChar())
          }
          setDisplayText(chars.join(""))
          if (step < text.length * 2 - 1) {
            stepRef.current = step + 1
          } else {
            setDisplayText(text)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
          }
        }
      }, speed)
    }

    let timer: ReturnType<typeof setTimeout> | null = null
    if (delay > 0) {
      timer = setTimeout(startAnim, delay * 1000)
    } else {
      startAnim()
    }

    return () => {
      if (timer) clearTimeout(timer)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [text, speed, delay])

  return (
    <span className={className} style={{ whiteSpace: "pre" }}>
      {displayText}
    </span>
  )
}
