'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AIThinkingIndicator() {
  return (
    <div className="px-4 pb-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] px-3 py-1">
        <div className="flex gap-1">
          <Dot />
          <Dot delay={0.15} />
          <Dot delay={0.3} />
        </div>
        <span className="text-[11px] text-[rgb(var(--muted-foreground))]">
          Brainiark is thinking…
        </span>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--os-accent))]"
      initial={{ opacity: 0.2, y: 0 }}
      animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}
