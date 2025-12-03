"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Cpu, Brain } from "lucide-react"
import { fadeInUp } from "@/lib/motion-variants"
import AnimatedBrain from "./AnimatedBrain"
import TerminalThinkingStream from "./TerminalThinkingStream"

const BOOT_MESSAGES: string[] = [
  "Booting Brainiark OS…",
  "Initializing Neural Systems…",
  "Loading Strategy Engine…",
  "Preparing your workspace…",
]

export default function OnboardingBoot() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) =>
        prev < BOOT_MESSAGES.length - 1 ? prev + 1 : prev
      )
    }, 650)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        relative h-screen w-full 
        bg-[rgb(var(--background))]
        overflow-hidden select-none
      "
    >
      {/* Subtle OS Grid */}
      <div className="absolute inset-0 canvas-grid-subtle opacity-[0.15]" />

      {/* Center Brain Visual */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Converted from size='xl' to pixel value */}
        <AnimatedBrain size={140} />
      </div>

      {/* Terminal-Like Boot Indicator */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        className="absolute bottom-24 left-0 right-0 flex justify-center"
      >
        <div
          className="
            inline-flex items-center gap-4
            rounded-xl
            border border-[rgb(var(--os-border))]
            bg-[rgb(var(--os-surface))/0.6]
            backdrop-blur-xl
            px-6 py-4
            shadow-[0_0_60px_rgba(0,0,0,0.18)]
          "
        >
          <Cpu className="h-5 w-5 text-[rgb(var(--os-accent))]" />

          <div className="text-left">
            <TerminalThinkingStream
              text={BOOT_MESSAGES[currentMessageIndex]}
              speed={40}
              className="font-mono text-sm text-[rgb(var(--muted-foreground))]"
            />

            {/* Booting dots */}
            <div className="mt-2 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.22,
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--os-accent))]"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Brand Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.3 }}
        className="absolute top-12 left-0 right-0 flex justify-center"
      >
        <div className="inline-flex items-center gap-3">
          <div
            className="
              h-10 w-10 rounded-xl 
              bg-gradient-to-br 
              from-[rgb(var(--os-accent))] 
              to-purple-600 
              flex items-center justify-center
              shadow-lg shadow-purple-900/30
            "
          >
            <Brain className="h-6 w-6 text-white" />
          </div>

          <div className="text-left">
            <div className="text-2xl font-semibold tracking-tight">
              Brainiark
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium">
              OS
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
