// /src/components/home/HomeQuickActions.tsx (Updated typography)
import { motion } from "framer-motion"
import { Brain, FileText, BarChart3, Sparkles, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomeQuickActions() {
  const router = useRouter()

  const actions = [
    {
      id: 'strategy',
      title: 'Create Strategy',
      description: 'Build comprehensive content strategy',
      icon: Brain,
      color: 'from-blue-500 to-cyan-400',
      path: '/strategy/new'
    },
    {
      id: 'content',
      title: 'Generate Content',
      description: 'Create AI-powered content',
      icon: FileText,
      color: 'from-emerald-500 to-teal-400',
      path: '/content'
    },
    {
      id: 'insights',
      title: 'Review Insights',
      description: 'Deep dive into brand intelligence',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-400',
      path: '/insights'
    },
    {
      id: 'canvas',
      title: 'Strategy Canvas',
      description: 'Visualize content ecosystem',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-400',
      path: '/canvas'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">
            Quick Actions
          </h3>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Start creating with Brainiark
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(action.path)}
            className="group relative overflow-hidden rounded-xl bg-[rgb(var(--os-surface)/0.8)] backdrop-blur-sm border border-[rgb(var(--border)/0.4)] p-4 text-left transition-all duration-300"
          >
            {/* Hover Underline */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[rgb(var(--os-accent))] to-transparent"
              initial={{ width: 0 }}
              whileHover={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />

            <div className="relative">
              {/* Icon */}
              <div className="mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div>
                <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {action.description}
                </p>
              </div>

              {/* Action Indicator */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[rgb(var(--os-accent))] font-medium">
                  Start →
                </span>
                <Zap className="w-3 h-3 text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--os-accent))] transition-colors" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}