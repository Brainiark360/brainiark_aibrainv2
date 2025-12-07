// /components/onboarding/BrandBrainChatView.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from './OnboardingStateManager';
import { BrandBrainData, BrandBrainSection } from '@/types/onboarding';

interface SectionConfig {
  id: BrandBrainSection;
  title: string;
  description: string;
  placeholder: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'summary',
    title: 'Brand Summary',
    description: 'A comprehensive overview of your brand identity, values, and market positioning',
    placeholder: 'Enter a detailed summary of your brand...',
  },
  {
    id: 'audience',
    title: 'Target Audience',
    description: 'Define your ideal customer personas and demographic segments',
    placeholder: 'Describe your target audience in detail...',
  },
  {
    id: 'tone',
    title: 'Tone & Voice',
    description: 'The personality and communication style that represents your brand',
    placeholder: 'Describe your brand\'s tone and voice...',
  },
  {
    id: 'pillars',
    title: 'Content Pillars',
    description: 'Core topics and themes that define your brand\'s content strategy',
    placeholder: 'Enter your content pillars (one per line)...',
  },
  {
    id: 'recommendations',
    title: 'Recommendations',
    description: 'Actionable insights and next steps for your brand strategy',
    placeholder: 'Enter recommendations for the brand...',
  },
];

