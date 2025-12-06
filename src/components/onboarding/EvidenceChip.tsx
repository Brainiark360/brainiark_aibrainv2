// /src/components/onboarding/EvidenceChip.tsx
"use client"

import { X } from "lucide-react"

interface EvidenceChipProps {
  label: string
  onRemove: () => void
}

export function EvidenceChip({ label, onRemove }: EvidenceChipProps) {
  return (
    <div className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 text-blue-600 hover:text-blue-800"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
