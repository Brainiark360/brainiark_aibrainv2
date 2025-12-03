// /src/app/onboarding/components/OnboardingEvidence.tsx
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  FileText, 
  Users, 
  Tag,
  Upload,
  Link,
  Plus,
  X,
  Sparkles,
  Brain
} from 'lucide-react'
import { fadeInUp, staggerChildren } from '@/lib/motion-variants'
import { EvidenceSourceInput } from '@/types/workspace'
import EvidenceDock from './EvidenceDock'
import AiLogPanel from './AiLogPanel'


interface OnboardingEvidenceProps {
  selectedMode?: string
  evidence: EvidenceSourceInput[]
  onEvidenceChange: (evidence: EvidenceSourceInput[]) => void
  onSubmit: (evidence: EvidenceSourceInput[]) => void
  config: any
}

export default function OnboardingEvidence({
  selectedMode,
  evidence,
  onEvidenceChange,
  onSubmit,
  config
}: OnboardingEvidenceProps) {
  const [aiLogs, setAiLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addAiLog = (message: string) => {
    setAiLogs(prev => [...prev, message])
  }

  const handleAddEvidence = (input: EvidenceSourceInput) => {
    onEvidenceChange([...evidence, input])
    
    // Add AI log based on type
    switch (input.type) {
      case 'website':
        addAiLog('Website added — scanning structure and content patterns…')
        break
      case 'document':
        addAiLog('Document queued for reading — extracting strategic insights…')
        break
      case 'social':
        addAiLog('Social profile received — analyzing content tone and engagement…')
        break
      case 'name':
        addAiLog('Brand name registered — initializing foundational structure…')
        break
    }
  }

  const handleRemoveEvidence = (id: string) => {
    onEvidenceChange(evidence.filter(source => source.id !== id))
    addAiLog('Source removed — adjusting analysis scope…')
  }

  const handleSubmit = async () => {
    if (evidence.length === 0) return
    
    setIsProcessing(true)
    addAiLog('Beginning brand analysis — fusing insights from all sources…')
    
    // Simulate processing before actual submit
    setTimeout(() => {
      onSubmit(evidence)
      setIsProcessing(false)
    }, 800)
  }

  // Initialize based on selected mode
  useEffect(() => {
    setAiLogs([])
    
    switch (selectedMode) {
      case 'website':
        addAiLog('Ready for website analysis. Enter your primary domain.')
        break
      case 'documents':
        addAiLog('Ready for document upload. Drag and drop brand files.')
        break
      case 'social':
        addAiLog('Ready for social profile analysis. Enter handles or URLs.')
        break
      case 'name':
        addAiLog('Ready to start with brand name. Enter your brand or personal name.')
        break
      case 'hybrid':
        addAiLog('Hybrid mode active — add any combination of sources.')
        break
      default:
        addAiLog('Ready to gather brand evidence. Add sources to begin.')
    }
  }, [selectedMode])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full bg-[rgb(var(--background))] canvas-grid overflow-hidden"
    >
      <div className="h-full flex flex-col lg:flex-row">
        {/* Left Panel - AI Guidance */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="lg:w-2/5 border-r border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[rgb(var(--border))]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))/0.1] to-transparent border border-[rgb(var(--os-accent))/0.2] flex items-center justify-center">
                  <Brain className="h-5 w-5 text-[rgb(var(--os-accent))]" />
                </div>
                <div>
                  <h2 className="font-semibold">Brand Brain AI</h2>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    {config.mode === 'new-client' 
                      ? `Building ${config.clientName}'s intelligence layer`
                      : 'Analyzing your brand evidence'}
                  </p>
                </div>
                <div className="ml-auto">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Guidance Text */}
            <div className="p-6 border-b border-[rgb(var(--border))]">
              <h3 className="font-medium mb-3">What to add:</h3>
              <ul className="space-y-2 text-sm text-[rgb(var(--muted-foreground))]">
                {selectedMode === 'hybrid' && (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>Website for structure & positioning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <span>Documents for strategic depth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <span>Social profiles for tone & audience</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>Brand name for foundational setup</span>
                    </li>
                  </>
                )}
                {selectedMode === 'website' && (
                  <li>Enter your primary website URL. I'll analyze content, structure, and positioning.</li>
                )}
              </ul>
            </div>

            {/* AI Logs */}
            <div className="flex-1 overflow-hidden">
              <AiLogPanel logs={aiLogs} />
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Evidence Dock */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          className="lg:w-3/5 overflow-y-auto"
        >
          <div className="h-full p-6">
            <EvidenceDock
              evidence={evidence}
              onAddEvidence={handleAddEvidence}
              onRemoveEvidence={handleRemoveEvidence}
              selectedMode={selectedMode}
            />

            {/* CTA */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="mt-8 pt-8 border-t border-[rgb(var(--border))]"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <button className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors">
                    Or skip and start with a guided conversation
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm text-[rgb(var(--muted-foreground))]">
                    {evidence.length} source{evidence.length !== 1 ? 's' : ''} added
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={evidence.length === 0 || isProcessing}
                    className="px-6 py-3 bg-[rgb(var(--foreground))] text-[rgb(var(--background))] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        Analyze Brand
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}