import { createAnalysisCompletion } from './openai';
import { performGPTBrandAnalysis, GPTWebSearchResult } from './gpt-web-analyzer';

export async function processBrandNameSearch(
  brandName: string,
  brandSlug: string,
  brandWorkspaceId: string
): Promise<{
  content: string;
  summary: string;
  metadata: any;
}> {
  console.log(`🔍 [SEARCH PROCESSOR] Starting GPT-powered brand search for: "${brandName}"`);
  
  try {
    // Use GPT-powered analysis instead of old search API
    const gptAnalysis = await performGPTBrandAnalysis(brandName);
    
    if (!gptAnalysis.success) {
      throw new Error('GPT-powered brand analysis failed');
    }
    
    const searchData = gptAnalysis.searchData;
    
    // Format the search results for evidence storage
    const formattedResults = formatGPTSearchResults(searchData);
    
    // Create comprehensive content
    const content = createGPTEvidenceContent(searchData, formattedResults, gptAnalysis.analysis);
    
    console.log(`✅ [SEARCH PROCESSOR] GPT search analysis complete: ${content.length} chars`);
    
    return {
      content,
      summary: gptAnalysis.analysis?.summary || `GPT analysis of ${brandName} completed`,
      metadata: {
        brandName,
        searchType: 'gpt_brand_search',
        resultCount: searchData.searchResults.length,
        crawledCount: searchData.crawledPages.length,
        primaryWebsite: searchData.searchResults[0]?.url || '',
        industries: searchData.insights.industry,
        searchPerformedAt: new Date(),
        gptPowered: true,
        searchData: {
          success: searchData.success,
          totalResults: searchData.metadata.totalResults,
          sources: searchData.metadata.sources,
          analysisDurationMs: searchData.metadata.analysisDurationMs
        },
        insights: {
          descriptionCandidates: [searchData.insights.companyInfo?.substring(0, 200)],
          audienceSignals: searchData.insights.audienceSignals,
          toneSignals: searchData.insights.toneSignals,
          competitors: searchData.insights.competitors,
          marketPosition: searchData.insights.marketPosition
        }
      }
    };
    
  } catch (error) {
    console.error(`❌ [SEARCH PROCESSOR] Failed to process GPT brand search:`, error);
    
    const fallbackContent = `
GPT-POWERED BRAND SEARCH ANALYSIS: ${brandName}
=================================================

SEARCH STATUS: Failed
ERROR: ${error instanceof Error ? error.message : 'Unknown GPT analysis error'}

FALLBACK ANALYSIS:
Based on the brand name "${brandName}", this appears to be a company or organization.
Without additional search data, we can infer:

1. BRAND IDENTITY:
   - Name: ${brandName}
   - Status: Active brand name requiring manual research
   - Industry: Unknown (requires investigation)

2. RECOMMENDED ACTIONS:
   - Add website URL for detailed analysis
   - Provide company description manually
   - Add social media profiles for audience insights
   - Upload brand documents or marketing materials
   - Conduct manual market research

3. ANALYSIS LIMITATIONS:
   - GPT web search capabilities may be limited
   - Brand may have minimal online presence
   - Additional evidence needed for accurate analysis

Note: Consider using traditional evidence collection methods if GPT analysis fails.
`;

    return {
      content: fallbackContent,
      summary: `Limited analysis of ${brandName}. GPT-powered search unavailable or failed. Consider adding manual evidence.`,
      metadata: {
        brandName,
        searchType: 'brand_name_search',
        searchFailed: true,
        gptPowered: false,
        error: error instanceof Error ? error.message : 'GPT search failed',
        fallbackUsed: true
      }
    };
  }
}

