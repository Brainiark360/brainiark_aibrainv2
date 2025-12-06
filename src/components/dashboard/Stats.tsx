// /src/components/home/HomeStats.tsx (Updated typography)
import { motion } from "framer-motion"
import { Target, MessageSquare, Users, Rocket, TrendingUp } from "lucide-react"

interface HomeStatsProps {
  scores: {
    identityStrength: number
    toneClarity: number
    audienceConfidence: number
    strategyReadiness: number
  }
}

export default function HomeStats({ scores }: HomeStatsProps) {
  const stats = [
    {
      id: 'identity',
      title: 'Brand Identity',
      value: scores.identityStrength,
      description: 'How well your brand identity is defined',
      icon: Target,
      color: 'blue' as const,
      trend: 'up' as const
    },
    {
      id: 'tone',
      title: 'Tone Clarity',
      value: scores.toneClarity,
      description: 'Consistency in brand voice and tone',
      icon: MessageSquare,
      color: 'green' as const,
      trend: 'up' as const
    },
    {
      id: 'audience',
      title: 'Audience Insight',
      value: scores.audienceConfidence,
      description: 'Understanding of target audience',
      icon: Users,
      color: 'purple' as const,
      trend: 'stable' as const
    },
    {
      id: 'strategy',
      title: 'Strategy Readiness',
      value: scores.strategyReadiness,
      description: 'Readiness for content strategy',
      icon: Rocket,
      color: 'amber' as const,
      trend: 'up' as const
    }
  ]

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-cyan-400'
      case 'green': return 'from-emerald-500 to-teal-400'
      case 'purple': return 'from-purple-500 to-pink-400'
      case 'amber': return 'from-amber-500 to-orange-400'
      default: return 'from-blue-500 to-cyan-400'
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className="group relative overflow-hidden rounded-xl bg-[rgb(var(--os-surface)/0.8)] backdrop-blur-sm border border-[rgb(var(--border)/0.4)] p-4 cursor-pointer"
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${getColorClass(stat.color)}`} />

          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getColorClass(stat.color)} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                </div>
              )}
            </div>

            {/* Value */}
            <div className="mb-1">
              <p className="text-xl font-bold text-[rgb(var(--foreground))]">
                {stat.value}
                <span className="text-sm text-[rgb(var(--muted-foreground))] ml-1">/100</span>
              </p>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">
                {stat.title}
              </h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                {stat.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-1 bg-[rgb(var(--border)/0.3)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${getColorClass(stat.color)}`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}