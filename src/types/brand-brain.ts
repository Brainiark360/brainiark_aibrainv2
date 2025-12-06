// /src/types/brand-brain.ts
export type BrainSectionKey =
  | "summary"
  | "audience"
  | "tone"
  | "pillars"
  | "offers"
  | "competitors"
  | "channels"

export interface BrandBrainSectionDTO {
  key: BrainSectionKey
  title: string
  content: string
}

export interface BrandBrainDraftProps {
  brandId: string
  brandName: string
  sections: BrandBrainSectionDTO[]
}
