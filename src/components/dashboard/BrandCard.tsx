'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface BrandCardProps {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export function BrandCard({ name, slug, createdAt }: BrandCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/workspace/${slug}`);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="card-base p-6 text-left w-full hover:border-[rgb(var(--os-accent))] transition-all duration-200 group"
    >
      <div className="space-y-4">
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          <span className="text-white font-semibold text-lg">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Brand Name */}
        <div>
          <h3 className="h3-os text-[rgb(var(--foreground))] mb-1">
            {name}
          </h3>
          <p className="caption-os text-[rgb(var(--muted-foreground))]">
            Created {format(new Date(createdAt), 'MMM d, yyyy')}
          </p>
        </div>

        {/* Action Indicator */}
        <div className="flex items-center text-[rgb(var(--os-accent))]">
          <span className="text-sm font-medium">Open workspace</span>
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}