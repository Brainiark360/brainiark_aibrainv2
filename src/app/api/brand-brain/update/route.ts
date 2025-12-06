// /src/app/api/brand-brain/update/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectDB } from "@/lib/mongoose"
import { getCurrentUser } from "@/lib/auth"
import { BrandBrain } from "@/models/BrandBrain"

const updateBrandBrainSchema = z.object({
  brandId: z.string().min(1),
  sectionKey: z.enum(["summary", "audience", "tone", "pillars", "offers", "competitors", "channels"]),
  content: z.string().min(1, "Content cannot be empty"),
})

interface UpdateBrandBrainSuccess {
  success: true
  data: {
    sectionKey: string
  }
}

interface UpdateBrandBrainError {
  success: false
  error: string
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<UpdateBrandBrainError>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const parsed = updateBrandBrainSchema.safeParse(json)

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input"
      return NextResponse.json<UpdateBrandBrainError>(
        { success: false, error: msg },
        { status: 400 }
      )
    }

    const { brandId, sectionKey, content } = parsed.data

    await connectDB()

    const brain = await BrandBrain.findOne({ brandId }).exec()
    if (!brain) {
      return NextResponse.json<UpdateBrandBrainError>(
        { success: false, error: "Brand brain not found" },
        { status: 404 }
      )
    }

    const section = brain.sections.find((s) => s.key === sectionKey)
    if (!section) {
      return NextResponse.json<UpdateBrandBrainError>(
        { success: false, error: "Section not found" },
        { status: 404 }
      )
    }

    section.content = content
    section.lastUpdatedAt = new Date()

    await brain.save()

    return NextResponse.json<UpdateBrandBrainSuccess>(
      { success: true, data: { sectionKey } },
      { status: 200 }
    )
  } catch (error) {
    console.error("[BRAND_BRAIN_UPDATE_ERROR]", error)
    return NextResponse.json<UpdateBrandBrainError>(
      { success: false, error: "Failed to update brand brain" },
      { status: 500 }
    )
  }
}
