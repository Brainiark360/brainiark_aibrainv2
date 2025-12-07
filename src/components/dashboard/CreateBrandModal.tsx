'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateBrandModalProps {
  onClose: () => void;
  onBrandCreated: (slug: string) => void;
}

export function CreateBrandModal({ onClose, onBrandCreated }: CreateBrandModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [brandName, setBrandName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandName.trim()) {
      setError('Brand name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: brandName.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create brand');
        return;
      }

      // Show AI feedback
      console.log(`Nice. I've set up a workspace for ${brandName}.`);
      
      // Close modal and navigate
      onBrandCreated(data.data.slug);
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md card-base p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="h2-os text-[rgb(var(--foreground))]">
              Create a Brand
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors"
            >
              <svg className="w-5 h-5 text-[rgb(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="body-os text-[rgb(var(--foreground))] font-medium">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full px-3 py-2 rounded-lg bg-[rgb(var(--input))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--os-accent))] placeholder:text-[rgb(var(--muted-foreground))]"
                autoFocus
              />
              <p className="caption-os text-[rgb(var(--muted-foreground))]">
                This will be your brand's display name
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !brandName.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Creating...' : 'Create Brand'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}