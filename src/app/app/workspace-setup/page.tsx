// /app/workspace-setup/page.tsx
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

import {
  EvidenceSourceInput,
  SetupStep,
  WorkspaceDraft,
  WorkspaceSetupConfig,
} from "@/types/workspace"
import { InputMode, OnboardingMode } from "@/types/onboarding"

import OnboardingGreeting from "@/components/onboarding/OnboardingGreeting"
import OnboardingModeSelect from "@/components/onboarding/OnboardingModeSelect"
import OnboardingProcessing from "@/components/onboarding/OnboardingProcessing"
import OnboardingComplete from "@/components/onboarding/OnboardingComplete"
import OnboardingBoot from "@/components/onboarding/OnboardingBoot"
import OnboardingEvidence from "@/components/onboarding/OnboardingEvidence"

import ProcessingScreen from "@/components/workspace/ProcessingScreen"
import ReviewScreen from "@/components/workspace/ReviewScreen"
import IntakeDock from "@/components/workspace/IntakeDock"
import ActivationScreen from "@/components/workspace/ActivationScreen"
import OnboardingReview from "@/components/onboarding/OnnoardingReview"

type CinematicStep =
  | "boot"
  | "greeting"
  | "mode-select"
  | "evidence"
  | "processing"
  | "review"
  | "complete"

// Default configuration
const DEFAULT_CONFIG: WorkspaceSetupConfig = {
  mode: "first-time",
  initialName: undefined
}

