// /src/components/workspace/WorkspaceSetupFlow.tsx
"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import {
  type WorkspaceSetupConfig,
  type WorkspaceDraft,
  type EvidenceSourceInput,
  type SetupStep
} from '@/types/workspace'
import IntakeDock from './IntakeDock'
import ProcessingScreen from './ProcessingScreen'
import ReviewScreen from './ReviewScreen'
import ActivationScreen from './ActivationScreen'

interface WorkspaceSetupFlowProps {
  config: WorkspaceSetupConfig;
  onCompleted?: (draft: WorkspaceDraft) => void;
  onCancelled?: () => void;
}

export default function WorkspaceSetupFlow({ 
  config, 
  onCompleted, 
  onCancelled 
}: WorkspaceSetupFlowProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>("intake")
  const [evidenceSources, setEvidenceSources] = useState<EvidenceSourceInput[]>([])
  const [workspaceDraft, setWorkspaceDraft] = useState<WorkspaceDraft | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAddEvidence = useCallback((input: EvidenceSourceInput) => {
    setEvidenceSources(prev => [...prev, input])
  }, [])

  const handleRemoveEvidence = useCallback((id: string) => {
    setEvidenceSources(prev => prev.filter(source => source.id !== id))
  }, [])

  const handleAnalyzeBrand = useCallback(async () => {
    if (evidenceSources.length === 0) return
    
    setIsProcessing(true)
    setCurrentStep("processing")
    
    // Mock analysis - would be replaced with real API call
    setTimeout(() => {
      const mockDraft = createMockWorkspaceDraft(evidenceSources, config.initialName)
      setWorkspaceDraft(mockDraft)
      setIsProcessing(false)
      setCurrentStep("review")
    }, 2500)
  }, [evidenceSources, config.initialName])

  const handleDraftUpdate = useCallback((updatedDraft: WorkspaceDraft) => {
    setWorkspaceDraft(updatedDraft)
  }, [])

  const handleActivateWorkspace = useCallback(() => {
    if (!workspaceDraft) return
    
    // Mock activation
    setTimeout(() => {
      setCurrentStep("activated")
      onCompleted?.(workspaceDraft)
    }, 1000)
  }, [workspaceDraft, onCompleted])

  const handleRestart = useCallback(() => {
    setCurrentStep("intake")
    setWorkspaceDraft(null)
  }, [])

  const getStepTitle = () => {
    switch (currentStep) {
      case "intake": return "New Workspace Setup"
      case "processing": return "Analyzing Brand Inputs"
      case "review": return "Review Brand Brain Draft"
      case "activated": return "Workspace Ready"
      default: return "Workspace Setup"
    }
  }

  const getStepSubtitle = () => {
    switch (currentStep) {
      case "intake": return "Drop in whatever you already have — I'll build a Brand Brain from it."
      case "processing": return "Ingesting sources and building your brand intelligence layer."
      case "review": return "Here's how I understand this brand from the inputs you provided. Adjust anything before we activate the workspace."
      case "activated": return "Your Brand Brain, Strategy Model, and Content System have been created."
      default: return ""
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl mx-4"
      >
        <div className="os-window">
          <div className="os-window-header">
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{getStepTitle()}</h2>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                {getStepSubtitle()}
              </p>
            </div>
            
            {currentStep !== "processing" && onCancelled && (
              <button
                onClick={onCancelled}
                className="h-8 w-8 rounded-md border border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))] transition-colors flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="os-window-content min-h-[600px] max-h-[80vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentStep === "intake" && (
                <IntakeDock
                  key="intake"
                  evidenceSources={evidenceSources}
                  onAddEvidence={handleAddEvidence}
                  onRemoveEvidence={handleRemoveEvidence}
                  onAnalyzeBrand={handleAnalyzeBrand}
                  initialName={config.initialName}
                  mode={config.mode}
                />
              )}

              {currentStep === "processing" && (
                <ProcessingScreen
                  key="processing"
                  evidenceSources={evidenceSources}
                  isProcessing={isProcessing}
                />
              )}

              {currentStep === "review" && workspaceDraft && (
                <ReviewScreen
                  key="review"
                  draft={workspaceDraft}
                  evidenceSources={evidenceSources}
                  onUpdateDraft={handleDraftUpdate}
                  onActivate={handleActivateWorkspace}
                  onBackToIntake={handleRestart}
                />
              )}

              {currentStep === "activated" && workspaceDraft && (
                <ActivationScreen
                  key="activated"
                  draft={workspaceDraft}
                  onEnterWorkspace={() => onCompleted?.(workspaceDraft)}
                  onRefine={() => setCurrentStep("review")}
                  onSetupAnother={handleRestart}
                  mode={config.mode}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Mock data generator
function createMockWorkspaceDraft(
  sources: EvidenceSourceInput[],
  initialName?: string
): WorkspaceDraft {
  const name = initialName || sources.find(s => s.type === "name")?.label || "New Brand"
  
  return {
    id: `draft_${Date.now()}`,
    brandName: {
      value: name,
      confidence: 0.9,
      primarySource: "name",
      rationale: "Based on provided brand name and website analysis"
    },
    description: {
      value: "A strategic brand focused on delivering value through intelligent content systems and audience engagement.",
      confidence: 0.7,
      primarySource: "website",
      secondarySources: ["document"],
      rationale: "Extracted from website content and document analysis"
    },
    audience: {
      value: ["Marketing Professionals", "Content Strategists", "Digital Agencies", "Tech Founders"],
      confidence: 0.8,
      primarySource: "social",
      secondarySources: ["website"],
      rationale: "Based on social media following patterns and website visitor analysis"
    },
    offers: {
      value: ["Content Strategy", "AI-Assisted Creation", "Multi-Platform Management", "Performance Analytics"],
      confidence: 0.85,
      primarySource: "website",
      rationale: "Identified from service pages and document mentions"
    },
    contentPillars: {
      value: ["Strategic Thinking", "AI Intelligence", "Content Systems", "Brand Growth"],
      confidence: 0.75,
      primarySource: "document",
      secondarySources: ["website"],
      rationale: "Extracted from strategic documents and content patterns"
    },
    tone: {
      value: "Analytical & direct",
      confidence: 0.65,
      primarySource: "website",
      secondarySources: ["social"],
      rationale: "Based on writing style analysis across platforms"
    },
    channels: {
      value: ["LinkedIn", "Twitter", "YouTube", "Newsletter"],
      confidence: 0.9,
      primarySource: "social",
      rationale: "Active presence detected on these platforms"
    },
    contentSystemNotes: {
      value: "Weekly long-form insights, daily social updates, monthly deep-dive analysis. Focus on strategic education and practical implementation.",
      confidence: 0.6,
      primarySource: null,
      rationale: "Inferred from content patterns and industry standards"
    }
  }
}