'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingPromptProps {
  brandName: string;
  brandSlug: string;
  completionScore: number;
}

export default function OnboardingPrompt({ brandName, brandSlug, completionScore }: OnboardingPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();

  const handleStartOnboarding = () => {
    router.push(`/workspace/${brandSlug}`);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Save dismissal preference to localStorage
    localStorage.setItem(`onboarding-dismissed-${brandSlug}`, 'true');
  };

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base border-2 border-[rgb(var(--os-accent))]/20 bg-gradient-to-r from-[rgb(var(--os-accent-soft))]/20 to-transparent mb-8"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-1">
                Complete {brandName} Setup
              </h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Help Brainiark AI understand your brand to unlock all features
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[rgb(var(--foreground))]">
              Setup Progress
            </span>
            <span className="text-sm font-semibold text-[rgb(var(--os-accent))]">
              {completionScore}%
            </span>
          </div>
          <div className="h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[rgb(var(--os-accent))] to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-[rgb(var(--secondary))]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                AI-Powered Insights
              </span>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Get personalized content and strategy recommendations
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[rgb(var(--secondary))]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-green-500" />
              </div>
              <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                Smart Automation
              </span>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Automate content creation and distribution
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[rgb(var(--secondary))]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                Performance Analytics
              </span>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Track and optimize your content performance
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Takes about 5-10 minutes
          </p>
          <button
            onClick={handleStartOnboarding}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[rgb(var(--os-accent))] to-purple-500 text-white hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            <span>Continue Setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}