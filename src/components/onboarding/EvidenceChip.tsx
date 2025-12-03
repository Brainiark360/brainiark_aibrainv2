// /src/components/onboarding/EvidenceChip.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2, FileText, Globe, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EvidenceSourceInput } from '@/types/workspace';

export type EvidenceStatus = 'queued' | 'processing' | 'fused';

interface EvidenceChipProps {
  evidence: EvidenceSourceInput;
  status: EvidenceStatus;
  onRemove?: (id: string) => void;
}

const EvidenceChip: React.FC<EvidenceChipProps> = ({
  evidence,
  status,
  onRemove,
}) => {
  const getIcon = () => {
    switch (evidence.type) {
      case 'website':
        return <Globe className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'queued':
        return null;
      case 'processing':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'fused':
        return <Check className="w-3 h-3" />;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const chipVariants = {
    initial: { opacity: 0, y: 6, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: { opacity: 0, y: -4, scale: 0.9, transition: { duration: 0.2 } },
    processing: {
      borderColor: 'rgb(var(--os-accent))',
      backgroundColor: 'rgb(var(--os-accent)/0.05)',
      transition: { duration: 0.3 }
    },
    fused: {
      borderColor: 'rgb(var(--os-accent)/0.3)',
      backgroundColor: 'rgb(var(--os-accent)/0.1)',
      scale: [1, 1.02, 1],
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      variants={chipVariants}
      initial="initial"
      animate={[
        'animate',
        status === 'processing' && 'processing',
        status === 'fused' && 'fused'
      ].filter(Boolean)}
      exit="exit"
      className={cn(
        'relative group flex items-center gap-2 px-3 py-2',
        'rounded-xl border backdrop-blur-sm',
        'transition-all duration-200',
        status === 'queued' && [
          'border-dashed border-[rgb(var(--border)/0.5)]',
          'bg-[rgb(var(--os-surface)/0.3)]',
          'opacity-70'
        ],
        status === 'processing' && [
          'border-[rgb(var(--os-accent))]',
          'bg-[rgb(var(--os-accent)/0.05)]',
          'animate-pulse'
        ],
        status === 'fused' && [
          'border-[rgb(var(--os-accent)/0.3)]',
          'bg-[rgb(var(--os-accent)/0.1)]',
          'text-[rgb(var(--os-accent))]'
        ]
      )}
    >
      {/* Glow effect for fused state */}
      {status === 'fused' && (
        <div className="absolute inset-0 rounded-xl bg-[rgb(var(--os-accent)/0.1)] blur-sm -z-10" />
      )}

      {/* Evidence Icon */}
      <div className={cn(
        'flex-shrink-0',
        status === 'fused' && 'text-[rgb(var(--os-accent))]',
        status === 'processing' && 'text-[rgb(var(--os-accent))]',
        status === 'queued' && 'text-[rgb(var(--muted-foreground))]'
      )}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {evidence.type === 'website' 
            ? new URL(evidence.content).hostname
            : evidence.name || truncateText(evidence.content, 30)}
        </p>
        <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
          {evidence.type === 'website' 
            ? truncateText(evidence.content, 40)
            : evidence.type.toUpperCase()}
        </p>
      </div>

      {/* Status Indicator */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-[rgb(var(--os-accent))]"
          >
            Analyzing...
          </motion.div>
        )}
        
        {getStatusIcon() && (
          <div className={cn(
            'flex items-center justify-center w-5 h-5',
            status === 'fused' && 'text-[rgb(var(--os-accent))]',
            status === 'processing' && 'text-[rgb(var(--os-accent))]'
          )}>
            {getStatusIcon()}
          </div>
        )}

        {/* Remove Button */}
        {onRemove && status !== 'processing' && (
          <button
            onClick={() => onRemove(evidence.id)}
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'p-1 hover:bg-[rgb(var(--border)/0.2)] rounded'
            )}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[rgb(var(--os-surface))] border border-[rgb(var(--border))] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {status === 'fused' ? 'Fused into Brand Brain' : 
         status === 'processing' ? 'Analyzing...' : 
         'Click to remove'}
      </div>
    </motion.div>
  );
};

export default EvidenceChip;