"use client"

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  GitBranch, 
  MessageSquare, 
  Brain, 
  Workflow, 
  BarChart3,
  Layers,
  Network,
  Cpu,
  Shield,
  Zap,
  Search
} from 'lucide-react'

const systemFeatures = [
  {
    category: "Strategy Layer",
    icon: LayoutDashboard,
    features: [
      {
        title: "Content Strategy Canvas",
        description: "Structured canvas environment for mapping content strategy, pillars, and multi-platform flows.",
        icon: GitBranch
      },
      {
        title: "Strategic Dialogue Interface",
        description: "Context-aware system interface for developing strategy with structured AI reasoning.",
        icon: MessageSquare
      }
    ]
  },
  {
    category: "Intelligence Layer",
    icon: Cpu,
    features: [
      {
        title: "Brand Intelligence Memory",
        description: "Persistent content intelligence layer that maintains strategic context across all operations.",
        icon: Brain
      },
      {
        title: "Execution Orchestration",
        description: "AI-structured workflow sequencing for multi-platform content creation and distribution.",
        icon: Workflow
      }
    ]
  },
  {
    category: "Analytics Layer",
    icon: BarChart3,
    features: [
      {
        title: "Performance Intelligence",
        description: "Content performance analysis across platforms with strategic pattern recognition.",
        icon: Search
      },
      {
        title: "Strategic Adaptation",
        description: "Real-time content strategy adjustment based on audience signals and engagement patterns.",
        icon: Zap
      }
    ]
  },
  {
    category: "System Layer",
    icon: Layers,
    features: [
      {
        title: "Modular Architecture",
        description: "Component-based system design for scalable content operations and strategic workflows.",
        icon: Network
      },
      {
        title: "Enterprise Content Security",
        description: "Comprehensive security framework for brand assets, content repositories, and strategic data.",
        icon: Shield
      }
    ]
  }
]

