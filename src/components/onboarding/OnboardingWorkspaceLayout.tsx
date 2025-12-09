'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  BookOpen,
  FileText,
  Globe2,
  Brain,
  Loader2,
} from 'lucide-react';

import OnboardingChat from './OnboardingChatPanel';
import { OnboardingStateManager, useOnboarding } from './OnboardingStateManager';
import type { OnboardingStep } from '@/types/onboarding';

//
// ------------------------------------------------------------
// Props expected from server (WorkspacePage)
// ------------------------------------------------------------
//
interface OnboardingWorkspaceLayoutProps {
  brandName: string;
  brandSlug: string;

  initialStep: OnboardingStep;
  initialEvidence: any[];
  initialBrain: any | null;

  onComplete?: () => void;
}

//
// ------------------------------------------------------------
// Top-level wrapper (sets up provider)
// ------------------------------------------------------------
//
export default function OnboardingWorkspaceLayout({
  brandName,
  brandSlug,
  initialStep,
  initialEvidence,
  initialBrain,
  onComplete,
}: OnboardingWorkspaceLayoutProps) {
  return (
    <OnboardingStateManager
      slug={brandSlug}
      initialStep={initialStep}
      initialEvidence={initialEvidence}
      initialBrain={initialBrain}
    >
      <OnboardingWorkspaceInner
        brandName={brandName}
        onComplete={onComplete}
      />
    </OnboardingStateManager>
  );
}

//
// ------------------------------------------------------------
// Inner layout — now safe to use useOnboarding
// ------------------------------------------------------------
//
function OnboardingWorkspaceInner({
  brandName,
  onComplete,
}: {
  brandName: string;
  onComplete?: () => void;
}) {
  const { step } = useOnboarding();

  // Notify workspace shell when onboarding completes
  useEffect(() => {
    if (step === 'complete' && onComplete) onComplete();
  }, [step, onComplete]);

  return (
    <div className="flex min-h-screen flex-col bg-[rgb(var(--background))]">
      <OnboardingHeader brandName={brandName} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)]">
          {/* Chat column */}
          <div className="flex flex-col">
            <OnboardingChat />
          </div>

          {/* Right panel */}
          <RightPanel />
        </div>
      </main>
    </div>
  );
}

//
// ------------------------------------------------------------
// Header (no longer references missing fields)
// ------------------------------------------------------------
//
function OnboardingHeader({ brandName }: { brandName: string }) {
  const { step } = useOnboarding();

  const stepLabel =
    step === 'intro'
      ? 'Introduction'
      : step === 'collecting_evidence'
      ? 'Collecting Evidence'
      : step === 'waiting_for_analysis'
      ? 'Ready for Analysis'
      : step === 'analyzing'
      ? 'Analyzing'
      : step === 'reviewing_brand_brain'
      ? 'Reviewing Brand Brain'
      : step === 'complete'
      ? 'Complete'
      : 'Onboarding';

  return (
    <header className="border-b border-[rgb(var(--border))] bg-[rgb(var(--os-surface)/0.9)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.7)] text-white">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
              {brandName}
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Onboarding · {stepLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

//
// ------------------------------------------------------------
// Right Panel routing logic
// ------------------------------------------------------------
//
function RightPanel() {
  const { step } = useOnboarding();

  if (step === 'analyzing' || step === 'waiting_for_analysis') {
    return <AnalysisProgressPanel />;
  }

  if (step === 'reviewing_brand_brain' || step === 'complete') {
    return <BrandBrainReviewPanel />;
  }

  return <EvidencePanel />;
}

//
// ------------------------------------------------------------
// Evidence Panel
// ------------------------------------------------------------
//
function EvidencePanel() {
  const { evidence, addEvidence, removeEvidence, step, startAnalysis } =
    useOnboarding();

  const hasEvidence = evidence.length > 0;

  const handleQuickAdd = async (value: string) => {
    if (!value.trim()) return;
    await addEvidence('website', value.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col rounded-2xl border border-[rgb(var(--border)/0.6)] bg-[rgb(var(--card))] p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-[rgb(var(--os-accent))]" />
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
            Evidence Sources
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Add websites, socials, documents, or descriptions
          </p>
        </div>
      </div>

      <QuickEvidenceInput onSubmit={handleQuickAdd} />

      {/* Evidence List */}
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {hasEvidence ? (
          evidence.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start justify-between rounded-lg border border-[rgb(var(--border)/0.7)] bg-[rgb(var(--secondary))] px-3 py-2"
            >
              <div className="mr-2 flex-1">
                <p className="text-[0.65rem] uppercase text-[rgb(var(--muted-foreground))]">
                  {item.source}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-[rgb(var(--foreground))]">
                  {item.metadata.originalValue || item.content}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeEvidence(item.id)}
                className="ml-2 rounded-full p-1 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--card))]"
              >
                ×
              </button>
            </motion.div>
          ))
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--secondary))] p-3 text-center">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              No evidence yet. Paste a website, social profile, or short description to begin.
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-4 border-t border-[rgb(var(--border)/0.7)] pt-3">
        <button
          type="button"
          onClick={() => startAnalysis({ brandNameOnly: !hasEvidence })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[rgb(var(--os-accent))] px-3 py-2 text-sm font-medium text-white shadow-sm"
        >
          <Brain className="h-4 w-4" />
          {hasEvidence ? 'Proceed to Brand Analysis' : 'Analyze my brand from its name'}
        </button>
      </div>
    </motion.div>
  );
}

//
// ------------------------------------------------------------
// Quick Evidence Input
// ------------------------------------------------------------
//
function QuickEvidenceInput({
  onSubmit,
}: {
  onSubmit: (value: string) => void | Promise<void>;
}) {
  const [value, setValue] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const handleSubmit = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    await onSubmit(value.trim());
    setValue('');
    setBusy(false);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-xs"
        placeholder="Paste a website or short description…"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!value.trim() || busy}
        className="rounded-lg bg-[rgb(var(--os-accent))] px-3 py-2 text-xs text-white"
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
      </button>
    </div>
  );
}

