'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIChatMessageProps {
  message: string;
  isTyping?: boolean;
  delay?: number;
}

export default function AIChatMessage({ message, isTyping = false, delay = 0 }: AIChatMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isTyping && currentIndex < message.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + message[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // Faster typing speed
      return () => clearTimeout(timeout);
    } else if (!isTyping) {
      setDisplayedText(message);
      setCurrentIndex(message.length);
    }
  }, [currentIndex, isTyping, message]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000 }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[rgb(var(--muted-foreground))] mb-1">
          Brainiark AI
        </div>
        <div className="p-3 rounded-lg bg-[rgb(var(--secondary))]">
          <p className="text-[rgb(var(--foreground))] break-words">
            {displayedText}
            {isTyping && currentIndex < message.length && (
              <span className="ml-1 inline-block w-2 h-4 bg-[rgb(var(--os-accent))] animate-pulse" />
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}