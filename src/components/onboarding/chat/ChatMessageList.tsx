'use client';

import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/components/onboarding/OnboardingStateManager';
import { MessageBubble } from './MessageBubble';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function ChatMessageList({ messages, isStreaming }: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change or streaming updates
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isStreaming]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin bg-[rgb(var(--os-surface))]"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-10 text-[rgb(var(--muted-foreground))] text-xs">
          <p className="mb-1">Welcome to Brainiark onboarding.</p>
          <p>Tell me about your brand or paste a link to your website.</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
