// /src/components/onboarding/OnboardingChatPanel.tsx
"use client";

import React, {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  User,
  Brain,
  MessageSquare,
  ChevronRight,
  Cpu,
} from "lucide-react";

import { useOnboarding } from "./OnboardingStateManager";
import { cn } from "@/lib/utils";

//
// -----------------------------
// Types & helpers
// -----------------------------
//

interface ParsedAction {
  label: string;
  action: string;
  variant: "primary" | "secondary" | "ghost" | string;
  raw: string;
}

interface ParsedMessage {
  text: string;
  actions: ParsedAction[];
}

const ACTION_REGEX = /\[ACTION:([^:]+):([^:]+):([^\]]+)\]/g;

function parseMessageContent(raw: string): ParsedMessage {
  if (!raw) return { text: "", actions: [] };

  const actions: ParsedAction[] = [];
  let text = raw;

  let match: RegExpExecArray | null;
  while ((match = ACTION_REGEX.exec(raw)) !== null) {
    const [, label, action, variant] = match;
    actions.push({
      label: label.trim(),
      action: action.trim(),
      variant: variant.trim() as ParsedAction["variant"],
      raw: match[0],
    });
  }

  // Remove the action tokens from shown text
  actions.forEach((a) => {
    text = text.replace(a.raw, "").trim();
  });

  return { text, actions };
}

//
// -----------------------------
// UI Subcomponents
// -----------------------------
//

function ThinkingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500">
          <Brain className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <div className="inline-flex max-w-[200px] items-center rounded-2xl rounded-bl-none bg-[rgb(var(--secondary))] px-3 py-2">
          <span className="mr-1 text-[0.7rem] text-[rgb(var(--muted-foreground))]">
            Brainiark is thinking
          </span>
          <div className="flex gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--os-accent))]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--os-accent))] delay-150" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--os-accent))] delay-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

//
// -----------------------------
// Main component
// -----------------------------
//

