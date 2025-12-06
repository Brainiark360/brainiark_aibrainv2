// /src/components/ui/SectionHeader.tsx
"use client"

import type { ReactNode } from "react"

interface SectionHeaderProps {
  title: string
  description?: ReactNode
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          {description}
        </p>
      )}
    </div>
  )
}
