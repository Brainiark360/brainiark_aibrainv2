// /src/components/ui/StreamingText.tsx
"use client"

import { useEffect, useState } from "react"

interface StreamingTextProps {
  messages: string[]
  active: boolean
  done: boolean
}

export function StreamingText({ messages, active, done }: StreamingTextProps) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (!active) {
      setVisibleCount(0)
      return
    }

    if (messages.length === 0) return

    setVisibleCount(1)

    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= messages.length) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1400)

    return () => clearInterval(interval)
  }, [active, messages])

  const items = done ? messages : messages.slice(0, visibleCount)

  return (
    <div className="space-y-1 text-xs text-[rgb(var(--muted-foreground))]">
      {items.map((line, idx) => (
        <p key={idx} className="leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  )
}
