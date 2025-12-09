'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Globe2, FileText, Link2, Search } from 'lucide-react';

import { useOnboarding, EvidenceItem } from './OnboardingStateManager';
import type { OnboardingStep } from '@/types/onboarding';

interface OnboardingEvidencePanelProps {
  evidence: EvidenceItem[];
  step: OnboardingStep;
}

export function OnboardingEvidencePanel({
  evidence,
  step,
}: OnboardingEvidencePanelProps) {
  const { removeEvidence, addEvidence } = useOnboarding();

  const showEmptyState = evidence.length === 0;

  const handleQuickAddBrandNameSearch = async () => {
    // Use a special "brand_name_search" evidence type via the API
    // mapped to "search" on the frontend.
    await addEvidence('brand_name_search', 'Brand name search');
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--card)/0.9)]">
        <div>
          <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wide">
            Evidence
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            {evidence.length} item{evidence.length === 1 ? '' : 's'} collected
          </p>
        </div>
        {step !== 'complete' && (
          <button
            type="button"
            onClick={handleQuickAddBrandNameSearch}
            className="text-[11px] px-2 py-1 rounded-full bg-[rgb(var(--os-accent-soft))] text-[rgb(var(--os-accent))] border border-[rgb(var(--os-accent))]"
          >
            Quick brand search
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin bg-[rgb(var(--os-surface))]">
        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center text-center py-10 text-[rgb(var(--muted-foreground))] text-xs">
            <p className="mb-2">
              No evidence yet. Add a website, social link, or document through
              the chat.
            </p>
            <p>
              Brainiark will use this to build a more accurate Brand Brain.
            </p>
          </div>
        ) : (
          evidence.map((item) => (
            <EvidenceRow
              key={item.id}
              item={item}
              onDelete={() => removeEvidence(item.id)}
            />
          ))
        )}
      </div>
    </>
  );
}

interface EvidenceRowProps {
  item: EvidenceItem;
  onDelete: () => Promise<void>;
}

function EvidenceRow({ item, onDelete }: EvidenceRowProps) {
  const icon = getEvidenceIcon(item.type, item.metadata.searchType);
  const statusLabel = item.metadata.status || 'pending';

  const statusColorClasses = getStatusColorClasses(statusLabel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2"
    >
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-[rgb(var(--foreground))] truncate">
            {item.metadata.originalValue}
          </p>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusColorClasses}`}
          >
            {statusLabel}
          </span>
        </div>
        {item.metadata.analysisSummary && (
          <p className="mt-1 text-[11px] text-[rgb(var(--muted-foreground))] line-clamp-2">
            {item.metadata.analysisSummary}
          </p>
        )}
        {!item.metadata.analysisSummary && item.content && (
          <p className="mt-1 text-[11px] text-[rgb(var(--muted-foreground))] line-clamp-2">
            {item.content}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="flex-shrink-0 p-1 rounded-md hover:bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]"
        aria-label="Delete evidence"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

function getEvidenceIcon(type: EvidenceItem['type'], searchType?: string) {
  if (type === 'url') {
    return (
      <div className="w-6 h-6 rounded-full bg-[rgb(var(--os-accent-soft))] flex items-center justify-center">
        <Globe2 className="w-3 h-3 text-[rgb(var(--os-accent))]" />
      </div>
    );
  }
  if (type === 'file') {
    return (
      <div className="w-6 h-6 rounded-full bg-[rgb(var(--os-accent-soft))] flex items-center justify-center">
        <FileText className="w-3 h-3 text-[rgb(var(--os-accent))]" />
      </div>
    );
  }
  if (type === 'search' || searchType === 'brand_search') {
    return (
      <div className="w-6 h-6 rounded-full bg-[rgb(var(--os-accent-soft))] flex items-center justify-center">
        <Search className="w-3 h-3 text-[rgb(var(--os-accent))]" />
      </div>
    );
  }
  // default text
  return (
    <div className="w-6 h-6 rounded-full bg-[rgb(var(--os-accent-soft))] flex items-center justify-center">
      <Link2 className="w-3 h-3 text-[rgb(var(--os-accent))]" />
    </div>
  );
}

function getStatusColorClasses(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'complete') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (normalized === 'processing') {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
  }
  if (normalized === 'failed') {
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
  }
  // pending
  return 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] border-[rgb(var(--border))]';
}
