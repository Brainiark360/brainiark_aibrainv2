"use client";

import { fadeUp, staggerContainer } from "@/lib/motion-variants";
import type {  BrandDraft, OnboardingMode } from "@/types/onboarding";
import { motion } from "framer-motion";

interface OnboardingReviewProps {
  mode: OnboardingMode;
  draft: BrandDraft;
  isSaving: boolean;
  onDraftChange: (draft: BrandDraft) => void;
  onSaveDraft: (draft: BrandDraft) => Promise<void> | void;
  onActivate: () => void;
  onBackToEvidence: () => void;
}

export default function OnboardingReview({
  draft,
  isSaving,
  onDraftChange,
  onSaveDraft,
  onActivate,
  onBackToEvidence,
}: OnboardingReviewProps) {
  return (
    <div className="w-full pt-12 pb-16">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-10"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="flex items-start justify-between gap-4"
        >
          <div className="space-y-2">
            <h2 className="h2-os">Review your Brand Brain</h2>

            <p className="body-os text-[rgb(var(--muted-foreground))] max-w-xl">
              This is how I currently understand your brand from the evidence you
              provided. Adjust anything before activating the workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToEvidence}
            className="
              text-xs body-os
              text-[rgb(var(--muted-foreground))]
              hover:text-[rgb(var(--foreground))]
              flex items-center gap-1
              transition-all duration-200
              hover:-translate-x-0.5
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[rgb(var(--os-accent))]
              rounded-md
              px-1.5 py-1
            "
          >
            <span className="text-sm">←</span>
            Back to evidence
          </button>
        </motion.div>

        {/* REVIEW CONTENT AREA */}
        <motion.div
          variants={fadeUp}
          className="
            border border-[rgb(var(--border))]
            rounded-xl bg-[rgb(var(--os-surface)/0.4)]
            backdrop-blur-md
            px-6 py-8
            shadow-[0_8px_24px_rgba(0,0,0,0.15)]
          "
        >
          {/* You will drop in your structured review UI (cards, meters etc.) */}
          <div className="text-center py-12 text-[rgb(var(--muted-foreground))] body-os">
            {/* TEMPORARY Placeholder */}
            Review section content goes here (brand attributes, confidence meters, etc.)
          </div>
        </motion.div>

        {/* Footer Buttons */}
        <motion.div
          variants={fadeUp}
          className="
            pt-8 border-t border-[rgb(var(--border))]
            flex flex-col sm:flex-row items-center justify-between gap-4
          "
        >
          <div className="flex gap-3 w-full sm:w-auto">
            {/* PRIMARY — ACTIVATE */}
            <button
              type="button"
              disabled={isSaving}
              onClick={async () => {
                await onSaveDraft(draft);
                onActivate();
              }}
              className={`
                flex-1 sm:flex-none px-7 py-3 rounded-xl text-sm font-medium
                bg-[rgb(var(--os-accent))]
                text-[rgb(var(--os-accent-foreground))]
                shadow-[0_4px_14px_rgba(0,0,0,0.25)]
                transition-all duration-200
                hover:brightness-110 hover:-translate-y-0.5
                active:translate-y-0
                disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed
                focus:outline-none
                focus-visible:ring-2 focus-visible:ring-[rgb(var(--os-accent))]
                focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background))]
              `}
            >
              {isSaving ? "Saving…" : "Activate Workspace"}
            </button>

            {/* SECONDARY — SAVE */}
            <button
              type="button"
              onClick={() => onSaveDraft(draft)}
              className="
                flex-1 sm:flex-none px-6 py-3 rounded-xl
                border border-[rgb(var(--border))]
                text-sm font-medium body-os
                text-[rgb(var(--foreground))]
                hover:bg-[rgb(var(--os-surface)/0.6)]
                transition-all duration-200
                active:scale-[0.98]
                focus:outline-none
                focus-visible:ring-2 focus-visible:ring-[rgb(var(--os-accent))]
                focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background))]
            "
            >
              Save & refine later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
