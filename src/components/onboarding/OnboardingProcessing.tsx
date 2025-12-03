"use client"

import { motion } from "framer-motion"
import type { EvidenceSourceInput } from "@/types/workspace"
import type { OnboardingMode } from "@/types/onboarding"
import NeuralFusionVisualizer from "./NeuralFusionVisualizer"
import { fadeUp, staggerContainer } from "@/lib/motion-variants"

interface OnboardingProcessingProps {
  mode: OnboardingMode
  evidence: EvidenceSourceInput[]
  isAnalyzing: boolean
}

export default function OnboardingProcessing({
  evidence,
  isAnalyzing,
}: OnboardingProcessingProps) {

  const progress = isAnalyzing ? 0.4 : 1 // replace with real progress state if available

  return (
    <div className="w-full py-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] max-w-6xl mx-auto"
      >
        <motion.div variants={fadeUp} className="os-window">
          <div className="os-window-header">
            <div>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Evidence Processing
              </p>
              <p className="text-sm font-medium">Sources</p>
            </div>
          </div>

          <div className="os-window-content space-y-3">
            {evidence.map((src) => (
              <div
                key={src.id}
                className="flex items-center justify-between border border-[rgb(var(--border))] rounded-lg px-3 py-2"
              >
                <div className="text-xs">
                  <p className="font-medium">{src.label}</p>
                  <p className="text-[rgb(var(--muted-foreground))] capitalize">
                    {src.type}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                  {isAnalyzing ? "Processing…" : "Queued"}
                  {isAnalyzing && (
                    <div className="h-3 w-3 border-2 border-[rgb(var(--os-accent))] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <NeuralFusionVisualizer
            evidence={evidence}
            progress={progress}
            evidenceCount={evidence.length}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
