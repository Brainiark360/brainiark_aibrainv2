// /app/api/brands/[slug]/onboarding/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase } from '@/db/db-optimized';
import { optimizedRequireAuth } from '@/lib/optimized-middleware';
import { performGPTBrandAnalysis } from '@/lib/ai/gpt-web-analyzer';
import { BrandBrain } from '@/models/BrandBrain';
import { BrandWorkspace } from '@/models/Workspace';
import { Evidence } from '@/models/Evidence';
import type { EvidenceStatus, EvidenceType } from '@/types/onboarding';

interface AnalysisSuccessResponse {
  success: true;
  data: BrandBrainAnalysis;
}

interface AnalysisErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  startedAt?: string;
}

type AnalysisResponse = AnalysisSuccessResponse | AnalysisErrorResponse;

interface EvidenceDoc {
  type: EvidenceType;
  value: string;
  status: EvidenceStatus;
  analyzedContent?: string;
  analysisSummary?: string;
  metadata?: Record<string, unknown>;
}

interface BrandBrainAnalysis {
  summary: string;
  audience: string;
  tone: string;
  pillars: string[];
  offers: string;
  competitors: string[];
  channels: string[];
  recommendations: string[];
}

interface GPTSearchInsights {
  industry?: string;
  competitors?: string[];
  companyInfo?: string;
  publicPresence?: string;
  audienceSignals?: string[];
  toneSignals?: string[];
}

interface GPTSearchMetadata {
  searchPerformedAt: string;
  totalResults: number;
  sources: string[];
  crawledCount: number;
}

interface GPTSearchPage {
  url?: string;
  title?: string;
  content: string;
}

interface GPTSearchData {
  searchResults: readonly unknown[];
  crawledPages: readonly GPTSearchPage[];
  metadata: GPTSearchMetadata;
  insights: GPTSearchInsights;
}

interface GPTAnalysisMetadata {
  analysisDurationMs: number;
}

interface GPTAnalysisResult {
  success: boolean;
  analysis?: BrandBrainAnalysis;
  searchData: GPTSearchData;
  metadata: GPTAnalysisMetadata;
}

