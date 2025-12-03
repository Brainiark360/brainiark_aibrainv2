"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TerminalMessage {
  id: string;
  text: string;
  type: "system" | "action" | "insight" | "thinking";
  timestamp: number;
}

interface TerminalThinkingStreamProps {
  messages?: TerminalMessage[];
  mode?: "live" | "static";
  autoScroll?: boolean;
  speed?: number;
  maxLines?: number;
  className?: string;
  onMessageComplete?: (id: string) => void;
}

const TerminalThinkingStream: React.FC<TerminalThinkingStreamProps> = ({
  messages: incomingMessages = [],
  mode = "live",
  autoScroll = true,
  speed = 25,
  maxLines = 200,
  className,
  onMessageComplete,
}) => {
  /** --------------------------------
   * NORMALIZED MESSAGE LIST (STABLE)
   * -------------------------------- */
  const normalizedMessages = useMemo<TerminalMessage[]>(() => {
    const safeArray = Array.isArray(incomingMessages)
      ? incomingMessages
      : [];
    return safeArray.slice(-maxLines);
  }, [incomingMessages, maxLines]);

  // Keep a ref for use inside effects without re-triggering them
  const messagesRef = useRef<TerminalMessage[]>(normalizedMessages);
  useEffect(() => {
    messagesRef.current = normalizedMessages;
  }, [normalizedMessages]);

  /** --------------------------------
   * STATE
   * -------------------------------- */
  const [displayedMessages, setDisplayedMessages] = useState<TerminalMessage[]>([]);
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(autoScroll);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [thinkingDots, setThinkingDots] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isLiveMode = mode === "live";
  const totalMessages = messagesRef.current.length;
  const typingFinished = typingIndex >= totalMessages;

  /** --------------------------------
   * RESET ON MESSAGES / MODE CHANGE
   * -------------------------------- */
  useEffect(() => {
    // Clear any previous typing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    if (!isLiveMode) {
      // Static mode: just show all messages immediately
      setDisplayedMessages(messagesRef.current);
      setTypingIndex(0);
      setCurrentText("");
      return;
    }

    // Live mode: start from scratch
    setDisplayedMessages([]);
    setTypingIndex(0);
    setCurrentText("");
  }, [isLiveMode, normalizedMessages]);

  /** --------------------------------
   * TYPEWRITER EFFECT (LIVE MODE)
   * -------------------------------- */
  useEffect(() => {
    if (!isLiveMode) {
      return;
    }

    const currentMessages = messagesRef.current;
    if (currentMessages.length === 0) return;
    if (typingIndex >= currentMessages.length) return;

    const currentMessage = currentMessages[typingIndex];

    // Clear any existing interval before starting a new one
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    typingIntervalRef.current = setInterval(() => {
      setCurrentText((prev) => {
        // Still typing characters
        if (prev.length < currentMessage.text.length) {
          return prev + currentMessage.text[prev.length];
        }

        // Message finished typing
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }

        // Add message to displayed list once per message
        setDisplayedMessages((prevDisplayed) => {
          if (prevDisplayed.some((m) => m.id === currentMessage.id)) {
            return prevDisplayed;
          }
          return [...prevDisplayed, currentMessage];
        });

        onMessageComplete?.(currentMessage.id);

        // Advance to the next message after a slight delay
        setTimeout(() => {
          setCurrentText("");
          setTypingIndex((prevIndex) => prevIndex + 1);
        }, 220 + Math.random() * 260);

        return prev;
      });
    }, speed + Math.random() * 20);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [typingIndex, isLiveMode, speed, onMessageComplete]);

  /** --------------------------------
   * THINKING DOTS ANIMATION
   * -------------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingDots((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  /** --------------------------------
   * AUTO SCROLL
   * -------------------------------- */
  useEffect(() => {
    if (autoScrollEnabled && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedMessages, currentText, autoScrollEnabled]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 40;

    if (atBottom) {
      setAutoScrollEnabled(true);
      setShowScrollButton(false);
    } else {
      setAutoScrollEnabled(false);
      setShowScrollButton(true);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setAutoScrollEnabled(true);
    setShowScrollButton(false);
  }, []);

  /** --------------------------------
   * HELPERS
   * -------------------------------- */
  const getMessageConfig = useCallback(
    (type: TerminalMessage["type"]) => {
      switch (type) {
        case "system":
          return {
            prefix: ">",
            color: "text-[rgb(var(--muted-foreground))]",
          };
        case "action":
          return {
            prefix: "Action:",
            color: "text-[rgb(var(--os-accent))]",
          };
        case "insight":
          return {
            prefix: "Insight:",
            color: "text-[rgb(var(--os-accent))] font-semibold",
          };
        case "thinking":
          return {
            prefix: "Thinking",
            color: "text-[rgb(var(--muted-foreground))] italic",
          };
        default:
          return {
            prefix: ">",
            color: "text-[rgb(var(--foreground))]",
          };
      }
    },
    []
  );

  const formatTime = useCallback((timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "--:--:--";
    }
  }, []);

  /** --------------------------------
   * RENDER
   * -------------------------------- */
  return (
    <div
      className={cn(
        "relative h-full bg-black/90 backdrop-blur-xl",
        "border border-[rgb(var(--border)/0.4)] rounded-xl",
        "shadow-2xl overflow-hidden font-mono text-sm leading-relaxed",
        className
      )}
    >
      {/* Screen FX */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(32,128,255,0.05)_50%)] bg-[length:100%_4px] opacity-15" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-[rgb(var(--border)/0.3)] bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-[rgb(var(--os-accent))]" />
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              Brainiark OS Terminal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-[rgb(var(--muted-foreground))]">
                {isLiveMode ? "LIVE" : "STATIC"}
              </span>
            </div>
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              {totalMessages} lines
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="log"
        aria-live={isLiveMode ? "polite" : "off"}
        className="h-[calc(100%-3.5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-[rgb(var(--border)/0.6)] scrollbar-track-transparent"
      >
        <div className="p-4 space-y-1">
          <AnimatePresence>
            {/* Empty static state */}
            {!isLiveMode && displayedMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 text-[rgb(var(--muted-foreground)/0.6)] italic"
              >
                <span className="text-xs flex-shrink-0">
                  {formatTime(Date.now())}
                </span>
                <div className="flex-1">
                  <span>&gt; Terminal ready. Waiting for input…</span>
                </div>
              </motion.div>
            )}

            {/* Displayed messages */}
            {displayedMessages.map((msg) => {
              const cfg = getMessageConfig(msg.type);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <span className="text-xs text-[rgb(var(--muted-foreground)/0.6)] flex-shrink-0">
                    {formatTime(msg.timestamp)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "whitespace-pre-wrap break-words",
                        cfg.color
                      )}
                    >
                      {cfg.prefix} {msg.text}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Currently typing line */}
            {isLiveMode &&
              typingIndex < totalMessages &&
              currentText.length <
                (messagesRef.current[typingIndex]?.text.length ?? 0) && (
                <motion.div
                  key="typing-line"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <span className="text-xs text-[rgb(var(--muted-foreground)/0.6)] flex-shrink-0">
                    {formatTime(Date.now())}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[rgb(var(--muted-foreground))] whitespace-pre-wrap break-words">
                      {currentText}
                      <motion.span
                        aria-hidden="true"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="ml-0.5"
                      >
                        █
                      </motion.span>
                    </span>
                  </div>
                </motion.div>
              )}

            {/* Thinking indicator after all messages */}
            {isLiveMode && typingFinished && totalMessages > 0 && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <span className="text-xs text-[rgb(var(--muted-foreground)/0.6)] flex-shrink-0">
                  {formatTime(Date.now())}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="italic text-[rgb(var(--muted-foreground))]">
                    Thinking{".".repeat(thinkingDots)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>
      </div>

      {/* Scroll to latest */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            type="button"
            onClick={scrollToBottom}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2",
              "px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm",
              "border border-[rgb(var(--border)/0.4)] shadow-lg",
              "flex items-center gap-2 text-xs text-[rgb(var(--foreground))]",
              "hover:bg-black/90 focus:outline-none focus-visible:ring-2",
              "focus-visible:ring-[rgb(var(--os-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              "transition-all duration-150"
            )}
          >
            <ChevronDown className="w-3 h-3" />
            <span>Jump to latest</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 border-t border-[rgb(var(--border)/0.3)] bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[rgb(var(--muted-foreground))]">
            Brainiark OS v1.0 • Neural Processing
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[rgb(var(--os-accent))]">
              {displayedMessages.filter((m) => m.type === "insight").length}{" "}
              insights
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--os-accent))] animate-pulse" />
              <span className="text-[rgb(var(--os-accent))]">
                System Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalThinkingStream;
