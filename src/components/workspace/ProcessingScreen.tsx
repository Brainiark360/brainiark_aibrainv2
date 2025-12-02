// /src/components/workspace/ProcessingScreen.tsx
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  FileText, 
  Users, 
  Tag,
  CheckCircle,
  Cpu,
  Brain,
  Network
} from 'lucide-react'
import type { EvidenceSourceInput } from '@/types/workspace'

interface ProcessingScreenProps {
  evidenceSources: EvidenceSourceInput[]
  isProcessing: boolean
}

const STATUS_MESSAGES = [
  "Scanning website structure...",
  "Extracting brand description...",
  "Analyzing content tone on social platforms...",
  "Processing document content...",
  "Identifying audience patterns...",
  "Fusing insights into a single Brand Brain Draft...",
  "Building strategic content pillars...",
  "Finalizing workspace configuration..."
]

const SOURCE_ICONS = {
  website: Globe,
  document: FileText,
  social: Users,
  name: Tag
} as const

export default function ProcessingScreen({ 
  evidenceSources, 
  isProcessing 
}: ProcessingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [completedSources, setCompletedSources] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isProcessing) return

    // Cycle through status messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => 
        prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev
      )
    }, 800)

    // Simulate source completion
    const sourceInterval = setInterval(() => {
      if (completedSources.size < evidenceSources.length) {
        const nextSource = evidenceSources[completedSources.size]
        setCompletedSources(prev => new Set([...prev, nextSource.id]))
      }
    }, 1200)

    return () => {
      clearInterval(messageInterval)
      clearInterval(sourceInterval)
    }
  }, [isProcessing, evidenceSources.length, completedSources.size, evidenceSources])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Source Status List */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
          Processing Sources
        </h3>
        
        <div className="space-y-3">
          {evidenceSources.map((source) => {
            const Icon = SOURCE_ICONS[source.type]
            const isComplete = completedSources.has(source.id)
            
            return (
              <div key={source.id} className="flex items-center justify-between p-3 border border-[rgb(var(--border))] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full border ${isComplete ? 'border-green-500/20 bg-green-500/10' : 'border-[rgb(var(--border))]'} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${isComplete ? 'text-green-500' : 'text-[rgb(var(--muted-foreground))]'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{source.label}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] capitalize">
                      {source.type}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">
                    {isComplete ? 'Complete' : 'Processing...'}
                  </span>
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-[rgb(var(--os-accent))] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Brain Visualization */}
      <div className="relative h-64 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Orbiting Sources */}
          {evidenceSources.map((source, index) => {
            const angle = (index * (360 / evidenceSources.length)) * (Math.PI / 180)
            const radius = 80
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            const Icon = SOURCE_ICONS[source.type]
            const isComplete = completedSources.has(source.id)
            
            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x,
                  y,
                  rotate: 360
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.2
                }}
                className="absolute"
              >
                <div className={`h-8 w-8 rounded-full border ${isComplete ? 'border-green-500/20 bg-green-500/10' : 'border-[rgb(var(--os-accent))/0.3] bg-[rgb(var(--os-accent))/0.1]'} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${isComplete ? 'text-green-500' : 'text-[rgb(var(--os-accent))]'}`} />
                </div>
              </motion.div>
            )
          })}
          
          {/* Central Brain */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity
            }}
            className="relative"
          >
            <div className="h-24 w-24 rounded-full bg-linear-to-br from-[rgb(var(--os-accent))/0.1] to-transparent border border-[rgb(var(--os-accent))/0.2] flex items-center justify-center">
              <Brain className="h-12 w-12 text-[rgb(var(--os-accent))]" />
            </div>
            
            {/* Pulsing Ring */}
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity
              }}
              className="absolute inset-0 border border-[rgb(var(--os-accent))/0.3] rounded-full"
            />
          </motion.div>
        </div>
      </div>

      {/* Status Log */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-[rgb(var(--os-accent))]" />
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            AI System Feed
          </h3>
        </div>
        
        <div className="space-y-2">
          {STATUS_MESSAGES.slice(0, currentMessageIndex + 1).map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 text-sm"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--os-accent))]" />
              <span className="text-[rgb(var(--muted-foreground))]">{message}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}