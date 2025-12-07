'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandSwitcherProps {
  currentBrandName: string;
  currentBrandSlug: string;
  userId: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export function BrandSwitcher({ currentBrandName, currentBrandSlug, userId }: BrandSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, [userId]);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandSelect = (slug: string) => {
    if (slug === currentBrandSlug) return;
    router.push(`/workspace/${slug}`);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    // You can implement a modal or navigate to create page
    console.log('Create new brand');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary))] transition-colors"
      >
        <div className="w-6 h-6 rounded bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))]" />
        <span className="body-os font-medium text-[rgb(var(--foreground))]">
          {currentBrandName}
        </span>
        <svg
          className={`w-4 h-4 text-[rgb(var(--muted-foreground))] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-64 card-base border border-[rgb(var(--border))] shadow-lg z-50"
          >
            <div className="p-2">
              {/* Current brand */}
              <div className="px-3 py-2 rounded bg-[rgb(var(--secondary))] mb-2">
                <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                  {currentBrandName}
                </p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Current workspace
                </p>
              </div>

              {/* Other brands */}
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="px-3 py-2 text-sm text-[rgb(var(--muted-foreground))]">
                    Loading brands...
                  </div>
                ) : brands.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-[rgb(var(--muted-foreground))]">
                    No other brands
                  </div>
                ) : (
                  brands
                    .filter(brand => brand.slug !== currentBrandSlug)
                    .map(brand => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandSelect(brand.slug)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-[rgb(var(--secondary))] transition-colors"
                      >
                        <p className="text-sm text-[rgb(var(--foreground))]">
                          {brand.name}
                        </p>
                      </button>
                    ))
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[rgb(var(--border))] my-2" />

              {/* Create new brand */}
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded text-sm text-[rgb(var(--os-accent))] hover:bg-[rgb(var(--os-accent-soft))] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create new brand</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}