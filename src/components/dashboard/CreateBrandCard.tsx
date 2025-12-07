'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreateBrandModal } from './CreateBrandModal';

export function CreateBrandCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleBrandCreated = (slug: string) => {
    router.push(`/workspace/${slug}`);
    router.refresh();
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className="card-base p-6 border-2 border-dashed border-[rgb(var(--border))] hover:border-[rgb(var(--os-accent))] transition-all duration-200 group"
      >
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-[rgb(var(--secondary))] flex items-center justify-center group-hover:bg-[rgb(var(--os-accent-soft))] transition-colors duration-200">
            <svg className="w-6 h-6 text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--os-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="h3-os text-[rgb(var(--foreground))] mb-1">
              Create Brand
            </h3>
            <p className="caption-os text-[rgb(var(--muted-foreground))]">
              Start a new brand workspace
            </p>
          </div>
        </div>
      </motion.button>

      {isModalOpen && (
        <CreateBrandModal
          onClose={() => setIsModalOpen(false)}
          onBrandCreated={handleBrandCreated}
        />
      )}
    </>
  );
}