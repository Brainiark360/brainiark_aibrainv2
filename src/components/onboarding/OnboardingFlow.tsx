// /src/app/onboarding/OnboardingFlow.tsx
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InputMode, OnboardingConfig, OnboardingStep } from '@/types/onboarding'
import { EvidenceSourceInput, WorkspaceDraft } from '@/types/workspace'
import OnboardingBoot from './OnboardingBoot'
import OnboardingGreeting from './OnboardingGreeting'
import OnboardingModeSelect from './OnboardingModeSelect'
import OnboardingEvidence from './OnboardingEvidence'
import OnboardingProcessing from './OnboardingProcessing'
import OnboardingReview from './OnnoardingReview'
import OnboardingComplete from './OnboardingComplete'

interface OnboardingFlowProps {
  config: OnboardingConfig
  onComplete?: (draft: WorkspaceDraft) => void
  onExit?: () => void
}

export default function OnboardingFlow({ config, onComplete, onExit }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('boot')
  const [selectedMode, setSelectedMode] = useState<InputMode>()
  const [evidence, setEvidence] = useState<EvidenceSourceInput[]>([])
  const [draft, setDraft] = useState<WorkspaceDraft>()
  const [processingProgress, setProcessingProgress] = useState(0)

  // Auto-advance from boot to greeting
  useEffect(() => {
    if (currentStep === 'boot') {
      const timer = setTimeout(() => {
        setCurrentStep('greeting')
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // Handle mode selection
  const handleModeSelect = (mode: InputMode) => {
    setSelectedMode(mode)
    setCurrentStep('evidence')
  }

  // Handle evidence submission
  const handleEvidenceSubmit = async (sources: EvidenceSourceInput[]) => {
    setEvidence(sources)
    setCurrentStep('processing')
    
    // Simulate processing
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          
          // Generate mock draft
          const mockDraft = generateMockDraft(sources, config)
          setDraft(mockDraft)
          setCurrentStep('review')
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  // Handle draft update
  const handleDraftUpdate = (updatedDraft: WorkspaceDraft) => {
    setDraft(updatedDraft)
  }

  // Handle workspace activation
  const handleActivate = async () => {
    if (!draft) return
    
    // Call activation API
    try {
      await fetch('/api/onboarding/activate', {
        method: 'POST',
        body: JSON.stringify({ draft, config })
      })
      setCurrentStep('complete')
      onComplete?.(draft)
    } catch (error) {
      console.error('Activation failed:', error)
    }
  }

  // Get greeting based on config
  const getGreeting = () => {
    switch (config.mode) {
      case 'new-client':
        return `Welcome, ${config.userName}. Let's set up ${config.clientName}'s workspace.`
      case 'new-workspace':
        return `Adding new workspace: ${config.workspaceName}`
      default:
        return `Hi, ${config.userName}. I'm your Brand Brain.`
    }
  }

  return (
    <div className="fixed inset-0 bg-[rgb(var(--background))] overflow-hidden">
      <AnimatePresence mode="wait">
        {currentStep === 'boot' && (
          <OnboardingBoot key="boot" />
        )}
        
        {currentStep === 'greeting' && (
          <OnboardingGreeting
            key="greeting"
            config={config}
            greeting={getGreeting()}
            onNext={() => setCurrentStep('mode-select')}
            onSkip={() => setCurrentStep('evidence')}
          />
        )}
        
        {currentStep === 'mode-select' && (
          <OnboardingModeSelect
            key="mode-select"
            selectedMode={selectedMode}
            onSelect={handleModeSelect}
            config={config}
          />
        )}
        
        {currentStep === 'evidence' && (
          <OnboardingEvidence
            key="evidence"
            selectedMode={selectedMode}
            evidence={evidence}
            onEvidenceChange={setEvidence}
            onSubmit={handleEvidenceSubmit}
            config={config}
          />
        )}
        
        {currentStep === 'processing' && (
          <OnboardingProcessing
            key="processing"
            evidence={evidence}
            progress={processingProgress}
            config={config}
          />
        )}
        
        {currentStep === 'review' && draft && (
          <OnboardingReview
            key="review"
            draft={draft}
            onUpdate={handleDraftUpdate}
            onActivate={handleActivate}
            onBack={() => setCurrentStep('evidence')}
            config={config}
          />
        )}
        
        {currentStep === 'complete' && draft && (
          <OnboardingComplete
            key="complete"
            draft={draft}
            config={config}
            onEnterWorkspace={() => onComplete?.(draft)}
            onRefine={() => setCurrentStep('review')}
            onAddAnother={() => {
              setCurrentStep('mode-select')
              setEvidence([])
              setDraft(undefined)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}