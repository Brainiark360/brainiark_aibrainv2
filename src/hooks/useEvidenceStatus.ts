// /src/hooks/useEvidenceStatus.ts
import { useState, useCallback } from 'react';

export type EvidenceStatus = 'queued' | 'processing' | 'fused';

export const useEvidenceStatus = () => {
  const [statuses, setStatuses] = useState<Record<string, EvidenceStatus>>({});

  const setStatus = useCallback((id: string, status: EvidenceStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  }, []);

  const batchSetStatus = useCallback((ids: string[], status: EvidenceStatus) => {
    setStatuses(prev => {
      const newStatuses = { ...prev };
      ids.forEach(id => {
        newStatuses[id] = status;
      });
      return newStatuses;
    });
  }, []);

  return { statuses, setStatus, batchSetStatus };
};