'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface OnboardingBannerProps {
  brandName: string;
  status: 'not_started' | 'in_progress' | 'ready';
}

export function OnboardingBanner({ brandName, status }: OnboardingBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusMessage = () => {
    switch (status) {
      case 'not_started':
        return 'Complete setup to unlock all features';
      case 'in_progress':
        return 'Continue where you left off';
      case 'ready':
        return 'Setup complete';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base border-2 border-[rgb(var(--os-accent))]/20 bg-gradient-to-r from-[rgb(var(--os-accent-soft))]/20 to-transparent"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))] flex items-center justify-center">
              <span className="text-white text-xl">✨</span>
            </div>
            <div>
              <h3 className="h3-os text-[rgb(var(--foreground))] mb-1">
                Let's help Brainiark understand {brandName}
              </h3>
              <p className="body-os text-[rgb(var(--muted-foreground))]">
                {getStatusMessage()}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-6 py-3 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))] text-white hover:opacity-90 transition-opacity"
          >
            {status === 'not_started' ? 'Start Setup' : 'Continue'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[rgb(var(--foreground))]">
              Setup Progress
            </span>
            <span className="text-sm font-medium text-[rgb(var(--os-accent))]">
              {status === 'not_started' ? '0%' : status === 'in_progress' ? '50%' : '100%'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[rgb(var(--secondary))] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))] transition-all duration-500"
              style={{
                width: status === 'not_started' ? '0%' : status === 'in_progress' ? '50%' : '100%',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[rgb(var(--muted-foreground))]">Brand Inputs</span>
            <span className="text-xs text-[rgb(var(--muted-foreground))]">AI Analysis</span>
            <span className="text-xs text-[rgb(var(--muted-foreground))]">Review & Confirm</span>
          </div>
        </div>

        {/* Expanded onboarding steps */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-[rgb(var(--border))]"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${
                status === 'not_started' 
                  ? 'border-[rgb(var(--os-accent))] bg-[rgb(var(--os-accent-soft))]/10' 
                  : 'border-[rgb(var(--border))]'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status === 'not_started' 
                      ? 'bg-[rgb(var(--os-accent))] text-white' 
                      : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {status === 'not_started' ? '1' : '✓'}
                  </div>
                  <h4 className="font-medium text-[rgb(var(--foreground))]">
                    Brand Inputs
                  </h4>
                </div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  Add your website, documents, social links, or description
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                status === 'in_progress' 
                  ? 'border-[rgb(var(--os-accent))] bg-[rgb(var(--os-accent-soft))]/10' 
                  : 'border-[rgb(var(--border))]'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status === 'ready' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : status === 'in_progress'
                      ? 'bg-[rgb(var(--os-accent))] text-white'
                      : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]'
                  }`}>
                    {status === 'ready' ? '✓' : '2'}
                  </div>
                  <h4 className="font-medium text-[rgb(var(--foreground))]">
                    AI Analysis
                  </h4>
                </div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  Brainiark analyzes your brand and generates insights
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                status === 'ready' 
                  ? 'border-[rgb(var(--os-accent))] bg-[rgb(var(--os-accent-soft))]/10' 
                  : 'border-[rgb(var(--border))]'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status === 'ready' 
                      ? 'bg-[rgb(var(--os-accent))] text-white'
                      : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]'
                  }`}>
                    3
                  </div>
                  <h4 className="font-medium text-[rgb(var(--foreground))]">
                    Review & Confirm
                  </h4>
                </div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  Review AI-generated insights and make adjustments
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}