export default function BrandBrainChatView() {
  const { 
    brandBrain, 
    activeSection, 
    dispatch, 
    fetchBrandBrain,
    step 
  } = useOnboarding();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [brandBrainData, setBrandBrainData] = useState<BrandBrainData | null>(null);
  
  // Load brand brain data
  useEffect(() => {
    const loadBrandBrain = async () => {
      try {
        const response = await fetch(`/api/brands/brain`);
        if (response.ok) {
          const data = await response.json();
          setBrandBrainData(data);
        }
      } catch (error) {
        console.error('Error loading brand brain:', error);
      }
    };
    
    loadBrandBrain();
  }, []);
  
  // Update local state when active section changes
  useEffect(() => {
    if (activeSection && brandBrainData) {
      const content = getSectionContent(activeSection, brandBrainData);
      setEditedContent(content);
      setIsEditing(false);
    }
  }, [activeSection, brandBrainData]);
  
  // Get section content
  const getSectionContent = (section: BrandBrainSection, data: BrandBrainData): string => {
    switch (section) {
      case 'summary':
        return data.summary || '';
      case 'audience':
        return data.audience || '';
      case 'tone':
        return data.tone || '';
      case 'pillars':
        return Array.isArray(data.pillars) ? data.pillars.join('\n') : '';
      case 'recommendations':
        return Array.isArray(data.recommendations) ? data.recommendations.join('\n') : '';
      default:
        return '';
    }
  };
  
  // Get current section config
  const currentSection = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];
  
  // Handle save changes
  const handleSave = useCallback(async () => {
    if (!activeSection || !editedContent.trim()) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/brands/brain`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [activeSection]: activeSection === 'pillars' || activeSection === 'recommendations' 
            ? editedContent.split('\n').filter(line => line.trim())
            : editedContent,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save changes');
      
      // Refresh brand brain data
      await fetchBrandBrain();
      setIsEditing(false);
      
      // Notify chat about the update
      dispatch({ type: 'SECTION_UPDATED' });
      
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setIsSaving(false);
    }
  }, [activeSection, editedContent, dispatch, fetchBrandBrain]);
  
  // Handle refine section
  const handleRefine = useCallback(async () => {
    if (!activeSection || !editedContent.trim()) return;
    
    setIsRefining(true);
    
    try {
      dispatch({
        type: 'REFINE_SECTION',
        payload: {
          section: activeSection,
          content: editedContent,
        },
      });
      
      // Wait a moment for the refinement to process
      setTimeout(async () => {
        await fetchBrandBrain();
        setIsRefining(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error refining section:', error);
      setIsRefining(false);
    }
  }, [activeSection, editedContent, dispatch, fetchBrandBrain]);
  
  // Navigate to next section
  const goToNextSection = useCallback(() => {
    if (!activeSection) return;
    
    const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
    const nextIndex = (currentIndex + 1) % SECTIONS.length;
    const nextSection = SECTIONS[nextIndex];
    
    dispatch({
      type: 'SHOW_SECTION',
      payload: { section: nextSection.id },
    });
  }, [activeSection, dispatch]);
  
  // Navigate to previous section
  const goToPreviousSection = useCallback(() => {
    if (!activeSection) return;
    
    const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
    const prevIndex = (currentIndex - 1 + SECTIONS.length) % SECTIONS.length;
    const prevSection = SECTIONS[prevIndex];
    
    dispatch({
      type: 'SHOW_SECTION',
      payload: { section: prevSection.id },
    });
  }, [activeSection, dispatch]);
  
  // Get current section index
  const currentIndex = SECTIONS.findIndex(s => s.id === activeSection) + 1;
  
  if (step !== 'reviewing_brand_brain') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground body-os">
            Brand Brain review will be available after analysis is complete
          </div>
        </div>
      </div>
    );
  }
  
  if (!activeSection) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground body-os">
            Select a section to review
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-os-surface-elevated rounded-lg">
      {/* Header */}
      <div className="os-window-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-os-accent-soft text-os-accent">
            <span className="font-semibold">{currentIndex}</span>
          </div>
          <div>
            <h3 className="h3-os">{currentSection.title}</h3>
            <p className="caption-os text-muted-foreground">
              {currentSection.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousSection}
            className="btn-base bg-secondary hover:bg-accent text-secondary-foreground"
          >
            Previous
          </button>
          <button
            onClick={goToNextSection}
            className="btn-base bg-os-accent text-primary-foreground hover:opacity-90"
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Edit/Save Controls */}
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-base bg-secondary hover:bg-accent text-secondary-foreground"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-base bg-os-accent text-primary-foreground hover:opacity-90"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-base bg-secondary hover:bg-accent text-secondary-foreground"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleRefine}
                    className="btn-base bg-os-accent-soft text-os-accent hover:opacity-90"
                    disabled={isRefining}
                  >
                    {isRefining ? 'Refining...' : 'AI Refine'}
                  </button>
                </>
              )}
            </div>
            
            {/* Content Area */}
            <div className="space-y-4">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full min-h-[300px] p-4 rounded-lg bg-card border border-input focus:outline-none focus:ring-2 focus:ring-os-accent resize-none body-os"
                  placeholder={currentSection.placeholder}
                  autoFocus
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-sm dark:prose-invert max-w-none"
                >
                  {activeSection === 'pillars' || activeSection === 'recommendations' ? (
                    <div className="space-y-2">
                      {editedContent.split('\n').map((item, index) => (
                        item.trim() && (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-os-accent-soft text-os-accent flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1 body-os">{item}</div>
                          </motion.div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-secondary/50 body-os-lg whitespace-pre-wrap">
                      {editedContent || (
                        <span className="text-muted-foreground italic">
                          No content yet. Click "Edit" to add content for this section.
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* Progress Indicator */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Section {currentIndex} of {SECTIONS.length}
                </div>
                <div className="flex items-center gap-1">
                  {SECTIONS.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => dispatch({
                        type: 'SHOW_SECTION',
                        payload: { section: section.id },
                      })}
                      className={`w-2 h-2 rounded-full transition-all ${
                        section.id === activeSection
                          ? 'bg-os-accent w-4'
                          : 'bg-border hover:bg-input'
                      }`}
                      aria-label={`Go to ${section.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex justify-between">
          <button
            onClick={() => dispatch({ type: 'FINISH_REVIEW' })}
            className="btn-base bg-os-accent text-primary-foreground hover:opacity-90 px-6"
          >
            Complete Review
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={goToPreviousSection}
              className="btn-base bg-secondary hover:bg-accent text-secondary-foreground"
            >
              ← Previous
            </button>
            <button
              onClick={goToNextSection}
              className="btn-base bg-secondary hover:bg-accent text-secondary-foreground"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}