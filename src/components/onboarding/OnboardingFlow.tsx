// /components/onboarding/OnboardingFlow.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  Brain, Sparkles, ArrowRight, CheckCircle, Loader2 
} from 'lucide-react';
import EvidenceInput from './EvidenceInput';
import AIAnalysis from './AIAnalysis';
import BrandBrainReview from './BrandBrainReview';
import OnboardingProgress from './OnboardingProcess';

export default function OnboardingFlow() {
  const params = useParams();
  const router = useRouter();
  const brandSlug = params.slug as string;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch onboarding status
  useEffect(() => {
    fetchOnboardingStatus();
  }, [brandSlug]);

  const fetchOnboardingStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/brands/${brandSlug}/onboarding`);
      const data = await response.json();
      
      if (data.success) {
        setCurrentStep(data.data.step || 1);
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
      setError('Failed to load onboarding status');
    } finally {
      setIsLoading(false);
    }
  };

  // In OnboardingFlow.tsx - update the handleUpdateStep function
  const handleUpdateStep = async (step: number) => {
    try {
      setError(''); // Clear previous errors
      
      const response = await fetch(`/api/brands/${brandSlug}/onboarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Onboarding API not found. Please check the server configuration.');
        } else {
          const data = await response.json();
          setError(data.error || `Failed to update step (${response.status})`);
        }
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentStep(step);
      } else {
        setError(data.error || 'Failed to update step');
      }
    } catch (error) {
      console.error('Failed to update step:', error);
      setError('Network error. Please check your connection.');
    }
  };
  const handleAnalysisComplete = (results: any) => {
    handleUpdateStep(4);
  };

  const handleReviewComplete = () => {
    handleUpdateStep(5);
    setTimeout(() => {
      router.refresh();
    }, 2000);
  };

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-[rgb(var(--os-accent))] animate-spin mb-4" />
          <span className="text-[rgb(var(--foreground))]">Loading onboarding...</span>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 px-4 sm:px-8"
          >
            <div className="relative mx-auto mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[rgb(var(--os-accent))] via-purple-500 to-[rgb(var(--os-accent)/0.7)] p-0.5">
                <div className="w-full h-full rounded-2xl bg-[rgb(var(--os-surface))] flex items-center justify-center">
                  <Brain className="w-12 h-12 text-[rgb(var(--os-accent))]" />
                </div>
              </div>
            </div>

            <h1 className="h1-os mb-6">
              Welcome to Your Brand Workspace
            </h1>
            
            <p className="body-os-lg text-[rgb(var(--muted-foreground))] mb-10 max-w-2xl mx-auto leading-relaxed">
              Let's create your intelligent brand workspace. I'll help you build a comprehensive brand understanding that powers your content, strategy, and growth.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
              {[
                { icon: Brain, title: "AI Analysis", desc: "Deep brand understanding" },
                { icon: Sparkles, title: "Smart Strategy", desc: "Data-driven insights" },
                { icon: ArrowRight, title: "Content Ready", desc: "Generate instantly" }
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))]"
                >
                  <feature.icon className="w-6 h-6 text-[rgb(var(--os-accent))] mb-3" />
                  <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpdateStep(2)}
              className="group px-10 py-4 rounded-xl bg-gradient-to-r from-[rgb(var(--os-accent))] to-purple-600 text-white hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-lg font-semibold">Begin Onboarding</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        );

      case 2:
        return (
          <div className="py-4">
            <EvidenceInput
              onAnalyze={() => handleUpdateStep(3)}
            />
          </div>
        );

      case 3:
        return (
          <div className="py-4">
            <AIAnalysis
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        );

      case 4:
        return (
          <div className="py-4">
            <BrandBrainReview
              onComplete={handleReviewComplete}
            />
          </div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 px-4 sm:px-8"
          >
            <div className="relative mx-auto mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl"
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>
            </div>

            <h1 className="h1-os mb-6">
              Onboarding Complete! 🎉
            </h1>
            
            <p className="body-os-lg text-[rgb(var(--muted-foreground))] mb-8 max-w-2xl mx-auto leading-relaxed">
              Your Brand Brain is now active and ready. I've analyzed your brand and created a comprehensive understanding that will power all your content and strategies.
            </p>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Redirecting to your workspace...</span>
              </div>
              <p className="caption-os text-[rgb(var(--muted-foreground))]">
                This will only take a moment
              </p>
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="py-8 text-center">
            <p className="text-[rgb(var(--foreground))]">Invalid onboarding step</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Progress Tracking - NOT STICKY */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))]"
      >
        <OnboardingProgress
          currentStep={currentStep}
          onStepClick={handleUpdateStep}
        />
      </motion.div>

      {/* Step Content Container - SCROLLABLE AREA */}
      <div className="overflow-visible">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card-base border border-[rgb(var(--border))] overflow-visible"
        >
          <div className="p-6 sm:p-8">
            {renderStepContent()}
          </div>
        </motion.div>
      </div>

      {/* AI Assistant Chat */}
      {currentStep > 1 && currentStep < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-[rgb(var(--os-accent-soft))] to-[rgb(var(--os-accent-soft)/0.5)] border border-[rgb(var(--border))]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* AI Avatar */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[rgb(var(--foreground))]">
                  Brainiark Assistant
                </h4>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Here to guide you
                </p>
              </div>
            </div>

            {/* AI Message */}
            <div className="flex-1">
              <div className="space-y-3">
                <p className="body-os text-[rgb(var(--foreground))]">
                  {currentStep === 2 && "Add your brand materials - websites, documents, social profiles, or any brand assets. The more context I have, the better I can understand and represent your brand."}
                  {currentStep === 3 && "I'm analyzing your brand now. This is where I process all the evidence to build your brand understanding. It usually takes 1-2 minutes."}
                  {currentStep === 4 && "Review the insights I've generated. Feel free to edit anything - I'll learn from your feedback to better understand your brand."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}