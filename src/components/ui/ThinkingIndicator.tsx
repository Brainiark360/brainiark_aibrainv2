// /src/components/ui/ThinkingIndicator.tsx
"use client"

interface ThinkingIndicatorProps {
  label?: string
}

export function ThinkingIndicator({ label = "Thinking…" }: ThinkingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
      <span className="relative flex h-2 w-6 items-center justify-between">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500/70 animate-bounce [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500/60 animate-bounce [animation-delay:-0.05s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500/50 animate-bounce [animation-delay:0.1s]" />
      </span>
      <span>{label}</span>
    </div>
  )
}
