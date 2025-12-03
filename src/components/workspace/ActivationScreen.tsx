// /src/components/workspace/ActivationScreen.tsx
"use client"

import { motion } from 'framer-motion'
import { CheckCircle, Brain, Zap, ArrowRight, RefreshCw, Plus } from 'lucide-react'
import type { WorkspaceDraft, WorkspaceSetupMode } from '@/types/workspace'

interface ActivationScreenProps {
  draft: WorkspaceDraft
  onEnterWorkspace: () => void
  onRefine: () => void
  onSetupAnother: () => void
  mode: WorkspaceSetupMode
}

export default function ActivationScreen({
  draft,
  onEnterWorkspace,
  onRefine,
  onSetupAnother,
  mode
}: ActivationScreenProps) {
  const getModeLabel = () => {
    switch (mode) {
      case "first-time": return "First Workspace"
      case "new-client": return "Client Workspace"
      case "new-workspace": return "New Workspace"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 text-center"
    >
      {/* Success Animation */}
      <div className="relative">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))/0.1] to-transparent border border-[rgb(var(--os-accent))/0.2] mb-6"
        >
          <CheckCircle className="h-12 w-12 text-green-500" />
        </motion.div>
        
        {/* Pulsing Rings */}
        <motion.div
          animate={{ 
            scale: [1, 1.5, 2],
            opacity: [0.3, 0.1, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity
          }}
          className="absolute inset-0 border border-green-500/20 rounded-full"
        />
      </div>

      {/* Title */}
      <div>
        <h3 className="text-2xl font-semibold mb-3">Workspace Ready</h3>
        <p className="text-[rgb(var(--muted-foreground))]">
          Your Brand Brain, Strategy Model, and Content System have been created.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div className="p-4 border border-[rgb(var(--border))] rounded-lg">
          <div className="h-10 w-10 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] flex items-center justify-center mb-3 mx-auto">
            <Brain className="h-5 w-5 text-[rgb(var(--os-accent))]" />
          </div>
          <p className="font-medium">{draft.brandName?.value || "New Brand"}</p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Brand Name</p>
        </div>
        
        <div className="p-4 border border-[rgb(var(--border))] rounded-lg">
          <div className="h-10 w-10 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] flex items-center justify-center mb-3 mx-auto">
            <Zap className="h-5 w-5 text-[rgb(var(--os-accent))]" />
          </div>
          <p className="font-medium">
            {draft.contentPillars?.value.slice(0, 3).join(", ") || "Strategic Pillars"}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Content Pillars</p>
        </div>
        
        <div className="p-4 border border-[rgb(var(--border))] rounded-lg">
          <div className="h-10 w-10 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] flex items-center justify-center mb-3 mx-auto">
            <CheckCircle className="h-5 w-5 text-[rgb(var(--os-accent))]" />
          </div>
          <p className="font-medium">{getModeLabel()}</p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Workspace Type</p>
        </div>
      </div>

      {/* Channels Preview */}
      {draft.channels && draft.channels.value.length > 0 && (
        <div className="max-w-md mx-auto">
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">Active Channels</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {draft.channels.value.slice(0, 5).map((channel, index) => (
              <span
                key={index}
                className="px-3 py-1.5 border border-[rgb(var(--border))] rounded text-sm"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
        <button
          onClick={onEnterWorkspace}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[rgb(var(--foreground))] text-[rgb(var(--background))] rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Enter Workspace
          <ArrowRight className="h-4 w-4" />
        </button>
        
        <button
          onClick={onRefine}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--accent))] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refine Brand Brain
        </button>
        
        {mode === "new-client" && (
          <button
            onClick={onSetupAnother}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--accent))] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Set Another Workspace
          </button>
        )}
      </div>

      {/* Next Steps Hint */}
      <div className="pt-6 border-t border-[rgb(var(--border))]">
        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          Your workspace includes: Strategy Canvas, Content Calendar, AI Assistant, and Performance Analytics
        </p>
      </div>
    </motion.div>
  )
}