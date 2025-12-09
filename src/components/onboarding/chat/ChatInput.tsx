'use client';

import React, { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Link2, FileText, Globe2 } from 'lucide-react';

interface ChatInputProps {
  disabled?: boolean;
  onSend: (text: string) => Promise<void>;
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    setValue('');
    await onSend(trimmed);
  };

  const placeholder = disabled
    ? 'Onboarding is complete.'
    : 'Ask Brainiark anything about your brand or paste a link…';

  return (
    <form onSubmit={handleSubmit} className="px-3 py-2">
      <div className="flex items-end gap-2">
        {/* Quick hint icons (purely visual for now) */}
        <div className="hidden sm:flex flex-col gap-1 text-[rgb(var(--muted-foreground))]">
          <div className="flex items-center gap-1 text-[10px]">
            <Globe2 className="w-3 h-3" />
            <span>Website</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <Link2 className="w-3 h-3" />
            <span>Social link</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <FileText className="w-3 h-3" />
            <span>Docs</span>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[rgb(var(--foreground))] text-sm outline-none placeholder:text-[rgb(var(--muted-foreground))]"
            disabled={disabled}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: disabled ? 1 : 1.03 }}
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            disabled={disabled || value.trim().length === 0}
            className="inline-flex items-center justify-center rounded-full w-8 h-8 bg-[rgb(var(--os-accent))] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-[rgb(var(--muted-foreground))]">
          Brainiark uses your messages to build a better Brand Brain.
        </span>
      </div>
    </form>
  );
}
