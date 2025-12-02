"use client";

import React, { type FC } from "react";
import { motion } from "framer-motion";

interface PricingSectionProps {}

const PricingSection: FC<PricingSectionProps> = () => {
  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[rgb(var(--br-fg-muted))]">
          Early access
        </p>
        <h2 className="text-lg font-semibold tracking-tight sm:text-2xl">
          Join the founding teams in the Brainiark studio.
        </h2>
        <p className="text-sm text-[rgb(var(--br-fg-soft))]">
          We&apos;re opening Brainiark to a limited set of brands and teams. You&apos;ll
          work directly with us as we evolve the OS around real strategic
          workflows.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="panel-base flex flex-col gap-6 bg-[var(--br-glass-bg)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="space-y-2 text-sm text-[rgb(var(--br-fg-soft))]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[rgb(var(--br-fg-muted))]">
            Studio Access
          </p>
          <p className="text-base font-semibold text-foreground">
            One plan while we&apos;re in studio mode.
          </p>
          <p className="text-xs">
            Priority onboarding, strategy co-design sessions, and early access to
            new canvases and flows.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex items-baseline gap-1 text-2xl font-semibold text-foreground">
            <span>$</span>
            <span>—</span>
            <span className="text-xs font-normal text-[rgb(var(--br-fg-soft))]">
              / request invite
            </span>
          </div>
          <button type="button" className="btn-base text-sm">
            Join Waitlist
          </button>
          <p className="text-[10px] text-[rgb(var(--br-fg-muted))]">
            No charge during early access. We design pricing with you.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default PricingSection;
