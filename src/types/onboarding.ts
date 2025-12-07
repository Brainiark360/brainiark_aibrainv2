// /types/onboarding.ts - COMPREHENSIVE VERSION
// This includes ALL types from both versions plus additional ones needed

// ========== CORE ONBOARDING TYPES ==========
export type OnboardingStep = 
  | 'intro' 
  | 'collecting_evidence' 
  | 'waiting_for_analysis' 
  | 'analyzing' 
  | 'reviewing_brand_brain' 
  | 'complete';

export type BrandBrainSection = 'summary' | 'audience' | 'tone' | 'pillars' | 'recommendations' | 'offers' | 'competitors' | 'channels';
export type BrainSectionKey = BrandBrainSection;
export type EvidenceType = 'website' | 'document' | 'social' | 'manual';
export type EvidenceStatus = 'pending' | 'processing' | 'complete';

// ========== API RESPONSE TYPES ==========
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========== AUTHENTICATION TYPES ==========
export interface SessionUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

// ========== AI / CHAT TYPES ==========
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  context?: any;
}

// ========== BACKEND DATA MODELS ==========
// These match the database schema
export interface BrandBrainData {
  brandWorkspaceId: string;
  brandSlug?: string;
  summary?: string;
  audience?: string;
  tone?: string;
  pillars?: string[];
  offers?: string;
  competitors?: string[];
  channels?: string[];
  recommendations?: string[];
  evidence?: EvidenceItem[];
  status?: 'not_started' | 'in_progress' | 'ready';
  isActivated?: boolean;
  onboardingStep?: number;
  lastAnalyzedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
}

export interface BrandWorkspaceData {
  ownerUserId: string;
  name: string;
  slug: string;
  aiThreadId?: string;
  status?: 'not_started' | 'in_progress' | 'ready';
  onboardingStep?: number;
  lastActiveAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EvidenceItem {
  type: EvidenceType;
  value: string;
  status: EvidenceStatus;
  analyzedContent?: string;
  id?: string;
  brandSlug?: string;
  brandWorkspaceId?: string;
  createdAt?: Date;
}

// ========== FRONTEND DATA MODELS ==========
// These are optimized for frontend display
export interface FrontendEvidenceItem {
  id: string;
  content: string;
  type: 'text' | 'image' | 'url' | 'file';
  source: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface FrontendBrandBrainData {
  _id?: string;
  summary?: string;
  audience?: string;
  tone?: string;
  pillars?: string[];
  recommendations?: string[];
  offers?: string;
  competitors?: string[];
  channels?: string[];
  status?: 'not_started' | 'in_progress' | 'ready';
  isActivated?: boolean;
  onboardingStep?: number;
  updatedAt?: string;
  lastAnalyzedAt?: string;
}

// ========== BRAND BRAIN UI TYPES ==========
export interface BrandBrainSectionDTO {
  key: BrainSectionKey;
  title: string;
  content: string;
}

export interface BrandBrainDraftProps {
  brandId: string;
  brandName: string;
  sections: BrandBrainSectionDTO[];
}

// ========== ONBOARDING STATE MANAGEMENT ==========
export type OnboardingEvent = 
  | { type: 'STEP_CHANGED'; payload: { step: OnboardingStep } }
  | { type: 'SHOW_SECTION'; payload: { section: BrandBrainSection } }
  | { type: 'SECTION_UPDATED'; payload?: any }
  | { type: 'ADD_EVIDENCE'; payload?: any }
  | { type: 'START_ANALYSIS'; payload?: any }
  | { type: 'FINISH_REVIEW'; payload?: any }
  | { type: 'EVIDENCE_UPDATED'; payload: { evidence: FrontendEvidenceItem[] } }
  | { type: 'BRAND_BRAIN_UPDATED'; payload: { brandBrain: FrontendBrandBrainData | null } }
  | { type: 'LOADING'; payload: { isLoading: boolean } }
  | { type: 'ERROR'; payload: { error: string | null } }
  | { type: 'CHAT_MESSAGE_ADDED'; payload: { message: ChatMessage } }
  | { type: 'REFINE_SECTION'; payload: { section: BrandBrainSection; content: string } }
  | { type: 'COMPLETE_ONBOARDING'; payload?: any };

export interface OnboardingState {
  step: OnboardingStep;
  brandBrain: FrontendBrandBrainData | null;
  evidence: FrontendEvidenceItem[];
  activeSection: BrandBrainSection | null;
  isLoading: boolean;
  error: string | null;
  chatMessages?: ChatMessage[];
}

// Add chatMessages to the context type
export interface OnboardingContextType {
  // State
  step: OnboardingStep;
  brandBrain: FrontendBrandBrainData | null;
  evidence: FrontendEvidenceItem[];
  activeSection: BrandBrainSection | null;
  isLoading: boolean;
  error: string | null;
  chatMessages: ChatMessage[]; // <-- ADD THIS
  
  // Actions
  updateStep: (step: OnboardingStep) => Promise<void>;
  fetchBrandBrain: () => Promise<FrontendBrandBrainData | null>;
  refreshEvidence: () => Promise<FrontendEvidenceItem[]>;
  dispatch: (event: OnboardingEvent) => void;
  startAnalysis: () => Promise<void>;
  updateBrandBrain: (updates: Partial<FrontendBrandBrainData>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addEvidence: (type: EvidenceType, value: string) => Promise<FrontendEvidenceItem>;
  deleteEvidence: (id: string) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
}

// ========== HELPER TYPES ==========
export interface EvidenceFormData {
  type: EvidenceType;
  value: string;
}

export interface AnalysisStatus {
  canAnalyze: boolean;
  evidenceCount: number;
  analysisStatus: 'not_started' | 'in_progress' | 'ready';
  lastAnalyzedAt?: Date;
  isReady: boolean;
}

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  totalSteps: number;
  percentage: number;
}