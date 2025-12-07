// /components/onboarding/OnboardingProgress.tsx - SIMPLIFIED VERSION
'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Target, 
  FileText, 
  Brain, 
  Zap,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { 
    id: 1, 
    label: 'Welcome', 
    icon: Sparkles,
    description: 'Get started with onboarding'
  },
  { 
    id: 2, 
    label: 'Evidence', 
    icon: FileText,
    description: 'Add brand materials'
  },
  { 
    id: 3, 
    label: 'Analysis', 
    icon: Brain,
    description: 'AI processing insights'
  },
  { 
    id: 4, 
    label: 'Review', 
    icon: Target,
    description: 'Verify brand insights'
  },
  { 
    id: 5, 
    label: 'Complete', 
    icon: CheckCircle,
    description: 'Ready to launch'
  },
];

export default function OnboardingProgress({ 
  currentStep, 
  onStepClick 
}: OnboardingProgressProps) {
  const completedPercentage = Math.round((currentStep / steps.length) * 100);
  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.7)] flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="h3-os text-[rgb(var(--foreground))]">
                Onboarding Journey
              </h3>
              <p className="body-os text-[rgb(var(--muted-foreground))]">
                {currentStepData?.description || `Step ${currentStep} of ${steps.length}`}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[rgb(var(--secondary))] flex items-center justify-center">
              <span className="text-xl font-bold text-[rgb(var(--foreground))]">
                {completedPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar with Steps */}
      <div className="relative mb-8">
        {/* Main Progress Line */}
        <div className="absolute top-5 left-4 right-4 h-0.5 bg-[rgb(var(--secondary))] z-0" />
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, (currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-5 left-4 h-0.5 bg-gradient-to-r from-[rgb(var(--os-accent))] to-purple-500 z-10"
        />

        {/* Step Indicators */}
        <div className="relative flex justify-between z-20">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isUpcoming = step.id > currentStep;
            
            return (
              <motion.button
                key={step.id}
                onClick={() => onStepClick?.(step.id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center w-16 sm:w-20 ${
                  onStepClick && !isCurrent ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Step Circle */}
                <div className="relative mb-3">
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center relative z-10
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 text-white shadow-lg' 
                        : isCurrent
                        ? 'bg-[rgb(var(--os-surface))] text-[rgb(var(--os-accent))] border-2 border-[rgb(var(--os-accent))] shadow-md'
                        : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                    
                    {/* Step Number */}
                    <div className={`
                      absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-bold flex items-center justify-center
                      ${isCompleted 
                        ? 'bg-white text-[rgb(var(--os-accent))]' 
                        : isCurrent
                        ? 'bg-[rgb(var(--os-accent))] text-white'
                        : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]'
                      }
                    `}>
                      {step.id}
                    </div>
                  </div>
                </div>

                {/* Step Label */}
                <div className="text-center space-y-1">
                  <span className={`text-xs sm:text-sm font-medium block ${
                    isCurrent || isCompleted 
                      ? 'text-[rgb(var(--foreground))]' 
                      : 'text-[rgb(var(--muted-foreground))]'
                  }`}>
                    {step.label}
                  </span>
                  <span className="text-xs text-[rgb(var(--muted-foreground))] hidden sm:block">
                    {step.description}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Current Step Details */}
      {currentStepData && (
        <div className="p-4 rounded-xl border border-[rgb(var(--os-accent))/20] bg-[rgb(var(--os-accent-soft))/30]">
          <div className="flex items-center gap-4">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              ${currentStepData.id < currentStep
                ? 'bg-green-500/10 text-green-600'
                : 'bg-[rgb(var(--os-accent-soft))] text-[rgb(var(--os-accent))]'
              }
            `}>
              {currentStepData.id < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-[rgb(var(--foreground))]">
                  {currentStepData.label}
                </h4>
                <div className="flex items-center gap-2">
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${currentStepData.id < currentStep
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-[rgb(var(--os-accent-soft))] text-[rgb(var(--os-accent))]'
                    }
                  `}>
                    {currentStepData.id < currentStep ? 'Completed' : 'In Progress'}
                  </div>
                  {currentStepData.id === currentStep && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse" />
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">
                        Active
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="body-os text-[rgb(var(--muted-foreground))]">
                {currentStep === 1 && "Welcome to your brand workspace setup. Let's get started by understanding your brand."}
                {currentStep === 2 && "Add your brand materials - websites, documents, social profiles, or any brand assets."}
                {currentStep === 3 && "Brainiark AI is analyzing your brand evidence to build a comprehensive understanding."}
                {currentStep === 4 && "Review and verify the insights generated from your brand analysis."}
                {currentStep === 5 && "Onboarding complete! Your brand brain is now ready to power your content and strategy."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}