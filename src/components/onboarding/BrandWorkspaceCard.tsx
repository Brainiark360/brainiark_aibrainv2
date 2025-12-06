// src/components/onboarding/BrandWorkspaceCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface BrandWorkspaceCardProps {
  name: string;
  slug: string;
}

export const BrandWorkspaceCard: React.FC<BrandWorkspaceCardProps> = ({
  name,
  slug,
}) => {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      onClick={() => router.push(`/workspace/${slug}`)}
      className="w-full text-left rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-4 transition-all hover:border-[rgb(var(--primary))] hover:shadow-md"
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-[rgb(var(--foreground))]">
          {name}
        </div>
        <div className="text-xs text-[rgb(var(--muted-foreground))]">
          /workspace/{slug}
        </div>
      </div>
    </motion.button>
  );
};
