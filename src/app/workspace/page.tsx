// /app/(app)/home/page.tsx (Remove container padding - handled by layout)
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import type { WorkspaceSummary } from "@/types/home"
import HomeWelcome from "@/components/dashboard/Welcome"
import HomeStats from "@/components/dashboard/Stats"
import HomeQuickActions from "@/components/dashboard/QuickActions"
import HomeCalendarMini from "@/components/dashboard/CalendarMini"
import HomeEvidenceSummary from "@/components/dashboard/EvidenceSummary"
import HomeInsights from "@/components/dashboard/Insights"
import HomeRecommendations from "@/components/dashboard/Recommendations"
import HomeRecentActivity from "@/components/dashboard/RecentActivity"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export default function HomePage() {
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const mockSummary: WorkspaceSummary = {
          userName: "Alex",
          workspaceName: "NexaBrand",
          evidence: [
            { id: "1", type: "website", label: "nexabrand.com", status: "fused" },
            { id: "2", type: "document", label: "Brand Guidelines.pdf", status: "fused" },
            { id: "3", type: "social", label: "@nexabrand", status: "processing" },
            { id: "4", type: "image", label: "Logo Pack", status: "fused" },
            { id: "5", type: "text", label: "Mission Statement", status: "queued" }
          ],
          scores: {
            identityStrength: 87,
            toneClarity: 92,
            audienceConfidence: 78,
            strategyReadiness: 65,
            completionScore: 45
          },
          insights: {
            toneSummary: "Professional, innovative, and slightly aspirational",
            corePillars: ["Technology", "Innovation", "Sustainability", "Community"],
            audienceSegments: ["Tech Professionals", "Sustainability Advocates", "Industry Leaders"],
            keywords: ["AI", "Green Tech", "Future", "Impact"],
            brandArchetype: "Innovator",
            writingStyle: "Analytical yet approachable"
          },
          recommendations: [
            "Complete your audience persona definitions",
            "Schedule content calendar for next quarter",
            "Review competitor analysis insights",
            "Set up automated content distribution"
          ],
          recentActivity: [
            {
              id: "1",
              type: "ai_insight",
              message: "Identified key brand pillars from website analysis",
              timestamp: Date.now() - 3600000,
              details: "Extracted from homepage and about page content"
            },
            {
              id: "2",
              type: "evidence_added",
              message: "Brand guidelines document uploaded",
              timestamp: Date.now() - 7200000,
              details: "PDF containing color palette and typography"
            },
            {
              id: "3",
              type: "strategy_created",
              message: "Initial content strategy framework generated",
              timestamp: Date.now() - 10800000,
              details: "Based on tone analysis and audience segments"
            }
          ]
        }
        
        setSummary(mockSummary)
      } catch (error) {
        console.error("Failed to fetch workspace summary:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 bg-[rgb(var(--os-surface))] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">
            Unable to load workspace
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Please try again or contact support
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <HomeWelcome 
        userName={summary.userName}
        workspaceName={summary.workspaceName}
        completionScore={summary.scores.completionScore}
      />

      {/* Stats Grid */}
      <HomeStats scores={summary.scores} />

      {/* Quick Actions */}
      <HomeQuickActions />

      {/* Calendar Preview */}
      <HomeCalendarMini />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evidence Summary */}
          <HomeEvidenceSummary evidence={summary.evidence} />
          
          {/* AI Insights */}
          <HomeInsights insights={summary.insights} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recommendations */}
          <HomeRecommendations recommendations={summary.recommendations} />
          
          {/* Recent Activity */}
          <HomeRecentActivity activities={summary.recentActivity} />
        </div>
      </div>
    </motion.div>
  )
}