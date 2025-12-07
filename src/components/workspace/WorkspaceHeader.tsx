// /components/workspace/WorkspaceHeader.tsx - UPDATED
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  HelpCircle,
  LogOut,
  Settings,
  Plus,
  Grid2X2,
  Sun,
  Moon,
  Building
} from 'lucide-react';

interface WorkspaceHeaderProps {
  userName?: string;
  brandName?: string;
  brandSlug?: string;
  isLoading?: boolean;
  onLogout?: () => void;
  onSettings?: () => void;
  onDashboard?: () => void;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function WorkspaceHeader({ 
  userName = "User", 
  brandName = "Brand",
  brandSlug = "",
  isLoading = false,
  onLogout,
  onSettings,
  onDashboard
}: WorkspaceHeaderProps) {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBrandSwitcherOpen, setIsBrandSwitcherOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Fetch user's brands
  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoadingBrands(true);
      try {
        const response = await fetch('/api/brands');
        const data = await response.json();
        
        if (data.success) {
          setBrands(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandSelect = (slug: string) => {
    router.push(`/workspace/${slug}`);
    setIsBrandSwitcherOpen(false);
  };

  const handleNavigateToDashboard = () => {
    router.push('/dashboard');
    setIsBrandSwitcherOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 border-b border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] backdrop-blur-xl"
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
          
          {/* Logo / Workspace Name */}
          
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Search content, strategies, insights..."
              className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--os-surface))] border border-[rgb(var(--border))] rounded-lg body-os focus:outline-none focus:ring-2 focus:ring-[rgb(var(--os-accent)/0.3)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Right: Controls with Brand Switcher */}
        <div className="flex items-center gap-3">
          {/* Mobile Search */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          </button>

          {/* Help */}
          <button className="hidden md:flex p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors">
            <HelpCircle className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          </button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors"
            aria-label="Toggle theme"
          >
            <div className="relative w-5 h-5">
              <Sun className="w-4 h-4 text-[rgb(var(--muted-foreground))] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute top-0.5 left-0.5 w-4 h-4 text-[rgb(var(--muted-foreground))] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </div>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[rgb(var(--os-accent))] border border-[rgb(var(--background))]" />
            </motion.button>
          </div>

          {/* Brand Switcher - MOVED TO RIGHT */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsBrandSwitcherOpen(!isBrandSwitcherOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors border-l border-[rgb(var(--border))] pl-4"
            >
              <Building className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm font-medium text-[rgb(var(--foreground))] hidden md:inline">
                Brands
              </span>
              <ChevronDown className={`w-3 h-3 text-[rgb(var(--muted-foreground))] transition-transform duration-200 ${
                isBrandSwitcherOpen ? 'rotate-180' : ''
              }`} />
            </motion.button>

            {/* Brand Switcher Dropdown */}
            <AnimatePresence>
              {isBrandSwitcherOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 card-base border border-[rgb(var(--border))] shadow-xl z-50"
                >
                  <div className="p-3">
                    {/* Header */}
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">
                        Your Brands
                      </h3>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        Switch between workspaces
                      </p>
                    </div>

                    {/* Current Brand */}
                    <div className="px-3 py-2.5 rounded-lg bg-[rgb(var(--secondary))] mb-3 border border-[rgb(var(--border))]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.7)] flex items-center justify-center">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                            {brandName}
                          </p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">
                            Current workspace • {brandSlug}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Other Brands */}
                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                      {isLoadingBrands ? (
                        <div className="px-3 py-2 text-sm text-[rgb(var(--muted-foreground))] text-center">
                          Loading brands...
                        </div>
                      ) : brands.length === 0 ? (
                        <div className="px-3 py-3 text-center">
                          <div className="w-12 h-12 rounded-full bg-[rgb(var(--secondary))] flex items-center justify-center mx-auto mb-2">
                            <Building className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                          </div>
                          <p className="text-sm text-[rgb(var(--muted-foreground))]">
                            No other brands
                          </p>
                        </div>
                      ) : (
                        brands.map((brand) => (
                          <motion.button
                            key={brand.id}
                            whileHover={{ x: 4 }}
                            onClick={() => handleBrandSelect(brand.slug)}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors flex items-center gap-3 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent)/0.6)] to-[rgb(var(--os-accent)/0.3)] group-hover:from-[rgb(var(--os-accent)/0.8)] group-hover:to-[rgb(var(--os-accent)/0.5)] transition-colors" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                                {brand.name}
                              </p>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                {brand.slug}
                              </p>
                            </div>
                          </motion.button>
                        ))
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[rgb(var(--border))] my-3" />

                    {/* Actions */}
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={handleNavigateToDashboard}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-colors"
                      >
                        <Grid2X2 className="w-4 h-4" />
                        <span>All Brands Dashboard</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => router.push('/dashboard/new')}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[rgb(var(--os-accent))] hover:bg-[rgb(var(--os-accent-soft))] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create New Brand</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-3 border-l border-[rgb(var(--border))]"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent)/0.7)] flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {isLoading ? "..." : userName?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                  {isLoading ? "Loading..." : userName}
                </p>
              </div>
              <ChevronDown className={`w-3 h-3 text-[rgb(var(--muted-foreground))] transition-transform duration-200 ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`} />
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 card-base border border-[rgb(var(--border))] shadow-xl z-50"
                >
                  <div className="p-3">
                    {/* User Info */}
                    <div className="px-3 py-2 mb-2">
                      <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                        {userName}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {brandName} Workspace
                      </p>
                    </div>

                    <div className="border-t border-[rgb(var(--border))] my-2" />

                    {/* Menu Items */}
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => router.push(`/workspace/${brandSlug}/settings`)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Workspace Settings</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => router.push('/account')}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </motion.button>

                    <div className="border-t border-[rgb(var(--border))] my-2" />

                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Panel */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[rgb(var(--border))]"
          >
            <div className="px-6 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                <input
                  type="text"
                  placeholder="Search Brainiark..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--os-surface))] border border-[rgb(var(--border))] rounded-lg body-os focus:outline-none focus:ring-2 focus:ring-[rgb(var(--os-accent)/0.3)] focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for dropdowns */}
      <AnimatePresence>
        {(isBrandSwitcherOpen || isUserMenuOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => {
              setIsBrandSwitcherOpen(false);
              setIsUserMenuOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}