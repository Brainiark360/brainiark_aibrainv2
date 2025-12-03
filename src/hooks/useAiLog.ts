// /src/hooks/useAiLog.ts
import { useState, useCallback, useRef } from 'react';
import type { AiLogItem } from '@/components/onboarding/AiLogPanel';

export const useAiLog = () => {
  const [logs, setLogs] = useState<AiLogItem[]>([]);
  const logIdCounter = useRef(0);

  const pushLog = useCallback((
    type: AiLogItem['type'],
    message: string,
    details?: string,
    streamDelay = 0
  ) => {
    const id = `log-${Date.now()}-${logIdCounter.current++}`;
    const newLog: AiLogItem = {
      id,
      type,
      message,
      details,
      createdAt: Date.now(),
    };

    if (streamDelay > 0) {
      // Stream character-by-character for selected logs
      setTimeout(() => {
        setLogs(prev => [...prev, newLog]);
      }, streamDelay);
    } else {
      setLogs(prev => [...prev, newLog]);
    }

    return id;
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, pushLog, clearLogs };
};