// /app/api/brands/[slug]/onboarding/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Evidence } from '@/models/Evidence';
import { BrandBrain } from '@/models/BrandBrain';
import { connectToDatabase } from '@/db/db-optimized';
import { optimizedRequireAuth } from '@/lib/optimized-middleware';
import { BrandWorkspace } from '@/models/Workspace';
import { createAnalysisCompletion } from '@/lib/ai/openai';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Check if analysis is already in progress
    const existingBrain = await BrandBrain.findOne({ brandSlug: slug });
    if (existingBrain?.status === 'in_progress' && existingBrain.onboardingStep === 4) {
      return NextResponse.json(
        { success: false, error: 'Analysis already in progress' },
        { status: 409 }
      );
    }
    
    // Fetch all completed evidence
    const evidenceItems = await Evidence.find({ 
      brandSlug: slug,
      status: 'complete'
    }).lean();
    
    if (evidenceItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No evidence available for analysis. Please add some evidence first.' },
        { status: 400 }
      );
    }
    
    // Update status to analyzing
    await Promise.all([
      BrandBrain.findOneAndUpdate(
        { brandSlug: slug },
        {
          status: 'in_progress',
          onboardingStep: 4, // analyzing
        },
        { new: true, upsert: true, lean: true }
      ),
      BrandWorkspace.findByIdAndUpdate(
        workspace._id,
        {
          status: 'in_progress',
          onboardingStep: 4,
          lastActiveAt: new Date(),
        },
        { new: true, lean: true }
      )
    ]);
    
    // Compile evidence for analysis
    const evidenceText = evidenceItems
      .map((item, index) => {
        const content = item.analyzedContent || item.value;
        return `Evidence ${index + 1} [${item.type.toUpperCase()}]:\n${content}\n`;
      })
      .join('\n---\n\n');
    
    // Create analysis prompt
    const systemPrompt = `You are Brainiark AI, a brand strategy analysis expert.
Your task is to analyze provided brand evidence and create a comprehensive Brand Brain.

Analyze the evidence and produce a JSON object with exactly this structure:
{
  "summary": "A concise 2-3 paragraph brand summary covering mission, values, and positioning",
  "audience": "Detailed description of target audience including demographics, psychographics, behaviors, and needs",
  "tone": "Brand voice and tone description with specific adjectives and communication examples",
  "pillars": ["Array of 3-5 strategic content pillars", "Each pillar should be distinct and actionable", "Focus on core brand themes"],
  "recommendations": ["Array of 3-5 actionable recommendations", "Focus on immediate next steps", "Be specific and practical"],
  "offers": "Key products, services, or value propositions",
  "competitors": ["Main competitors or alternatives", "Brief differentiators"],
  "channels": ["Primary marketing and communication channels", "Focus on where audience is most active"]
}

Rules:
- Be specific and actionable
- Base everything on the evidence provided
- Use professional but approachable language
- Ensure recommendations are practical and implementable
- Pillars should support the overall brand strategy
- Do not invent information not supported by evidence

Return ONLY the JSON object.`;

    const userPrompt = `Brand: ${workspace.name}
Slug: ${slug}

Evidence Analysis Request:
${evidenceText}

Please analyze this evidence and create the Brand Brain JSON.`;
    
    // Call OpenAI for analysis
    const analysisResponse = await createAnalysisCompletion(systemPrompt, userPrompt);
    
    if (!analysisResponse) {
      throw new Error('No response received from AI analysis');
    }
    
    // Parse JSON response
    let brandBrainData;
    try {
      // Clean and parse the response
      const cleanedResponse = analysisResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      brandBrainData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Response:', analysisResponse);
      
      // Fallback to structured text extraction
      brandBrainData = {
        summary: "Based on the provided evidence, here's an initial brand analysis...",
        audience: "Target audience analysis based on provided evidence",
        tone: "Brand voice to be refined based on further evidence",
        pillars: ["Content Strategy", "Audience Engagement", "Brand Messaging"],
        recommendations: [
          "Review and refine the brand strategy",
          "Implement content pillars",
          "Develop audience-specific messaging"
        ],
        offers: "Key offerings based on evidence",
        competitors: ["Market competitors identified from evidence"],
        channels: ["Recommended marketing channels"]
      };
    }
    
    // Update BrandBrain with analysis results
    const updatedBrain = await BrandBrain.findOneAndUpdate(
      { brandSlug: slug },
      {
        ...brandBrainData,
        status: 'ready',
        onboardingStep: 5, // reviewing_brand_brain
        lastAnalyzedAt: new Date(),
        isActivated: false,
      },
      { new: true, lean: true }
    );
    
    // Update workspace
    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      status: 'in_progress',
      onboardingStep: 5,
      lastActiveAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      data: {
        brain: updatedBrain,
        evidenceCount: evidenceItems.length,
        analyzedAt: new Date(),
      }
    });
    
  } catch (error: any) {
    console.error('Analysis error:', error);
    
    // Reset status on error
    try {
      await BrandBrain.findOneAndUpdate(
        { brandSlug: slug },
        {
          status: 'not_started',
          onboardingStep: 2, // back to collecting_evidence
        }
      );
    } catch (updateError) {
      console.error('Failed to reset status:', updateError);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to perform brand analysis' 
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Check analysis status
    const brandBrain = await BrandBrain.findOne({ brandSlug: slug }).lean();
    const evidenceCount = await Evidence.countDocuments({ 
      brandSlug: slug,
      status: 'complete'
    });
    
    return NextResponse.json({
      success: true,
      data: {
        canAnalyze: evidenceCount > 0,
        evidenceCount,
        analysisStatus: brandBrain?.status || 'not_started',
        lastAnalyzedAt: brandBrain?.lastAnalyzedAt,
        isReady: brandBrain?.status === 'ready',
      }
    });
    
  } catch (error: any) {
    console.error('Analysis status error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}