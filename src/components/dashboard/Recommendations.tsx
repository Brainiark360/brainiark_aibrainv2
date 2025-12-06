// /src/components/home/HomeRecommendations.tsx
import { motion } from "framer-motion"
import { CheckCircle, Clock, AlertCircle, Zap, ChevronRight } from "lucide-react"
import { useState } from "react"

interface HomeRecommendationsProps {
  recommendations: string[]
}

export default function HomeRecommendations({ recommendations }: HomeRecommendationsProps) {
  const [completed, setCompleted] = useState<string[]>([])

  const toggleComplete = (rec: string) => {
    if (completed.includes(rec)) {
      setCompleted(completed.filter(r => r !== rec))
    } else {
      setCompleted([...completed, rec])
    }
  }

  const getPriority = (index: number) => {
    if (index === 0) return 'high'
    if (index < 3) return 'medium'
    return 'low'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-2xl bg-[rgb(var(--os-surface)/0.8)] backdrop-blur-sm border border-[rgb(var(--border)/0.4)]"
    >
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border)/0.4)]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">
            Recommended Actions
          </h2>
          <span className="text-sm font-medium text-[rgb(var(--os-accent))]">
            {completed.length}/{recommendations.length} completed
          </span>
        </div>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          AI-generated tasks to optimize your workspace
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-2 bg-[rgb(var(--border)/0.3)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completed.length / recommendations.length) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="h-full bg-gradient-to-r from-[rgb(var(--os-accent))] to-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="divide-y divide-[rgb(var(--border)/0.4)]">
        {recommendations.map((rec, index) => {
          const isCompleted = completed.includes(rec)
          const priority = getPriority(index)
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              className={`p-4 hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors ${isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleComplete(rec)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-[rgb(var(--border))] hover:border-[rgb(var(--os-accent))]'
                  }`}
                >
                  {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${isCompleted ? 'line-through text-[rgb(var(--muted-foreground))]' : 'text-[rgb(var(--foreground))]'}`}>
                      {rec}
                    </h3>
                    <div className="flex items-center gap-2">
                      {priority === 'high' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span className="text-xs font-medium text-rose-500">High</span>
                        </span>
                      )}
                      {priority === 'medium' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span className="text-xs font-medium text-amber-500">Medium</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!isCompleted && (
                    <div className="flex items-center gap-3 mt-2">
                      <button className="inline-flex items-center gap-1 text-xs font-medium text-[rgb(var(--os-accent))] hover:text-[rgb(var(--os-accent)/0.8)]">
                        <Zap className="w-3 h-3" />
                        Start now
                      </button>
                      <button className="inline-flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
                        <ChevronRight className="w-3 h-3" />
                        Learn more
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-[rgb(var(--border)/0.4)] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-[rgb(var(--muted-foreground)/0.5)]" />
          </div>
          <h4 className="font-medium text-[rgb(var(--foreground))] mb-2">
            All caught up!
          </h4>
          <p className="text-sm text-[rgb(var(--muted-foreground))] max-w-sm mx-auto">
            Brainiark will suggest new actions as you continue using the platform
          </p>
        </div>
      )}
    </motion.div>
  )
}