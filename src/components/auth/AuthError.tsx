"use client"

import { AlertTriangle } from "lucide-react"

export default function AuthError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm animate-fadeIn">
      <AlertTriangle className="h-4 w-4 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}
