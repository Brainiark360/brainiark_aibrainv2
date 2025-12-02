"use client"

import { motion } from 'framer-motion'
import { Target, Map, GitBranch } from 'lucide-react'

export default function StrategyCanvasSection() {
  return (
    <div id="strategy">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-[rgb(var(--os-accent))] uppercase tracking-wider">
              Strategy Canvas
            </span>
            <h2 className="h2-os mt-4 mb-6">
              Visual strategy mapping,
              <br />
              not scattered notes.
            </h2>
            <p className="body-os mb-8">
              Map your marketing strategy on an infinite canvas where every 
              idea, insight, and action connects intelligently. Watch as your 
              strategy evolves in real-time with AI-driven suggestions.
            </p>
            
            <div className="space-y-6">
              {[
                {
                  icon: Target,
                  title: "Strategic Nodes",
                  description: "Create interconnected strategy nodes that maintain context and relationships."
                },
                {
                  icon: Map,
                  title: "Real-time Mapping",
                  description: "Visualize complex strategies with automatic layout and relationship mapping."
                },
                {
                  icon: GitBranch,
                  title: "Branching Logic",
                  description: "Create strategy branches that adapt based on performance data and AI insights."
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-[rgb(var(--os-accent))]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-[rgb(var(--muted-foreground))]">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="os-window">
            <div className="os-window-header">
              <div className="flex items-center gap-2">
                <div className="os-controls">
                  <div className="os-control os-control-close" />
                  <div className="os-control os-control-minimize" />
                  <div className="os-control os-control-maximize" />
                </div>
                <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                  Strategy Canvas — Market Expansion
                </span>
              </div>
            </div>
            
            <div className="os-window-content h-[400px] canvas-grid">
              {/* Animated Canvas Nodes */}
              {[
                { top: '15%', left: '15%', width: 'w-40', title: 'Market Entry' },
                { top: '15%', left: '65%', width: 'w-40', title: 'Competitor Analysis' },
                { top: '45%', left: '40%', width: 'w-48', title: 'Core Strategy' },
                { top: '75%', left: '20%', width: 'w-36', title: 'Tactics' },
                { top: '75%', left: '70%', width: 'w-36', title: 'Metrics' },
              ].map((node, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`absolute ${node.width} canvas-node-base`}
                  style={{ top: node.top, left: node.left }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-2 w-20 bg-[rgb(var(--os-accent))/0.2] rounded-full" />
                    <div className="h-2 w-2 rounded-full bg-[rgb(var(--os-accent))]" />
                  </div>
                  <h4 className="font-medium mb-2">{node.title}</h4>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-[rgb(var(--muted))] rounded-full" />
                    <div className="h-1.5 w-3/4 bg-[rgb(var(--muted))] rounded-full" />
                    <div className="h-1.5 w-1/2 bg-[rgb(var(--muted))] rounded-full" />
                  </div>
                </motion.div>
              ))}
              
              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  viewport={{ once: true }}
                  d="M15% 25% L40% 45%"
                  stroke="rgb(var(--os-accent))"
                  strokeWidth="1"
                  strokeDasharray="4"
                  fill="none"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                  viewport={{ once: true }}
                  d="M65% 25% L40% 45%"
                  stroke="rgb(var(--os-accent))"
                  strokeWidth="1"
                  strokeDasharray="4"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}