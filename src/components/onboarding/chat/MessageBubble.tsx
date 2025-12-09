'use client';

import React, { ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/components/onboarding/OnboardingStateManager';
import type { ChatMessage } from '@/components/onboarding/OnboardingStateManager';

type ActionVariant = 'primary' | 'secondary' | 'ghost';

interface ParsedAction {
  id: string;
  label: string;
  actionType: string;
  variant: ActionVariant;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { startAnalysis, completeOnboarding, updateStep } = useOnboarding();

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isAssistant = message.role === 'assistant';

  const { text, actions } = useMemo(
    () => parseMessageContent(message.content),
    [message.content]
  );

  const handleActionClick = async (action: ParsedAction) => {
    // System-driven actions. This keeps UI dumb and StateManager in charge.
    switch (action.actionType) {
      case 'start-analysis':
        await startAnalysis();
        break;
      case 'start-analysis-brand-name':
        await startAnalysis({ brandNameOnly: true });
        break;
      case 'complete-onboarding':
        await completeOnboarding();
        break;
      case 'go-to-evidence':
        await updateStep('collecting_evidence');
        break;
      case 'go-to-review':
        await updateStep('reviewing_brand_brain');
        break;
      default:
        // Unknown action type – no-op for now
        // Could push a system message later if needed
        break;
    }
  };

  const alignmentClass = isUser ? 'justify-end' : 'justify-start';
  const bubbleAlignClass = isUser ? 'items-end' : 'items-start';

  let bubbleClass =
    'max-w-[80%] rounded-xl px-3 py-2 text-sm border shadow-sm';

  if (isSystem) {
    bubbleClass +=
      ' bg-[rgb(var(--os-accent-soft))] text-[rgb(var(--foreground))] border-[rgb(var(--os-accent))]';
  } else if (isAssistant) {
    bubbleClass +=
      ' bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] border-[rgb(var(--border))]';
  } else {
    // user
    bubbleClass += ' bg-[rgb(var(--os-accent))] text-white border-[rgb(var(--os-accent))]';
  }

  return (
    <div className={`w-full flex ${alignmentClass}`}>
      <div className={`flex flex-col gap-1 ${bubbleAlignClass}`}>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={bubbleClass}
        >
          <MessageText text={text} />
        </motion.div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleActionClick(action)}
                className={actionButtonClass(action.variant)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageText({ text }: { text: string }) {
  // Simple paragraph splitting
  const parts = text.split('\n').filter((line) => line.trim().length > 0);

  if (parts.length <= 1) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div className="space-y-1">
      {parts.map((line, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {line}
        </p>
      ))}
    </div>
  );
}

/**
 * Parse content for [ACTION:label:type:variant] tokens.
 * Example: "Ready? [ACTION:Start analysis:start-analysis:primary]"
 */
function parseMessageContent(content: string): { text: string; actions: ParsedAction[] } {
  const actionRegex = /\[ACTION:([^:]+):([^:]+):([^\]]+)\]/g;
  const actions: ParsedAction[] = [];
  let text = content;

  let match: RegExpExecArray | null;
  while ((match = actionRegex.exec(content)) !== null) {
    const [, label, actionType, variantRaw] = match;
    actions.push({
      id: `${actionType}-${match.index}`,
      label: label.trim(),
      actionType: actionType.trim(),
      variant: (variantRaw.trim() as ActionVariant) || 'primary',
    });

    // Remove the token from visible text
    text = text.replace(match[0], '').trim();
  }

  return { text, actions };
}

function actionButtonClass(variant: ActionVariant): string {
  const base =
    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border';

  if (variant === 'primary') {
    return (
      base +
      ' bg-[rgb(var(--os-accent))] text-white border-[rgb(var(--os-accent))] hover:bg-[rgb(var(--os-accent)/0.9)]'
    );
  }

  if (variant === 'secondary') {
    return (
      base +
      ' bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary)/0.9)]'
    );
  }

  // ghost
  return (
    base +
    ' bg-transparent text-[rgb(var(--muted-foreground))] border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary)/0.5)]'
  );
}
