// components/ui/ThinkingIndicator.tsx
'use client';

import { motion } from 'framer-motion';

export function ThinkingIndicator() {
  return (
    <div className="flex items-center space-x-2 text-gray-500">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-2 h-2 bg-blue-400 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        className="w-2 h-2 bg-blue-400 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        className="w-2 h-2 bg-blue-400 rounded-full"
      />
      <span className="text-sm font-medium">AI is thinking...</span>
    </div>
  );
}