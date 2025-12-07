'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Brain, MessageSquare, Zap, CheckCircle } from 'lucide-react';
import AIChatMessage from './AiChatMessage';

interface OnboardingModalProps {
  brandName: string;
  brandSlug: string;
  onComplete: () => void;
}

export default function OnboardingModal({ brandName, brandSlug, onComplete }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [aiMessages, setAiMessages] = useState<string[]>([
    `Hi there! I'm Brainiark AI. 👋`,
    `I see you've created "${brandName}". That's a great name!`,
    `I'd love to help you set up this brand workspace.`,
    `This will help me create personalized strategies for you.`
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const onboardingSteps = [
    {
      title: "Welcome to Brainiark",
      description: "Let me help you set up your brand workspace",
      icon: Sparkles,
    },
    {
      title: "Brand Understanding",
      description: "Teach me about your brand identity",
      icon: Brain,
    },
    {
      title: "AI Analysis",
      description: "I'll analyze your brand and provide insights",
      icon: Zap,
    },
    {
      title: "Ready to Go",
      description: "Start creating amazing content",
      icon: CheckCircle,
    },
  ];

  useEffect(() => {
    // Simulate AI typing messages
    if (currentMessageIndex < aiMessages.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        if (currentMessageIndex < aiMessages.length - 1) {
          setCurrentMessageIndex(prev => prev + 1);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, aiMessages.length]);

  const handleNextStep = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    setIsOpen(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] flex flex-col card-base border border-[rgb(var(--border))] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="flex-shrink-0 p-6 border-b border-[rgb(var(--border))] bg-gradient-to-r from-[rgb(var(--os-accent-soft))] to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">
                        Welcome to {brandName}
                      </h2>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        Let Brainiark AI help you get started
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="p-2 rounded-lg hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* AI Chat Interface */}
                <div className="mb-6 space-y-4">
                  {aiMessages.slice(0, currentMessageIndex + 1).map((message, index) => (
                    <AIChatMessage
                      key={index}
                      message={message}
                      isTyping={index === currentMessageIndex && isTyping}
                      delay={index * 100}
                    />
                  ))}
                </div>

                {/* Step Indicator */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))] flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {step + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[rgb(var(--foreground))]">
                          {onboardingSteps[step].title}
                        </h3>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">
                          {onboardingSteps[step].description}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">
                      Step {step + 1} of {onboardingSteps.length}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${((step + 1) / onboardingSteps.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-[rgb(var(--os-accent))] to-purple-500"
                    />
                  </div>
                </div>

                {/* Step Content */}
                <div className="mb-6">
                  {step === 0 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-[rgb(var(--secondary))]">
                        <h4 className="font-medium text-[rgb(var(--foreground))] mb-2">
                          What we'll do together:
                        </h4>
                        <ul className="space-y-2 text-sm text-[rgb(var(--muted-foreground))]">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Add your brand materials (website, documents, social links)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>I'll analyze your brand identity and tone</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Create your Brand Brain with AI-generated insights</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Start creating content and strategies</span>
                          </li>
                        </ul>
                      </div>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        This usually takes about 5-10 minutes and will unlock all features.
                      </p>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-4">
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        I'll need to understand your brand better. You can provide:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-lg border border-[rgb(var(--border))] hover:border-[rgb(var(--os-accent))] transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                            <span className="text-2xl">🌐</span>
                          </div>
                          <h4 className="font-medium text-[rgb(var(--foreground))] mb-1">
                            Website URL
                          </h4>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">
                            Analyze your existing website
                          </p>
                        </div>
                        <div className="p-4 rounded-lg border border-[rgb(var(--border))] hover:border-[rgb(var(--os-accent))] transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                            <span className="text-2xl">📄</span>
                          </div>
                          <h4 className="font-medium text-[rgb(var(--foreground))] mb-1">
                            Documents
                          </h4>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">
                            Brand guidelines, PDFs, etc.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <h4 className="font-medium text-[rgb(var(--foreground))] mb-2">
                          What happens during analysis:
                        </h4>
                        <ul className="space-y-2 text-sm text-[rgb(var(--muted-foreground))]">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span>Extracting brand tone and voice from your content</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <span>Identifying key audience segments and personas</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Creating content pillars and strategy framework</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <span>Generating actionable recommendations</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <h4 className="font-medium text-[rgb(var(--foreground))] mb-2">
                          Ready to unlock:
                        </h4>
                        <ul className="space-y-2 text-sm text-[rgb(var(--muted-foreground))]">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>AI-powered content generation</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Smart content calendar and scheduling</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Performance analytics and insights</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Team collaboration features</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions - Fixed at bottom */}
              <div className="flex-shrink-0 p-6 border-t border-[rgb(var(--border))] bg-[rgb(var(--card))]">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    {step === onboardingSteps.length - 1 ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Get Started
                      </>
                    ) : (
                      <>
                        Continue
                        <MessageSquare className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}