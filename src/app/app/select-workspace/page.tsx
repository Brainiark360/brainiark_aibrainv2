"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Calendar, 
  Plus,
  ChevronRight,
  Users
} from 'lucide-react'
import AuthWindow from '@/components/auth/AuthWindow'
import AuthButton from '@/components/auth/AuthButton'
import Link from 'next/link'

interface Workspace {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  type: 'personal' | 'team' | 'client'
}

export default function SelectWorkspacePage() {
  const router = useRouter()
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('')
  
  // Mock workspaces - replace with real API call
  const workspaces: Workspace[] = [
    {
      id: 'ws_1',
      name: 'Acme Corp',
      description: 'Main marketing workspace',
      createdAt: '2024-01-15',
      updatedAt: '2024-03-10',
      type: 'client'
    },
    {
      id: 'ws_2',
      name: 'Personal Projects',
      description: 'Personal content experiments',
      createdAt: '2024-02-20',
      updatedAt: '2024-03-08',
      type: 'personal'
    },
    {
      id: 'ws_3',
      name: 'Team Workspace',
      description: 'Internal team collaboration',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-09',
      type: 'team'
    }
  ]

  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspace(workspaceId)
    
    // In a real app, you would set the active workspace in context/store
    setTimeout(() => {
      router.push(`/workspace/${workspaceId}`)
    }, 300)
  }

  const getWorkspaceIcon = (type: Workspace['type']) => {
    switch (type) {
      case 'personal': return Briefcase
      case 'team': return Users
      case 'client': return Briefcase
      default: return Briefcase
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <AuthWindow
      title="Select Workspace"
      subtitle="Choose a workspace to continue"
    >
      <div className="space-y-6">
        {/* Workspace List */}
        <div className="space-y-3">
          {workspaces.map((workspace, index) => {
            const Icon = getWorkspaceIcon(workspace.type)
            return (
              <motion.button
                key={workspace.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectWorkspace(workspace.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedWorkspace === workspace.id
                    ? 'border-[rgb(var(--os-accent))] bg-[rgb(var(--os-accent))/0.05]'
                    : 'border-[rgb(var(--border))] hover:border-[rgb(var(--os-accent))/0.3] hover:bg-[rgb(var(--accent))]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[rgb(var(--os-accent))]" />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">{workspace.name}</h4>
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                        {workspace.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 rounded border border-[rgb(var(--border))] capitalize">
                          {workspace.type}
                        </span>
                        <span className="text-xs text-[rgb(var(--muted-foreground))]">
                          Updated {formatDate(workspace.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className={`h-5 w-5 ${
                    selectedWorkspace === workspace.id 
                      ? 'text-[rgb(var(--os-accent))]' 
                      : 'text-[rgb(var(--muted-foreground))]'
                  }`} />
                </div>
              </motion.button>
            )
          })}
        </div>
        
        {/* Add Workspace */}
        <div className="pt-4 border-t border-[rgb(var(--border))]">
          <Link href="/auth/workspace-setup?mode=new-workspace">
            <AuthButton variant="outline" icon={Plus}>
              Add Workspace
            </AuthButton>
          </Link>
        </div>
      </div>
    </AuthWindow>
  )
}