//
// ------------------------------------------------------------
// Analysis Progress Panel (simplified to match provider)
// ------------------------------------------------------------
//
function AnalysisProgressPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col rounded-2xl border border-[rgb(var(--border)/0.6)] bg-[rgb(var(--card))] p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Loader2 className="h-4 w-4 animate-spin text-[rgb(var(--os-accent))]" />
        <p className="text-sm font-semibold">Analyzing your brand…</p>
      </div>

      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        This may take up to 20–30 seconds. You can continue chatting while I work.
      </p>
    </motion.div>
  );
}

//
// ------------------------------------------------------------
// Brand Brain Review Panel
// ------------------------------------------------------------
//
function BrandBrainReviewPanel() {
  const { brandBrain, updateBrandBrain, completeOnboarding } = useOnboarding();
  const [local, setLocal] = React.useState(brandBrain);

  useEffect(() => setLocal(brandBrain), [brandBrain]);

  if (!local) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border p-4">
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Brand Brain not available yet.
        </p>
      </div>
    );
  }

  const handleChange = (field: keyof typeof local, value: any) => {
    setLocal((prev) => prev && { ...prev, [field]: value });
  };

  const handleSave = () =>
    updateBrandBrain({
      summary: local.summary,
      audience: local.audience,
      tone: local.tone,
      pillars: local.pillars,
      competitors: local.competitors,
      channels: local.channels,
      recommendations: local.recommendations,
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col gap-3 rounded-xl border border-[rgb(var(--border)/0.6)] bg-[rgb(var(--card))] p-4"
    >
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[rgb(var(--os-accent))]" />
          Review Your Brand Brain
        </h3>
        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          Adjust anything you like before activating your workspace.
        </p>
      </div>

      <SectionEditor
        icon={FileText}
        title="Summary"
        value={local.summary}
        onChange={(v) => handleChange('summary', v)}
      />

      <SectionEditor
        icon={Globe2}
        title="Audience"
        value={local.audience}
        onChange={(v) => handleChange('audience', v)}
      />

      <SectionEditor
        icon={FileText}
        title="Tone & Voice"
        value={local.tone}
        onChange={(v) => handleChange('tone', v)}
      />

      <TagListEditor
        title="Content Pillars"
        value={local.pillars}
        onChange={(v) => handleChange('pillars', v)}
      />

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg border px-3 py-2 text-xs"
        >
          Save changes
        </button>

        <button
          type="button"
          onClick={() => completeOnboarding()}
          className="rounded-lg bg-[rgb(var(--os-accent))] px-3 py-2 text-xs text-white"
        >
          Complete onboarding
        </button>
      </div>
    </motion.div>
  );
}

//
// ------------------------------------------------------------
// Subcomponents
// ------------------------------------------------------------
//
function SectionEditor({
  icon: Icon,
  title,
  value,
  onChange,
}: {
  icon: any;
  title: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1 rounded-lg border bg-[rgb(var(--secondary))] p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3 w-3 text-[rgb(var(--os-accent))]" />
        <p className="text-xs font-medium">{title}</p>
      </div>
      <textarea
        className="w-full rounded-md border bg-[rgb(var(--card))] p-2 text-xs"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TagListEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = React.useState('');

  const add = () => {
    if (!input.trim()) return;
    onChange([...value, input.trim()]);
    setInput('');
  };

  const remove = (idx: number) =>
    onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2 rounded-lg border bg-[rgb(var(--secondary))] p-3">
      <p className="text-xs font-medium">{title}</p>
      <div className="flex flex-wrap gap-1">
        {value.map((tag, i) => (
          <span
            key={i}
            className="rounded-full bg-[rgb(var(--card))] px-2 py-1 text-xs flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => remove(i)}
              className="text-[rgb(var(--muted-foreground))]"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border bg-[rgb(var(--card))] p-2 text-xs"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a pillar…"
        />
        <button
          className="rounded-md bg-[rgb(var(--os-accent))] px-3 py-1.5 text-xs text-white"
          onClick={add}
          disabled={!input.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
}
