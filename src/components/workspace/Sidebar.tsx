'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Target, 
  PenSquare, 
  Calendar, 
  Brain, 
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  FolderKanban,
  Users,
  Layers,
  Zap,
  Sparkles
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  brandName: string;
  brandSlug: string;
}

export default function Sidebar({ brandName, brandSlug }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Navigation items for brand workspace
  const navItems = [
    { id: 'home', label: 'Overview', icon: Home, path: `/workspace/${brandSlug}`, badge: null },
    { id: 'strategy', label: 'Strategy', icon: Target, path: `/workspace/${brandSlug}/strategy`, badge: '3' },
    { id: 'content', label: 'Content', icon: PenSquare, path: `/workspace/${brandSlug}/content`, badge: null },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: `/workspace/${brandSlug}/calendar`, badge: 'New' },
    { id: 'brain', label: 'Brand Brain', icon: Brain, path: `/workspace/${brandSlug}/brain`, badge: 'AI' },
    { id: 'analytics', label: 'Analytics', icon: Layers, path: `/workspace/${brandSlug}/analytics`, badge: null },
    { id: 'team', label: 'Team', icon: Users, path: `/workspace/${brandSlug}/team`, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, path: `/workspace/${brandSlug}/settings`, badge: null },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  const sidebarWidth = isExpanded ? 260 : 80;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed position, no scrolling */}
      <motion.aside
        layout
        initial={{ width: sidebarWidth }}
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-screen flex flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--os-surface)/0.95)] backdrop-blur-xl z-50 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ height: '100vh' }}
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border)/0.4)]">
          <motion.div
            animate={{ opacity: isExpanded ? 1 : 0 }}
            className={`flex items-center gap-3 ${!isExpanded && 'w-0 overflow-hidden'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.6)] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[rgb(var(--foreground))] text-sm">
                {brandName}
              </h1>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Workspace
              </p>
            </div>
          </motion.div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors flex-shrink-0"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Main Navigation - Scrollable within fixed sidebar */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[rgb(var(--os-accent)/0.1)] border border-[rgb(var(--os-accent)/0.2)] text-[rgb(var(--os-accent))]'
                    : 'hover:bg-[rgb(var(--os-surface)/0.6)] text-[rgb(var(--foreground))]'
                }`}
              >
                <div className={`flex-shrink-0 ${isActive ? 'text-[rgb(var(--os-accent))]' : 'text-[rgb(var(--muted-foreground))]'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <motion.span
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                  className={`text-sm font-medium whitespace-nowrap ${!isExpanded && 'w-0 overflow-hidden'}`}
                >
                  {item.label}
                </motion.span>
                
                {/* Badge */}
                {item.badge && isExpanded && (
                  <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                    item.badge === 'AI' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                    item.badge === 'New' ? 'bg-green-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
                
                {/* Active indicator */}
                {isActive && !item.badge && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[rgb(var(--os-accent))]"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer - Fixed at bottom of sidebar */}
        <div className="p-4 border-t border-[rgb(var(--border)/0.4)] space-y-4">
          {/* Quick Actions */}
          <div className={`space-y-2 ${!isExpanded && 'hidden'}`}>
            <button
              onClick={() => router.push(`/workspace/${brandSlug}/ai-studio`)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[rgb(var(--foreground))] bg-gradient-to-r from-[rgb(var(--os-accent)/0.1)] to-transparent hover:from-[rgb(var(--os-accent)/0.2)] transition-all"
            >
              <Zap className="w-4 h-4" />
              AI Studio
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors"
            >
              <FolderKanban className="w-4 h-4" />
              All Brands
            </button>
          </div>

          {/* Help & Theme */}
          <div className={`flex items-center justify-between ${!isExpanded && 'justify-center'}`}>
            <button className="p-2 rounded-lg hover:bg-[rgb(var(--os-surface)/0.6)] transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
            
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-purple-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {brandName?.[0]?.toUpperCase() || 'B'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--foreground))]">
                    {brandName}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    Active
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[rgb(var(--os-surface)/0.95)] backdrop-blur-xl border border-[rgb(var(--border))] md:hidden"
        aria-label="Open menu"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </>
  );
}