export default function FeaturesGridSection() {
  return (
    <div id="features">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-sm font-medium text-[rgb(var(--os-accent))] uppercase tracking-wider">
          System Architecture
        </span>
        <h2 className="h2-os mt-4 mb-6">
          Not marketing tools.
          <br />
          Strategic system layers.
        </h2>
        <p className="body-os max-w-2xl mx-auto">
          Brainiark OS is built as a complete operating environment for content strategy and execution. 
          Each system layer works in orchestration with others, forming an intelligent content ecosystem.
        </p>
      </motion.div>

      {/* OS Capability Grid */}
      <div className="space-y-8">
        {systemFeatures.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            viewport={{ once: true }}
            className="os-window"
          >
            <div className="os-window-header">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] flex items-center justify-center">
                  <category.icon className="h-5 w-5 text-[rgb(var(--os-accent))]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{category.category}</h3>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    System Layer • {category.features.length} Core Processes
                  </p>
                </div>
              </div>
              <div className="text-xs text-[rgb(var(--muted-foreground))]">
                Active • Orchestrated
              </div>
            </div>

            <div className="os-window-content">
              <div className="grid md:grid-cols-2 gap-6">
                {category.features.map((feature, featureIndex) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <div className="p-6 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--os-surface))] hover:border-[rgb(var(--os-accent))/0.3] transition-all">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] group-hover:border-[rgb(var(--os-accent))/0.3] transition-colors flex items-center justify-center">
                            <feature.icon className="h-6 w-6 text-[rgb(var(--os-accent))]" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2 group-hover:text-[rgb(var(--os-accent))] transition-colors">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-[rgb(var(--muted-foreground))]">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Indicators */}
                      <div className="mt-6 pt-6 border-t border-[rgb(var(--border))]">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-[rgb(var(--muted-foreground))]">Active</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-[rgb(var(--os-surface))] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${Math.random() * 60 + 40}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                viewport={{ once: true }}
                                className="h-full bg-[rgb(var(--os-accent))] rounded-full"
                              />
                            </div>
                            <span className="text-[rgb(var(--muted-foreground))]">Ready</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Architecture Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <div className="os-window">
          <div className="os-window-header">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] flex items-center justify-center">
                <Network className="h-5 w-5 text-[rgb(var(--os-accent))]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">System Orchestration</h3>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  How system layers interoperate
                </p>
              </div>
            </div>
            <div className="text-xs text-[rgb(var(--muted-foreground))]">
              Live System State
            </div>
          </div>

          <div className="os-window-content">
            {/* Architecture Diagram */}
            <div className="relative h-96">
              {/* Central Brain */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(var(--os-accent), 0.1)',
                      '0 0 0 20px rgba(var(--os-accent), 0)',
                      '0 0 0 0 rgba(var(--os-accent), 0.1)'
                    ]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity
                  }}
                  className="h-24 w-24 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))/0.15] to-transparent border border-[rgb(var(--os-accent))/0.2] flex items-center justify-center"
                >
                  <Brain className="h-8 w-8 text-[rgb(var(--os-accent))]" />
                </motion.div>
              </div>

              {/* Satellite Modules */}
              {[
                { angle: 0, icon: LayoutDashboard, label: "Strategy", delay: 0 },
                { angle: 90, icon: Cpu, label: "Intelligence", delay: 0.1 },
                { angle: 180, icon: BarChart3, label: "Analytics", delay: 0.2 },
                { angle: 270, icon: Layers, label: "System", delay: 0.3 },
              ].map((module, i) => (
                <motion.div
                  key={module.label}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: module.delay }}
                  viewport={{ once: true }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${module.angle}deg) translateX(180px) rotate(-${module.angle}deg)`
                  }}
                >
                  <div className="h-16 w-16 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] flex items-center justify-center group hover:border-[rgb(var(--os-accent))/0.3] transition-colors">
                    <module.icon className="h-6 w-6 text-[rgb(var(--os-accent))]" />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-20 text-center">
                    <div className="text-sm font-medium">{module.label}</div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">Layer</div>
                  </div>
                </motion.div>
              ))}

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                {[0, 90, 180, 270].map((angle, i) => (
                  <motion.path
                    key={i}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    d="M50% 50% L50% 50%"
                    stroke="rgb(var(--os-accent))"
                    strokeWidth="1"
                    strokeDasharray="4"
                    fill="none"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </svg>

              {/* Data Flow Animation */}
              {[0, 90, 180, 270].map((angle, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    x: [0, 180, 0],
                    y: [0, 0, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "linear"
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `rotate(${angle}deg)`
                  }}
                >
                  <div className="h-2 w-2 rounded-full bg-[rgb(var(--os-accent))] shadow-lg shadow-[rgb(var(--os-accent))/0.3]" />
                </motion.div>
              ))}
            </div>

            {/* Architecture Description */}
            <div className="mt-8 pt-8 border-t border-[rgb(var(--border))]">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-[rgb(var(--os-accent))] mb-2">Modular</div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    Independent system layers that interlock for comprehensive content operations
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-[rgb(var(--os-accent))] mb-2">Intelligent</div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    AI-native architecture with continuous learning across all content operations
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-[rgb(var(--os-accent))] mb-2">Scalable</div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    Enterprise-grade infrastructure for global content teams and strategic workflows
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Integration Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <div className="text-center mb-12">
          <h3 className="h3-os mb-4">Content Strategy Flow</h3>
          <p className="body-os max-w-2xl mx-auto">
            Strategic content workflow from conceptualization to performance intelligence and adaptation.
          </p>
        </div>

        <div className="relative">
          {/* Flow Visualization */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {[
              { step: 1, title: "Strategy", icon: GitBranch, color: "bg-blue-500" },
              { step: 2, title: "Intelligence", icon: Cpu, color: "bg-purple-500" },
              { step: 3, title: "Execution", icon: Zap, color: "bg-green-500" },
              { step: 4, title: "Adaptation", icon: Brain, color: "bg-amber-500" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative flex-1 text-center"
              >
                <div className="mb-4">
                  <div className={`h-16 w-16 rounded-full ${step.color}/10 border ${step.color}/20 mx-auto flex items-center justify-center mb-3`}>
                    <step.icon className="h-7 w-7" style={{ color: `var(--os-accent)` }} />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[rgb(var(--os-surface))] border border-[rgb(var(--border))] flex items-center justify-center text-sm font-semibold mx-auto mb-2">
                    {step.step}
                  </div>
                  <h4 className="font-semibold mb-2">{step.title}</h4>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {step.step === 1 && "Content strategy formulation and audience mapping"}
                    {step.step === 2 && "AI-driven content analysis and strategic optimization"}
                    {step.step === 3 && "Multi-platform content creation and orchestration"}
                    {step.step === 4 && "Performance-based strategy refinement and learning"}
                  </p>
                </div>
                
                {/* Flow Arrows */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-16">
                    <motion.div
                      animate={{ 
                        x: [0, 16, 0]
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      className="text-[rgb(var(--muted-foreground))]"
                    >
                      →
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}