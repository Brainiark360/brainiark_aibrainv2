"use client"

import { fadeInUp } from "@/lib/motion-variants"
import { OnboardingMode } from "@/types/onboarding"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface OnboardingCompleteProps {
  mode: OnboardingMode
  draft: BrandDraft
  isActivating: boolean
  onEnterWorkspace: () => void
  onRefineBrain: () => void
  onAddAnotherWorkspace: () => void
}

export default function OnboardingComplete({
  mode,
  draft,
  isActivating,
  onEnterWorkspace,
  onRefineBrain,
  onAddAnotherWorkspace,
}: OnboardingCompleteProps) {
  const showAddAnother = mode === "new-client" || mode === "new-workspace"

  return (
    <div className="w-full py-16">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto text-center space-y-8"
      >
        <motion.div variants={fadeInUp} className="relative inline-block">
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="h-24 w-24 rounded-full bg-[rgb(var(--os-accent))/0.1] border border-[rgb(var(--os-accent))/0.4] flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </motion.div>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <h2 className="h2-os mb-2">Workspace Ready</h2>
          <p className="body-os text-[rgb(var(--muted-foreground))]">
            Your Brand Brain, Strategy Model, and Content System have been created.
          </p>
        </motion.div>

        {/* Summary chips */}
        <motion.div
          variants={fadeInUp}
          className="grid gap-4 md:grid-cols-3 text-left"
        >
          {/* Pillars, Audience, Channels summary cards */}
          {/* ...pull from draft.contentPillars/audience/channels */}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
        >
          <button
            type="button"
            onClick={onEnterWorkspace}
            disabled={isActivating}
            className="
              px-8 py-3 rounded-md
              bg-[rgb(var(--foreground))]
              text-[rgb(var(--background))]
              text-sm font-medium
              disabled:opacity-50
            "
          >
            Enter Workspace
          </button>
          <button
            type="button"
            onClick={onRefineBrain}
            className="
              px-6 py-3 rounded-md border border-[rgb(var(--border))]
              text-sm font-medium hover:bg-[rgb(var(--accent))]
            "
          >
            Refine Brand Brain
          </button>
          {showAddAnother && (
            <button
              type="button"
              onClick={onAddAnotherWorkspace}
              className="
                px-6 py-3 rounded-md border border-[rgb(var(--border))]
                text-sm font-medium hover:bg-[rgb(var(--accent))]
              "
            >
              Add Another Workspace
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
