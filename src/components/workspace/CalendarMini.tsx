// /src/components/home/HomeCalendarMini.tsx
import { motion } from "framer-motion"
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface MiniCalendarDay {
  date: string
  platform: "linkedin" | "instagram" | "twitter" | "tiktok"
  suggestedPost?: string
  status: "none" | "scheduled" | "suggested"
}

export default function HomeCalendarMini() {
  const router = useRouter()
  
  // Generate mock data for the next 7 days
  const days: MiniCalendarDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    
    const platforms: MiniCalendarDay["platform"][] = ["linkedin", "instagram", "twitter", "tiktok"]
    const statuses: MiniCalendarDay["status"][] = ["none", "scheduled", "suggested"]
    
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      suggestedPost: i % 3 === 0 ? "Weekly industry insights" : undefined,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }
  })

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "linkedin": return "bg-blue-500"
      case "instagram": return "bg-gradient-to-br from-purple-500 to-pink-500"
      case "twitter": return "bg-blue-400"
      case "tiktok": return "bg-black"
      default: return "bg-gray-500"
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-[rgb(var(--os-accent)/0.2)] border border-[rgb(var(--os-accent)/0.3)]"
      case "suggested":
        return "bg-[rgb(var(--muted-foreground)/0.1)] border border-[rgb(var(--border))]"
      default:
        return "bg-transparent border border-[rgb(var(--border)/0.3)]"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl bg-[rgb(var(--os-surface)/0.8)] backdrop-blur-sm border border-[rgb(var(--border)/0.4)] overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-[rgb(var(--border)/0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.6)] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">
                This Week's Social Plan
              </h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                3 posts scheduled, 4 suggested
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/calendar")}
            className="flex items-center gap-1 text-xs font-medium text-[rgb(var(--os-accent))] hover:text-[rgb(var(--os-accent)/0.8)] transition-colors"
          >
            View Calendar
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[rgb(var(--muted-foreground))]">Post density</span>
            <span className="font-medium text-[rgb(var(--foreground))]">43%</span>
          </div>
          <div className="h-1 bg-[rgb(var(--border)/0.3)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "43%" }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-full bg-gradient-to-r from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.6)] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
              whileHover={{ y: -2 }}
              className={`relative p-2 rounded-lg ${getStatusStyles(day.status)} transition-all cursor-pointer`}
              title={day.suggestedPost || "No posts scheduled"}
            >
              {/* Platform Indicator */}
              {day.status !== "none" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-[rgb(var(--os-surface))]">
                  <div className={`w-full h-full rounded-full ${getPlatformColor(day.platform)}`} />
                </div>
              )}

              <div className="text-center">
                <p className="text-xs font-medium text-[rgb(var(--foreground))]">
                  {day.date.split(" ")[1]}
                </p>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                  {day.date.split(" ")[0]}
                </p>
              </div>

              {/* Status Indicator */}
              {day.status === "scheduled" && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[rgb(var(--os-accent))]" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[rgb(var(--border)/0.4)]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[rgb(var(--os-accent)/0.3)]" />
            <span className="text-xs text-[rgb(var(--muted-foreground))]">Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[rgb(var(--muted-foreground)/0.2)]" />
            <span className="text-xs text-[rgb(var(--muted-foreground))]">Suggested</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}