'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { OnboardingStep } from '@/types/onboarding';

//
// -----------------------------
// Local Types (frontend DTOs)
// -----------------------------
//

export type EvidenceMappedType = 'text' | 'image' | 'url' | 'file' | 'search';

export interface EvidenceItem {
  id: string;
  content: string;
  type: EvidenceMappedType;
  source: string;
  createdAt: string;
  metadata: {
    originalValue: string;
    status: string;
    analyzedContent?: string;
    analysisSummary?: string;
    searchType?: string;
  };
}

export interface BrandBrainData {
  _id?: string;
  brandWorkspaceId?: string;
  brandSlug?: string;

  summary: string;
  audience: string;
  tone: string;
  pillars: string[];
  offers: string;
  competitors: string[];
  channels: string[];
  recommendations?: string[];

  status: 'not_started' | 'in_progress' | 'ready' | 'failed' | string;
  isActivated: boolean;
  onboardingStep: number;

  lastAnalyzedAt?: string;
  analysisCompletedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  // Optional GPT metadata if present
  gptAnalysisData?: {
    searchPerformed?: boolean;
    sourcesUsed?: string[];
    resultsCount?: number;
    crawledCount?: number;
    enhancement?: boolean;
    analysisDurationMs?: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

interface EvidenceListResponse {
  success: boolean;
  data?: EvidenceItem[];
  error?: string;
}

interface EvidenceSingleResponse {
  success: boolean;
  data?: EvidenceItem;
  error?: string;
}

interface BrainGetResponse {
  success: boolean;
  data?: BrandBrainData | null;
  error?: string;
}

interface BrainPatchResponse {
  success: boolean;
  data?: BrandBrainData;
  error?: string;
}

interface BrainCompleteResponse {
  success: boolean;
  data?: {
    brain: BrandBrainData;
    workspace: unknown;
    completedAt: string;
  };
  error?: string;
}

interface AnalyzeResponse {
  success: boolean;
  data?: {
    summary: string;
    audience: string;
    tone: string;
    pillars: string[];
    offers: string;
    competitors: string[];
    channels: string[];
    recommendations?: string[];
  };
  error?: string;
  code?: string;
}

interface OnboardingStateResponse {
  success: boolean;
  data?: {
    step: OnboardingStep;
    status: string;
    onboardingStep: number;
    isActivated: boolean;
    updatedAt: string;
  };
  error?: string;
}

//
// -----------------------------
// Onboarding State Interface
// -----------------------------
//

export interface OnboardingState {
  step: OnboardingStep;
  evidence: EvidenceItem[];
  brandBrain: BrandBrainData | null;

  messages: ChatMessage[];

  // Global UI indicators
  isThinking: boolean; // GPT streaming
  isProcessing: boolean; // system operations
  analysisProgress: string[]; // e.g. ["Searching...", "Crawling..."]

  // Actions
  sendChatMessage: (text: string) => Promise<void>;
  addEvidence: (type: string, value: string) => Promise<void>;
  removeEvidence: (id: string) => Promise<void>;
  startAnalysis: (options?: { brandNameOnly?: boolean }) => Promise<void>;
  resetAnalysis: () => Promise<void>;
  updateStep: (step: OnboardingStep) => Promise<void>;
  updateBrandBrain: (updates: Partial<BrandBrainData>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

//
// -----------------------------
// Context
// -----------------------------
//

const OnboardingContext = createContext<OnboardingState | null>(null);

export function useOnboarding(): OnboardingState {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used inside <OnboardingStateManager>');
  }
  return ctx;
}

//
// -----------------------------
// Provider Component
// -----------------------------
//

const ANALYSIS_STEPS: string[] = [
  '🔵 Searching for brand information…',
  '🔵 Crawling website & public sources…',
  '🔵 Extracting messaging, tone, and positioning…',
  '🔵 Building your Brand Brain…',
];

interface OnboardingProviderProps {
  slug: string;
  initialStep: OnboardingStep;
  initialEvidence: EvidenceItem[];
  initialBrain: BrandBrainData | null;
  children: React.ReactNode;
}

export function OnboardingStateManager({
  slug,
  initialStep,
  initialEvidence,
  initialBrain,
  children,
}: OnboardingProviderProps) {
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(initialEvidence);
  const [brandBrain, setBrandBrain] = useState<BrandBrainData | null>(initialBrain);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setThinking] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  //
  // -----------------------------
  // Utility: message helpers
  // -----------------------------
  //

  const pushSystemMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: 'system',
        content,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const pushUserMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: 'user',
        content,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  //
  // -----------------------------
  // Helper: refresh BrandBrain from API
  // -----------------------------
  //

  const refreshBrandBrain = useCallback(async () => {
    try {
      const res = await fetch(`/api/brands/${slug}/onboarding/brain`, {
        method: 'GET',
      });

      const data = (await res.json()) as BrainGetResponse;

      if (!res.ok || !data.success) {
        if (data.error) {
          pushSystemMessage(`⚠️ Failed to load Brand Brain: ${data.error}`);
        }
        return;
      }

      if (data.data) {
        setBrandBrain(data.data);
      }
    } catch (error) {
      console.error('refreshBrandBrain error:', error);
      pushSystemMessage('⚠️ Could not refresh Brand Brain.');
    }
  }, [slug, pushSystemMessage]);

  //
  // -----------------------------
  // 1. SEND CHAT MESSAGE (streaming)
  // -----------------------------
  //

  const sendChatMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      pushUserMessage(trimmed);
      setThinking(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(`/api/brands/${slug}/onboarding/chat`, {
          method: 'POST',
          body: JSON.stringify({
            message: trimmed,
            step,
          }),
          signal: abortRef.current.signal,
        });

        //
        // -----------------------------
        // CASE 1: Error JSON from backend
        // -----------------------------
        //
        if (!res.ok) {
          let errorText = 'AI failed to respond.';
          try {
            const json = await res.json();
            errorText = json.error ?? errorText;
          } catch (_) {
            errorText = `HTTP ${res.status}`;
          }
          pushSystemMessage(`⚠️ ${errorText}`);
          return;
        }

        //
        // -----------------------------
        // CASE 2: No streaming body (fallback text)
        // -----------------------------
        //
        if (!res.body || !res.body.getReader) {
          const fallback = await res.text();

          const assistantId = `ai-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;

          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: 'assistant',
              content: fallback || '(no response)',
              createdAt: Date.now(),
            },
          ]);

          return;
        }

        //
        // -----------------------------
        // CASE 3: TRUE STREAM (OpenAI)
        // -----------------------------
        //
        const reader = res.body.getReader?.();
        if (!reader) {
          // Body exists but is not a stream → fallback text
          const fallback = await res.text();

          const assistantId = `ai-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;

          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: 'assistant',
              content: fallback || '(no response)',
              createdAt: Date.now(),
            },
          ]);

          return;
        }