const OnboardingChat: React.FC = () => {
  const {
    messages,
    sendChatMessage,
    isThinking,
    isProcessing,
    step,
    startAnalysis,
    resetAnalysis,
    completeOnboarding,
  } = useOnboarding();

  const [input, setInput] = useState("");
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  //
  // -----------------------------------
  // Autoscroll behavior
  // -----------------------------------
  //

  useEffect(() => {
    if (!bottomRef.current) return;

    // Simple but stable scroll: snap to bottom when new messages arrive.
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isThinking]);

  //
  // -----------------------------------
  // Initial conversational welcome
  // -----------------------------------
  //

  const syntheticWelcome = useMemo(() => {
    if (hasShownWelcome || messages.length > 0) return null;

    return {
      id: "welcome-0",
      role: "assistant" as const,
      createdAt: Date.now(),
      content:
        "# Welcome to Brainiark AI 👋\n\n" +
        "I’ll help you set up your **Brand Brain** through a calm, guided conversation.\n\n" +
        "## What we’ll do together:\n" +
        "• Collect your brand evidence (websites, socials, docs, descriptions)\n" +
        "• Run GPT-powered analysis with live progress\n" +
        "• Build a structured Brand Brain (summary, audience, tone, pillars, etc.)\n" +
        "• Review & refine it together, then activate your workspace\n\n" +
        "You can **describe your brand**, paste a link, or use one of these quick options:\n\n" +
        "[ACTION:Start GPT Analysis:start-gpt-analysis:primary]" +
        "[ACTION:Add Evidence First:collect-evidence:secondary]" +
        "[ACTION:Describe My Brand:describe-brand:secondary]",
    };
  }, [hasShownWelcome, messages.length]);

  useEffect(() => {
    if (messages.length === 0 && !hasShownWelcome) {
      setHasShownWelcome(true);
    }
  }, [messages.length, hasShownWelcome]);

  //
  // -----------------------------------
  // Input handling
  // -----------------------------------
  //

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    await sendChatMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  //
  // -----------------------------------
  // Action handlers (from AI buttons)
  // -----------------------------------
  //

  const handleActionClick = async (action: ParsedAction) => {
    const key = action.action.toLowerCase();

    if (key === "start-analysis" || key === "analyze-now") {
      await startAnalysis();
      return;
    }

    if (key === "start-gpt-analysis" || key === "brand-name-analysis") {
      await startAnalysis({ brandNameOnly: true });
      return;
    }

    if (key === "reset-analysis") {
      await resetAnalysis();
      return;
    }

    if (key === "complete-onboarding" || key === "finish") {
      await completeOnboarding();
      return;
    }

    if (key === "collect-evidence") {
      await sendChatMessage(
        "I'd like help adding evidence for my brand (websites, socials, docs, or a description)."
      );
      return;
    }

    if (key === "describe-brand") {
      await sendChatMessage("I want to describe my brand in detail.");
      return;
    }

    // Fallback: just send the label so AI can respond contextually
    await sendChatMessage(action.label);
  };

  //
  // -----------------------------------
  // Render helpers (markdown-ish)
// -----------------------------------
  //

  const allMessages = useMemo(() => {
    const base = syntheticWelcome ? [syntheticWelcome, ...messages] : messages;
    return base;
  }, [messages, syntheticWelcome]);

  const renderFormattedText = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;

    while (remaining.includes("**")) {
      const start = remaining.indexOf("**");
      const end = remaining.indexOf("**", start + 2);
      if (end === -1) break;

      if (start > 0) {
        parts.push(
          <span key={parts.length}>{remaining.substring(0, start)}</span>
        );
      }

      parts.push(
        <strong
          key={parts.length}
          className="font-semibold text-[rgb(var(--foreground))]"
        >
          {remaining.substring(start + 2, end)}
        </strong>
      );

      remaining = remaining.substring(end + 2);
    }

    if (remaining) {
      parts.push(<span key={parts.length}>{remaining}</span>);
    }

    return parts;
  };

  const renderMessageText = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          // H1
          if (line.startsWith("# ")) {
            return (
              <h2
                key={index}
                className="mt-1 text-sm font-semibold text-[rgb(var(--foreground))]"
              >
                {line.substring(2)}
              </h2>
            );
          }
          // H2
          if (line.startsWith("## ")) {
            return (
              <h3
                key={index}
                className="mt-1 text-[0.85rem] font-semibold text-[rgb(var(--foreground))]"
              >
                {line.substring(3)}
              </h3>
            );
          }
          // Bullet
          if (line.startsWith("• ") || line.startsWith("- ")) {
            return (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[rgb(var(--os-accent))]" />
                <span className="text-xs text-[rgb(var(--foreground))]">
                  {renderFormattedText(line.substring(2))}
                </span>
              </div>
            );
          }

          if (line.trim()) {
            return (
              <p
                key={index}
                className="text-xs leading-relaxed text-[rgb(var(--foreground))]"
              >
                {renderFormattedText(line)}
              </p>
            );
          }

          return <div key={index} className="h-2" />;
        })}
      </div>
    );
  };

  //
  // -----------------------------------
  // UI
  // -----------------------------------
  //

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-gradient-to-r from-[rgb(var(--os-accent-soft))] to-transparent px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[rgb(var(--foreground))]">
              Brainiark AI Assistant
            </p>
            <p className="text-[0.7rem] text-[rgb(var(--muted-foreground))]">
              Conversational brand onboarding · No forms, just chat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(isThinking || isProcessing) && (
            <div className="flex items-center gap-2 rounded-full bg-[rgb(var(--secondary))] px-3 py-1.5">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--os-accent))]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--os-accent))] delay-150" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--os-accent))] delay-300" />
              </div>
              <span className="text-[0.7rem] text-[rgb(var(--muted-foreground))]">
                {isThinking ? "AI thinking…" : "Processing…"}
              </span>
            </div>
          )}
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isThinking || isProcessing
                ? "bg-yellow-500 animate-pulse"
                : "bg-emerald-500"
            )}
          />
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-[rgb(var(--os-surface))] p-4 scrollbar-thin"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <AnimatePresence initial={false}>
            {allMessages.map((msg, index) => {
              const { text, actions } = parseMessageContent(msg.content);
              const isUser = msg.role === "user";
              const isAssistant = msg.role === "assistant";
              const isSystem = msg.role === "system";

              const previous = index > 0 ? allMessages[index - 1] : null;
              const sameAuthorAsPrev =
                previous && previous.role === msg.role && previous.role !== "system";

              const showAvatar = !sameAuthorAsPrev;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    "flex w-full gap-2",
                    isUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <div className="flex w-8 flex-shrink-0 justify-center">
                    {showAvatar && (
                      <>
                        {isUser ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--secondary))]">
                            <User className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full",
                              isSystem
                                ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                                : "bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500"
                            )}
                          >
                            {isSystem ? (
                              <Sparkles className="h-4 w-4 text-white" />
                            ) : (
                              <Bot className="h-4 w-4 text-white" />
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Bubble + Actions */}
                  <div
                    className={cn(
                      "flex max-w-[82%] flex-col gap-1",
                      isUser && "items-end"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm",
                        isUser &&
                          "ml-auto rounded-br-none bg-[rgb(var(--os-accent))] text-white",
                        isAssistant &&
                          "rounded-bl-none bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))]",
                        isSystem &&
                          "border border-[rgb(var(--os-accent)/0.4)] bg-gradient-to-r from-[rgb(var(--os-accent-soft))] to-transparent text-[rgb(var(--foreground))]"
                      )}
                    >
                      {renderMessageText(text)}
                    </div>

                    {/* Action buttons (AI only) */}
                    {actions.length > 0 && !isUser && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {actions.map((action, idx) => {
                          const iconMap: Record<string, React.ReactNode> = {
                            "start-gpt-analysis": <Cpu className="h-3 w-3" />,
                            "collect-evidence": (
                              <MessageSquare className="h-3 w-3" />
                            ),
                            "describe-brand": (
                              <MessageSquare className="h-3 w-3" />
                            ),
                            primary: <Sparkles className="h-3 w-3" />,
                            default: <ChevronRight className="h-3 w-3" />,
                          };

                          const icon =
                            iconMap[action.action] ||
                            iconMap[action.variant] ||
                            iconMap.default;

                          return (
                            <motion.button
                              key={`${msg.id}-${idx}`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={() => void handleActionClick(action)}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.7rem] font-medium transition",
                                action.variant === "primary"
                                  ? "border-transparent bg-[rgb(var(--os-accent))] text-white hover:bg-[rgb(var(--os-accent)/0.9)] shadow-sm"
                                  : action.variant === "secondary"
                                  ? "border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))]"
                                  : "border-[rgb(var(--border))] bg-transparent text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))]"
                              )}
                            >
                              {action.variant === "primary" && icon}
                              {action.variant !== "primary" && (
                                <span className="text-[rgb(var(--muted-foreground))]">
                                  {icon}
                                </span>
                              )}
                              {action.label}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Typing indicator (AI, left-aligned, stable height) */}
            {isThinking && (
              <motion.div
                key="thinking-indicator"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="mt-1"
              >
                <ThinkingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mx-auto max-w-2xl space-y-2"
        >
          <div
            className={cn(
              "relative rounded-xl border bg-[rgb(var(--background))] transition-all duration-150",
              isInputFocused
                ? "border-[rgb(var(--os-accent))] ring-2 ring-[rgb(var(--os-accent)/0.12)]"
                : "border-[rgb(var(--border))] hover:border-[rgb(var(--border)/0.8)]"
            )}
          >
            <div className="pointer-events-none absolute left-3 top-3">
              <MessageSquare className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              rows={2}
              placeholder={
                step === "intro"
                  ? "Describe your brand, paste a website or social link, or ask me anything..."
                  : "Ask questions, refine your Brand Brain, or add more context..."
              }
              className="max-h-32 w-full resize-none bg-transparent px-10 pb-3 pt-3 text-xs text-[rgb(var(--foreground))] outline-none placeholder:text-[rgb(var(--muted-foreground))] scrollbar-thin"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-white transition-all",
                  input.trim() && !isThinking
                    ? "bg-[rgb(var(--os-accent))] hover:bg-[rgb(var(--os-accent)/0.9)] shadow-sm"
                    : "bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]"
                )}
                aria-label="Send message"
              >
                {isThinking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Footer helper row */}
          <div className="flex items-center justify-between text-[0.7rem] text-[rgb(var(--muted-foreground))]">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isThinking ? "bg-yellow-500 animate-pulse" : "bg-emerald-500"
                )}
              />
              <span>{isThinking ? "AI is thinking…" : "Ready to chat"}</span>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-1">
                <kbd className="rounded bg-[rgb(var(--secondary))] px-1.5 py-0.5 text-[0.65rem]">
                  Enter
                </kbd>
                <span>to send</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="rounded bg-[rgb(var(--secondary))] px-1.5 py-0.5 text-[0.65rem]">
                  Shift
                </kbd>
                <kbd className="rounded bg-[rgb(var(--secondary))] px-1.5 py-0.5 text-[0.65rem]">
                  Enter
                </kbd>
                <span>for new line</span>
              </div>
            </div>
          </div>

          {/* Contextual quick actions under input (intro/evidence only) */}
          {(step === "intro" || step === "collecting_evidence") && !isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              <button
                type="button"
                onClick={() =>
                  handleActionClick({
                    label: "Start GPT Analysis",
                    action: "start-gpt-analysis",
                    variant: "primary",
                    raw: "",
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 text-[0.7rem] font-medium text-blue-600 transition hover:from-blue-100 hover:to-cyan-100 dark:border-blue-900 dark:from-blue-900/20 dark:to-cyan-900/20 dark:text-blue-300 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30"
              >
                <Sparkles className="h-3 w-3" />
                Start GPT Analysis
              </button>
              <button
                type="button"
                onClick={() =>
                  handleActionClick({
                    label: "Help me add evidence",
                    action: "collect-evidence",
                    variant: "secondary",
                    raw: "",
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-[0.7rem] font-medium text-[rgb(var(--muted-foreground))] transition hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))]"
              >
                <MessageSquare className="h-3 w-3" />
                Add website / socials
              </button>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OnboardingChat;
