'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Edit3, Sparkles, Check, X } from 'lucide-react';

import {
  useOnboarding,
  BrandBrainData,
} from './OnboardingStateManager';
import type { OnboardingStep } from '@/types/onboarding';

interface OnboardingBrandBrainReviewPanelProps {
  step: OnboardingStep;
  brain: BrandBrainData;
  isProcessing: boolean;
}

export function OnboardingBrandBrainReviewPanel({
  step,
  brain,
  isProcessing,
}: OnboardingBrandBrainReviewPanelProps) {
  const { updateBrandBrain, completeOnboarding, sendChatMessage } = useOnboarding();

  const isComplete = step === 'complete';

  const handleRefineSection = async (section: string, content: string) => {
    const prompt = `Please refine the "${section}" section of my Brand Brain to be clearer and more strategic. Here is the current content:\n\n${content}`;
    await sendChatMessage(prompt);
  };

  const handleComplete = async () => {
    await completeOnboarding();
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--card)/0.9)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[rgb(var(--os-accent-soft))] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[rgb(var(--os-accent))]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wide">
              Brand Brain Review
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Review and polish your brand’s strategic foundation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[rgb(var(--muted-foreground))]">
          <Sparkles className="w-3 h-3 text-[rgb(var(--os-accent))]" />
          <span>{isComplete ? 'Activated' : 'Almost done'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin bg-[rgb(var(--os-surface))]">
        <BrandBrainSectionEditor
          title="Brand Summary"
          description="High-level overview of your brand’s purpose and positioning."
          sectionKey="summary"
          value={brain.summary}
          isMultiline
          onSave={async (val) => updateBrandBrain({ summary: val })}
          onRefine={() => handleRefineSection('Brand Summary', brain.summary)}
        />

        <BrandBrainSectionEditor
          title="Target Audience"
          description="Who your brand is primarily speaking to."
          sectionKey="audience"
          value={brain.audience}
          isMultiline
          onSave={async (val) => updateBrandBrain({ audience: val })}
          onRefine={() => handleRefineSection('Target Audience', brain.audience)}
        />

        <BrandBrainSectionEditor
          title="Brand Tone & Voice"
          description="How your brand should sound across messaging."
          sectionKey="tone"
          value={brain.tone}
          isMultiline
          onSave={async (val) => updateBrandBrain({ tone: val })}
          onRefine={() => handleRefineSection('Brand Tone', brain.tone)}
        />

        <BrandBrainListSectionEditor
          title="Content Pillars"
          description="Key themes your content should consistently cover."
          sectionKey="pillars"
          values={brain.pillars}
          onSave={async (vals) => updateBrandBrain({ pillars: vals })}
          onRefine={() =>
            handleRefineSection('Content Pillars', brain.pillars.join('\n'))
          }
        />

        <BrandBrainSectionEditor
          title="Offers & Value Proposition"
          description="What you offer and why it matters to your audience."
          sectionKey="offers"
          value={brain.offers}
          isMultiline
          onSave={async (val) => updateBrandBrain({ offers: val })}
          onRefine={() => handleRefineSection('Offers', brain.offers)}
        />

        <BrandBrainListSectionEditor
          title="Key Competitors"
          description="Brands your audience might consider instead of you."
          sectionKey="competitors"
          values={brain.competitors}
          onSave={async (vals) => updateBrandBrain({ competitors: vals })}
          onRefine={() =>
            handleRefineSection('Competitors', brain.competitors.join('\n'))
          }
        />

        <BrandBrainListSectionEditor
          title="Primary Channels"
          description="Where your brand should be consistently showing up."
          sectionKey="channels"
          values={brain.channels}
          onSave={async (vals) => updateBrandBrain({ channels: vals })}
          onRefine={() =>
            handleRefineSection('Channels', brain.channels.join('\n'))
          }
        />

        {brain.recommendations && brain.recommendations.length > 0 && (
          <BrandBrainListSectionEditor
            title="Strategic Recommendations"
            description="Next steps and strategic moves based on your brand."
            sectionKey="recommendations"
            values={brain.recommendations}
            onSave={async (vals) =>
              updateBrandBrain({ recommendations: vals })
            }
            onRefine={() =>
              handleRefineSection(
                'Strategic Recommendations',
                brain.recommendations?.join('\n') ?? ''
              )
            }
          />
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-[rgb(var(--border))] px-4 py-3 bg-[rgb(var(--card))] flex items-center justify-between gap-3">
        <p className="text-[11px] text-[rgb(var(--muted-foreground))] max-w-xs">
          Once you’re happy with these sections, activate your Brand Brain to
          power strategies and content across Brainiark.
        </p>
        <button
          type="button"
          onClick={handleComplete}
          disabled={isProcessing || isComplete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgb(var(--os-accent))] text-white text-[11px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-3 h-3" />
          {isComplete ? 'Brand Brain Activated' : 'Activate Brand Brain'}
        </button>
      </div>
    </>
  );
}

interface BrandBrainSectionEditorProps {
  title: string;
  description: string;
  sectionKey: string;
  value: string;
  isMultiline?: boolean;
  onSave: (value: string) => Promise<void>;
  onRefine: () => Promise<void>;
}

function BrandBrainSectionEditor({
  title,
  description,
  value,
  isMultiline = true,
  onSave,
  onRefine,
}: BrandBrainSectionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleStartEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleSave = async () => {
    if (draft.trim() === value.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    setEditing(false);
  };

  const displayValue = value || 'No content yet. Let Brainiark help you draft this.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] px-3 py-2"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <p className="text-xs font-semibold text-[rgb(var(--foreground))]">
            {title}
          </p>
          <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefine}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[rgb(var(--os-accent-soft))] text-[rgb(var(--os-accent))] text-[10px] border border-[rgb(var(--os-accent))]"
          >
            <Sparkles className="w-3 h-3" />
            Refine with AI
          </button>
          <button
            type="button"
            onClick={handleStartEdit}
            className="p-1 rounded-md hover:bg-[rgb(var(--secondary))]"
          >
            <Edit3 className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-1 space-y-2">
          {isMultiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="w-full text-xs rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--input))] text-[rgb(var(--foreground))] px-2 py-1 outline-none"
            />
          ) : (
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full text-xs rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--input))] text-[rgb(var(--foreground))] px-2 py-1 outline-none"
            />
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgb(var(--os-accent))] text-white text-[10px] disabled:opacity-50"
            >
              <Check className="w-3 h-3" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-xs text-[rgb(var(--foreground))] whitespace-pre-wrap">
          {displayValue}
        </p>
      )}
    </motion.div>
  );
}

