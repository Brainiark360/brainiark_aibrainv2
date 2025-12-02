"use client"

import { motion } from 'framer-motion'
import { Brain, Database, RefreshCw, Network, Layers, MemoryStick } from 'lucide-react'

export default function BrandBrainSection() {
  return (
    <div id="brand-brain">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-[rgb(var(--os-accent))] uppercase tracking-wider">
              Brand Intelligence Layer
            </span>
            <h2 className="h2-os mt-4 mb-6">
              Persistent context
              <br />
              for strategic decisions.
            </h2>
            <p className="body-os mb-8">
              All content strategy, decisions, and performance signals persist 
              in a structured intelligence layer. The Brand Intelligence Layer 
              maintains context across all content operations, informing every 
              strategic action.
            </p>
            
            <div className="space-y-6">
              {[
                {
                  icon: Brain,
                  title: "Context Memory",
                  description: "Maintains complete historical context of all content decisions and strategies."
                },
                {
                  icon: Layers,
                  title: "Strategy Hierarchy",
                  description: "Structures content knowledge across strategic, tactical, and execution layers."
                },
                {
                  icon: Network,
                  title: "Decision Mapping",
                  description: "Connects content actions to strategic outcomes and performance patterns."
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
                    <p className="text-[rgb(var(--muted-foreground))] text-sm">{item.description}</p>
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
                  Brand Intelligence — Content Context Graph
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-[rgb(var(--muted-foreground))]">
                  Active Learning • 94% Context Density
                </span>
              </div>
            </div>
            
            <div className="os-window-content h-[500px] relative overflow-hidden">
              {/* Neural Network Visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Outer Network Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute h-72 w-72 rounded-full border border-[rgb(var(--os-accent))/0.1]"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-3 w-3 rounded-full bg-[rgb(var(--os-accent))/0.2] border border-[rgb(var(--os-accent))/0.3]"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateX(144px) rotate(-${i * 30}deg)`
                      }}
                    />
                  ))}
                </motion.div>

                {/* Middle Network Ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute h-56 w-56 rounded-full border border-[rgb(var(--os-accent))/0.15]"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-3 w-3 rounded-full bg-[rgb(var(--os-accent))/0.25] border border-[rgb(var(--os-accent))/0.35]"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(112px) rotate(-${i * 45}deg)`
                      }}
                    />
                  ))}
                </motion.div>

                {/* Core Brain */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.02, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div className="h-40 w-40 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))/0.15] via-[rgb(var(--os-accent))/0.1] to-transparent border border-[rgb(var(--os-accent))/0.2]" />
                  
                  {/* Brain Hemispheres */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    {/* Left Hemisphere */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.6, 0.8, 0.6]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.5
                      }}
                      className="absolute top-1/4 left-1/4 h-20 w-16 rounded-full bg-[rgb(var(--os-accent))/0.1] border border-[rgb(var(--os-accent))/0.15]"
                    />
                    
                    {/* Right Hemisphere */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.6, 0.8, 0.6]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: 1
                      }}
                      className="absolute top-1/4 right-1/4 h-20 w-16 rounded-full bg-[rgb(var(--os-accent))/0.1] border border-[rgb(var(--os-accent))/0.15]"
                    />
                  </div>

                  {/* Active Neural Pathways */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i * 22.5) * (Math.PI / 180);
                    const length = 20 + Math.sin(Date.now() / 1000 + i) * 5;
                    return (
                      <motion.div
                        key={i}
                        animate={{ 
                          height: [length, length + 10, length],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                        className="absolute w-0.5 bg-[rgb(var(--os-accent))/0.4] origin-bottom"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${i * 22.5}deg)`,
                          height: `${length}px`
                        }}
                      />
                    );
                  })}
                </motion.div>

                {/* Floating Memory Nodes */}
                {[
                  { x: '10%', y: '20%', label: 'Content Strategy' },
                  { x: '80%', y: '15%', label: 'Audience Insights' },
                  { x: '15%', y: '70%', label: 'Performance Data' },
                  { x: '75%', y: '75%', label: 'Content Pillars' },
                  { x: '45%', y: '10%', label: 'Channel Context' },
                  { x: '55%', y: '85%', label: 'Brand Voice' },
                ].map((node, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="absolute"
                    style={{ left: node.x, top: node.y }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(var(--os-accent), 0.2)',
                          '0 0 0 8px rgba(var(--os-accent), 0)',
                          '0 0 0 0 rgba(var(--os-accent), 0.2)'
                        ]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                      className="h-4 w-4 rounded-full bg-[rgb(var(--os-accent))] border border-white/20"
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 top-5 whitespace-nowrap text-xs text-[rgb(var(--muted-foreground))] bg-[rgb(var(--os-surface))] px-2 py-1 rounded border border-[rgb(var(--border))]">
                      {node.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Neural Activity Indicators */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[rgb(var(--foreground))]">Knowledge Processing</span>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">Live Analysis</span>
                </div>
                
                <div className="h-1.5 w-full bg-[rgb(var(--os-surface))] rounded-full overflow-hidden">
                  <motion.div
                    animate={{ 
                      backgroundPosition: ['0% 0%', '100% 0%']
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="h-full w-full bg-gradient-to-r from-transparent via-[rgb(var(--os-accent))/0.3] to-transparent"
                    style={{ backgroundSize: '200% 100%' }}
                  />
                </div>
                
                {/* Memory Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[rgb(var(--os-accent))]">94%</div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">Context Recall</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[rgb(var(--os-accent))]">3.2M</div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">Strategic Links</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[rgb(var(--os-accent))]">0.2ms</div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">Response</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Key Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-16 pt-12 border-t border-[rgb(var(--border))]"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: MemoryStick,
              title: "Content Memory",
              description: "Maintains complete historical record of all content decisions, strategies, and outcomes."
            },
            {
              icon: RefreshCw,
              title: "Continuous Learning",
              description: "Learns from each content action, refining strategic intelligence and decision patterns."
            },
            {
              icon: Database,
              title: "Strategic Graph",
              description: "Structures content knowledge across audience, channel, and strategic dimensions."
            }
          ].map((feature, index) => (
            <div key={feature.title} className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] mb-4">
                <feature.icon className="h-6 w-6 text-[rgb(var(--os-accent))]" />
              </div>
              <h4 className="font-semibold mb-3">{feature.title}</h4>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">{feature.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}