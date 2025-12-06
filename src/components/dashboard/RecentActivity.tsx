// /src/components/home/HomeRecentActivity.tsx
import { motion } from "framer-motion"
import { Brain, FileText, Upload, Sparkles, Clock } from "lucide-react"
import type { ActivityLog } from "@/types/home"

interface HomeRecentActivityProps {
  activities: ActivityLog[]
}

export default function HomeRecentActivity({ activities }: HomeRecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ai_insight': return Brain
      case 'evidence_added': return Upload
      case 'strategy_created': return Sparkles
      case 'content_generated': return FileText
      default: return Clock
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'ai_insight': return 'text-blue-500'
      case 'evidence_added': return 'text-emerald-500'
      case 'strategy_created': return 'text-purple-500'
      case 'content_generated': return 'text-amber-500'
      default: return 'text-gray-500'
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="rounded-2xl bg-[rgb(var(--os-surface)/0.8)] backdrop-blur-sm border border-[rgb(var(--border)/0.4)]"
    >
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border)/0.4)]">
        <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">
          Recent Activity
        </h2>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Latest actions from Brainiark
        </p>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-[rgb(var(--border)/0.4)] max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type)
          const colorClass = getActivityColor(activity.type)
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
              className="p-4 hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-[rgb(var(--os-surface))] border border-[rgb(var(--border)/0.4)] flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-[rgb(var(--foreground))]">
                      {activity.message}
                    </p>
                    <span className="text-xs text-[rgb(var(--muted-foreground))] whitespace-nowrap">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  
                  {activity.details && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-[rgb(var(--border)/0.4)] flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-[rgb(var(--muted-foreground)/0.5)]" />
          </div>
          <h4 className="font-medium text-[rgb(var(--foreground))] mb-2">
            No recent activity
          </h4>
          <p className="text-sm text-[rgb(var(--muted-foreground))] max-w-sm mx-auto">
            Start using Brainiark to see activity here
          </p>
        </div>
      )}

      {/* View All */}
      {activities.length > 0 && (
        <div className="p-4 border-t border-[rgb(var(--border)/0.4)]">
          <button className="w-full py-2 text-sm font-medium text-[rgb(var(--os-accent))] hover:text-[rgb(var(--os-accent)/0.8)] transition-colors">
            View all activity →
          </button>
        </div>
      )}
    </motion.div>
  )
}