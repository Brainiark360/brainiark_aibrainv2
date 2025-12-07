// /src/components/home/HomeWelcome.tsx (Updated - Cleaner)
import { motion } from "framer-motion"
import { Sparkles, Zap } from "lucide-react"

interface HomeWelcomeProps {
  userName: string
  workspaceName: string
  completionScore: number
}

export default function HomeWelcome({ userName, workspaceName, completionScore }: HomeWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl bg-[rgb(var(--os-surface)/0.8)] backdrop-blur-sm border border-[rgb(var(--border)/0.4)] p-5"
    >
      {/* Animated Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-[rgb(var(--os-accent))] to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="flex items-start justify-between">
        {/* Left Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.6)] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-lg border border-[rgb(var(--os-accent)/0.3)]"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                Welcome back, <span className="text-[rgb(var(--os-accent))]">{userName}</span>
              </h1>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Your <span className="font-medium text-[rgb(var(--foreground))]">{workspaceName}</span> workspace is active
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[rgb(var(--muted-foreground))]">Workspace completion</span>
              <span className="font-medium text-[rgb(var(--foreground))]">{completionScore}%</span>
            </div>
            <div className="h-1.5 bg-[rgb(var(--border)/0.3)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.6)] rounded-full"
              />
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(var(--os-accent)/0.1)] border border-[rgb(var(--os-accent)/0.2)]">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-[rgb(var(--os-accent))]">
            AI Online
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="p-2 rounded-lg bg-[rgb(var(--os-surface)/0.6)] border border-[rgb(var(--border)/0.3)]">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Insights</p>
          <p className="text-base font-bold text-[rgb(var(--foreground))]">42</p>
        </div>
        <div className="p-2 rounded-lg bg-[rgb(var(--os-surface)/0.6)] border border-[rgb(var(--border)/0.3)]">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Strategies</p>
          <p className="text-base font-bold text-[rgb(var(--foreground))]">3</p>
        </div>
        <div className="p-2 rounded-lg bg-[rgb(var(--os-surface)/0.6)] border border-[rgb(var(--border)/0.3)]">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Drafts</p>
          <p className="text-base font-bold text-[rgb(var(--foreground))]">18</p>
        </div>
      </div>
    </motion.div>
  )
}