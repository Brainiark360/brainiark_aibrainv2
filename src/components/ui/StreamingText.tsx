// components/ui/StreamingText.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StreamingTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function StreamingText({ text, speed = 20, className = '', onComplete }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex >= text.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div className={`relative ${className}`}>
      <span className="text-gray-800">{displayedText}</span>
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="ml-0.5 w-[2px] h-5 bg-blue-500 inline-block"
        />
      )}
    </div>
  );
}