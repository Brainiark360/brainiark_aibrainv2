// /components/onboarding/AIAnalysis.tsx - UPDATED
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Target, Users, MessageSquare, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

interface AIAnalysisProps {
  onAnalysisComplete: (results: any) => void;
}

interface AnalysisStep {
  title: string;
  description: string;
  icon: any;
  color: string;
}

export default function AIAnalysis({ onAnalysisComplete }: AIAnalysisProps) {
  const params = useParams();
  const brandSlug = params.slug as string;
  
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');

  const analysisSteps: AnalysisStep[] = [
    {
      title: 'Reading Materials',
      description: 'Analyzing your website and documents',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Identifying Tone',
      description: 'Understanding your brand voice',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Finding Audience',
      description: 'Identifying target customers',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Creating Pillars',
      description: 'Building content strategy pillars',
      icon: Target,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Generating Insights',
      description: 'Creating actionable recommendations',
      icon: Sparkles,
      color: 'from-yellow-500 to-amber-500',
    },
  ];

  useEffect(() => {
    startAnalysis();
  }, []);

  const startAnalysis = async () => {
    try {
      setIsStreaming(true);
      setError('');
      setMessages([]);
      setCurrentMessage('');

      const response = await fetch(`/api/brands/${brandSlug}/analyze`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const event = line.replace('event: ', '');
            const nextLine = lines[lines.indexOf(line) + 1];
            if (nextLine?.startsWith('data: ')) {
              const data = JSON.parse(nextLine.replace('data: ', ''));
              
              switch (event) {
                case 'step_update':
                  const stepIndex = analysisSteps.findIndex(step => 
                    step.title.toLowerCase().includes(data.step.toLowerCase()) ||
                    data.step.toLowerCase().includes(step.title.toLowerCase())
                  );
                  if (stepIndex !== -1) {
                    setCurrentStep(stepIndex);
                  }
                  break;
                
                case 'ai_message':
                  setMessages(prev => [...prev, data]);
                  break;
                
                case 'ai_message_chunk':
                  setCurrentMessage(prev => prev + data);
                  break;
                
                case 'progress':
                  setProgress(data);
                  break;
                
                case 'analysis_complete':
                  onAnalysisComplete(data);
                  setIsStreaming(false);
                  // Update onboarding step
                  try {
                    await fetch(`/api/brands/${brandSlug}/onboarding`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ step: 4 }),
                    });
                  } catch (error) {
                    console.error('Failed to update onboarding step:', error);
                  }
                  break;
                
                case 'error':
                  setError(data.message || 'Analysis failed');
                  setIsStreaming(false);
                  break;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze brand. Please try again.');
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (currentMessage && !messages.includes(currentMessage)) {
      setMessages(prev => [...prev, currentMessage]);
      setCurrentMessage('');
    }
  }, [currentMessage]);

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Progress Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
          Brainiark AI is Analyzing
        </h2>
        <p className="text-[rgb(var(--muted-foreground))]">
          {isStreaming ? 'Analyzing your brand evidence...' : 'Analysis complete!'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-[rgb(var(--foreground))]">Progress</span>
          <span className="text-[rgb(var(--os-accent))] font-semibold">{progress}%</span>
        </div>
        <div className="h-3 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[rgb(var(--os-accent))] to-purple-500 rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Analysis Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {analysisSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                isActive
                  ? 'border-[rgb(var(--os-accent))] bg-gradient-to-br from-[rgb(var(--os-accent-soft))] to-transparent'
                  : 'border-[rgb(var(--border))]'
              } ${isCurrent ? 'ring-2 ring-[rgb(var(--os-accent))] ring-opacity-30' : ''}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center ${
                  isActive ? 'opacity-100' : 'opacity-50'
                }`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {isCurrent && isStreaming && (
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                )}
                {!isStreaming && isActive && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              <h4 className={`font-medium mb-1 ${isActive ? 'text-[rgb(var(--foreground))]' : 'text-[rgb(var(--muted-foreground))]'}`}>
                {step.title}
              </h4>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* AI Messages */}
      <div className="p-4 rounded-lg bg-[rgb(var(--secondary))] space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
            <Brain className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-[rgb(var(--foreground))]">
            Brainiark AI
          </span>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {messages.map((message, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-sm text-[rgb(var(--foreground))]"
            >
              {message}
            </motion.p>
          ))}
          {isStreaming && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse delay-150" />
                <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] animate-pulse delay-300" />
              </div>
              <span className="text-sm text-[rgb(var(--muted-foreground))]">
                Analyzing...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        {isStreaming ? (
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            This may take a few moments...
          </p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-500">
            <CheckCircle className="w-4 h-4" />
            <span>Analysis complete! Review your brand insights.</span>
          </div>
        )}
      </div>
    </div>
  );
}