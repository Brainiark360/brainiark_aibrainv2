"use client"

import { motion } from "framer-motion"
import { ArrowRight, Cpu, Sparkles } from "lucide-react"
import { SignUpButton } from "./AuthButtons"

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-32 sm:pt-12">
      {/* Background Grid */}
      <div className="absolute inset-0 canvas-grid-subtle opacity-[0.35]" />

      {/* Subtle Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[rgb(var(--os-accent))/0.04] blur-3xl rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 text-center">
        {/* OS Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="
            inline-flex items-center gap-2
            rounded-full
            border border-[rgb(var(--os-border))]
            bg-[rgb(var(--os-surface))/0.55]
            px-4 py-2 mb-10
            backdrop-blur-md 
          "
        >
          <Cpu className="h-4 w-4 text-[rgb(var(--os-accent))]" />
          <span className="text-sm font-medium tracking-tight">
            Brainiark OS — Content Intelligence Platform v2.1
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="h1-os mb-6 leading-[1.15] tracking-tight"
        >
          Strategy-first content,
          <br />
          orchestrated by
          <span className="text-[rgb(var(--os-accent))]"> intelligence</span>
          <span className="relative inline-block">
            .
            <Sparkles className="absolute -top-6 -right-6 h-6 w-6 text-[rgb(var(--os-accent))/0.5]" />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="body-os max-w-2xl mx-auto mb-12 text-[rgb(var(--muted-foreground))]"
        >
          Brainiark is the Marketing Operating System where content strategy forms on
          canvas, AI intelligently creates across platforms, and execution flows from
          strategic clarity. A unified workspace for content marketing, creation, and
          management.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <SignUpButton size="lg" />

          <a
            href="#product"
            className="
              inline-flex items-center justify-center
              rounded-md border border-[rgb(var(--border))]
              px-8 py-3 text-sm font-medium tracking-tight
              hover:bg-[rgb(var(--accent))]
              transition-colors
            "
          >
            Enter Content Workspace
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </motion.div>

        {/* Preview Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.975 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="mt-24 relative"
        >
          <div className="os-window max-w-5xl mx-auto">
            {/* Window Header */}
            <div className="os-window-header py-3">
              <div className="flex items-center gap-2">
                <div className="os-controls">
                  <div className="os-control os-control-close" />
                  <div className="os-control os-control-minimize" />
                  <div className="os-control os-control-maximize" />
                </div>
                <span className="text-sm text-[rgb(var(--muted-foreground))] tracking-tight">
                  Content Strategy Canvas — Q3 Editorial Framework
                </span>
              </div>

              <span className="text-xs text-[rgb(var(--muted-foreground))]">
                Content Intelligence: 94% • Connected to Brand Voice
              </span>
            </div>

            {/* Window Content */}
            <div className="os-window-content h-[420px] canvas-grid relative overflow-hidden">
              {/* Canvas Nodes */}
              <div className="relative h-full">
                {[
                  { top: "20%", left: "20%", delay: 0, title: "Content Pillar", subtitle: "Thought Leadership" },
                  { top: "42%", left: "62%", delay: 0.15, title: "Audience Signal", subtitle: "Engagement Patterns" },
                  { top: "68%", left: "30%", delay: 0.3, title: "Creation Node", subtitle: "Multi-Platform Assets" },
                  { top: "32%", left: "82%", delay: 0.45, title: "Distribution Layer", subtitle: "Channel Orchestration" },
                ].map((node, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.4 + node.delay,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute canvas-node-base w-48 shadow-sm"
                    style={{ top: node.top, left: node.left }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-medium text-[rgb(var(--os-accent))] mb-1 tracking-tight">
                          {node.title}
                        </div>
                        <div className="text-xs text-[rgb(var(--muted-foreground))] tracking-tight">
                          {node.subtitle}
                        </div>
                      </div>
                      <div className="h-6 w-6 rounded-full bg-[rgb(var(--os-accent))/0.1] border border-[rgb(var(--os-accent))/0.25] flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-[rgb(var(--os-accent))]" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="h-1.5 w-full bg-[rgb(var(--muted))] rounded-full" />
                      <div className="h-1.5 w-3/4 bg-[rgb(var(--muted))] rounded-full" />
                    </div>
                  </motion.div>
                ))}

                {/* Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, delay: 1.1, ease: "linear" }}
                    d="M20% 20% L62% 42%"
                    stroke="rgb(var(--os-accent))"
                    strokeWidth="1"
                    strokeDasharray="4"
                    fill="none"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, delay: 1.2, ease: "linear" }}
                    d="M62% 42% L30% 68%"
                    stroke="rgb(var(--os-accent))"
                    strokeWidth="1"
                    strokeDasharray="4"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
