// src/components/onboarding/NewBrandCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export const NewBrandCard: React.FC = () => {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      onClick={() => router.push("/onboarding/new-brand")}
      className="w-full rounded-xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--secondary))] px-4 py-4 text-left transition-all hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--background))] hover:shadow-md"
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]">
          <Plus className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[rgb(var(--foreground))]">
            Create new brand workspace
          </div>
          <div className="text-xs text-[rgb(var(--muted-foreground))]">
            Start onboarding a new brand into Brainiark OS.
          </div>
        </div>
      </div>
    </motion.button>
  );
};
