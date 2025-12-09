// /hooks/useEvidenceManager.ts
'use client';

import { useCallback } from 'react';
import { useOnboarding } from '@/components/onboarding/OnboardingStateManager';
import { EvidenceType } from '@/types/onboarding';

export function useEvidenceManager() {
  const { addEvidence, deleteEvidence, refreshEvidence, evidence } = useOnboarding();

  const addNewEvidence = useCallback(async (type: EvidenceType, value: string) => {
    try {
      const result = await addEvidence(type, value);
      
      // Trigger chat notification
      // This could be done via a custom event or state update
      
      return result;
    } catch (error) {
      console.error('Evidence add failed:', error);
      throw error;
    }
  }, [addEvidence]);

  const removeEvidence = useCallback(async (id: string) => {
    try {
      await deleteEvidence(id);
    } catch (error) {
      console.error('Evidence delete failed:', error);
      throw error;
    }
  }, [deleteEvidence]);

  const reloadEvidence = useCallback(async () => {
    try {
      await refreshEvidence();
    } catch (error) {
      console.error('Evidence refresh failed:', error);
      throw error;
    }
  }, [refreshEvidence]);

  return {
    evidence,
    addEvidence: addNewEvidence,
    deleteEvidence: removeEvidence,
    refreshEvidence: reloadEvidence,
    evidenceCount: evidence.length,
    hasEvidence: evidence.length > 0,
  };
}