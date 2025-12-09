'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function SystemProcessingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--secondary))] border border-[rgb(var(--border))] px-2 py-0.5"
    >
      <Loader2 className="w-3 h-3 text-[rgb(var(--os-accent))] animate-spin" />
      <span className="text-[10px] text-[rgb(var(--muted-foreground))]">
        Processing…
      </span>
    </motion.div>
  );
}
