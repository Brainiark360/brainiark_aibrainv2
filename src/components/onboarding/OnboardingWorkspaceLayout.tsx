// /components/onboarding/OnboardingWorkspaceLayout.tsx
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Brain, MessageSquare, Sparkles, Zap } from 'lucide-react';
import OnboardingProgress from './OnboardingProcess';
import OnboardingChatPanel from './OnboardingChatPanel';
import EvidenceChatView from './EvidenceChatView';
import { OnboardingStateManager, useOnboarding } from './OnboardingStateManager';
import BrandBrainChatView from './BrandBrainChatView';

interface OnboardingWorkspaceLayoutProps {
  children?: React.ReactNode;
}

// Main layout wrapper
export default function OnboardingWorkspaceLayout({ children }: OnboardingWorkspaceLayoutProps) {
  return (
    <OnboardingStateManager>
      <OnboardingContent />
    </OnboardingStateManager>
  );
}

// Inner component that uses the context
function OnboardingContent() {
  const params = useParams();
  const brandSlug = params.slug as string;
  
  const { step, isLoading, error, updateStep } = useOnboarding();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-[rgb(var(--os-accent))] border-t-transparent rounded-full animate-spin" />
          <p className="text-[rgb(var(--muted-foreground))]">Loading onboarding...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="h3-os mb-2">Error Loading Onboarding</h3>
          <p className="text-[rgb(var(--muted-foreground))] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[rgb(var(--os-accent))] text-white hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">      
      {/* Main Onboarding Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <OnboardingProgress currentStep={step} />
        </div>
        
        {/* Two-Column Layout for Chat-Driven Onboarding */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Chat Panel (40%) */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              <OnboardingChatPanel 
                currentStep={step}
                onStepUpdate={updateStep}
              />
            </motion.div>
          </div>
          
          {/* Right Column: Interactive Panel (60%) */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="h-full"
            >
              <AnimatePresence mode="wait">
                {step === 'intro' && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="card-base border border-[rgb(var(--border))] p-6 h-full"
                  >
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[rgb(var(--os-accent))] via-purple-500 to-[rgb(var(--os-accent)/0.7)] p-0.5">
                        <div className="w-full h-full rounded-2xl bg-[rgb(var(--os-surface))] flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-[rgb(var(--os-accent))]" />
                        </div>
                      </div>
                      <h2 className="h2-os mb-4">Welcome to Your Brand Workspace</h2>
                      <p className="body-os-lg text-[rgb(var(--muted-foreground))] mb-8">
                        I'm your AI brand strategist. Let's have a conversation to build your Brand Brain together.
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse" />
                        <span className="text-sm text-[rgb(var(--muted-foreground))]">
                          Ready when you are
                        </span>
                        <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse delay-150" />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {step === 'collecting_evidence' && (
                  <motion.div
                    key="evidence"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <EvidenceChatView />
                  </motion.div>
                )}
                
                {(step === 'waiting_for_analysis' || step === 'analyzing') && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <div className="card-base border border-[rgb(var(--border))] p-6 h-full">
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="h3-os mb-4">
                          {step === 'analyzing' ? 'Analyzing Your Brand' : 'Ready for Analysis'}
                        </h3>
                        <p className="body-os text-[rgb(var(--muted-foreground))]">
                          {step === 'analyzing' 
                            ? 'I\'m processing your evidence to understand your brand identity...' 
                            : 'Review your evidence in the chat, then let me know when you\'re ready to begin analysis.'
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {step === 'reviewing_brand_brain' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <BrandBrainChatView />
                  </motion.div>
                )}
                
                {step === 'complete' && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="card-base border border-[rgb(var(--border))] p-6 h-full"
                  >
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                      <h2 className="h2-os mb-6">Onboarding Complete! 🎉</h2>
                      <p className="body-os-lg text-[rgb(var(--muted-foreground))] mb-8">
                        Your Brand Brain is now active and ready to power your content strategy.
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-green-500">
                          Redirecting to workspace...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
        
        {/* Status Footer */}
        <div className="mt-6 pt-6 border-t border-[rgb(var(--border))]">
          <div className="flex items-center justify-between text-sm text-[rgb(var(--muted-foreground))]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>AI Assistant Active</span>
            </div>
            <div>
              <span>Conversation saved to your brand workspace</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}