        const decoder = new TextDecoder();
        const assistantId = `ai-${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`;

        // create blank assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content: '',
            createdAt: Date.now(),
          },
        ]);

        // read stream chunks safely
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            const textPart = decoder.decode(value, { stream: true });
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: msg.content + textPart }
                  : msg
              )
            );
          }
        }
      } catch (err) {
        console.error('Chat stream error', err);
        pushSystemMessage('⚠️ AI connection interrupted. Please retry.');
      } finally {
        setThinking(false);
      }
    },
    [slug, step, pushUserMessage, pushSystemMessage]
  );

  //
  // -----------------------------
  // 2. ADD EVIDENCE
  // -----------------------------
  //

  const addEvidence = useCallback(
    async (type: string, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      setProcessing(true);
      pushSystemMessage('📄 Adding evidence…');

      try {
        const res = await fetch(`/api/brands/${slug}/onboarding/evidence`, {
          method: 'POST',
          body: JSON.stringify({ type, value: trimmed }),
        });

        const data = (await res.json()) as EvidenceSingleResponse;

        if (!res.ok || !data.success || !data.data) {
          const errMsg = data.error || 'Failed to add evidence';
          pushSystemMessage(`❌ Could not add evidence: ${errMsg}`);
          return;
        }

        setEvidence((prev) => [...prev, data.data]);
        pushSystemMessage('✅ Evidence received');
      } catch (err) {
        console.error('addEvidence error:', err);
        pushSystemMessage('❌ Could not add evidence');
      } finally {
        setProcessing(false);
      }
    },
    [slug, pushSystemMessage]
  );

  //
  // -----------------------------
  // 3. REMOVE EVIDENCE
  // -----------------------------
  //

  const removeEvidence = useCallback(
    async (id: string) => {
      if (!id) return;

      setProcessing(true);
      pushSystemMessage('🗑️ Removing evidence…');

      try {
        const url = new URL(
          `/api/brands/${slug}/onboarding/evidence`,
          window.location.origin
        );
        url.searchParams.set('id', id);

        const res = await fetch(url.toString(), {
          method: 'DELETE',
        });

        const data = (await res.json()) as {
          success: boolean;
          error?: string;
        };

        if (!res.ok || !data.success) {
          const errMsg = data.error || 'Failed to delete evidence';
          pushSystemMessage(`❌ Could not delete evidence: ${errMsg}`);
          return;
        }

        setEvidence((prev) => prev.filter((item) => item.id !== id));
        pushSystemMessage('✅ Evidence removed');
      } catch (error) {
        console.error('removeEvidence error:', error);
        pushSystemMessage('❌ Could not delete evidence');
      } finally {
        setProcessing(false);
      }
    },
    [slug, pushSystemMessage]
  );

  //
  // -----------------------------
  // 4. START ANALYSIS
  // -----------------------------
  //

  const startAnalysis = useCallback(
    async (options?: { brandNameOnly?: boolean }) => {
      setProcessing(true);
      setAnalysisProgress([]);
      pushSystemMessage('🔎 Starting brand analysis…');

      // Move to analyzing step locally
      setStep('analyzing');

      try {
        // For UX: immediately show progress stages
        setAnalysisProgress([...ANALYSIS_STEPS]);

        const res = await fetch(`/api/brands/${slug}/onboarding/analyze`, {
          method: 'POST',
          body: JSON.stringify(options ?? {}),
        });

        const data = (await res.json()) as AnalyzeResponse;

        if (!res.ok || !data.success) {
          const errMsg =
            data.error ||
            'Analysis failed. Please check your evidence or try again.';
          pushSystemMessage(`⚠️ ${errMsg}`);

          // Move back to waiting state
          setStep('waiting_for_analysis');
          return;
        }

        // After analysis completes, refresh BrandBrain from DB
        await refreshBrandBrain();

        pushSystemMessage('🧠 Brand Brain has been generated!');
        setStep('reviewing_brand_brain');
      } catch (err) {
        console.error('startAnalysis error:', err);
        pushSystemMessage('❌ Analysis failed. Please try again.');
        setStep('waiting_for_analysis');
      } finally {
        setProcessing(false);
        setAnalysisProgress([]);
      }
    },
    [slug, refreshBrandBrain, pushSystemMessage]
  );

  //
  // -----------------------------
  // 5. RESET ANALYSIS
  // -----------------------------
  //

  const resetAnalysis = useCallback(async () => {
    setProcessing(true);
    pushSystemMessage('🔄 Resetting analysis…');

    try {
      const res = await fetch(
        `/api/brands/${slug}/onboarding/analyze/reset`,
        {
          method: 'POST',
        }
      );

      const data = (await res.json()) as {
        success: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        const errMsg = data.error || 'Failed to reset analysis';
        pushSystemMessage(`❌ Could not reset analysis: ${errMsg}`);
        return;
      }

      pushSystemMessage('✔️ Analysis reset successfully');
      setStep('collecting_evidence');
      setAnalysisProgress([]);
    } catch (err) {
      console.error('resetAnalysis error:', err);
      pushSystemMessage('❌ Could not reset analysis');
    } finally {
      setProcessing(false);
    }
  }, [slug, pushSystemMessage]);

  //
  // -----------------------------
  // 6. UPDATE STEP (persisted)
