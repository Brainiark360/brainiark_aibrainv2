'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Target, 
  FileText, 
  Brain, 
  Zap,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Search,
  Eye
} from 'lucide-react';
import { OnboardingStep } from '@/types/onboarding';

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  onStepClick?: (step: OnboardingStep) => void;
}

// Map string steps to numeric indices for the progress bar
const stepOrder: OnboardingStep[] = [
  'intro',
  'collecting_evidence', 
  'waiting_for_analysis',
  'analyzing',
  'reviewing_brand_brain', 
  'complete'
];

const steps = [
  { 
    id: 'intro' as OnboardingStep,
    label: 'Welcome', 
    icon: Sparkles,
    description: 'Get started with onboarding'
  },
  { 
    id: 'collecting_evidence' as OnboardingStep,
    label: 'Evidence', 
    icon: FileText,
    description: 'Add brand materials'
  },
  { 
    id: 'waiting_for_analysis' as OnboardingStep,
    label: 'Ready', 
    icon: Target,
    description: 'Ready for analysis'
  },
  { 
    id: 'analyzing' as OnboardingStep,
    label: 'Analysis', 
    icon: Brain,
    description: 'AI processing insights'
  },
  { 
    id: 'reviewing_brand_brain' as OnboardingStep,
    label: 'Review', 
    icon: Eye,
    description: 'Verify brand insights'
  },
  { 
    id: 'complete' as OnboardingStep,
    label: 'Complete', 
    icon: CheckCircle,
    description: 'Ready to launch'
  },
];

export default function OnboardingProgress({ 
  currentStep, 
  onStepClick 
}: OnboardingProgressProps) {
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const completedSteps = Math.max(0, currentStepIndex);
  const totalSteps = stepOrder.length;
  const completedPercentage = Math.round((completedSteps / (totalSteps - 1)) * 100);
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
                {currentStepData?.description || `Step ${currentStepIndex + 1} of ${totalSteps}`}
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
          animate={{ width: `${Math.max(0, (completedSteps / (totalSteps - 1)) * 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-5 left-4 h-0.5 bg-gradient-to-r from-[rgb(var(--os-accent))] to-purple-500 z-10"
        />

        {/* Step Indicators */}
        <div className="relative flex justify-between z-20">
          {steps.map((step, index) => {
            const stepIndex = stepOrder.indexOf(step.id);
            const isCompleted = stepIndex < currentStepIndex;
            const isCurrent = step.id === currentStep;
            const isUpcoming = stepIndex > currentStepIndex;
            
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
                    ) : isCurrent ? (
                      <div className="relative">
                        <step.icon className="w-5 h-5" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse" />
                      </div>
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
                      {stepIndex + 1}
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
              ${isCompleted 
                ? 'bg-green-500/10 text-green-600'
                : currentStep === 'analyzing'
                ? 'bg-purple-500/10 text-purple-600'
                : 'bg-[rgb(var(--os-accent-soft))] text-[rgb(var(--os-accent))]'
              }
            `}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : currentStep === 'analyzing' ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-[rgb(var(--foreground))]">
                  {getStepTitle(currentStep)}
                </h4>
                <div className="flex items-center gap-2">
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${currentStep === 'complete'
                      ? 'bg-green-500/10 text-green-600'
                      : currentStep === 'analyzing'
                      ? 'bg-purple-500/10 text-purple-600'
                      : 'bg-[rgb(var(--os-accent-soft))] text-[rgb(var(--os-accent))]'
                    }
                  `}>
                    {getStepStatus(currentStep)}
                  </div>
                  {currentStep !== 'complete' && currentStep !== 'analyzing' && (
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
                {getStepDescription(currentStep)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for step details
function getStepTitle(step: OnboardingStep): string {
  switch (step) {
    case 'intro': return 'Welcome & Introduction';
    case 'collecting_evidence': return 'Collect Brand Evidence';
    case 'waiting_for_analysis': return 'Ready for Analysis';
    case 'analyzing': return 'AI Analysis in Progress';
    case 'reviewing_brand_brain': return 'Review Brand Brain';
    case 'complete': return 'Onboarding Complete';
    default: return 'Onboarding';
  }
}

function getStepStatus(step: OnboardingStep): string {
  switch (step) {
    case 'intro': return 'Conversation';
    case 'collecting_evidence': return 'Collecting';
    case 'waiting_for_analysis': return 'Ready';
    case 'analyzing': return 'Processing';
    case 'reviewing_brand_brain': return 'Reviewing';
    case 'complete': return 'Completed';
    default: return 'Active';
  }
}

function getStepDescription(step: OnboardingStep): string {
  switch (step) {
    case 'intro': 
      return "Welcome to your brand workspace setup. Let's have a conversation about your brand and what makes it unique.";
    case 'collecting_evidence': 
      return "Add your brand materials - websites, documents, social profiles, or any brand assets. The AI will analyze them to understand your brand.";
    case 'waiting_for_analysis': 
      return "You've added evidence. Ready to have the AI analyze your brand and build your Brand Brain?";
    case 'analyzing': 
      return "Brainiark AI is analyzing your brand evidence to build a comprehensive understanding. This usually takes about a minute.";
    case 'reviewing_brand_brain': 
      return "Review and verify the insights generated from your brand analysis. You can edit, refine, and approve each section.";
    case 'complete': 
      return "Onboarding complete! Your brand brain is now ready to power your content and strategy.";
    default: 
      return "Progressing through brand onboarding.";
  }
}

function isCompleted(step: OnboardingStep, currentStep: OnboardingStep): boolean {
  const currentIndex = stepOrder.indexOf(currentStep);
  const stepIndex = stepOrder.indexOf(step);
  return stepIndex < currentIndex;
}