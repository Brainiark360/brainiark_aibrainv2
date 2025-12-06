"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Globe,
  FileText,
  Share2,
  PenLine,
  Layers
} from "lucide-react";

interface Props {
  slug: string;
}

export function EvidenceModeGrid({ slug }: Props) {
  const router = useRouter();

  const modes = [
    {
      key: "website",
      title: "Website",
      icon: Globe,
      description: "I’ll scan your site and extract brand tone, messaging, and structure.",
    },
    {
      key: "documents",
      title: "Documents",
      icon: FileText,
      description: "Upload PDFs, decks, briefs, or brand assets for deep analysis.",
    },
    {
      key: "social",
      title: "Social Links",
      icon: Share2,
      description: "Let me study your public presence to understand your audience & voice.",
    },
    {
      key: "manual",
      title: "Manual",
      icon: PenLine,
      description: "Describe the brand yourself—ideal for early-stage or stealth brands.",
    },
    {
      key: "hybrid",
      title: "Hybrid",
      icon: Layers,
      description: "Mix multiple evidence sources for the most accurate brand understanding.",
    },
  ];

  const handleSelect = (mode: string) => {
    router.push(`/onboarding/${slug}/evidence?mode=${mode}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      {modes.map(({ key, title, icon: Icon, description }) => (
        <motion.button
          key={key}
          onClick={() => handleSelect(key)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 text-left shadow-sm transition-all hover:border-[rgb(var(--foreground))] hover:bg-[rgb(var(--card-hover))]"
        >
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-[rgb(var(--foreground))] group-hover:text-blue-500 transition-colors" />
            <h2 className="text-base font-medium text-[rgb(var(--foreground))]">{title}</h2>
          </div>

          <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
            {description}
          </p>
        </motion.button>
      ))}

    </div>
  );
}