interface BrandBrainListSectionEditorProps {
  title: string;
  description: string;
  sectionKey: string;
  values: string[];
  onSave: (values: string[]) => Promise<void>;
  onRefine: () => Promise<void>;
}

function BrandBrainListSectionEditor({
  title,
  description,
  values,
  onSave,
  onRefine,
}: BrandBrainListSectionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(values.join('\n'));
  const [saving, setSaving] = useState(false);

  const handleStartEdit = () => {
    setDraft(values.join('\n'));
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(values.join('\n'));
    setEditing(false);
  };

  const handleSave = async () => {
    const lines = draft
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setSaving(true);
    await onSave(lines);
    setSaving(false);
    setEditing(false);
  };

  const displayValues = values.length
    ? values
    : ['No items yet. Add a few bullet points to get started.'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] px-3 py-2"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <p className="text-xs font-semibold text-[rgb(var(--foreground))]">
            {title}
          </p>
          <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefine}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[rgb(var(--os-accent-soft))] text-[rgb(var(--os-accent))] text-[10px] border border-[rgb(var(--os-accent))]"
          >
            <Sparkles className="w-3 h-3" />
            Refine with AI
          </button>
          <button
            type="button"
            onClick={handleStartEdit}
            className="p-1 rounded-md hover:bg-[rgb(var(--secondary))]"
          >
            <Edit3 className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-1 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="w-full text-xs rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--input))] text-[rgb(var(--foreground))] px-2 py-1 outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgb(var(--os-accent))] text-white text-[10px] disabled:opacity-50"
            >
              <Check className="w-3 h-3" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <ul className="mt-1 space-y-1.5">
          {displayValues.map((val, idx) => (
            <li
              key={`${val}-${idx}`}
              className="flex items-start gap-1 text-xs text-[rgb(var(--foreground))]"
            >
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[rgb(var(--os-accent))]" />
              <span>{val}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
