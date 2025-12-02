// /src/components/workspace/IntakeDock.tsx
"use client"

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, 
  FileText, 
  Users, 
  Tag,
  Plus,
  X,
  Upload,
  Link
} from 'lucide-react'
import type { 
  EvidenceSourceInput, 
  EvidenceSourceType,
  WorkspaceSetupMode 
} from '@/types/workspace'

interface IntakeDockProps {
  evidenceSources: EvidenceSourceInput[]
  onAddEvidence: (input: EvidenceSourceInput) => void
  onRemoveEvidence: (id: string) => void
  onAnalyzeBrand: () => void
  initialName?: string
  mode: WorkspaceSetupMode
}

const SOURCE_ICONS = {
  website: Globe,
  document: FileText,
  social: Users,
  name: Tag
} as const

const SOURCE_COLORS = {
  website: "bg-blue-500/10 border-blue-500/20",
  document: "bg-green-500/10 border-green-500/20",
  social: "bg-purple-500/10 border-purple-500/20",
  name: "bg-amber-500/10 border-amber-500/20"
} as const

export default function IntakeDock({
  evidenceSources,
  onAddEvidence,
  onRemoveEvidence,
  onAnalyzeBrand,
  initialName,
  mode
}: IntakeDockProps) {
  const [websiteInput, setWebsiteInput] = useState("")
  const [socialInput, setSocialInput] = useState("")
  const [nameInput, setNameInput] = useState(initialName || "")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddWebsite = useCallback(() => {
    if (!websiteInput.trim()) return
    
    const url = websiteInput.startsWith('http') ? websiteInput : `https://${websiteInput}`
    onAddEvidence({
      id: `website_${Date.now()}`,
      type: "website",
      label: url,
      url
    })
    setWebsiteInput("")
  }, [websiteInput, onAddEvidence])

  const handleAddSocial = useCallback(() => {
    if (!socialInput.trim()) return
    
    onAddEvidence({
      id: `social_${Date.now()}`,
      type: "social",
      label: socialInput
    })
    setSocialInput("")
  }, [socialInput, onAddEvidence])

  const handleAddName = useCallback(() => {
    if (!nameInput.trim()) return
    
    onAddEvidence({
      id: `name_${Date.now()}`,
      type: "name",
      label: nameInput
    })
    setNameInput("")
  }, [nameInput, onAddEvidence])

  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      onAddEvidence({
        id: `doc_${Date.now()}_${file.name}`,
        type: "document",
        label: file.name,
        file
      })
    })
  }, [onAddEvidence])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const handleFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files)
    }
  }, [handleFileUpload])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Evidence Sources Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Added Sources ({evidenceSources.length})
          </h3>
          <span className="text-xs text-[rgb(var(--muted-foreground))]">
            {mode === "first-time" ? "First-time setup" : 
             mode === "new-client" ? "Client workspace" : "New workspace"}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-12">
          <AnimatePresence>
            {evidenceSources.map((source) => {
              const Icon = SOURCE_ICONS[source.type]
              return (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${SOURCE_COLORS[source.type]}`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="text-sm">{source.label}</span>
                  <button
                    onClick={() => onRemoveEvidence(source.id)}
                    className="h-4 w-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Document Dropzone */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[rgb(var(--foreground))]">
          Documents
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileInput}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-[rgb(var(--os-accent))] bg-[rgb(var(--os-accent))/0.05]' 
              : 'border-[rgb(var(--border))] hover:border-[rgb(var(--os-accent))/0.3]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] flex items-center justify-center">
              <Upload className="h-6 w-6 text-[rgb(var(--muted-foreground))]" />
            </div>
            <div>
              <p className="font-medium">Drop brand documents here</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                Briefs, brand guides, decks, strategies — or click to browse
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Website Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[rgb(var(--foreground))]">
            Website
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                value={websiteInput}
                onChange={(e) => setWebsiteInput(e.target.value)}
                placeholder="yourbrand.com"
                className="w-full pl-10 pr-4 py-2.5 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--os-surface))] focus:outline-none focus:border-[rgb(var(--os-accent))]"
                onKeyDown={(e) => e.key === 'Enter' && handleAddWebsite()}
              />
            </div>
            <button
              onClick={handleAddWebsite}
              disabled={!websiteInput.trim()}
              className="px-4 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--accent))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Homepage or primary site where your brand lives.
          </p>
        </div>

        {/* Social Profiles */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[rgb(var(--foreground))]">
            Social Profiles
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                value={socialInput}
                onChange={(e) => setSocialInput(e.target.value)}
                placeholder="@handle or URL"
                className="w-full pl-10 pr-4 py-2.5 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--os-surface))] focus:outline-none focus:border-[rgb(var(--os-accent))]"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSocial()}
              />
            </div>
            <button
              onClick={handleAddSocial}
              disabled={!socialInput.trim()}
              className="px-4 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--accent))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Instagram, LinkedIn, X, YouTube, etc.
          </p>
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[rgb(var(--foreground))]">
          Brand / Person Name
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Brand or personal name"
              className="w-full pl-10 pr-4 py-2.5 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--os-surface))] focus:outline-none focus:border-[rgb(var(--os-accent))]"
              onKeyDown={(e) => e.key === 'Enter' && handleAddName()}
            />
          </div>
          <button
            onClick={handleAddName}
            disabled={!nameInput.trim()}
            className="px-4 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--accent))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="pt-6 border-t border-[rgb(var(--border))]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onAnalyzeBrand}
            disabled={evidenceSources.length === 0}
            className="w-full sm:w-auto px-8 py-3 bg-[rgb(var(--foreground))] text-[rgb(var(--background))] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
          >
            Analyze Brand
          </button>
          
          <div className="text-center sm:text-right">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Or skip and start with a guided conversation
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}