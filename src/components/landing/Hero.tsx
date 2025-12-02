"use client"

import { motion } from 'framer-motion'
import { ArrowRight, Cpu, Sparkles } from 'lucide-react'
import { SignUpButton } from './AuthButtons'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 canvas-grid-subtle opacity-50" />
      
      {/* Subtle Accent Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[rgb(var(--os-accent))/0.05] blur-3xl rounded-full" />
      
      <div className="relative text-center">
        {/* OS Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--os-border))] bg-[rgb(var(--os-surface))/0.5] px-4 py-2 mb-8"
        >
          <Cpu className="h-4 w-4 text-[rgb(var(--os-accent))]" />
          <span className="text-sm font-medium">Brainiark OS — Content Intelligence Platform v2.1</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="h1-os mb-6"
        >
          Strategy-first content,
          <br />
          orchestrated by
          <span className="text-[rgb(var(--os-accent))]"> intelligence</span>
          <span className="relative">
            .
            <Sparkles className="absolute -top-6 -right-6 h-6 w-6 text-[rgb(var(--os-accent))/0.6]" />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="body-os max-w-2xl mx-auto mb-10"
        >
          Brainiark is the Marketing Operating System where content strategy forms on canvas, 
          AI intelligently creates across platforms, and execution flows from strategic clarity. 
          A unified workspace for content marketing, creation, and management.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <SignUpButton size="lg" />
          <a
            href="#product"
            className="inline-flex items-center justify-center rounded-md border border-[rgb(var(--border))] px-8 py-3 text-sm font-medium hover:bg-[rgb(var(--accent))] transition-colors"
          >
            Enter Content Workspace
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </motion.div>

        {/* Preview Image/Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 relative"
        >
          <div className="os-window max-w-5xl mx-auto">
            <div className="os-window-header">
              <div className="flex items-center gap-2">
                <div className="os-controls">
                  <div className="os-control os-control-close" />
                  <div className="os-control os-control-minimize" />
                  <div className="os-control os-control-maximize" />
                </div>
                <span className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                  Content Strategy Canvas — Q3 Editorial Framework
                </span>
              </div>
              <div className="text-xs text-[rgb(var(--muted-foreground))]">
                Content Intelligence: 94% • Connected to Brand Voice
              </div>
            </div>
            <div className="os-window-content h-[400px] canvas-grid">
              {/* Animated Nodes */}
              <div className="relative h-full">
                {[
                  { top: '20%', left: '20%', delay: 0, title: 'Content Pillar', subtitle: 'Thought Leadership' },
                  { top: '40%', left: '60%', delay: 0.2, title: 'Audience Signal', subtitle: 'Engagement Patterns' },
                  { top: '70%', left: '30%', delay: 0.4, title: 'Creation Node', subtitle: 'Multi-Platform Assets' },
                  { top: '30%', left: '80%', delay: 0.6, title: 'Distribution Layer', subtitle: 'Channel Orchestration' },
                ].map((node, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: node.delay,
                      type: "spring",
                      stiffness: 100 
                    }}
                    className="absolute canvas-node-base w-48"
                    style={{ top: node.top, left: node.left }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-medium text-[rgb(var(--os-accent))] mb-1">
                          {node.title}
                        </div>
                        <div className="text-xs text-[rgb(var(--muted-foreground))]">
                          {node.subtitle}
                        </div>
                      </div>
                      <div className="h-6 w-6 rounded-full bg-[rgb(var(--os-accent))/0.1] border border-[rgb(var(--os-accent))/0.2] flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-[rgb(var(--os-accent))]" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-1.5 w-full bg-[rgb(var(--muted))] rounded-full" />
                      <div className="h-1.5 w-3/4 bg-[rgb(var(--muted))] rounded-full" />
                    </div>
                  </motion.div>
                ))}
                
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    d="M20% 20% L60% 40%"
                    stroke="rgb(var(--os-accent))"
                    strokeWidth="1"
                    strokeDasharray="4"
                    fill="none"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1 }}
                    d="M60% 40% L30% 70%"
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