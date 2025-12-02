// /src/components/workspace/ReviewScreen.tsx
"use client"

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Edit2,
  Check,
  AlertCircle,
  Globe,
  FileText,
  Users,
  Tag,
  Plus,
  X
} from 'lucide-react'
import type { 
  WorkspaceDraft, 
  EvidenceSourceInput,
  AttributeWithProvenance 
} from '@/types/workspace'

interface ReviewScreenProps {
  draft: WorkspaceDraft
  evidenceSources: EvidenceSourceInput[]
  onUpdateDraft: (draft: WorkspaceDraft) => void
  onActivate: () => void
  onBackToIntake: () => void
}

const TONE_OPTIONS = [
  "Analytical & direct",
  "Conversational & friendly",
  "Professional & formal",
  "Creative & energetic",
  "Minimal & precise"
]

const CHANNEL_OPTIONS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "X/Twitter" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "newsletter", label: "Newsletter" },
  { id: "blog", label: "Blog" }
]

const SOURCE_ICONS = {
  website: Globe,
  document: FileText,
  social: Users,
  name: Tag
} as const

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return "High"
  if (confidence >= 0.6) return "Medium"
  return "Low"
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-green-500 bg-green-500/10"
  if (confidence >= 0.6) return "text-amber-500 bg-amber-500/10"
  return "text-red-500 bg-red-500/10"
}

