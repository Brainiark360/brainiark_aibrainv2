// /src/components/onboarding/EvidenceDock.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import EvidenceChip from './EvidenceChip';
import type { EvidenceStatus } from './EvidenceChip';
import { EvidenceSourceInput } from '@/types/workspace';

interface EvidenceDockProps {
  sources?: EvidenceSourceInput[]; // Made optional
  statuses?: Record<string, EvidenceStatus>; // Made optional
  onRemove?: (id: string) => void;
  onAddMore?: () => void;
}

const EvidenceDock: React.FC<EvidenceDockProps> = ({
  sources: propSources,
  statuses: propStatuses,
  onRemove,
  onAddMore,
}) => {
  // Provide safe defaults
  const sources = propSources || [];
  const statuses = propStatuses || {};
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  // Safely get processing stats
  const processingCount = Object.values(statuses).filter(s => s === 'processing').length;
  const fusedCount = Object.values(statuses).filter(s => s === 'fused').length;
  const totalSources = sources.length;
  
  // Calculate progress percentage safely
  const progressPercentage = totalSources > 0 
    ? (fusedCount / totalSources) * 100 
    : 0;

  return (
    <div className="relative h-full bg-[rgb(var(--os-surface)/0.4)] backdrop-blur-xl border border-[rgb(var(--border)/0.3)] rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
            Evidence Dock
          </h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            {totalSources} source{totalSources !== 1 ? 's' : ''} added
          </p>
        </div>
        
        {onAddMore && (
          <button
            onClick={onAddMore}
            className="p-2 rounded-lg border border-[rgb(var(--border)/0.4)] hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors"
            aria-label="Add more evidence"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dock Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-2 max-h-[calc(100%-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-[rgb(var(--border)/0.5)] scrollbar-track-transparent"
      >
        <AnimatePresence>
          {sources.map((source) => {
            if (!source || !source.id) return null; // Skip invalid sources
            
            return (
              <EvidenceChip
                key={source.id}
                evidence={source}
                status={statuses[source.id] || 'queued'}
                onRemove={onRemove}
              />
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {totalSources === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[rgb(var(--border)/0.4)] flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-[rgb(var(--muted-foreground)/0.5)]" />
            </div>
            <h4 className="text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              No evidence added yet
            </h4>
            <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-xs">
              Add websites, documents, or images to help Brainiark understand your brand
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Processing Stats */}
      {totalSources > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-xs text-[rgb(var(--muted-foreground))]">
            <span>
              {processingCount} processing
            </span>
            <span>
              {fusedCount} fused
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 h-1 bg-[rgb(var(--border)/0.3)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${progressPercentage}%` 
              }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="h-full bg-[rgb(var(--os-accent))] rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceDock;