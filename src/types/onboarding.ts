import { EvidenceSourceInput, WorkspaceDraft } from "./workspace"

// /src/types/onboarding.ts
export type OnboardingMode = 'first-time' | 'new-client' | 'new-workspace'
export type OnboardingStep = 
  | 'boot' 
  | 'greeting' 
  | 'mode-select' 
  | 'evidence' 
  | 'processing' 
  | 'review' 
  | 'complete'

export type InputMode = 'website' | 'documents' | 'social' | 'name' | 'hybrid'

export interface OnboardingConfig {
  mode: OnboardingMode
  userName?: string
  workspaceName?: string
  clientName?: string
}

export interface OnboardingState {
  step: OnboardingStep
  config: OnboardingConfig
  selectedMode?: InputMode
  evidence: EvidenceSourceInput[]
  draft?: WorkspaceDraft
  processingProgress: number
}

// Lightweight editable draft used inside cinematic onboarding
export interface BrandDraft {
  brandName: {
    value: string
    confidence: number
    primarySource?: string | null
    rationale?: string
  }

  description: {
    value: string
    confidence: number
    primarySource?: string | null
    secondarySources?: string[]
    rationale?: string
  }

  audience: {
    value: string[]
    confidence: number
    primarySource?: string | null
    secondarySources?: string[]
    rationale?: string
  }

  offers: {
    value: string[]
    confidence: number
    primarySource?: string | null
    rationale?: string
  }

  contentPillars: {
    value: string[]
    confidence: number
    primarySource?: string | null
    secondarySources?: string[]
    rationale?: string
  }

  tone: {
    value: string
    confidence: number
    primarySource?: string | null
    secondarySources?: string[]
    rationale?: string
  }

  channels: {
    value: string[]
    confidence: number
    primarySource?: string | null
    rationale?: string
  }

  contentSystemNotes: {
    value: string
    confidence: number
    primarySource?: string | null
    rationale?: string
  }
}
