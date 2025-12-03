// /src/hooks/useTerminalMessages.ts
import { useState, useCallback, useRef } from 'react';

export type TerminalMessageType = 'system' | 'action' | 'insight' | 'thinking';

export interface TerminalMessage {
  id: string;
  text: string;
  type: TerminalMessageType;
  timestamp: number;
}

export const useTerminalMessages = (maxLines = 200) => {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const idCounter = useRef(0);

  const pushMessage = useCallback((
    text: string,
    type: TerminalMessageType = 'system'
  ) => {
    const id = `msg-${Date.now()}-${idCounter.current++}`;
    const newMessage: TerminalMessage = {
      id,
      text,
      type,
      timestamp: Date.now(),
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      return updated.slice(-maxLines);
    });

    return id;
  }, [maxLines]);

  const pushSystemMessage = useCallback((text: string) => 
    pushMessage(text, 'system'), [pushMessage]);
  
  const pushActionMessage = useCallback((text: string) => 
    pushMessage(text, 'action'), [pushMessage]);
  
  const pushInsightMessage = useCallback((text: string) => 
    pushMessage(text, 'insight'), [pushMessage]);
  
  const pushThinkingMessage = useCallback((text: string) => 
    pushMessage(text, 'thinking'), [pushMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    pushMessage,
    pushSystemMessage,
    pushActionMessage,
    pushInsightMessage,
    pushThinkingMessage,
    clearMessages,
  };
};