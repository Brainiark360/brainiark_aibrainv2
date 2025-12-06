// /src/app/components/auth/AuthSectionHeader.tsx
"use client"

import type { ReactNode } from "react"

interface AuthSectionHeaderProps {
  title: string
  description?: ReactNode
}

export default function AuthSectionHeader({ title, description }: AuthSectionHeaderProps) {
  return (
    <div className="space-y-1">
      <h3 className="h3-os opacity-80 text-sm">{title}</h3>
      {description && (
        <p className="body-os text-xs text-[rgb(var(--muted-foreground))]">
          {description}
        </p>
      )}
    </div>
  )
}
