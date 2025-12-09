'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, Loader2 } from 'lucide-react';

import { useOnboarding } from '@/components/onboarding/OnboardingStateManager';
import { OnboardingStep } from '@/types/onboarding';
import { SystemProcessingIndicator } from '../SystemProcessingIndicator';
import { ChatMessageList } from './ChatMessageList';
import { AIThinkingIndicator } from '../AiThinkingIndicator';
import { ChatInput } from './ChatInput';


const stepLabels: Record<OnboardingStep, string> = {
  intro: 'Introduction',
  collecting_evidence: 'Collecting Evidence',
  waiting_for_analysis: 'Ready for Analysis',
  analyzing: 'Analyzing Brand',
  reviewing_brand_brain: 'Reviewing Brand Brain',
  complete: 'Onboarding Complete',
};

const stepDescriptions: Record<OnboardingStep, string> = {
  intro: 'Tell Brainiark about your brand so we can get started.',
  collecting_evidence: 'Share websites, social links, and docs about your brand.',
  waiting_for_analysis: 'Everything is ready. You can start the analysis when you’re ready.',
  analyzing: 'AI is researching and building your Brand Brain.',
  reviewing_brand_brain: 'Review and polish your Brand Brain sections.',
  complete: 'Your Brand Brain is live and powering your workspace.',
};

interface ChatPanelProps {
  className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
  const {
    step,
    messages,
    isThinking,
    isProcessing,
    analysisProgress,
    sendChatMessage,
  } = useOnboarding();

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] backdrop-blur-sm h-full ${className ?? ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--card)/0.8)]">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-[rgb(var(--card))]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wide">
              Brainiark Onboarding
            </p>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[rgb(var(--foreground))]">
                {stepLabels[step]}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] border border-[rgb(var(--border))]">
                Guided · AI
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isProcessing && <SystemProcessingIndicator />}
          {isThinking && (
            <div className="flex items-center gap-1 text-[rgb(var(--muted-foreground))] text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>AI thinking…</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-header / step description */}
      <div className="px-4 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--secondary)/0.6)]">
        <p className="text-xs text-[rgb(var(--muted-foreground))] flex items-center gap-1.5">
          <MessageCircle className="w-3 h-3 text-[rgb(var(--os-accent))]" />
          {stepDescriptions[step]}
        </p>
      </div>

      {/* Messages + progress */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Analysis progress (during analyzing) */}
        {step === 'analyzing' && analysisProgress.length > 0 && (
          <div className="px-4 pt-3 pb-1 border-b border-[rgb(var(--border))] bg-[rgb(var(--card)/0.8)]">
            <p className="text-[11px] font-medium text-[rgb(var(--muted-foreground))] mb-1">
              Analysis in progress
            </p>
            <ul className="space-y-1">
              {analysisProgress.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[11px] text-[rgb(var(--muted-foreground))]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--os-accent))]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Message list */}
        <div className="flex-1 min-h-0">
          <ChatMessageList messages={messages} isStreaming={isThinking} />
        </div>

        {/* AI thinking indicator in message area */}
        {isThinking && <AIThinkingIndicator />}

        {/* Input */}
        <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--card))]">
          <ChatInput
            disabled={isThinking || step === 'complete'}
            onSend={sendChatMessage}
          />
        </div>
      </div>
    </motion.section>
  );
}
