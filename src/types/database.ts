// /types/database.ts
export interface EvidenceItem {
  type: 'website' | 'document' | 'social' | 'manual';
  value: string;
  status: 'pending' | 'processing' | 'complete';
  analyzedContent?: string;
}

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
  evidence?: EvidenceItem[];
  status?: 'not_started' | 'in_progress' | 'ready';
  isActivated?: boolean;
  onboardingStep?: number;
  lastAnalyzedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
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