// /src/app/onboarding/components/shared/NeuralFusionVisualizer.tsx
"use client"

import { EvidenceSourceInput } from '@/types/workspace'
import { motion } from 'framer-motion'
import { Brain, Globe, FileText, Users, Tag } from 'lucide-react'

const SOURCE_ICONS = {
  website: Globe,
  document: FileText,
  social: Users,
  name: Tag
} as const

interface NeuralFusionVisualizerProps {
  evidence: EvidenceSourceInput[]
  progress: number
  evidenceCount: number;

}

export default function NeuralFusionVisualizer({ evidence, progress, evidenceCount }: NeuralFusionVisualizerProps) {
  return (
    <div className="relative h-64 w-full">
      {/* Central Brain */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity 
          }}
          className="relative"
        >
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))/0.1] via-transparent to-[rgb(var(--os-accent))/0.05] border border-[rgb(var(--os-accent))/0.2] flex items-center justify-center">
            <Brain className="h-12 w-12 text-[rgb(var(--os-accent))]" />
          </div>
          
          {/* Progress Ring */}
          <motion.div
            className="absolute inset-0 border-2 border-transparent rounded-full"
            style={{
              background: `conic-gradient(rgb(var(--os-accent)) ${progress * 3.6}deg, transparent 0deg)`,
              mask: 'radial-gradient(transparent 55%, black 56%)'
            }}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>

      {/* Orbiting Nodes */}
      {evidence.map((source, index) => {
        const angle = (index * (360 / evidence.length)) * (Math.PI / 180)
        const radius = 120
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const Icon = SOURCE_ICONS[source.type]
        
        return (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x,
              y
            }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.1
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3
              }}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))/0.2] to-transparent border border-[rgb(var(--os-accent))/0.3] flex items-center justify-center"
            >
              <Icon className="h-5 w-5 text-[rgb(var(--os-accent))]" />
            </motion.div>
            
            {/* Connection Line */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                x1="50%"
                y1="50%"
                x2="50%"
                y2="50%"
                stroke="rgb(var(--os-accent))"
                strokeWidth="1"
                strokeDasharray="4"
                transform={`rotate(${angle * (180 / Math.PI)}) translateX(60px)`}
              />
            </svg>
          </motion.div>
        )
      })}

      {/* Data Flow Particles */}
      {evidence.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            x: [0, 120, 0],
            y: [0, 0, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            delay: index * 0.5,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `rotate(${index * (360 / evidence.length)}deg)`
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--os-accent))] shadow-lg shadow-[rgb(var(--os-accent))/0.3]" />
        </motion.div>
      ))}
    </div>
  )
}