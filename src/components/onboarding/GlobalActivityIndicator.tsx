'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Upload, Brain, Cpu } from 'lucide-react';
import { useOnboarding } from './OnboardingStateManager';

type ActivityType = 
  | 'evidence_uploading' 
  | 'evidence_processing'
  | 'analysis_running'
  | 'gpt_analyzing'
  | 'state_updating'
  | 'chat_thinking'
  | 'idle';

interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  duration?: number;
}

export default function GlobalActivityIndicator() {
  const { isLoading, step } = useOnboarding();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Simulate background activities based on onboarding state
  useEffect(() => {
    const newActivities: Activity[] = [];

    // Add activity based on current step
    switch (step) {
      case 'collecting_evidence':
        if (isLoading) {
          newActivities.push({
            id: 'evidence-processing',
            type: 'evidence_processing',
            message: 'Processing evidence...',
            timestamp: new Date(),
            duration: 5000
          });
        }
        break;
      case 'analyzing':
        newActivities.push({
          id: 'analysis-running',
          type: 'analysis_running',
          message: 'Analyzing brand...',
          timestamp: new Date(),
          duration: 10000
        });
        break;
      case 'reviewing_brand_brain':
        if (isLoading) {
          newActivities.push({
            id: 'state-updating',
            type: 'state_updating',
            message: 'Updating Brand Brain...',
            timestamp: new Date(),
            duration: 3000
          });
        }
        break;
    }

    // Add generic thinking activity when AI is processing
    if (isLoading && !['analyzing', 'reviewing_brand_brain'].includes(step)) {
      newActivities.push({
        id: 'chat-thinking',
        type: 'chat_thinking',
        message: 'AI is thinking...',
        timestamp: new Date(),
        duration: 3000
      });
    }

    setActivities(prev => {
      const updated = [...prev];
      newActivities.forEach(newActivity => {
        if (!updated.some(a => a.id === newActivity.id)) {
          updated.push(newActivity);
          
          // Auto-remove after duration
          if (newActivity.duration) {
            setTimeout(() => {
              setActivities(current => current.filter(a => a.id !== newActivity.id));
            }, newActivity.duration);
          }
        }
      });
      return updated;
    });

    // Show indicator if there are activities
    setIsVisible(activities.length > 0 || newActivities.length > 0);
  }, [step, isLoading, activities.length]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'evidence_uploading':
      case 'evidence_processing':
        return <Upload className="w-3 h-3" />;
      case 'analysis_running':
        return <Brain className="w-3 h-3" />;
      case 'gpt_analyzing':
        return <Cpu className="w-3 h-3" />;
      case 'state_updating':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'chat_thinking':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      default:
        return <Loader2 className="w-3 h-3 animate-spin" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'evidence_uploading':
      case 'evidence_processing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'analysis_running':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'gpt_analyzing':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'state_updating':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'chat_thinking':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-[rgb(var(--os-accent-soft))] text-[rgb(var(--os-accent))] border-[rgb(var(--os-accent)/0.2)]';
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <AnimatePresence>
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={`mb-2 px-3 py-2 rounded-lg backdrop-blur-sm border ${getActivityColor(activity.type)} shadow-lg`}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {getActivityIcon(activity.type)}
                <span className="text-sm font-medium">{activity.message}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}