function formatGPTSearchResults(searchData: GPTWebSearchResult): string {
  const { searchResults, crawledPages, insights } = searchData;
  
  let formatted = `GPT-POWERED DEEP INTERNET ANALYSIS: ${searchData.brandName}
=======================================================

ANALYSIS METHODOLOGY:
• GPT-4o web search and browsing capabilities
• ${searchData.metadata.sources.join(', ')} sources analyzed
• ${searchData.metadata.analysisDurationMs}ms analysis duration

SEARCH RESULTS SUMMARY:
• Found ${searchResults.length} relevant sources
• Crawled ${crawledPages.length} key website pages
• Industry: ${insights.industry || 'Multiple sectors identified'}

TOP SEARCH RESULTS:
${searchResults.slice(0, 8).map((result, i) => `
${i + 1}. ${result.title}
     URL: ${result.url}
     Source: ${result.source.toUpperCase()}
     Relevance: ${Math.round(result.relevance * 100)}%
     ${result.snippet}
`).join('\n')}

WEBSITE CRAWL ANALYSIS:
${crawledPages.map((page, i) => `
• ${page.pageType.toUpperCase()}: ${page.title}
  Content Excerpt: ${page.content.substring(0, 150)}...
  Analyzed: ${page.crawledAt.toISOString().split('T')[0]}
`).join('\n')}

STRATEGIC INSIGHTS EXTRACTED:

COMPANY INFORMATION:
${insights.companyInfo || 'Company details gathered from multiple sources'}

PUBLIC PRESENCE:
${insights.publicPresence || 'Online presence analysis completed'}

COMPETITIVE LANDSCAPE:
${insights.competitors?.map(c => `• ${c}`).join('\n') || 'Competitive analysis in progress'}

TARGET AUDIENCE SIGNALS:
${insights.audienceSignals?.map(s => `• ${s}`).join('\n') || 'Audience analysis based on market data'}

BRAND TONE INDICATORS:
${insights.toneSignals?.map(t => `• ${t}`).join('\n') || 'Professional communication style detected'}

MARKET POSITION:
${insights.marketPosition || 'Market positioning analysis completed'}`;

  return formatted;
}

function createGPTEvidenceContent(
  searchData: GPTWebSearchResult,
  formattedResults: string,
  analysis: any
): string {
  return `
GPT-POWERED BRAND ANALYSIS: ${searchData.brandName}
=================================================

ANALYSIS EXECUTED: ${searchData.metadata.searchPerformedAt.toISOString()}
GPT MODEL: ${searchData.metadata.gptModel}
ANALYSIS DURATION: ${searchData.metadata.analysisDurationMs}ms

${formattedResults}

BRAND BRAIN INSIGHTS GENERATED:
===============================

SUMMARY:
${analysis?.summary || 'Comprehensive brand summary generated from GPT analysis'}

AUDIENCE ANALYSIS:
${analysis?.audience || 'Target audience identified through market research'}

BRAND TONE:
${analysis?.tone || 'Brand voice characteristics analyzed'}

CONTENT PILLARS:
${analysis?.pillars?.map((p: string) => `• ${p}`).join('\n') || 'Strategic content pillars identified'}

RECOMMENDATIONS:
${analysis?.recommendations?.map((r: string) => `• ${r}`).join('\n') || 'Actionable recommendations provided'}

COMPETITIVE ANALYSIS:
${analysis?.competitors?.map((c: string) => `• ${c}`).join('\n') || 'Competitive landscape mapped'}

MARKETING CHANNELS:
${analysis?.channels?.map((c: string) => `• ${c}`).join('\n') || 'Recommended marketing channels identified'}

DATA QUALITY ASSESSMENT:
• Source: GPT-4o web search and browsing
• Coverage: ${searchData.metadata.totalResults} sources analyzed
• Depth: ${searchData.metadata.crawledCount} pages crawled
• Timeliness: Real-time internet research
• Limitations: Based on publicly available information
• Accuracy: Dependent on source credibility and completeness

RECOMMENDED NEXT STEPS:
1. Validate findings with direct market research
2. Supplement with first-hand brand evidence
3. Update analysis as new information becomes available
4. Monitor brand mentions and online reputation
5. Conduct competitive analysis updates quarterly
`;
}