interface AnalyzeRequestBody {
  force?: boolean;
  brandNameOnly?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<AnalysisResponse>> {
  console.log('[ANALYZE] 🚀 Starting GPT-powered brand analysis request');

  try {
    await connectToDatabase();

    const { slug } = await params;
    const { workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<AnalysisResponse>;

    if (!workspace?._id) {
      return NextResponse.json<AnalysisErrorResponse>(
        { success: false, error: 'Workspace not found for this brand.' },
        { status: 404 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as AnalyzeRequestBody;
    const forceRestart = body.force === true;
    const isBrandNameOnly = body.brandNameOnly === true;

    console.log(
      `[ANALYZE] Workspace: ${workspace.name}, brandNameOnly=${isBrandNameOnly}`
    );

    // Check existing analysis state
    const existingBrainDoc = await BrandBrain.findOne({
      brandWorkspaceId: workspace._id,
    })
      .lean()
      .exec();

    if (
      existingBrainDoc &&
      existingBrainDoc.status === 'in_progress' &&
      typeof existingBrainDoc.onboardingStep === 'number' &&
      existingBrainDoc.onboardingStep === 4
    ) {
      if (forceRestart) {
        console.log('[ANALYZE] Force restart requested, resetting in-progress analysis');
        await BrandBrain.findOneAndUpdate(
          { brandWorkspaceId: workspace._id },
          {
            $set: {
              status: 'not_started',
              onboardingStep: 3,
              lastAnalyzedAt: null,
              updatedAt: new Date(),
            },
          }
        ).exec();
      } else {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const analysisStartedAt =
          existingBrainDoc.analysisStartedAt ?? existingBrainDoc.updatedAt;

        if (analysisStartedAt && analysisStartedAt < fiveMinutesAgo) {
          console.log('[ANALYZE] Stale analysis found, resetting state');
          await BrandBrain.findOneAndUpdate(
            { brandWorkspaceId: workspace._id },
            {
              $set: {
                status: 'not_started',
                onboardingStep: 3,
                lastAnalyzedAt: null,
                updatedAt: new Date(),
              },
            }
          ).exec();
        } else {
          return NextResponse.json<AnalysisErrorResponse>(
            {
              success: false,
              error:
                'Analysis already in progress. Try again in a few minutes or force restart.',
              code: 'ANALYSIS_IN_PROGRESS',
              startedAt: analysisStartedAt?.toISOString(),
            },
            { status: 409 }
          );
        }
      }
    }

    // Mark analysis as in progress
    const analysisStartTime = new Date();
    await Promise.all([
      BrandBrain.findOneAndUpdate(
        { brandWorkspaceId: workspace._id },
        {
          $set: {
            brandWorkspaceId: workspace._id,
            brandSlug: slug,
            status: 'in_progress',
            onboardingStep: 4,
            analysisStartedAt: analysisStartTime,
            analysisMethod: 'gpt_4o_web',
            updatedAt: new Date(),
          },
          $setOnInsert: {
            isActivated: false,
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true }
      ).exec(),
      BrandWorkspace.findByIdAndUpdate(workspace._id, {
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      }).exec(),
    ]);

    // BRAND-NAME-ONLY PATH
    if (isBrandNameOnly) {
      return handleBrandNameOnlyAnalysis(
        slug,
        workspace.name,
        workspace._id.toString(),
        analysisStartTime
      );
    }

    // EVIDENCE-BASED ANALYSIS
    return handleEvidenceBasedAnalysis(
      slug,
      workspace.name,
      workspace._id.toString(),
      analysisStartTime
    );
  } catch (error: unknown) {
    console.error('[ANALYZE] GPT-powered brand analysis error:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to analyze brand evidence';

    return NextResponse.json<AnalysisErrorResponse>(
      {
        success: false,
        error: message,
        code: 'GPT_ANALYSIS_FAILED',
        details:
          process.env.NODE_ENV === 'development'
            ? { message }
            : undefined,
      },
      { status: 500 }
    );
  }
}

async function handleBrandNameOnlyAnalysis(
  slug: string,
  brandName: string,
  workspaceId: string,
  analysisStartTime: Date
): Promise<NextResponse<AnalysisResponse>> {
  console.log('[ANALYZE] Brand-name-only GPT analysis start');

  const searchEvidence = await Evidence.create({
    brandSlug: slug,
    brandWorkspaceId: workspaceId,
    type: 'brand_name_search',
    value: brandName,
    status: 'processing',
    createdAt: new Date(),
  });

  logSystemMessage(
    `🔍 Searching the internet for brand information about "${brandName}"...`
  );
  logSystemMessage('🌐 Crawling website pages and analyzing public presence...');

  try {
    const gptResult = (await performGPTBrandAnalysis(
      brandName,
      []
    )) as GPTAnalysisResult;

    if (!gptResult.success) {
      throw new Error('GPT web search and analysis failed');
    }

    await Evidence.findByIdAndUpdate(searchEvidence._id, {
      analyzedContent: JSON.stringify(gptResult.searchData, null, 2),
      analysisSummary: 'GPT-4o web search and analysis completed',
      metadata: {
        gptAnalysis: true,
        searchResults: gptResult.searchData.searchResults.length,
        crawledPages: gptResult.searchData.crawledPages.length,
        sources: gptResult.searchData.metadata.sources,
      },
      status: 'complete',
      processingCompletedAt: new Date(),
    }).exec();

    logSystemMessage(
      `✅ Found ${gptResult.searchData.metadata.totalResults} sources and crawled ${gptResult.searchData.metadata.crawledCount} pages`
    );
    logSystemMessage('🤖 Generating your Brand Brain from GPT analysis...');

    const analysis =
      gptResult.analysis ??
      createFallbackAnalysisFromGPT(brandName, gptResult.searchData);

    const analysisCompleteTime = new Date();

    await BrandBrain.findOneAndUpdate(
      { brandWorkspaceId: workspaceId },
      {
        $set: {
          brandWorkspaceId: workspaceId,
          brandSlug: slug,
          summary: analysis.summary,
          audience: analysis.audience,
          tone: analysis.tone,
          pillars: analysis.pillars,
          offers: analysis.offers,
          competitors: analysis.competitors,
          channels: analysis.channels,
          recommendations: analysis.recommendations,
          status: 'ready',
          onboardingStep: 5,
          lastAnalyzedAt: analysisCompleteTime,
          analysisCompletedAt: analysisCompleteTime,
          analysisDurationMs:
            analysisCompleteTime.getTime() - analysisStartTime.getTime(),
          evidenceCount: 1,
          evidenceType: 'gpt_brand_search',
          analysisMethod: 'gpt_4o_web',
          gptAnalysisData: {
            searchPerformed: true,
            sourcesUsed: gptResult.searchData.metadata.sources,
            resultsCount: gptResult.searchData.metadata.totalResults,
            crawledCount: gptResult.searchData.metadata.crawledCount,
          },
          updatedAt: new Date(),
        },
        $setOnInsert: {
          isActivated: false,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    ).exec();

    await BrandWorkspace.findByIdAndUpdate(workspaceId, {
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    }).exec();

    logSystemMessage('✅ Brand Brain created successfully from GPT-powered analysis!');

    console.log('[ANALYZE] ✅ Brand-name-only GPT analysis completed');

    return NextResponse.json<AnalysisSuccessResponse>({
      success: true,
      data: analysis,
    });
  } catch (error: unknown) {
    console.error('[ANALYZE] Brand-name-only GPT analysis failed:', error);

    await Evidence.findByIdAndUpdate(searchEvidence._id, {
      status: 'failed',
      analysisError: error instanceof Error ? error.message : 'GPT analysis failed',
    }).exec();

    return NextResponse.json<AnalysisErrorResponse>(
      {
        success: false,
        error:
          error instanceof Error
            ? `GPT-powered analysis failed: ${error.message}`
            : 'GPT-powered analysis failed',
        code: 'GPT_ANALYSIS_FAILED',
      },
      { status: 500 }
    );
  }
}

async function handleEvidenceBasedAnalysis(
  slug: string,
  brandName: string,
  workspaceId: string,
  analysisStartTime: Date
): Promise<NextResponse<AnalysisResponse>> {
  console.log('[ANALYZE] Evidence-based GPT-enhanced analysis start');

  const processingEvidence = await Evidence.countDocuments({
    brandSlug: slug,
    status: 'processing',
  }).exec();

  if (processingEvidence > 0) {
    console.log(
      `[ANALYZE] ${processingEvidence} evidence items still processing, continuing anyway`
    );
  }

  const rawEvidence = await Evidence.find({
    brandSlug: slug,
    status: 'complete',
  })
    .lean()
    .exec();

  if (rawEvidence.length === 0) {
    return NextResponse.json<AnalysisErrorResponse>(
      {
        success: false,
        error:
          'No evidence available. Would you like me to search the internet and analyze your brand using AI?',
        code: 'NO_EVIDENCE_GPT_SUGGESTION',
        details: {
          suggestion: 'gpt_brand_search',
          brandName,
          canPerformGPTAnalysis: true,
        },
      },
      { status: 400 }
    );
  }

  const evidenceItems: EvidenceDoc[] = rawEvidence.map((item) => ({
    type: item.type as EvidenceType,
    value: typeof item.value === 'string' ? item.value : String(item.value),
    status: item.status as EvidenceStatus,
    analyzedContent:
      typeof item.analyzedContent === 'string' ? item.analyzedContent : undefined,
    analysisSummary:
      typeof item.analysisSummary === 'string' ? item.analysisSummary : undefined,
    metadata: item.metadata ?? {},
  }));

  logSystemMessage(
    `🔍 Starting GPT-powered analysis of ${evidenceItems.length} evidence items...`
  );
  logSystemMessage('🌐 Enhancing analysis with internet research...');

  let gptEnhancedData: GPTAnalysisResult | null = null;

  try {
    gptEnhancedData = (await performGPTBrandAnalysis(
      brandName,
      evidenceItems
        .map((item) => item.analyzedContent || item.value)
        .filter((v) => v.length > 0)
    )) as GPTAnalysisResult;

    if (gptEnhancedData.success) {
      logSystemMessage(
        `✅ Added ${gptEnhancedData.searchData.metadata.totalResults} internet sources to analysis`
      );
    }
  } catch (error: unknown) {
    console.warn(
      '[ANALYZE] GPT enhancement failed, proceeding with evidence-only analysis:',
      error
    );
  }

  const enhancedEvidenceText = buildEnhancedEvidenceText(evidenceItems, gptEnhancedData);

  logSystemMessage('🤖 Generating comprehensive Brand Brain with GPT-4o...');

  let analysis: BrandBrainAnalysis;

  if (gptEnhancedData?.success && gptEnhancedData.analysis) {
    analysis = enhanceAnalysisWithUserEvidence(gptEnhancedData.analysis, evidenceItems);
  } else if (gptEnhancedData?.success) {
    analysis = createFallbackAnalysisFromGPT(brandName, gptEnhancedData.searchData);
  } else {
    analysis = createFallbackEvidenceOnlyAnalysis(brandName, enhancedEvidenceText);
  }

  const normalized = normalizeAnalysis(analysis);
  const analysisCompleteTime = new Date();

  await BrandBrain.findOneAndUpdate(
    { brandWorkspaceId: workspaceId },
    {
      $set: {
        brandWorkspaceId: workspaceId,
        brandSlug: slug,
        summary: normalized.summary,
        audience: normalized.audience,
        tone: normalized.tone,
        pillars: normalized.pillars,
        offers: normalized.offers,
        competitors: normalized.competitors,
        channels: normalized.channels,
        recommendations: normalized.recommendations,
        status: 'ready',
        onboardingStep: 5,
        lastAnalyzedAt: analysisCompleteTime,
        analysisCompletedAt: analysisCompleteTime,
        analysisDurationMs:
          analysisCompleteTime.getTime() - analysisStartTime.getTime(),
        evidenceCount: evidenceItems.length,
        gptEnhanced: Boolean(gptEnhancedData?.success),
        analysisMethod: gptEnhancedData?.success
          ? 'gpt_4o_enhanced'
          : 'evidence_only',
        gptAnalysisData: gptEnhancedData?.success
          ? {
              searchPerformed: true,
              sourcesUsed: gptEnhancedData.searchData.metadata.sources,
              resultsCount: gptEnhancedData.searchData.metadata.totalResults,
              crawledCount: gptEnhancedData.searchData.metadata.crawledCount,
            }
          : undefined,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        isActivated: false,
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true }
  ).exec();

  await BrandWorkspace.findByIdAndUpdate(workspaceId, {
    lastActiveAt: new Date(),
    updatedAt: new Date(),
  }).exec();

  logSystemMessage('✅ GPT-powered Brand Brain created successfully!');

  console.log('[ANALYZE] ✅ Evidence-based GPT-enhanced analysis completed');

  return NextResponse.json<AnalysisSuccessResponse>({
    success: true,
    data: normalized,
  });
}

// ---- Helpers ----

function logSystemMessage(content: string): void {
  console.log(`[SYSTEM MESSAGE]: ${content}`);
}

function buildEnhancedEvidenceText(
  evidenceItems: EvidenceDoc[],
  gptData: GPTAnalysisResult | null
): string {
  let text = 'USER-PROVIDED EVIDENCE:\n';
  text += '=======================\n\n';

  evidenceItems.forEach((item, index) => {
    text += `[${item.type.toUpperCase()}] ${index + 1}:\n`;
    text += `${item.analysisSummary || item.analyzedContent || item.value}\n\n`;
  });

  if (gptData?.success) {
    const { searchData } = gptData;
    text += '\nGPT-ENHANCED INTERNET RESEARCH:\n';
    text += '===============================\n\n';
    text += `Search Results: ${searchData.searchResults.length} sources found\n`;
    text += `Crawled Pages: ${searchData.crawledPages.length} pages analyzed\n`;
    text += `Industry: ${searchData.insights.industry ?? 'Not specified'}\n`;
    text += `Competitors Identified: ${
      searchData.insights.competitors?.length ?? 0
    }\n\n`;
    text += 'Key Findings:\n';
    text += `${
      searchData.insights.companyInfo ?? 'No additional company info found'
    }\n`;

    if (searchData.insights.publicPresence) {
      text += `\nPublic Presence: ${searchData.insights.publicPresence}\n`;
    }

    if (searchData.crawledPages.length > 0) {
      text += '\nWebsite Content Excerpts:\n';
      searchData.crawledPages.slice(0, 3).forEach((page, index) => {
        const title = page.title ?? 'Untitled page';
        const snippet = page.content.substring(0, 150);
        text += `${index + 1}. ${title}: ${snippet}...\n`;
      });
    }
  }

  return text;
}

function enhanceAnalysisWithUserEvidence(
  gptAnalysis: BrandBrainAnalysis,
  _evidenceItems: EvidenceDoc[]
): BrandBrainAnalysis {
  // Hook for more advanced merging later
  return gptAnalysis;
}

function createFallbackEvidenceOnlyAnalysis(
  brandName: string,
  evidenceText: string
): BrandBrainAnalysis {
  return {
    summary: `Analysis of ${brandName} based on provided evidence. Key themes:\n${evidenceText.substring(
      0,
      400
    )}...`,
    audience:
      'Target audience inferred from the combination of user-provided URLs, descriptions, and social evidence.',
    tone: 'Professional, brand-aligned communication style inferred from content.',
    pillars: [
      'Brand Strategy',
      'Content Development',
      'Audience Engagement',
      'Market Positioning',
    ],
    offers:
      'Value proposition synthesized from evidence, focusing on core benefits, differentiation, and customer outcomes.',
    competitors: ['Industry competitors inferred from context'],
    channels: ['Website', 'Social Media', 'Email', 'Content Marketing'],
    recommendations: [
      'Refine brand positioning statements based on evidence.',
      'Develop detailed audience personas.',
      'Define a content calendar aligned to the strongest brand pillars.',
      'Monitor competitor messaging and update Brand Brain over time.',
    ],
  };
}

function createFallbackAnalysisFromGPT(
  brandName: string,
  gptData: GPTSearchData
): BrandBrainAnalysis {
  return {
    summary: `Analysis of ${brandName} based on GPT-powered internet research. ${
      gptData.insights.companyInfo ?? 'Public information gathered from web sources.'
    }`,
    audience:
      gptData.insights.audienceSignals?.join(', ') ??
      'Target audience inferred from market positioning and public presence.',
    tone:
      gptData.insights.toneSignals?.join(', ') ??
      'Professional brand communication.',
    pillars: [
      'Digital Brand Strategy',
      'Content & Messaging',
      'Audience Development',
      'Competitive Positioning',
    ],
    offers:
      'Value proposition based on market research and competitive context, focusing on differentiation and customer value.',
    competitors:
      gptData.insights.competitors ?? ['Industry competitors identified via research'],
    channels: [
      'Digital Presence (Website, SEO)',
      'Social Media Platforms',
      'Content Marketing',
      'Email Communications',
      'Public Relations',
    ],
    recommendations: [
      'Validate findings with direct customer research.',
      'Develop comprehensive brand guidelines.',
      'Create audience-specific content strategies.',
      'Monitor competitor activities and adjust positioning.',
      'Establish clear brand performance metrics.',
    ],
  };
}

function normalizeAnalysis(analysis: BrandBrainAnalysis): BrandBrainAnalysis {
  return {
    summary:
      analysis.summary ||
      'Brand summary will be refined based on future insights.',
    audience:
      analysis.audience ||
      'Target audience definition will be refined as more data is collected.',
    tone:
      analysis.tone || 'Brand tone is professional and consistent across channels.',
    pillars:
      analysis.pillars && analysis.pillars.length > 0
        ? analysis.pillars
        : ['Brand Strategy', 'Audience Engagement', 'Content Excellence'],
    offers:
      analysis.offers ||
      'Core offers and value propositions will be detailed based on ongoing strategy.',
    competitors:
      analysis.competitors && analysis.competitors.length > 0
        ? analysis.competitors
        : ['Key competitors in the same category'],
    channels:
      analysis.channels && analysis.channels.length > 0
        ? analysis.channels
        : ['Website', 'Social Media', 'Email', 'Content'],
    recommendations:
      analysis.recommendations && analysis.recommendations.length > 0
        ? analysis.recommendations
        : [
            'Refine your brand’s strategic narrative.',
            'Clarify your ideal customer profile.',
            'Align content pillars with business objectives.',
          ],
  };
}
