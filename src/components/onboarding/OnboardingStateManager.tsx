// /components/onboarding/OnboardingStateManager.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { 
  OnboardingStep, 
  BrandBrainSection, 
  FrontendEvidenceItem, 
  FrontendBrandBrainData, 
  OnboardingEvent, 
  OnboardingState, 
  OnboardingContextType,
  EvidenceType,
  ChatMessage,
  ApiResponse
} from '@/types/onboarding';

interface OnboardingProviderProps {
  children: ReactNode;
}

// Initial state
const initialState: OnboardingState = {
  step: 'intro',
  brandBrain: null,
  evidence: [],
  activeSection: null,
  isLoading: false,
  error: null,
  chatMessages: [],
};

// Create context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Helper function to map evidence from backend to frontend format
function mapEvidenceToFrontend(backendEvidence: any[]): FrontendEvidenceItem[] {
  if (!backendEvidence || !Array.isArray(backendEvidence)) {
    return [];
  }
  
  return backendEvidence.map((item) => ({
    id: item._id || item.id || `evidence-${Date.now()}-${Math.random()}`,
    content: item.analyzedContent || item.value || '',
    type: mapEvidenceType(item.type),
    source: item.type || 'manual',
    createdAt: item.createdAt || new Date().toISOString(),
    metadata: {
      originalValue: item.value,
      status: item.status || 'pending',
      analyzedContent: item.analyzedContent,
    }
  }));
}

// Helper function to map evidence types
function mapEvidenceType(type: string): 'text' | 'image' | 'url' | 'file' {
  switch (type) {
    case 'website':
      return 'url';
    case 'document':
      return 'file';
    case 'social':
      return 'text';
    case 'manual':
      return 'text';
    default:
      return 'text';
  }
}

// Helper function to map brand brain from backend to frontend format
function mapBrandBrainToFrontend(backendBrain: any): FrontendBrandBrainData | null {
  if (!backendBrain) return null;
  
  return {
    _id: backendBrain._id?.toString() || backendBrain.id,
    summary: backendBrain.summary || '',
    audience: backendBrain.audience || '',
    tone: backendBrain.tone || '',
    pillars: backendBrain.pillars || [],
    recommendations: backendBrain.recommendations || [],
    offers: backendBrain.offers || '',
    competitors: backendBrain.competitors || [],
    channels: backendBrain.channels || [],
    status: backendBrain.status || 'not_started',
    isActivated: backendBrain.isActivated || false,
    onboardingStep: backendBrain.onboardingStep || 1,
    updatedAt: backendBrain.updatedAt || new Date().toISOString(),
    lastAnalyzedAt: backendBrain.lastAnalyzedAt,
  };
}

// Reducer function
function onboardingReducer(state: OnboardingState, action: OnboardingEvent): OnboardingState {
  switch (action.type) {
    case 'STEP_CHANGED':
      return {
        ...state,
        step: action.payload.step,
        activeSection: action.payload.step === 'reviewing_brand_brain' ? 'summary' : null,
      };
    
    case 'SHOW_SECTION':
      return {
        ...state,
        activeSection: action.payload.section,
      };
    
    case 'SECTION_UPDATED':
      return {
        ...state,
        isLoading: false,
      };
    
    case 'ADD_EVIDENCE':
      return {
        ...state,
        step: 'collecting_evidence',
      };
    
    case 'START_ANALYSIS':
      return {
        ...state,
        step: 'analyzing',
        activeSection: null,
      };
    
    case 'FINISH_REVIEW':
      return {
        ...state,
        step: 'complete',
        activeSection: null,
      };
    
    case 'EVIDENCE_UPDATED':
      return {
        ...state,
        evidence: action.payload.evidence,
      };
    
    case 'BRAND_BRAIN_UPDATED':
      return {
        ...state,
        brandBrain: action.payload.brandBrain,
      };
    
    case 'LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    
    case 'ERROR':
      return {
        ...state,
        error: action.payload.error,
      };
    
    case 'CHAT_MESSAGE_ADDED':
      return {
        ...state,
        chatMessages: [...(state.chatMessages || []), action.payload.message],
      };
    
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        step: 'complete',
      };
    
    default:
      return state;
  }
}