export default function WorkspaceSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get configuration from URL parameters
  const mode = searchParams.get("mode") as WorkspaceSetupConfig["mode"] | null
  const initialName = searchParams.get("name")
  
  // Build config from URL params with defaults
  const config: WorkspaceSetupConfig = {
    mode: mode || "first-time",
    initialName: initialName || undefined
  }

  const [currentStep, setCurrentStep] = useState<SetupStep>("intake")
  const [evidenceSources, setEvidenceSources] = useState<EvidenceSourceInput[]>([])
  const [workspaceDraft, setWorkspaceDraft] = useState<WorkspaceDraft | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [selectedInputMode, setSelectedInputMode] = useState<InputMode>("hybrid")
  const [processingProgress, setProcessingProgress] = useState<number>(0)

  // Default to cinematic mode
  const [useCinematicMode] = useState<boolean>(true)
  const [cinematicStep, setCinematicStep] = useState<CinematicStep>("boot")

  const getOnboardingMode = (): OnboardingMode => {
    switch (config.mode) {
      case "first-time":
        return "first-time"
      case "new-client":
        return "new-client"
      case "new-workspace":
        return "new-workspace"
      default:
        return "first-time"
    }
  }

  // Auto-advance from boot → greeting
  useEffect(() => {
    if (!useCinematicMode || cinematicStep !== "boot") return

    const timer = setTimeout(() => {
      setCinematicStep("greeting")
    }, 2500)

    return () => clearTimeout(timer)
  }, [useCinematicMode, cinematicStep])

  const handleModeSelect = (mode: InputMode) => {
    setSelectedInputMode(mode)
    setCinematicStep("evidence")
    setCurrentStep("intake")
  }

  const handleAnalyzeBrand = async (sources?: EvidenceSourceInput[]) => {
    const sourcesToProcess = sources ?? evidenceSources
    if (!sourcesToProcess.length) return

    if (useCinematicMode) {
      setCinematicStep("processing")
      setEvidenceSources(sourcesToProcess)
    } else {
      setCurrentStep("processing")
    }

    setIsProcessing(true)
    setProcessingProgress(0)

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)

          const mockDraft = createMockWorkspaceDraft(
            sourcesToProcess,
            config.initialName
          )
          setWorkspaceDraft(mockDraft)

          if (useCinematicMode) {
            setCinematicStep("review")
          } else {
            setCurrentStep("review")
          }

          setIsProcessing(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleAddEvidence = (input: EvidenceSourceInput) => {
    setEvidenceSources((prev) => [...prev, input])
  }

  const handleRemoveEvidence = (id: string) => {
    setEvidenceSources((prev) => prev.filter((source) => source.id !== id))
  }

  const handleDraftUpdate = (updatedDraft: WorkspaceDraft) => {
    setWorkspaceDraft(updatedDraft)
  }

  const handleActivateWorkspace = async () => {
    if (!workspaceDraft) return

    setTimeout(() => {
      if (useCinematicMode) {
        setCinematicStep("complete")
      } else {
        setCurrentStep("activated")
      }
      // Navigate to workspace after completion
      router.push(`/workspace/${workspaceDraft.id}`)
    }, 1000)
  }

  const handleCancel = () => {
    router.back()
  }

  const handleRestart = () => {
    if (useCinematicMode) {
      setCinematicStep("mode-select")
    } else {
      setCurrentStep("intake")
    }
    setEvidenceSources([])
    setWorkspaceDraft(null)
    setProcessingProgress(0)
    setIsProcessing(false)
  }

  const getGreeting = (): string => {
    switch (config.mode) {
      case "new-client":
        return `Let's set up ${config.initialName || "your client"}'s workspace.`
      case "new-workspace":
        return `Adding new workspace: ${config.initialName || "New Workspace"}`
      default:
        return `Hi, ${config.initialName || "there"}. I'm your Brand Brain.`
    }
  }

  // CINEMATIC FLOW RENDER
  if (useCinematicMode) {
    const commonConfig = {
      mode: getOnboardingMode(),
      userName: config.initialName,
    }

    return (
      <div className="fixed inset-0 z-50 bg-[rgb(var(--background))]">
        <AnimatePresence mode="wait">
          {cinematicStep === "boot" && <OnboardingBoot key="boot" />}

          {cinematicStep === "greeting" && (
            <OnboardingGreeting
              key="greeting"
              config={commonConfig}
              greeting={getGreeting()}
              onNext={() => setCinematicStep("mode-select")}
              onSkip={() => {
                setSelectedInputMode("hybrid")
                setCinematicStep("evidence")
              }}
            />
          )}

          {cinematicStep === "mode-select" && (
            <OnboardingModeSelect
              key="mode-select"
              selectedMode={selectedInputMode}
              onSelect={handleModeSelect}
              config={commonConfig}
            />
          )}

          {cinematicStep === "evidence" && (
            <OnboardingEvidence
              key="evidence"
              selectedMode={selectedInputMode}
              evidence={evidenceSources}
              onEvidenceChange={(sources) => {
                setEvidenceSources(sources)
                if (sources.length > evidenceSources.length) {
                  const newSource = sources[sources.length - 1]
                  handleAddEvidence(newSource)
                }
              }}
              onSubmit={handleAnalyzeBrand}
              config={commonConfig}
            />
          )}

          {cinematicStep === "processing" && (
            <OnboardingProcessing
              key="processing"
              evidence={evidenceSources}
              progress={processingProgress}
              config={commonConfig}
            />
          )}

          {cinematicStep === "review" && workspaceDraft && (
            <OnboardingReview
              key="review"
              draft={workspaceDraft}
              onUpdate={handleDraftUpdate}
              onActivate={handleActivateWorkspace}
              onBack={() => setCinematicStep("evidence")}
              config={commonConfig}
            />
          )}

          {cinematicStep === "complete" && workspaceDraft && (
            <div className="fixed inset-0 z-50">
              <OnboardingComplete
                key="complete"
                draft={workspaceDraft}
                config={commonConfig}
                onEnterWorkspace={() => router.push(`/workspace/${workspaceDraft.id}`)}
                onRefine={() => setCinematicStep("review")}
                onAddAnother={handleRestart}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // LEGACY FLOW RENDER (fallback)
  const getStepTitle = (): string => {
    switch (currentStep) {
      case "intake":
        return "New Workspace Setup"
      case "processing":
        return "Analyzing Brand Inputs"
      case "review":
        return "Review Brand Brain Draft"
      case "activated":
        return "Workspace Ready"
      default:
        return "Workspace Setup"
    }
  }

  const getStepSubtitle = (): string => {
    switch (currentStep) {
      case "intake":
        return "Drop in whatever you already have — I'll build a Brand Brain from it."
      case "processing":
        return "Ingesting sources and building your brand intelligence layer."
      case "review":
        return "Here's how I understand this brand from the inputs you provided. Adjust anything before we activate the workspace."
      case "activated":
        return "Your Brand Brain, Strategy Model, and Content System have been created."
      default:
        return ""
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

            {currentStep !== "processing" && (
              <button
                type="button"
                onClick={handleCancel}
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
                  onAnalyzeBrand={() => handleAnalyzeBrand()}
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
                  onEnterWorkspace={() => router.push(`/workspace/${workspaceDraft.id}`)}
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
  const name =
    initialName ||
    sources.find((s) => s.type === "name")?.label ||
    "New Brand"

  return {
    id: `draft_${Date.now()}`,
    brandName: {
      value: name,
      confidence: 0.9,
      primarySource: "name",
      rationale: "Based on provided brand name and website analysis",
    },
    description: {
      value:
        "A strategic brand focused on delivering value through intelligent content systems and audience engagement.",
      confidence: 0.7,
      primarySource: "website",
      secondarySources: ["document"],
      rationale: "Extracted from website content and document analysis",
    },
    audience: {
      value: [
        "Marketing Professionals",
        "Content Strategists",
        "Digital Agencies",
        "Tech Founders",
      ],
      confidence: 0.8,
      primarySource: "social",
      secondarySources: ["website"],
      rationale:
        "Based on social media following patterns and website visitor analysis",
    },
    offers: {
      value: [
        "Content Strategy",
        "AI-Assisted Creation",
        "Multi-Platform Management",
        "Performance Analytics",
      ],
      confidence: 0.85,
      primarySource: "website",
      rationale: "Identified from service pages and document mentions",
    },
    contentPillars: {
      value: [
        "Strategic Thinking",
        "AI Intelligence",
        "Content Systems",
        "Brand Growth",
      ],
      confidence: 0.75,
      primarySource: "document",
      secondarySources: ["website"],
      rationale:
        "Extracted from strategic documents and content patterns",
    },
    tone: {
      value: "Analytical & direct",
      confidence: 0.65,
      primarySource: "website",
      secondarySources: ["social"],
      rationale:
        "Based on writing style analysis across platforms",
    },
    channels: {
      value: ["LinkedIn", "Twitter", "YouTube", "Newsletter"],
      confidence: 0.9,
      primarySource: "social",
      rationale: "Active presence detected on these platforms",
    },
    contentSystemNotes: {
      value:
        "Weekly long-form insights, daily social updates, monthly deep-dive analysis. Focus on strategic education and practical implementation.",
      confidence: 0.6,
      primarySource: null,
      rationale:
        "Inferred from content patterns and industry standards",
    },
  }
}