// -----------------------------
  //

  const updateStep = useCallback(
    async (newStep: OnboardingStep) => {
      // Local optimistic update
      setStep(newStep);

      try {
        const res = await fetch(
          `/api/brands/${slug}/onboarding/state`,
          {
            method: 'PATCH',
            body: JSON.stringify({ step: newStep }),
          }
        );

        const data = (await res.json()) as OnboardingStateResponse;

        if (!res.ok || !data.success || !data.data) {
          const errMsg = data.error || 'Failed to update onboarding step';
          pushSystemMessage(`⚠️ Could not save step: ${errMsg}`);
          return;
        }

        // Sync step with server response (string step)
        setStep(data.data.step);
      } catch (error) {
        console.error('updateStep error:', error);
        pushSystemMessage('⚠️ Could not sync onboarding step.');
      }
    },
    [slug, pushSystemMessage]
  );

  //
  // -----------------------------
  // 7. UPDATE BRAND BRAIN
  // -----------------------------
  //

  const updateBrandBrain = useCallback(
    async (updates: Partial<BrandBrainData>) => {
      if (!updates || Object.keys(updates).length === 0) return;

      setProcessing(true);
      pushSystemMessage('✏️ Updating Brand Brain…');

      try {
        const res = await fetch(`/api/brands/${slug}/onboarding/brain`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });

        const data = (await res.json()) as BrainPatchResponse;

        if (!res.ok || !data.success || !data.data) {
          const errMsg = data.error || 'Failed to update Brand Brain';
          pushSystemMessage(`❌ Could not update Brand Brain: ${errMsg}`);
          return;
        }

        setBrandBrain(data.data);
        pushSystemMessage('✔️ Brand Brain updated');
      } catch (err) {
        console.error('updateBrandBrain error:', err);
        pushSystemMessage('❌ Could not update Brand Brain');
      } finally {
        setProcessing(false);
      }
    },
    [slug, pushSystemMessage]
  );

  //
  // -----------------------------
  // 8. COMPLETE ONBOARDING
  // -----------------------------
  //

  const completeOnboarding = useCallback(async () => {
    setProcessing(true);
    pushSystemMessage('🎉 Completing onboarding…');

    try {
      const res = await fetch(`/api/brands/${slug}/onboarding/brain`, {
        method: 'POST',
      });

      const data = (await res.json()) as BrainCompleteResponse;

      if (!res.ok || !data.success || !data.data) {
        const errMsg = data.error || 'Failed to complete onboarding';
        pushSystemMessage(`❌ Could not complete onboarding: ${errMsg}`);
        return;
      }

      setBrandBrain(data.data.brain);
      pushSystemMessage('🎊 Onboarding complete! Your Brand Brain is live.');
      setStep('complete');
    } catch (err) {
      console.error('completeOnboarding error:', err);
      pushSystemMessage('❌ Could not complete onboarding');
    } finally {
      setProcessing(false);
    }
  }, [slug, pushSystemMessage]);

  //
  // -----------------------------
  // Initial sync (optional)
  // -----------------------------
  //

  useEffect(() => {
    // If initial brain missing but backend has one, you could call refreshBrandBrain() here.
    // For now, we trust the server-provided initialBrain.
  }, [refreshBrandBrain]);

  //
  // -----------------------------
  // Provider Value
  // -----------------------------
  //

  const value: OnboardingState = {
    step,
    evidence,
    brandBrain,
    messages,
    isThinking,
    isProcessing,
    analysisProgress,

    sendChatMessage,
    addEvidence,
    removeEvidence,
    startAnalysis,
    resetAnalysis,
    updateStep,
    updateBrandBrain,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
