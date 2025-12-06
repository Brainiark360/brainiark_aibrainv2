// /src/components/onboarding/BrandBrainDraft.tsx
"use client"

import { BrandBrainSectionDTO } from "@/types/brand-brain"
import { BrandBrainSection } from "./BrandBrainSection"
import { ActivationCard } from "./ActivationCard"

interface BrandBrainDraftProps {
  brandId: string
  brandName: string
  sections: BrandBrainSectionDTO[]
}

export function BrandBrainDraft({ brandId, brandName, sections }: BrandBrainDraftProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">
          Brand Brain for {brandName}
        </h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))] max-w-xl">
          Review, refine, and regenerate each part of your brand’s strategy. These
          sections power your content, channels, and automation.
        </p>
      </header>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <BrandBrainSection
            key={section.key}
            section={section}
            brandId={brandId}
            index={index}
          />
        ))}
      </div>

      <ActivationCard brandId={brandId} brandName={brandName} />
    </div>
  )
}
