export interface EvidenceItem {
  id: string;
  type: 'website' | 'document' | 'social' | 'image' | 'text';
  label: string;
  status: 'queued' | 'processing' | 'fused' | 'error';
}

export interface WorkspaceScores {
  identityStrength: number;
  toneClarity: number;
  audienceConfidence: number;
  strategyReadiness: number;
  completionScore: number;
}

export interface WorkspaceInsights {
  toneSummary: string;
  corePillars: string[];
  audienceSegments: string[];
  keywords: string[];
  brandArchetype: string;
  writingStyle: string;
}

export interface ActivityItem {
  id: string;
  type: 'ai_insight' | 'evidence_added' | 'strategy_created' | 'content_published' | 'system';
  message: string;
  timestamp: number;
  details?: string;
}

export interface WorkspaceSummary {
  userName: string;
  workspaceName: string;
  evidence: EvidenceItem[];
  scores: WorkspaceScores;
  insights: WorkspaceInsights;
  recommendations: string[];
  recentActivity: ActivityItem[];
}