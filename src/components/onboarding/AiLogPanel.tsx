// /src/components/onboarding/AiLogPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Brain, Zap, ChevronDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AiLogItem {
  id: string;
  type: 'system' | 'insight' | 'action';
  message: string;
  details?: string;
  createdAt: number;
}

interface AiLogPanelProps {
  logs: AiLogItem[];
  autoScroll?: boolean;
  compact?: boolean;
  className?: string;
}

const AiLogPanel: React.FC<AiLogPanelProps> = ({
  logs,
  autoScroll = true,
  compact = false,
  className,
}) => {
  const [isAutoScrolling, setIsAutoScrolling] = useState(autoScroll);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const getIcon = (type: AiLogItem['type']) => {
    switch (type) {
      case 'system': return <Cpu className="w-3.5 h-3.5" />;
      case 'insight': return <Brain className="w-3.5 h-3.5" />;
      case 'action': return <Zap className="w-3.5 h-3.5" />;
    }
  };

  const getColorClass = (type: AiLogItem['type']) => {
    switch (type) {
      case 'system': return 'text-[rgb(var(--muted-foreground))] border-l-[rgb(var(--muted-foreground)/0.3)]';
      case 'insight': return 'text-[rgb(var(--os-accent))] border-l-[rgb(var(--os-accent)/0.4)]';
      case 'action': return 'text-[rgb(var(--os-accent))] border-l-[rgb(var(--os-accent)/0.6)]';
    }
  };

  const groupLogsByTime = (logs: AiLogItem[]) => {
    const groups: AiLogItem[][] = [];
    let currentGroup: AiLogItem[] = [];
    let lastTime = 0;

    logs.forEach((log, index) => {
      if (index === 0 || log.createdAt - lastTime > 3000) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [log];
      } else {
        currentGroup.push(log);
      }
      lastTime = log.createdAt;
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isAtBottom && !isAutoScrolling) {
      setIsAutoScrolling(true);
      setShowScrollButton(false);
    } else if (!isAtBottom && isAutoScrolling) {
      setIsAutoScrolling(false);
      setShowScrollButton(true);
    }
  };

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAutoScrolling(true);
    setShowScrollButton(false);
  };

  useEffect(() => {
    if (isAutoScrolling && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isAutoScrolling]);

  const logGroups = groupLogsByTime(logs);

  return (
    <div className={cn(
      'relative h-full bg-[rgb(var(--os-surface)/0.7)] backdrop-blur-xl',
      'border border-[rgb(var(--border)/0.3)] rounded-2xl',
      'shadow-lg overflow-hidden',
      compact ? 'p-3' : 'p-4',
      className
    )}>
      {/* Glassmorphic background with noise */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
      
      {/* AI Activity Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--os-accent)/0.3)]" />
          <div className="relative w-2 h-2 rounded-full bg-[rgb(var(--os-accent))]" />
        </div>
        <span className="text-xs text-[rgb(var(--muted-foreground))]">
          AI is thinking...
        </span>
      </div>

      {/* Neural Ring Decoration */}
      <div className="absolute -top-12 -left-12 w-24 h-24">
        <div className="absolute inset-0 rounded-full border-2 border-[rgb(var(--os-accent)/0.2)] animate-spin-slow" />
        <div className="absolute inset-4 rounded-full border-2 border-[rgb(var(--os-accent)/0.15)] animate-spin-slower reverse" />
      </div>

      {/* Logs Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[rgb(var(--border)/0.5)] scrollbar-track-transparent"
        onScroll={handleScroll}
      >
        <div className={cn('space-y-4', compact ? 'space-y-2' : 'space-y-4')}>
          <AnimatePresence>
            {logGroups.map((group) => (
              <motion.div
                key={`group-${group[0].id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {/* Timestamp Header */}
                {group.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground)/0.7)]">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(group[0].createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit' 
                    })}</span>
                    <div className="flex-1 h-px bg-[rgb(var(--border)/0.3)]" />
                  </div>
                )}

                {/* Log Items */}
                {group.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border-l-4',
                      getColorClass(log.type),
                      compact && 'p-2',
                      log.type === 'insight' && 'bg-[rgb(var(--os-accent)/0.05)]',
                      log.type === 'action' && 'bg-[rgb(var(--os-accent)/0.02)]'
                    )}
                  >
                    <div className={cn(
                      'mt-0.5',
                      log.type === 'insight' && 'animate-pulse',
                      log.type === 'action' && 'animate-pulse'
                    )}>
                      {getIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <motion.p
                        className={cn(
                          'text-sm font-medium leading-snug',
                          compact && 'text-xs'
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {log.message}
                      </motion.p>
                      {log.details && (
                        <motion.p
                          className="text-xs text-[rgb(var(--muted-foreground))] mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {log.details}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      </div>

      {/* Scroll to Latest Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className={cn(
              "absolute bottom-4 left-1/2 transform -translate-x-1/2",
              "px-3 py-1.5 bg-[rgb(var(--os-surface))] border border-[rgb(var(--border)/0.4)]",
              "rounded-full shadow-lg backdrop-blur-sm",
              "flex items-center gap-2 text-xs text-[rgb(var(--foreground))]",
              "hover:bg-[rgb(var(--os-surface)/0.9)] transition-colors"
            )}
          >
            <ChevronDown className="w-3 h-3" />
            Scroll to latest
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiLogPanel;