// /src/components/onboarding/AIThinkingPanel.tsx
"use client"

import { ThinkingIndicator } from "@/components/ui/ThinkingIndicator"
import { StreamingText } from "@/components/ui/StreamingText"

interface AIThinkingPanelProps {
  active: boolean
  done: boolean
  messages: string[]
}

export function AIThinkingPanel({ active, done, messages }: AIThinkingPanelProps) {
  return (
    <div className="h-full flex flex-col p-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm overflow-y-auto">
      <h3 className="text-sm font-semibold mb-2">AI Activity</h3>
      <ThinkingIndicator label="Analyzing evidence…" />

      <div className="mt-4 space-y-2">
        <StreamingText messages={messages} active={active} done={done} />
      </div>
    </div>
  )
}
