// /src/app/api/onboarding/analyze-evidence/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectDB } from "@/lib/mongoose"
import { getCurrentUser } from "@/lib/auth"
import { BrandBrain } from "@/models/BrandBrain"

const analyzeEvidenceSchema = z.object({
  brandId: z.string().min(1),
  mode: z.enum(["website", "documents", "social", "manual", "hybrid"]),
  websiteUrl: z.string().url().optional(),
  manualText: z.string().optional(),
  socialLinks: z.array(z.string().url()).optional(),
})

interface AnalyzeEvidenceSuccess {
  success: true
  data: {
    message: string
  }
}

interface AnalyzeEvidenceError {
  success: false
  error: string
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<AnalyzeEvidenceError>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const parsed = analyzeEvidenceSchema.safeParse(json)

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input"
      return NextResponse.json<AnalyzeEvidenceError>(
        { success: false, error: msg },
        { status: 400 }
      )
    }

    const { brandId, mode, websiteUrl, manualText, socialLinks } = parsed.data

    await connectDB()

    const brain = await BrandBrain.findOne({ brandId }).exec()
    if (!brain) {
      return NextResponse.json<AnalyzeEvidenceError>(
        { success: false, error: "Brand brain not found" },
        { status: 404 }
      )
    }

    const pieces: string[] = []
    if (websiteUrl) pieces.push(`Website: ${websiteUrl}`)
    if (manualText) pieces.push(`Manual: ${manualText.slice(0, 200)}…`)
    if (socialLinks && socialLinks.length > 0) {
      pieces.push(`Social: ${socialLinks.join(", ")}`)
    }

    brain.evidence.push({
      type: mode === "documents" ? "document" : mode === "social" ? "social" : mode === "manual" ? "manual" : mode === "website" ? "website" : "hybrid",
      sourceLabel: mode,
      url: websiteUrl,
      contentPreview: pieces.join(" | ").slice(0, 400),
      createdAt: new Date(),
    })

    await brain.save()

    // TODO: call AI to analyze and update sections

    return NextResponse.json<AnalyzeEvidenceSuccess>(
      { success: true, data: { message: "Evidence captured for analysis." } },
      { status: 200 }
    )
  } catch (error) {
    console.error("[ANALYZE_EVIDENCE_ERROR]", error)
    return NextResponse.json<AnalyzeEvidenceError>(
      { success: false, error: "Failed to analyze evidence" },
      { status: 500 }
    )
  }
}
