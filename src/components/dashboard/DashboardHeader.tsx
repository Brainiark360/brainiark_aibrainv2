// /src/components/home/HomeHeader.tsx (Fixed - fixed position)
"use client"

import { motion } from "framer-motion"
import { Brain, Bell, Search, Menu, ChevronDown, HelpCircle } from "lucide-react"
import { useState } from "react"

interface HomeHeaderProps {
  userName?: string
  isLoading?: boolean
}

export default function HomeHeader({ userName, isLoading }: HomeHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 border-b border-[rgb(var(--border)/0.5)] bg-[rgb(var(--os-surface)/0.95)] backdrop-blur-xl"
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Breadcrumb & Title */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <button className="p-2 rounded-lg hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.6)] flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold text-[rgb(var(--foreground))]">
                Brainiark OS
              </h1>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Home Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Search Brainiark..."
              className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--os-surface))] border border-[rgb(var(--border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--os-accent)/0.3)]"
            />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Help */}
          <button className="hidden md:flex p-2 rounded-lg hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors">
            <Bell className="w-4 h-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* User */}
          <div className="flex items-center gap-2 pl-3 border-l border-[rgb(var(--border)/0.4)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {isLoading ? "..." : userName?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                {isLoading ? "Loading..." : userName || "User"}
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Workspace Admin
              </p>
            </div>
            <button className="p-1 hover:bg-[rgb(var(--os-surface)/0.6)] rounded-md">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden px-6 py-3 border-t border-[rgb(var(--border)/0.4)]"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Search Brainiark..."
              className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--os-surface))] border border-[rgb(var(--border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--os-accent)/0.3)]"
              autoFocus
            />
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}