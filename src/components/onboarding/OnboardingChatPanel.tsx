// In /components/onboarding/OnboardingChatPanel.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { 
  Send, Paperclip, Smile, Sparkles, 
  Brain, Zap, CheckCircle, Loader2 
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useOnboarding } from './OnboardingStateManager';
import { ChatMessage as ChatMessageType, OnboardingStep } from '@/types/onboarding';

interface ChatMessageUI {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    type: string;
    label: string;
    action: () => Promise<void> | void;
    variant?: 'primary' | 'secondary' | 'ghost';
  }>;
  isTyping?: boolean;
  isLoading?: boolean;
}

interface OnboardingChatPanelProps {
  currentStep: 'intro' | 'collecting_evidence' | 'waiting_for_analysis' | 'analyzing' | 'reviewing_brand_brain' | 'complete';
  onStepUpdate: (step: typeof currentStep) => Promise<void>;
}

export default function OnboardingChatPanel({ 
  currentStep, 
  onStepUpdate 
}: OnboardingChatPanelProps) {
  const params = useParams();
  const brandSlug = params.slug as string;
  
  const { sendChatMessage, chatMessages, step } = useOnboarding();
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uiMessages, setUiMessages] = useState<ChatMessageUI[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to your new brand workspace! I'm Brainiark AI, your brand strategy assistant. Let's work together to build your Brand Brain. First — tell me a bit about your brand. You can share your website URL, describe your brand in your own words, or upload any materials you'd like me to analyze.`,
      timestamp: new Date(),
      actions: [
        {
          type: 'start-description',
          label: 'Describe my brand',
          action: () => handleAction('start-description'),
          variant: 'primary'
        },
        {
          type: 'add-website',
          label: 'Add website',
          action: () => handleAction('add-website'),
          variant: 'secondary'
        },
        {
          type: 'upload-files',
          label: 'Upload files',
          action: () => handleAction('upload-files'),
          variant: 'ghost'
        }
      ]
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Replace the entire useEffect for converting chat messages with this:
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      // Convert global chat messages to UI format
      const convertedMessages: ChatMessageUI[] = chatMessages.map(msg => {
        // Convert to UI format with actions if needed
        const uiMessage: ChatMessageUI = {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          isTyping: msg.isLoading || false,
          isLoading: msg.isLoading || false,
        };
        
        // Only add actions to non-loading assistant messages
        if (msg.role === 'assistant' && !msg.isLoading && msg.content) {
          // Parse actions from content or use step-based actions
          const actions = parseAIResponse(msg.content);
          if (actions && actions.length > 0) {
            uiMessage.actions = actions;
          }
        }
        
        return uiMessage;
      });
      
      setUiMessages(convertedMessages);
    }
  }, [chatMessages]);
    
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uiMessages]);
  
  // Initialize chat based on current step
  useEffect(() => {
    initializeChatForStep();
  }, [currentStep]);
  
  const initializeChatForStep = async () => {
    // If we're in a new step and need to add AI messages
    if (uiMessages.length <= 1) {
      await addAIMessageForStep(currentStep);
    }
  };
  
  const addAIMessageForStep = async (step: typeof currentStep) => {
    setIsTyping(true);
    
    // Create step-specific AI messages
    let newMessage: ChatMessageUI | null = null;
    
    switch (step) {
      case 'intro':
        // Initial message already set
        break;
        
      case 'collecting_evidence':
        newMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Great! I can analyze various materials to understand your brand better. You can add:',
          timestamp: new Date(),
          actions: [
            {
              type: 'add-website',
              label: '🌐 Website URL',
              action: () => handleAction('add-website'),
              variant: 'secondary'
            },
            {
              type: 'add-social',
              label: '📱 Social profiles',
              action: () => handleAction('add-social'),
              variant: 'secondary'
            },
            {
              type: 'upload-documents',
              label: '📄 Documents',
              action: () => handleAction('upload-documents'),
              variant: 'secondary'
            },
            {
              type: 'skip-evidence',
              label: 'Skip for now',
              action: () => handleAction('skip-evidence'),
              variant: 'ghost'
            }
          ]
        };
        break;
        
      case 'waiting_for_analysis':
        newMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Perfect! I have your materials ready. Would you like me to start analyzing them now to build your Brand Brain?',
          timestamp: new Date(),
          actions: [
            {
              type: 'start-analysis',
              label: 'Yes, analyze now',
              action: () => handleAction('start-analysis'),
              variant: 'primary'
            },
            {
              type: 'add-more-evidence',
              label: 'Add more materials',
              action: () => handleAction('add-more-evidence'),
              variant: 'secondary'
            }
          ]
        };
        break;
        
      case 'reviewing_brand_brain':
        newMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'I\'ve analyzed your brand and drafted your Brand Brain with key insights. Want to review them section by section?',
          timestamp: new Date(),
          actions: [
            {
              type: 'show-summary',
              label: 'Show Summary',
              action: () => handleAction('show-summary'),
              variant: 'secondary'
            },
            {
              type: 'show-audience',
              label: 'Show Audience',
              action: () => handleAction('show-audience'),
              variant: 'secondary'
            },
            {
              type: 'show-tone',
              label: 'Show Tone',
              action: () => handleAction('show-tone'),
              variant: 'secondary'
            },
            {
              type: 'show-pillars',
              label: 'Show Pillars',
              action: () => handleAction('show-pillars'),
              variant: 'secondary'
            }
          ]
        };
        break;
    }
    
    if (newMessage) {
      setUiMessages(prev => [...prev, newMessage!]);
    }
    
    setIsTyping(false);
  };
  
 
  const handleAction = async (actionType: string) => {
    console.log('Action triggered:', actionType);
    
    // Map action types to user messages AND step updates
    const actionConfigs: Record<string, { message: string; step?: OnboardingStep; handler?: () => Promise<void> }> = {
      'start-description': { 
        message: 'I want to describe my brand',
        handler: async () => {
          // Send chat message
          await handleSendMessage('I want to describe my brand');
          // After describing, move to evidence collection
          setTimeout(() => {
            onStepUpdate('collecting_evidence');
          }, 1500);
        }
      },
      'add-website': { 
        message: 'Add website URL',
        step: 'collecting_evidence'
      },
      'upload-files': { 
        message: 'Upload files',
        step: 'collecting_evidence'
      },
      'add-social': { 
        message: 'Add social profiles',
        step: 'collecting_evidence'
      },
      'upload-documents': { 
        message: 'Upload documents',
        step: 'collecting_evidence'
      },
      'skip-evidence': { 
        message: 'Skip evidence for now',
        handler: async () => {
          await handleSendMessage('Skip evidence for now');
          // Skip to waiting for analysis
          setTimeout(() => {
            onStepUpdate('waiting_for_analysis');
          }, 1000);
        }
      },
      'start-analysis': { 
        message: 'Start analysis now',
        handler: async () => {
          await handleSendMessage('Start analysis now');
          // Move to analyzing step
          setTimeout(() => {
            onStepUpdate('analyzing');
          }, 1000);
        }
      },
      'add-more-evidence': { 
        message: 'Add more materials',
        step: 'collecting_evidence'
      },
      'show-summary': { 
        message: 'Show Summary section',
        handler: async () => {
          // This should trigger the right panel to show summary
          // We'll handle this through the state manager
          await handleSendMessage('Show me the brand summary');
        }
      },
      'show-audience': { 
        message: 'Show Audience section',
        handler: async () => {
          await handleSendMessage('Show me the target audience');
        }
      },
      'show-tone': { 
        message: 'Show Tone section',
        handler: async () => {
          await handleSendMessage('Show me the brand tone');
        }
      },
      'show-pillars': { 
        message: 'Show Pillars section',
        handler: async () => {
          await handleSendMessage('Show me the content pillars');
        }
      },
    };

    const config = actionConfigs[actionType];
    if (!config) return;

    // Execute handler if provided
    if (config.handler) {
      await config.handler();
    } else {
      // Just send the message
      await handleSendMessage(config.message);
      
      // Update step if specified
      if (config.step && config.step !== currentStep) {
        await onStepUpdate(config.step);
      }
    }
  };

  // Also update the handleSendMessage to be more aware of onboarding flow:
  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputValue;
    
    if (!messageToSend.trim() || isLoading) return;
    
    if (!customMessage) {
      setInputValue('');
    }
    
    setIsLoading(true);
    
    try {
      // Send the message using the state manager
      await sendChatMessage(messageToSend);
      
      // Check if we should auto-progress based on message content
      const messageLower = messageToSend.toLowerCase();
      
      // Auto-detect evidence mentions
      if (currentStep === 'intro' && 
          (messageLower.includes('website') || 
          messageLower.includes('http') ||
          messageLower.includes('.com') ||
          messageLower.includes('social') ||
          messageLower.includes('document') ||
          messageLower.includes('pdf') ||
          messageLower.includes('file'))) {
        // User mentioned evidence, move to evidence collection
        setTimeout(async () => {
          await onStepUpdate('collecting_evidence');
        }, 1000);
      }
      
      // Auto-detect analysis readiness
      if (currentStep === 'collecting_evidence' && 
          (messageLower.includes('analyze') || 
          messageLower.includes('ready') ||
          messageLower.includes('go ahead') ||
          messageLower.includes('proceed'))) {
        // User wants to analyze, move to analysis
        setTimeout(async () => {
          await onStepUpdate('waiting_for_analysis');
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to parse AI responses for actions
  const parseAIResponse = (content: string): ChatMessageUI['actions'] => {
    // Look for action patterns in the AI response
    // Format: [ACTION:label:type:variant] or just [ACTION:label:type]
    const actionRegex = /\[ACTION:([^:]+):([^:\]]+)(?::([^\]]+))?\]/g;
    const matches = [...content.matchAll(actionRegex)];
    
    if (matches.length === 0) return undefined;
    
    return matches.map(match => {
      const [, label, type, variant = 'secondary'] = match;
      
      return {
        type,
        label,
        action: () => handleAction(type),
        variant: variant as 'primary' | 'secondary' | 'ghost',
      };
    });
  };
  
  return (
    <div className="flex flex-col h-[600px] card-base border border-[rgb(var(--border))] overflow-hidden">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b border-[rgb(var(--border))] bg-gradient-to-r from-[rgb(var(--os-accent-soft))] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[rgb(var(--foreground))]">
              Brainiark AI Assistant
            </h3>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Interactive brand strategy onboarding
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              {isLoading ? 'Thinking...' : 'Active'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        <AnimatePresence initial={false}>
          {uiMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className={cn(
                'flex-1 space-y-2 max-w-[80%]',
                message.role === 'user' ? 'items-end' : ''
              )}>
                <div className={cn(
                  'p-3 rounded-2xl transition-all',
                  message.role === 'user'
                    ? 'bg-[rgb(var(--os-accent))] text-white ml-auto rounded-br-none'
                    : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-bl-none',
                  message.isLoading ? 'opacity-80' : ''
                )}>
                  {message.isLoading && !message.content ? (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse delay-150" />
                      <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse delay-300" />
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Timestamp */}
                      <div className={cn(
                        'text-xs mt-2',
                        message.role === 'user' 
                          ? 'text-white/70 text-right' 
                          : 'text-[rgb(var(--muted-foreground))]'
                      )}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Actions - parse from AI response or use predefined */}
                {message.actions && message.actions.length > 0 && !message.isLoading && (
                  <div className={cn(
                    'flex flex-wrap gap-2',
                    message.role === 'user' ? 'justify-end' : ''
                  )}>
                    {message.actions.map((action, index) => (
                      <motion.button
                        key={`${message.id}-action-${index}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={action.action}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          action.variant === 'primary'
                            ? 'bg-[rgb(var(--os-accent))] text-white hover:opacity-90'
                            : action.variant === 'secondary'
                            ? 'border border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary))]'
                            : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                        )}
                      >
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[rgb(var(--secondary))] flex items-center justify-center">
                    <span className="text-sm font-medium">U</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator for step-based messages */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="p-3 rounded-2xl bg-[rgb(var(--secondary))] rounded-bl-none w-24">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse delay-150" />
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse delay-300" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--os-surface))]">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message or describe your brand..."
              className="w-full px-4 py-3 pl-10 pr-12 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--os-accent))] focus:border-transparent"
              disabled={isLoading}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Smile className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <button
                className="p-1 hover:bg-[rgb(var(--secondary))] rounded"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              </button>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  "p-1 hover:bg-[rgb(var(--secondary))] rounded transition-all",
                  isLoading ? "animate-pulse" : ""
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-[rgb(var(--muted-foreground))] animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-[rgb(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            <span>AI-powered streaming conversation</span>
          </div>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}