export function OnboardingStateManager({ children }: OnboardingProviderProps) {
  const params = useParams();
  const slug = params.slug as string;
  
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  
  // Helper function for API calls
  const apiCall = useCallback(async <T,>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API call error for ${endpoint}:`, error);
      throw error;
    }
  }, []);
  
  // Fetch onboarding state on mount
  const fetchOnboardingState = useCallback(async () => {
    try {
      dispatch({ type: 'LOADING', payload: { isLoading: true } });
      
      const response = await apiCall<{ step: OnboardingStep }>(
        `/api/brands/${slug}/onboarding/state`
      );
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'STEP_CHANGED', 
          payload: { step: response.data.step || 'intro' } 
        });
      }
    } catch (error) {
      console.error('Error fetching onboarding state:', error);
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to fetch onboarding state' } 
      });
    } finally {
      dispatch({ type: 'LOADING', payload: { isLoading: false } });
    }
  }, [slug, apiCall]);
  
  // Update onboarding step
  const updateStep = useCallback(async (step: OnboardingStep) => {
    try {
      dispatch({ type: 'LOADING', payload: { isLoading: true } });
      
      const response = await apiCall<{ step: OnboardingStep }>(
        `/api/brands/${slug}/onboarding/state`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step }),
        }
      );
      
      if (response.success) {
        dispatch({ type: 'STEP_CHANGED', payload: { step } });
      }
    } catch (error) {
      console.error('Error updating step:', error);
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to update step' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: { isLoading: false } });
    }
  }, [slug, apiCall]);
  
  // Fetch brand brain data
  const fetchBrandBrain = useCallback(async (): Promise<FrontendBrandBrainData | null> => {
    try {
      dispatch({ type: 'LOADING', payload: { isLoading: true } });
      
      const response = await apiCall<FrontendBrandBrainData>(
        `/api/brands/${slug}/onboarding/brain`
      );
      
      let brandBrain: FrontendBrandBrainData | null = null;
      
      if (response.success && response.data) {
        brandBrain = mapBrandBrainToFrontend(response.data);
      }
      
      dispatch({ 
        type: 'BRAND_BRAIN_UPDATED', 
        payload: { brandBrain } 
      });
      
      return brandBrain;
    } catch (error) {
      console.error('Error fetching brand brain:', error);
      
      // Check if it's a 404 (not created yet)
      if (error instanceof Error && error.message.includes('404')) {
        console.log('Brand brain not created yet, returning null');
        return null;
      }
      
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to fetch brand brain' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: { isLoading: false } });
    }
  }, [slug, apiCall]);
  
  // Update brand brain
  const updateBrandBrain = useCallback(async (updates: Partial<FrontendBrandBrainData>) => {
    try {
      dispatch({ type: 'LOADING', payload: { isLoading: true } });
      
      const response = await apiCall<FrontendBrandBrainData>(
        `/api/brands/${slug}/onboarding/brain`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );
      
      if (response.success && response.data) {
        const brandBrain = mapBrandBrainToFrontend(response.data);
        dispatch({ 
          type: 'BRAND_BRAIN_UPDATED', 
          payload: { brandBrain } 
        });
      }
    } catch (error) {
      console.error('Error updating brand brain:', error);
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to update brand brain' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: { isLoading: false } });
    }
  }, [slug, apiCall]);
  
  // Start analysis
  const startAnalysis = useCallback(async () => {
    try {
      dispatch({ type: 'LOADING', payload: { isLoading: true } });
      
      const response = await apiCall(
        `/api/brands/${slug}/onboarding/analyze`,
        {
          method: 'POST',
        }
      );
      
      if (response.success) {
        // Update step to analyzing
        dispatch({ type: 'START_ANALYSIS' });
        
        // Poll for analysis completion
        const pollAnalysisStatus = async (): Promise<void> => {
          try {
            const statusResponse = await apiCall<any>(
              `/api/brands/${slug}/onboarding/analyze`
            );
            
            if (statusResponse.success && statusResponse.data?.isReady) {
              // Analysis complete, fetch the brand brain
              await fetchBrandBrain();
              // Update step to reviewing
              await updateStep('reviewing_brand_brain');
            } else {
              // Not ready yet, poll again after delay
              setTimeout(pollAnalysisStatus, 2000);
            }
          } catch (pollError) {
            console.error('Error polling analysis status:', pollError);
            // On error, assume analysis failed and go back to collecting evidence
            await updateStep('collecting_evidence');
          }
        };
        
        // Start polling
        setTimeout(pollAnalysisStatus, 3000);
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to start analysis' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: { isLoading: false } });
    }
  }, [slug, apiCall, fetchBrandBrain, updateStep]);
  
  // Refresh evidence
  const refreshEvidence = useCallback(async (): Promise<FrontendEvidenceItem[]> => {
    try {
      dispatch({ type: 'LOADING', payload: { isLoading: true } });
      
      const response = await apiCall<any[]>(
        `/api/brands/${slug}/onboarding/evidence`
      );
      
      let evidence: FrontendEvidenceItem[] = [];
      
      if (response.success && response.data) {
        evidence = mapEvidenceToFrontend(response.data);
      }
      
      dispatch({ 
        type: 'EVIDENCE_UPDATED', 
        payload: { evidence } 
      });
      
      return evidence;
    } catch (error) {
      console.error('Error refreshing evidence:', error);
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to refresh evidence' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: { isLoading: false } });
    }
  }, [slug, apiCall]);
  
  // Add evidence
  const addEvidence = useCallback(async (type: EvidenceType, value: string): Promise<FrontendEvidenceItem> => {
    try {
      dispatch({ type: 'LOADING', payload: { isLoading: true } });
      
      const response = await apiCall<any>(
        `/api/brands/${slug}/onboarding/evidence`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, value }),
        }
      );
      
      if (response.success && response.data) {
        const newEvidence = mapEvidenceToFrontend([response.data])[0];
        
        // Refresh the full evidence list
        await refreshEvidence();
        
        // Update step to collecting evidence if not already
        if (state.step !== 'collecting_evidence') {
          dispatch({ type: 'ADD_EVIDENCE' });
        }
        
        return newEvidence;
      }
      
      throw new Error('Failed to add evidence: No data returned');
    } catch (error) {
      console.error('Error adding evidence:', error);
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to add evidence' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: { isLoading: false } });
    }
  }, [slug, apiCall, refreshEvidence, state.step]);
  
  // Delete evidence
  const deleteEvidence = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'LOADING', payload: { isLoading: true } });
      
      const response = await apiCall(
        `/api/brands/${slug}/onboarding/evidence?id=${id}`,
        { method: 'DELETE' }
      );
      
      if (response.success) {
        // Refresh the evidence list
        await refreshEvidence();
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to delete evidence' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: { isLoading: false } });
    }
  }, [slug, apiCall, refreshEvidence]);
  
  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      dispatch({ type: 'LOADING', payload: { isLoading: true } });
      
      const response = await apiCall(
        `/api/brands/${slug}/onboarding/brain`,
        { method: 'POST' }
      );
      
      if (response.success) {
        dispatch({ type: 'COMPLETE_ONBOARDING' });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Failed to complete onboarding' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: { isLoading: false } });
    }
  }, [slug, apiCall]);
  
  // Send chat message (streaming will be implemented in Phase 2)
  const sendChatMessage = useCallback(async (message: string) => {
    try {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      dispatch({ type: 'CHAT_MESSAGE_ADDED', payload: { message: userMessage } });

      // Create AI message with loading state
      const aiMessageId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };

      dispatch({ type: 'CHAT_MESSAGE_ADDED', payload: { message: aiMessage } });

      // Send streaming request to backend
      const response = await fetch(`/api/brands/${slug}/onboarding/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          step: state.step,
          context: {
            brandBrain: state.brandBrain,
            evidence: state.evidence,
            activeSection: state.activeSection,
          }
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Chat failed: ${response.statusText}`);
      }

      // Set up streaming reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let isFirstChunk = true;

      // Function to update the AI message content
      const updateAIMessage = (newContent: string) => {
        dispatch({
          type: 'CHAT_MESSAGE_ADDED',
          payload: {
            message: {
              id: aiMessageId,
              role: 'assistant',
              content: newContent,
              timestamp: new Date(),
              isLoading: false,
            },
          },
        });
      };

      try {
        // Process the stream
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Stream complete
            break;
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
          
          // Update message with current content
          if (isFirstChunk) {
            isFirstChunk = false;
            // Remove loading indicator on first chunk
            updateAIMessage(accumulatedContent);
          } else {
            updateAIMessage(accumulatedContent);
          }

          // Extract and handle actions from AI response
          // The AI might embed action markers like [ACTION:button_label:action_type]
          if (accumulatedContent.includes('[ACTION:')) {
            const actionMatches = accumulatedContent.match(/\[ACTION:([^:]+):([^\]]+)\]/g);
            if (actionMatches) {
              // Extract actions for potential UI buttons
              // For now, we'll just log them - the UI can parse them later
              console.log('AI actions detected:', actionMatches);
            }
          }
        }

        // Final update to ensure complete message
        updateAIMessage(accumulatedContent.trim());

      } catch (streamError) {
        console.error('Stream reading error:', streamError);
        
        // Update with error message
        dispatch({
          type: 'CHAT_MESSAGE_ADDED',
          payload: {
            message: {
              id: aiMessageId,
              role: 'assistant',
              content: 'Sorry, I encountered an error while processing your message. Please try again.',
              timestamp: new Date(),
              isLoading: false,
            },
          },
        });
        
        throw streamError;
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('Error sending chat message:', error);
      
      // Create error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error 
          ? `I'm having trouble connecting right now: ${error.message}. Please try again in a moment.`
          : 'Network error. Please check your connection and try again.',
        timestamp: new Date(),
        isLoading: false,
      };
      
      dispatch({ type: 'CHAT_MESSAGE_ADDED', payload: { message: errorMessage } });
      
      dispatch({ 
        type: 'ERROR', 
        payload: { 
          error: error instanceof Error 
            ? `Chat error: ${error.message}` 
            : 'Failed to send chat message' 
        } 
      });
      
      throw error;
    }
  }, [slug, state.step, state.brandBrain, state.evidence, state.activeSection, dispatch]);
  
  // Event dispatcher with side effects
  const handleDispatch = useCallback(async (event: OnboardingEvent) => {
    try {
      switch (event.type) {
        case 'ADD_EVIDENCE':
          dispatch(event);
          await updateStep('collecting_evidence');
          break;
          
        case 'START_ANALYSIS':
          await startAnalysis();
          break;
          
        case 'SHOW_SECTION':
          dispatch(event);
          break;
          
        case 'REFINE_SECTION':
          if (event.payload) {
            // Call refinement endpoint
            const response = await fetch(`/api/brands/${slug}/brain/refine`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                section: event.payload.section,
                content: event.payload.content,
              }),
            });
            
            if (response.ok) {
              await fetchBrandBrain();
              dispatch({ type: 'SECTION_UPDATED' });
            }
          }
          break;
          
        case 'FINISH_REVIEW':
          await completeOnboarding();
          break;
          
        default:
          dispatch(event);
      }
    } catch (error) {
      console.error('Error handling event:', error);
      dispatch({ 
        type: 'ERROR', 
        payload: { error: error instanceof Error ? error.message : 'Error handling event' } 
      });
    }
  }, [slug, updateStep, startAnalysis, fetchBrandBrain, completeOnboarding]);
  
  // Initialize - fetch initial state
  useEffect(() => {
    if (slug) {
      const init = async () => {
        try {
          dispatch({ type: 'LOADING', payload: { isLoading: true } });
          
          // Fetch state, evidence, and brand brain in parallel
          await Promise.allSettled([
            fetchOnboardingState(),
            refreshEvidence(),
            fetchBrandBrain(),
          ]);
        } catch (error) {
          console.error('Initialization error:', error);
        } finally {
          dispatch({ type: 'LOADING', payload: { isLoading: false } });
        }
      };
      
      init();
    }
  }, [slug, fetchOnboardingState, refreshEvidence, fetchBrandBrain]);
  
  // Context value
  const contextValue: OnboardingContextType = {
    // State
    step: state.step,
    brandBrain: state.brandBrain,
    evidence: state.evidence,
    activeSection: state.activeSection,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    updateStep,
    fetchBrandBrain,
    refreshEvidence,
    dispatch: handleDispatch,
    startAnalysis,
    updateBrandBrain,
    completeOnboarding,
    addEvidence,
    deleteEvidence,
    sendChatMessage,
  };
  
  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook for using the context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingStateManager');
  }
  return context;
}