export default function ReviewScreen({
  draft,
  evidenceSources,
  onUpdateDraft,
  onActivate,
  onBackToIntake
}: ReviewScreenProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string>("")

  const handleEditField = useCallback((field: string, currentValue: string) => {
    setEditingField(field)
    setTempValue(currentValue)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingField || !draft) return

    const updatedDraft = { ...draft }
    
    // Simple update logic - would need to handle different field types
    if (editingField === "brandName" && draft.brandName) {
      updatedDraft.brandName = {
        ...draft.brandName,
        value: tempValue,
        confidence: Math.max(draft.brandName.confidence, 0.9) // User edit increases confidence
      }
    } else if (editingField === "description" && draft.description) {
      updatedDraft.description = {
        ...draft.description,
        value: tempValue,
        confidence: Math.max(draft.description.confidence, 0.9)
      }
    }

    onUpdateDraft(updatedDraft)
    setEditingField(null)
  }, [editingField, draft, tempValue, onUpdateDraft])

  const handleAddPillar = useCallback(() => {
    if (!draft.contentPillars) return
    
    const newPillar = `New Pillar ${draft.contentPillars.value.length + 1}`
    const updatedDraft = {
      ...draft,
      contentPillars: {
        value: [...draft.contentPillars.value, newPillar],
        confidence: 0.5,
        primarySource: null,
        rationale: "Added by user"
      }
    }
    
    onUpdateDraft(updatedDraft)
  }, [draft, onUpdateDraft])

  const handleRemovePillar = useCallback((index: number) => {
    if (!draft.contentPillars) return
    
    const updatedPillars = draft.contentPillars.value.filter((_, i) => i !== index)
    const updatedDraft = {
      ...draft,
      contentPillars: {
        ...draft.contentPillars,
        value: updatedPillars
      }
    }
    
    onUpdateDraft(updatedDraft)
  }, [draft, onUpdateDraft])

  const handleUpdatePillar = useCallback((index: number, value: string) => {
    if (!draft.contentPillars) return
    
    const updatedPillars = [...draft.contentPillars.value]
    updatedPillars[index] = value
    
    const updatedDraft = {
      ...draft,
      contentPillars: {
        ...draft.contentPillars,
        value: updatedPillars
      }
    }
    
    onUpdateDraft(updatedDraft)
  }, [draft, onUpdateDraft])

  const handleToneChange = useCallback((tone: string) => {
    if (!draft.tone) return
    
    const updatedDraft = {
      ...draft,
      tone: {
        ...draft.tone,
        value: tone,
        confidence: 0.9
      }
    }
    
    onUpdateDraft(updatedDraft)
  }, [draft, onUpdateDraft])

  const handleToggleChannel = useCallback((channelId: string) => {
    if (!draft.channels) return
    
    const currentChannels = draft.channels.value
    const updatedChannels = currentChannels.includes(channelId)
      ? currentChannels.filter(id => id !== channelId)
      : [...currentChannels, channelId]
    
    const updatedDraft = {
      ...draft,
      channels: {
        ...draft.channels,
        value: updatedChannels
      }
    }
    
    onUpdateDraft(updatedDraft)
  }, [draft, onUpdateDraft])

  const renderAttribute = (
    title: string,
    attribute: AttributeWithProvenance<any> | undefined,
    fieldName: string,
    renderContent: (value: any) => React.ReactNode
  ) => {
    if (!attribute) return null

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{title}</h4>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(attribute.confidence)}`}>
              {getConfidenceLabel(attribute.confidence)} confidence
            </span>
            {attribute.confidence < 0.6 && (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </div>
        
        <div className="relative">
          {editingField === fieldName ? (
            <div className="space-y-2">
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full p-3 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--os-surface))] focus:outline-none focus:border-[rgb(var(--os-accent))]"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 bg-[rgb(var(--foreground))] text-[rgb(var(--background))] rounded text-sm hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="px-3 py-1.5 border border-[rgb(var(--border))] rounded text-sm hover:bg-[rgb(var(--accent))] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <div className="p-3 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--os-surface))]">
                {renderContent(attribute.value)}
              </div>
              <button
                onClick={() => handleEditField(fieldName, attribute.value)}
                className="absolute top-2 right-2 h-8 w-8 rounded border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] hover:bg-[rgb(var(--accent))] transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          
          {attribute.primarySource && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Source:</span>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[rgb(var(--border))]">
                {(() => {
                  const Icon = SOURCE_ICONS[attribute.primarySource]
                  return <Icon className="h-3 w-3" />
                })()}
                <span className="text-xs capitalize">{attribute.primarySource}</span>
              </div>
            </div>
          )}
          
          {attribute.confidence < 0.6 && (
            <p className="text-xs text-amber-500 mt-2">
              I saw multiple descriptions in your materials. This is my best guess. Adjust if needed.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Brand Overview */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Brand Overview</h3>
        
        {renderAttribute(
          "Brand Name",
          draft.brandName,
          "brandName",
          (value) => <p className="text-lg font-medium">{value}</p>
        )}
        
        {renderAttribute(
          "Brand Description",
          draft.description,
          "description",
          (value) => <p className="text-[rgb(var(--muted-foreground))]">{value}</p>
        )}
      </div>

      {/* Audience */}
      {renderAttribute(
        "Audience",
        draft.audience,
        "audience",
        (value: string[]) => (
          <div className="flex flex-wrap gap-2">
            {value.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] rounded text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        )
      )}

      {/* Offers */}
      {renderAttribute(
        "Offers / Services",
        draft.offers,
        "offers",
        (value: string[]) => (
          <ul className="space-y-2">
            {value.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--os-accent))]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )
      )}

      {/* Content Pillars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Content Pillars</h4>
          <button
            onClick={handleAddPillar}
            className="h-8 w-8 rounded border border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))] transition-colors flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {draft.contentPillars?.value.map((pillar, index) => (
            <div key={index} className="group relative">
              <input
                value={pillar}
                onChange={(e) => handleUpdatePillar(index, e.target.value)}
                className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--os-surface))] focus:outline-none focus:border-[rgb(var(--os-accent))]"
              />
              <button
                onClick={() => handleRemovePillar(index)}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 border border-white dark:border-gray-900 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tone & Style */}
      <div className="space-y-3">
        <h4 className="font-medium">Tone & Style</h4>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone}
              onClick={() => handleToneChange(tone)}
              className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                draft.tone?.value === tone
                  ? 'bg-[rgb(var(--os-accent))] text-white border-[rgb(var(--os-accent))]'
                  : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-3">
        <h4 className="font-medium">Channels / Platforms</h4>
        <div className="flex flex-wrap gap-2">
          {CHANNEL_OPTIONS.map((channel) => (
            <button
              key={channel.id}
              onClick={() => handleToggleChannel(channel.id)}
              className={`px-3 py-1.5 rounded border text-sm transition-colors flex items-center gap-2 ${
                draft.channels?.value.includes(channel.id)
                  ? 'bg-[rgb(var(--os-accent))] text-white border-[rgb(var(--os-accent))]'
                  : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]'
              }`}
            >
              <span>{channel.label}</span>
              {draft.channels?.value.includes(channel.id) && (
                <Check className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content System Summary */}
      {renderAttribute(
        "Content System Summary",
        draft.contentSystemNotes,
        "contentSystemNotes",
        (value) => <p className="text-[rgb(var(--muted-foreground))]">{value}</p>
      )}

      {/* CTA Section */}
      <div className="pt-6 border-t border-[rgb(var(--border))]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={onActivate}
              className="px-8 py-3 bg-[rgb(var(--foreground))] text-[rgb(var(--background))] rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Activate Workspace
            </button>
            <button
              onClick={onBackToIntake}
              className="px-6 py-3 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--accent))] transition-colors"
            >
              Back to Inputs
            </button>
          </div>
          
          <div className="text-center sm:text-right">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Activating will create your Brand Brain and Content System
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}