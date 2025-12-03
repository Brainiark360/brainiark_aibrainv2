// /src/components/onboarding/OnboardingGreeting.tsx
"use client"

import { motion } from "framer-motion"
import type { OnboardingMode, OnboardingConfig } from "@/types/onboarding"
import { fadeUp, scaleIn } from "@/lib/motion-variants"

interface OnboardingGreetingProps {
  config?: OnboardingConfig // Changed from 'mode' to 'config'
  greeting?: string // Added optional greeting prop
  onNext: () => void
  onSkip?: () => void
}

// Default config to prevent undefined errors
const DEFAULT_CONFIG: OnboardingConfig = {
  mode: "first-time",
  userName: undefined
}

// Updated function to accept config
function getGreetingCopy(config: OnboardingConfig) {
  const { mode, userName } = config
  
  switch (mode) {
    case "first-time":
      return {
        title: `Hi ${userName ? userName + ',' : 'there,'} I’m your Brand Brain.`,
        body: "Brainiark is a strategy-first content marketing OS. Before I build your Brand Brain and content system, I need to understand what already exists.",
        primary: "Begin Setup",
        secondary: "Skip for now",
      }
    case "new-client":
      return {
        title: `Let’s set up ${userName || 'this client'}'s Brand Brain.`,
        body: "I’ll map their existing materials into a living brand model — so strategy, content, and signals stay aligned.",
        primary: "Set Up Client Workspace",
        secondary: "Skip for now",
      }
    case "new-workspace":
      return {
        title: "New workspace. Same Brand Brain.",
        body: "We'll reuse what we know, and extend it to this new workspace configuration.",
        primary: "Configure Workspace",
        secondary: "Skip for now",
      }
    default:
      // Fallback for any unexpected mode
      return {
        title: "Hi, I'm your Brand Brain.",
        body: "Brainiark is a strategy-first content marketing OS. Let's get started.",
        primary: "Begin Setup",
        secondary: "Skip for now",
      }
  }
}

export default function OnboardingGreeting({ 
  config, 
  greeting, 
  onNext, 
  onSkip 
}: OnboardingGreetingProps) {
  // Use provided config or default config to prevent undefined errors
  const safeConfig = config || DEFAULT_CONFIG
  
  // Use provided greeting or generate from config
  const copy = greeting 
    ? { 
        title: greeting, 
        body: "", 
        primary: "Continue", 
        secondary: "Skip" 
      }
    : getGreetingCopy(safeConfig)

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-gradient-to-br from-[rgb(var(--background))] to-[rgb(var(--os-surface)/0.1)]">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="show"
        className="os-window max-w-xl w-full mx-4"
      >
        <div className="os-window-content space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h1 className="text-3xl font-bold mb-4 text-[rgb(var(--foreground))]">
              {copy.title}
            </h1>
            {copy.body && (
              <p className="text-lg text-[rgb(var(--muted-foreground))] leading-relaxed">
                {copy.body}
              </p>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3 pt-6"
          >
            <button
              onClick={onNext}
              className="
                w-full sm:w-auto px-8 py-3 rounded-xl
                bg-[rgb(var(--os-accent))]
                text-white
                text-sm font-medium
                hover:bg-[rgb(var(--os-accent)/0.9)]
                transition-colors
                shadow-lg shadow-[rgb(var(--os-accent)/0.2)]
              "
            >
              {copy.primary}
            </button>

            {onSkip && (
              <button
                onClick={onSkip}
                type="button"
                className="
                  w-full sm:w-auto px-8 py-3 rounded-xl
                  border border-[rgb(var(--border)/0.4)]
                  text-sm font-medium
                  text-[rgb(var(--muted-foreground))]
                  hover:bg-[rgb(var(--os-surface)/0.5)]
                  hover:text-[rgb(var(--foreground))]
                  transition-colors
                "
              >
                {copy.secondary}
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}