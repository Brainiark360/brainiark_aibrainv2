// /src/types/workspace.ts

export type EvidenceSourceType = "website" | "document" | "social" | "name";

export interface EvidenceSourceInput {
  id: string;
  type: 'website' | 'pdf' | 'image' | 'text';
  content: string;
  name?: string;
  metadata?: Record<string, any>;  label: string;
  url?: string;
  file?: File;
}

export interface EvidenceChunk {
  sourceType: EvidenceSourceType;
  sourceId: string;
  confidence: number;
  extracted: {
    brandName?: string;
    description?: string;
    audienceHints?: string[];
    toneHints?: string[];
    offers?: string[];
    contentPillars?: string[];
    channels?: string[];
    colors?: string[];
    logoUrl?: string;
    painPoints?: string[];
    [key: string]: unknown;
  };
}

export interface AttributeWithProvenance<T> {
  value: T;
  confidence: number;
  primarySource: EvidenceSourceType | null;
  secondarySources?: EvidenceSourceType[];
  rationale?: string;
}

export interface WorkspaceDraft {
  id?: string;
  brandName?: AttributeWithProvenance<string>;
  description?: AttributeWithProvenance<string>;
  audience?: AttributeWithProvenance<string[]>;
  offers?: AttributeWithProvenance<string[]>;
  contentPillars?: AttributeWithProvenance<string[]>;
  tone?: AttributeWithProvenance<string>;
  channels?: AttributeWithProvenance<string[]>;
  contentSystemNotes?: AttributeWithProvenance<string>;
  logoUrl?: AttributeWithProvenance<string>;
  colors?: AttributeWithProvenance<string[]>;
  rawEvidence?: EvidenceChunk[];
}

export type WorkspaceSetupMode = "first-time" | "new-workspace" | "new-client";

export interface WorkspaceSetupConfig {
  mode: WorkspaceSetupMode;
  initialName?: string;
}

export type SetupStep = "intake" | "processing" | "review" | "activated";