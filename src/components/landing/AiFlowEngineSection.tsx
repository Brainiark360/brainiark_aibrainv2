"use client"

import { motion } from 'framer-motion'
import { Cpu, Workflow, Zap } from 'lucide-react'

export default function AiFlowEngineSection() {
  return (
    <div id="ai-flow">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1"
        >
          <span className="text-sm font-medium text-[rgb(var(--os-accent))] uppercase tracking-wider">
            Strategy Execution Layer
          </span>
          <h2 className="h2-os mt-4 mb-6">
            Structured reasoning,
            <br />
            not conversational UI.
          </h2>
          <p className="body-os mb-8">
            The Strategy Execution Layer interprets content strategy, maps actions 
            to Brand Brain context, and orchestrates intelligent workflow sequences.
          </p>
          
          <div className="space-y-6">
            {[
              {
                icon: Cpu,
                title: "Strategy-Aware Processing",
                description: "Maintains strategic context across all execution layers and sessions."
              },
              {
                icon: Workflow,
                title: "Intelligent Execution Sequencing",
                description: "Structures and sequences content workflows based on strategic priority."
              },
              {
                icon: Zap,
                title: "Contextual Adaptation",
                description: "Adjusts execution paths based on real-time content performance signals."
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2"
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
                  Strategy Execution Layer — Content Strategy Analysis
                </span>
              </div>
            </div>
            
            <div className="os-window-content space-y-6">
              {/* Strategy Messages */}
              <div className="space-y-4">
                {/* User Strategy Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  viewport={{ once: true }}
                  className="flex justify-end"
                >
                  <div className="max-w-[80%] bg-[rgb(var(--os-accent))] text-white rounded-lg rounded-tr-none px-4 py-3">
                    <p className="text-sm">Analyze Q3 content performance against strategic pillars</p>
                  </div>
                </motion.div>
                
                {/* Strategy Engine Response */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex"
                >
                  <div className="max-w-[80%] bg-[rgb(var(--os-surface))] border border-[rgb(var(--border))] rounded-lg rounded-tl-none px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-[rgb(var(--os-accent))/0.1] border border-[rgb(var(--os-accent))/0.2] flex items-center justify-center">
                        <Cpu className="h-4 w-4 text-[rgb(var(--os-accent))]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm mb-3">Mapping Q3 content metrics to strategic framework and Brand Brain context...</p>
                        
                        {/* Processing Indicators */}
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="h-2 w-2 rounded-full bg-[rgb(var(--os-accent))]"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                            className="h-2 w-2 rounded-full bg-[rgb(var(--os-accent))]"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                            className="h-2 w-2 rounded-full bg-[rgb(var(--os-accent))]"
                          />
                          <span className="text-xs text-[rgb(var(--muted-foreground))]">Structuring strategic analysis</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Action Sequence */}
              <div className="flex gap-3">
                <button className="flex-1 btn-base border border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]">
                  Initiate Analysis
                </button>
                <button className="flex-1 btn-base border border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]">
                  Map Insights
                </button>
                <button className="flex-1 btn-base border border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]">
                  Sequence Actions
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}