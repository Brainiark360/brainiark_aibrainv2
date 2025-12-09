import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db/db-optimized";
import { Evidence } from "@/models/Evidence";
import { BrandBrain } from "@/models/BrandBrain";
import { optimizedRequireAuth } from "@/lib/optimized-middleware";
import { BrandWorkspace } from "@/models/Workspace";
import { performGPTBrandAnalysis } from "@/lib/ai/gpt-web-analyzer";

interface GPTAnalysisResponse {
  success: boolean;
  data?: {
    analysis: any;
    metadata: {
      gptPowered: boolean;
      sourcesUsed: string[];
      resultsCount: number;
      enhancement: boolean;
      evidenceAdded?: string;
      analysisDurationMs: number;
    };
  };
  error?: string;
  code?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<GPTAnalysisResponse>> {
  console.log('[GPT-ANALYZE] 🚀 Starting GPT-powered analysis endpoint');
  
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    
    if (errorResponse) return errorResponse;
    if (!workspace?._id) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const enhanceExisting = body.enhanceExisting === true;
    const brandName = workspace.name;
    
    // Check for existing analysis
    const existingBrain = await BrandBrain.findOne({
      brandWorkspaceId: workspace._id,
      status: 'in_progress'
    });
    
    if (existingBrain && !body.force) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Analysis already in progress",
          code: "ANALYSIS_IN_PROGRESS"
        },
        { status: 409 }
      );
    }
    
    // Update status to analyzing
    await BrandBrain.findOneAndUpdate(
      { brandWorkspaceId: workspace._id },
      {
        $set: {
          brandWorkspaceId: workspace._id,
          brandSlug: slug,
          status: "in_progress",
          onboardingStep: 4,
          analysisStartedAt: new Date(),
          analysisMethod: 'gpt_4o_web',
          updatedAt: new Date(),
        },
        $setOnInsert: {
          isActivated: false,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    
    // If enhancing existing, get current evidence
    let userEvidence: string[] = [];
    if (enhanceExisting) {
      const evidenceItems = await Evidence.find({
        brandSlug: slug,
        status: 'complete',
      }).lean();
      
      userEvidence = evidenceItems
        .map(item => item.analyzedContent || item.value)
        .filter(Boolean);
    }
    
    console.log(`[GPT-ANALYZE] Starting GPT analysis for ${brandName}, evidence count: ${userEvidence.length}`);
    
    // Perform GPT analysis
    const gptResult = await performGPTBrandAnalysis(brandName, userEvidence);
    
    if (!gptResult.success) {
      throw new Error('GPT analysis failed to produce results');
    }
    
    // Save GPT analysis as evidence
    const gptEvidence = await Evidence.create({
      brandSlug: slug,
      brandWorkspaceId: workspace._id,
      type: 'brand_name_search',
      value: brandName,
      analyzedContent: JSON.stringify({
        gptAnalysis: true,
        searchResults: gptResult.searchData.searchResults.length,
        crawledPages: gptResult.searchData.crawledPages.length,
        insights: gptResult.searchData.insights,
        analysis: gptResult.analysis ? 'Full analysis available' : 'Analysis summary only',
      }, null, 2),
      analysisSummary: 'GPT-4o web search and analysis completed',
      metadata: {
        gptPowered: true,
        searchPerformedAt: gptResult.searchData.metadata.searchPerformedAt,
        totalResults: gptResult.searchData.metadata.totalResults,
        sources: gptResult.searchData.metadata.sources,
        enhancement: enhanceExisting,
        analysisDurationMs: gptResult.metadata.analysisDurationMs,
      },
      status: 'complete',
      createdAt: new Date(),
    });
    
    // Update BrandBrain with GPT analysis
    const analysisCompleteTime = new Date();
    
    await BrandBrain.findOneAndUpdate(
      { brandWorkspaceId: workspace._id },
      {
        $set: {
          summary: gptResult.analysis?.summary || `GPT analysis of ${brandName}`,
          audience: gptResult.analysis?.audience || 'Audience analysis from GPT research',
          tone: gptResult.analysis?.tone || 'Brand tone from GPT analysis',
          pillars: gptResult.analysis?.pillars || [
            'Brand Strategy',
            'Content Development', 
            'Audience Engagement',
            'Market Positioning'
          ],
          offers: gptResult.analysis?.offers || 'Value proposition from GPT research',
          competitors: gptResult.analysis?.competitors || ['Industry competitors identified'],
          channels: gptResult.analysis?.channels || [
            'Digital Marketing',
            'Content Strategy',
            'Social Media',
            'Email Marketing'
          ],
          recommendations: gptResult.analysis?.recommendations || [
            'Validate GPT findings with direct research',
            'Develop comprehensive brand strategy',
            'Implement content calendar',
            'Monitor competitive landscape'
          ],
          status: "ready",
          onboardingStep: 5,
          lastAnalyzedAt: analysisCompleteTime,
          analysisCompletedAt: analysisCompleteTime,
          evidenceCount: enhanceExisting ? userEvidence.length + 1 : 1,
          evidenceType: 'gpt_brand_search',
          analysisMethod: 'gpt_4o_web',
          gptAnalysisData: {
            searchPerformed: true,
            sourcesUsed: gptResult.searchData.metadata.sources,
            resultsCount: gptResult.searchData.metadata.totalResults,
            crawledCount: gptResult.searchData.metadata.crawledCount,
            enhancement: enhanceExisting,
            analysisDurationMs: gptResult.metadata.analysisDurationMs,
          },
          updatedAt: new Date(),
        },
      }
    );
    
    // Update workspace
    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      status: "ready",
      onboardingStep: 5,
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('[GPT-ANALYZE] ✅ GPT-powered analysis completed successfully');
    
    return NextResponse.json({
      success: true,
      data: {
        analysis: gptResult.analysis,
        metadata: {
          gptPowered: true,
          sourcesUsed: gptResult.searchData.metadata.sources,
          resultsCount: gptResult.searchData.metadata.totalResults,
          enhancement: enhanceExisting,
          evidenceAdded: gptEvidence._id.toString(),
          analysisDurationMs: gptResult.metadata.analysisDurationMs,
        }
      }
    });
    
  } catch (error) {
    console.error('[GPT-ANALYZE] Error:', error);
    
    // Try to update status to failed
    try {
      const { slug } = await params;
      const { workspace } = await optimizedRequireAuth(request, { slug });
      
      if (workspace?._id) {
        await BrandBrain.findOneAndUpdate(
          { brandWorkspaceId: workspace._id },
          {
            $set: {
              status: "failed",
              lastError: error instanceof Error ? error.message.substring(0, 500) : 'GPT analysis failed',
              updatedAt: new Date(),
            }
          }
        );
      }
    } catch (cleanupError) {
      console.error('[GPT-ANALYZE] Cleanup error:', cleanupError);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'GPT analysis failed',
        code: "GPT_ANALYSIS_FAILED"
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check GPT analysis status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    
    if (errorResponse) return errorResponse;
    if (!workspace?._id) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 }
      );
    }
    
    // Check for GPT analysis evidence
    const gptEvidence = await Evidence.find({
      brandSlug: slug,
      type: 'brand_name_search',
      'metadata.gptPowered': true,
    }).sort({ createdAt: -1 }).limit(1).lean();
    
    // Check BrandBrain for GPT analysis
    const brandBrain = await BrandBrain.findOne({
      brandWorkspaceId: workspace._id,
    }).lean();
    
    const hasGPTAnalysis = brandBrain?.analysisMethod?.includes('gpt') || 
                          brandBrain?.gptAnalysisData?.searchPerformed ||
                          gptEvidence.length > 0;
    
    return NextResponse.json({
      success: true,
      data: {
        hasGPTAnalysis,
        gptEvidenceCount: gptEvidence.length,
        lastGPTAnalysis: gptEvidence[0]?.createdAt || null,
        brandBrainGPT: brandBrain?.analysisMethod?.includes('gpt') || false,
        capabilities: {
          webSearch: true,
          websiteCrawling: true,
          competitiveAnalysis: true,
          marketResearch: true
        }
      }
    });
    
  } catch (error) {
    console.error('[GPT-ANALYZE GET] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check GPT status'
      },
      { status: 500 }
    );
  }
}