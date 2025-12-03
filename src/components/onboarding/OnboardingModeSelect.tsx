// /src/app/onboarding/components/OnboardingModeSelect.tsx
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  FileText, 
  Users, 
  Tag, 
  Zap,
  Check,
  ArrowRight
} from 'lucide-react'
import { fadeInUp, staggerChildren } from '@/lib/motion-variants'
import AuthButton from '@/components/auth/AuthButton'
import ModeCard from './ModeCard'

interface OnboardingModeSelectProps {
  selectedMode?: 'website' | 'documents' | 'social' | 'name' | 'hybrid'
  onSelect: (mode: 'website' | 'documents' | 'social' | 'name' | 'hybrid') => void
  config: any
}

const MODES = [
  {
    id: 'website',
    title: 'Website First',
    description: 'Start with your primary website',
    icon: Globe,
    color: 'from-blue-500 to-cyan-400',
    recommended: true
  },
  {
    id: 'documents',
    title: 'Documents First',
    description: 'Upload brand guides, briefs, strategies',
    icon: FileText,
    color: 'from-green-500 to-emerald-400'
  },
  {
    id: 'social',
    title: 'Social First',
    description: 'Connect social profiles for tone analysis',
    icon: Users,
    color: 'from-purple-500 to-pink-400'
  },
  {
    id: 'name',
    title: 'Name First',
    description: 'Start with just your brand name',
    icon: Tag,
    color: 'from-amber-500 to-orange-400'
  },
  {
    id: 'hybrid',
    title: 'Hybrid Input',
    description: 'Combine multiple sources for rich context',
    icon: Zap,
    color: 'from-violet-500 to-indigo-400'
  }
]

export default function OnboardingModeSelect({ selectedMode, onSelect, config }: OnboardingModeSelectProps) {
  const [hoveredMode, setHoveredMode] = useState<string>()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full bg-[rgb(var(--background))] canvas-grid-subtle overflow-y-auto"
    >
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-semibold mb-4">
            How would you like to start?
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto">
            Choose your input method. You can always add more sources later.
          </p>
        </motion.div>

        {/* Mode Grid */}
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              isSelected={selectedMode === mode.id}
              isHovered={hoveredMode === mode.id}
              onSelect={() => onSelect(mode.id as any)}
              onHoverStart={() => setHoveredMode(mode.id)}
              onHoverEnd={() => setHoveredMode(undefined)}
            />
          ))}
        </motion.div>

        {/* Description Panel */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          {selectedMode && (
            <div className="os-window border border-[rgb(var(--border))]">
              <div className="os-window-content">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))/0.1] to-transparent border border-[rgb(var(--os-accent))/0.2] flex items-center justify-center">
                    {(() => {
                      const ModeIcon = MODES.find(m => m.id === selectedMode)?.icon || Zap
                      return <ModeIcon className="h-6 w-6 text-[rgb(var(--os-accent))]" />
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">
                      {selectedMode === 'website' && 'Website Analysis'}
                      {selectedMode === 'documents' && 'Document Intelligence'}
                      {selectedMode === 'social' && 'Social Profile Scanning'}
                      {selectedMode === 'name' && 'Brand Name Analysis'}
                      {selectedMode === 'hybrid' && 'Multi-Source Fusion'}
                    </h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {selectedMode === 'website' && 'I\'ll analyze your website structure, content, and positioning to understand your brand. This works best for established businesses.'}
                      {selectedMode === 'documents' && 'Upload brand documents, strategies, or briefs. I\'ll extract key information and patterns to build your Brand Brain.'}
                      {selectedMode === 'social' && 'Connect social profiles to analyze your tone, audience engagement, and content strategy across platforms.'}
                      {selectedMode === 'name' && 'Start with just your brand name and I\'ll build a foundational structure that you can refine with additional sources.'}
                      {selectedMode === 'hybrid' && 'Combine multiple sources for the most comprehensive Brand Brain. I\'ll intelligently fuse insights from all inputs.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
          className="fixed bottom-0 left-0 right-0 border-t border-[rgb(var(--border))] bg-[rgb(var(--background))] p-6"
        >
          <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[rgb(var(--muted-foreground))]">
              {!selectedMode ? 'Select an input method to continue' : 'Ready to proceed'}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelect('hybrid')}
                className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
              >
                I'm not sure
              </button>
              
              <AuthButton
                onClick={() => selectedMode && onSelect(selectedMode)}
                disabled={!selectedMode}
                className="min-w-[140px]"
              >
                {selectedMode ? (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Select Method'
                )}
              </AuthButton>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}