// /components/onboarding/BrandBrainReview.tsx - UPDATED
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Edit2, Save, Users, MessageSquare, Target, 
  Zap, CheckCircle, RefreshCw, Sparkles, Loader2 
} from 'lucide-react';
import { useParams } from 'next/navigation';

interface BrandBrainReviewProps {
  onComplete: () => void;
}

interface BrandBrainData {
  summary: string;
  audience: string;
  tone: string;
  pillars: string[];
  competitors: string[];
  channels: string[];
}

export default function BrandBrainReview({ onComplete }: BrandBrainReviewProps) {
  const params = useParams();
  const brandSlug = params.slug as string;
  
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<BrandBrainData>({
    summary: '',
    audience: '',
    tone: '',
    pillars: [],
    competitors: [],
    channels: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState('');

  // Load brand brain data
  useEffect(() => {
    fetchBrandBrain();
  }, [brandSlug]);

  const fetchBrandBrain = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/brands/${brandSlug}/brain`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const brainData = data.data;
        setEditedContent({
          summary: brainData.summary || '',
          audience: brainData.audience || '',
          tone: brainData.tone || '',
          pillars: brainData.pillars || [],
          competitors: brainData.competitors || [],
          channels: brainData.channels || [],
        });
      } else {
        setError('No brand brain data found');
      }
    } catch (error) {
      console.error('Failed to fetch brand brain:', error);
      setError('Failed to load brand brain');
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    {
      id: 'summary',
      title: 'Brand Summary',
      description: 'The core essence of your brand',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      value: editedContent.summary,
    },
    {
      id: 'audience',
      title: 'Target Audience',
      description: 'Who your brand speaks to',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      value: editedContent.audience,
    },
    {
      id: 'tone',
      title: 'Brand Tone & Voice',
      description: 'How your brand communicates',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      value: editedContent.tone,
    },
    {
      id: 'pillars',
      title: 'Content Pillars',
      description: 'Key themes for your content',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      value: editedContent.pillars.join(', '),
    },
    {
      id: 'competitors',
      title: 'Key Competitors',
      description: 'Brands in your space',
      icon: Zap,
      color: 'from-yellow-500 to-amber-500',
      value: editedContent.competitors.join(', '),
    },
    {
      id: 'channels',
      title: 'Recommended Channels',
      description: 'Where to reach your audience',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500',
      value: editedContent.channels.join(', '),
    },
  ];

  const handleEdit = (sectionId: string, currentValue: string) => {
    setEditingSection(sectionId);
  };

  const handleSave = async (sectionId: string) => {
    try {
      setIsSaving(true);
      setError('');

      let value: string | string[];
      if (['pillars', 'competitors', 'channels'].includes(sectionId)) {
        value = editedContent[sectionId as keyof BrandBrainData]
          .toString()
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      } else {
        value = editedContent[sectionId as keyof BrandBrainData] as string;
      }

      const response = await fetch(`/api/brands/${brandSlug}/brain`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionId, value }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save');
      }

      setEditingSection(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefineWithAI = async (sectionId: string) => {
    try {
      setIsRefining(true);
      setError('');

      // Call AI refinement endpoint
      const response = await fetch(`/api/brands/${brandSlug}/brain/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionId,
          currentValue: editedContent[sectionId as keyof BrandBrainData],
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setEditedContent(prev => ({
          ...prev,
          [sectionId]: sectionId === 'pillars' || sectionId === 'competitors' || sectionId === 'channels'
            ? data.data.split(',').map((item: string) => item.trim())
            : data.data,
        }));
      } else {
        throw new Error(data.error || 'AI refinement failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'AI refinement failed');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsSaving(true);
      setError('');

      // Activate brand brain
      const response = await fetch(`/api/brands/${brandSlug}/brain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Activation failed');
      }

      // Update onboarding step
      await fetch(`/api/brands/${brandSlug}/onboarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 5 }),
      });

      onComplete();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete onboarding');
      setIsSaving(false);
    }
  };

  const renderSectionContent = (section: typeof sections[0]) => {
    const isEditing = editingSection === section.id;
    const Icon = section.icon;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 text-[rgb(var(--muted-foreground))] animate-spin" />
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-3">
          <textarea
            value={editedContent[section.id as keyof BrandBrainData] as string}
            onChange={(e) => setEditedContent(prev => ({
              ...prev,
              [section.id]: e.target.value,
            }))}
            className="w-full p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--os-accent))] min-h-[100px] resize-none"
            placeholder={`Edit ${section.title.toLowerCase()}...`}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleSave(section.id)}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-[rgb(var(--os-accent))] text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={() => setEditingSection(null)}
              className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary))] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-[rgb(var(--foreground))] leading-relaxed">
          {section.value || 'No data available. Add evidence and run analysis.'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(section.id, section.value)}
            className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary))] transition-colors flex items-center gap-2 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => handleRefineWithAI(section.id)}
            disabled={isRefining || !section.value}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefining ? 'animate-spin' : ''}`} />
            {isRefining ? 'AI Refining...' : 'Refine with AI'}
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[rgb(var(--os-accent))] animate-spin" />
        <span className="ml-3 text-[rgb(var(--foreground))]">Loading brand brain...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
          Review Your Brand Brain
        </h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          Brainiark AI has analyzed your brand. Review and refine these insights.
        </p>
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-[rgb(var(--os-accent-soft))] to-transparent inline-block">
          <p className="text-sm text-[rgb(var(--foreground))] flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>You can edit anything — I'll adapt to your changes</span>
          </p>
        </div>
      </div>

      {/* Brand Brain Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-lg border ${
                editingSection === section.id 
                  ? 'border-[rgb(var(--os-accent))] ring-2 ring-[rgb(var(--os-accent))] ring-opacity-20' 
                  : 'border-[rgb(var(--border))] hover:border-[rgb(var(--os-accent))]'
              } transition-all`}
            >
              {/* Section Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[rgb(var(--foreground))]">
                      {section.title}
                    </h3>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {section.description}
                    </p>
                  </div>
                </div>
                {editingSection === section.id && (
                  <div className="text-xs px-2 py-1 rounded-full bg-[rgb(var(--os-accent))] text-white">
                    Editing
                  </div>
                )}
              </div>

              {/* Section Content */}
              {renderSectionContent(section)}
            </motion.div>
          );
        })}
      </div>

      {/* Completion */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-500">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Brand Brain is ready for activation</span>
        </div>
        
        <p className="text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto">
          Once you're satisfied with these insights, your Brand Brain will be activated and all workspace features will unlock.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCompleteOnboarding}
          disabled={isSaving}
          className="px-8 py-4 rounded-lg bg-gradient-to-r from-[rgb(var(--os-accent))] to-purple-600 text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-3 mx-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-lg font-semibold">Activating Brand Brain...</span>
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              <span className="text-lg font-semibold">Activate Brand Brain & Continue</span>
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          You can always edit your Brand Brain later in Settings
        </p>
      </div>
    </div>
  );
}