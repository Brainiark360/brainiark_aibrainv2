// /src/components/home/HomeEvidenceSummary.tsx (Updated)
import { motion } from "framer-motion"
import { Globe, FileText, Users, Image, Check, Clock, Plus, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { EvidenceSourceInput } from "@/types/home"

interface HomeEvidenceSummaryProps {
  evidence: EvidenceSourceInput[]
}

export default function HomeEvidenceSummary({ evidence }: HomeEvidenceSummaryProps) {
  const router = useRouter()
  
  // Limit to first 5 items
  const visibleEvidence = evidence.slice(0, 5)
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'website': return Globe
      case 'document': return FileText
      case 'social': return Users
      case 'image': return Image
      default: return FileText
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fused': return 'bg-emerald-500'
      case 'processing': return 'bg-amber-500'
      case 'queued': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fused': return 'Fused'
      case 'processing': return 'Processing'
      case 'queued': return 'Queued'
      default: return 'Pending'
    }
  }

  // Calculate stats
  const totalSources = evidence.length
  const fusedCount = evidence.filter(e => e.status === 'fused').length
  const processingCount = evidence.filter(e => e.status === 'processing').length
  const pendingCount = evidence.filter(e => e.status === 'queued').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl bg-[rgb(var(--os-surface)/0.8)] backdrop-blur-sm border border-[rgb(var(--border)/0.4)] overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-[rgb(var(--border)/0.4)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">
              Evidence Sources
            </h3>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Materials analyzed by Brainiark
            </p>
          </div>
          <button
            onClick={() => router.push('/onboarding/add')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span className="text-xs font-medium">Add</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-[rgb(var(--foreground))]">
              {fusedCount} fused
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500">
              {processingCount > 0 && (
                <motion.div
                  className="w-2 h-2 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <span className="text-xs font-medium text-[rgb(var(--foreground))]">
              {processingCount} processing
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-[rgb(var(--foreground))]">
              {pendingCount} pending
            </span>
          </div>
        </div>

        {/* Processing Ring */}
        {processingCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="relative w-4 h-4">
              <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            </div>
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              Processing {processingCount} source{processingCount !== 1 ? 's' : ''}...
            </span>
          </div>
        )}
      </div>

      {/* Evidence List */}
      <div className="divide-y divide-[rgb(var(--border)/0.4)]">
        {visibleEvidence.map((item, index) => {
          const Icon = getIcon(item.type)
          const statusColor = getStatusColor(item.status)
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-3 hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-[rgb(var(--os-surface))] border border-[rgb(var(--border)/0.4)] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-[rgb(var(--os-surface))] ${statusColor}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {item.label}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[rgb(var(--muted-foreground))] capitalize">
                        {item.type}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-[rgb(var(--border))]" />
                      <span className={`text-xs font-medium ${
                        item.status === 'fused' ? 'text-emerald-500' :
                        item.status === 'processing' ? 'text-amber-500' :
                        'text-blue-500'
                      }`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {item.status === 'fused' && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
                {item.status === 'processing' && (
                  <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* See All Link */}
      {evidence.length > 5 && (
        <div className="p-3 border-t border-[rgb(var(--border)/0.4)]">
          <button
            onClick={() => router.push('/evidence')}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-[rgb(var(--os-accent))] hover:text-[rgb(var(--os-accent)/0.8)] transition-colors"
          >
            See All Evidence ({evidence.length} total)
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {evidence.length === 0 && (
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-[rgb(var(--border)/0.4)] flex items-center justify-center mx-auto mb-3">
            <Plus className="w-5 h-5 text-[rgb(var(--muted-foreground)/0.5)]" />
          </div>
          <h4 className="text-sm font-medium text-[rgb(var(--foreground))] mb-1">
            No evidence added yet
          </h4>
          <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-sm mx-auto mb-3">
            Add websites, documents, or brand materials to help Brainiark understand your brand
          </p>
          <button
            onClick={() => router.push('/onboarding/add')}
            className="px-4 py-1.5 text-xs font-medium bg-[rgb(var(--os-accent))] text-white rounded-lg hover:bg-[rgb(var(--os-accent)/0.9)] transition-colors"
          >
            Add First Evidence
          </button>
        </div>
      )}
    </motion.div>
  )
}