'use client';

import { motion } from 'framer-motion';
import type { WorkspaceSummary } from '@/types/home';
import HomeWelcome from './Welcome';
import HomeStats from './Stats';
import HomeQuickActions from './QuickActions';
import HomeCalendarMini from './CalendarMini';
import HomeEvidenceSummary from './EvidenceSummary';
import HomeInsights from './Insights';
import HomeRecommendations from './Recommendations';
import HomeRecentActivity from './RecentActivity';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

interface WorkspaceDashboardProps {
  summary: WorkspaceSummary;
}

export default function WorkspaceDashboard({ summary }: WorkspaceDashboardProps) {
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
  );
}