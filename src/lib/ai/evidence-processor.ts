// /lib/backend/evidence-processor.ts - COMPLETE FIXED VERSION
import { Evidence } from '@/models/Evidence';
import { createAnalysisCompletion } from './openai';
import { crawlWebsite, WebsiteData } from './web-crawler';
import { crawlJavaScriptSite, detectJavaScriptSite } from './js-crawler';
import { processBrandNameSearch } from './search-processor';

export async function processEvidence(
  evidenceId: string,
  type: string,
  value: string,
  brandSlug: string,
  brandWorkspaceId: string
) {
  console.log(`🔄 [EVIDENCE PROCESSOR] Starting processing for ${type}: ${evidenceId}`);
  console.log(`   Value: ${value.substring(0, 100)}...`);
  
  try {
    // Update status to processing
    await Evidence.findByIdAndUpdate(evidenceId, {
      status: 'processing',
      processingStartedAt: new Date(),
    });

    let analyzedContent = '';
    let analysisSummary = '';
    let metadata: any = {};

    // Process based on type
    console.log(`[EVIDENCE PROCESSOR] Processing type: ${type}`);
    
    switch (type) {
      case 'website':
        console.log(`[EVIDENCE PROCESSOR] Starting website analysis for: ${value}`);
        const websiteAnalysis = await analyzeWebsiteEnhanced(value);
        analyzedContent = websiteAnalysis.content;
        analysisSummary = websiteAnalysis.summary;
        metadata = websiteAnalysis.metadata;
        console.log(`[EVIDENCE PROCESSOR] Website analysis complete. Content: ${analyzedContent.length} chars, Summary: ${analysisSummary.length} chars`);
        break;
        
      case 'document':
        console.log(`[EVIDENCE PROCESSOR] Starting document analysis (${value.length} chars)`);
        const docAnalysis = await analyzeDocument(value);
        analyzedContent = docAnalysis.content;
        analysisSummary = docAnalysis.summary;
        console.log(`[EVIDENCE PROCESSOR] Document analysis complete. Summary: ${analysisSummary.length} chars`);
        break;
        
      case 'social':
        console.log(`[EVIDENCE PROCESSOR] Starting social analysis (${value.length} chars)`);
        const socialAnalysis = await analyzeSocial(value);
        analyzedContent = socialAnalysis.content;
        analysisSummary = socialAnalysis.summary;
        console.log(`[EVIDENCE PROCESSOR] Social analysis complete. Summary: ${analysisSummary.length} chars`);
        break;
        
      case 'manual':
        console.log(`[EVIDENCE PROCESSOR] Starting manual input analysis (${value.length} chars)`);
        const manualAnalysis = await analyzeManualInput(value);
        analyzedContent = manualAnalysis.content;
        analysisSummary = manualAnalysis.summary;
        console.log(`[EVIDENCE PROCESSOR] Manual analysis complete. Summary: ${analysisSummary.length} chars`);
        break;
        
      case 'brand_name_search':
        console.log(`[EVIDENCE PROCESSOR] Starting brand name search analysis for: "${value}"`);
        const searchAnalysis = await processBrandNameSearch(value, brandSlug, brandWorkspaceId);
        analyzedContent = searchAnalysis.content;
        analysisSummary = searchAnalysis.summary;
        metadata = searchAnalysis.metadata;
        console.log(`[EVIDENCE PROCESSOR] Brand name search complete. Content: ${analyzedContent.length} chars, Results: ${metadata.resultCount || 0}`);
        break;
        
      default:
        analyzedContent = value;
        analysisSummary = `Unprocessed ${type} content`;
        console.log(`[EVIDENCE PROCESSOR] Using default processing for type: ${type}`);
    }

    // Validate we have content
    if (!analyzedContent || analyzedContent.length < 10) {
      console.warn(`⚠️ [EVIDENCE PROCESSOR] Minimal content generated, using fallback`);
      analyzedContent = `Original value: ${value.substring(0, 500)}`;
      analysisSummary = `Analysis generated minimal content for ${type}`;
    }

    // Update with analyzed content
    await Evidence.findByIdAndUpdate(evidenceId, {
      analyzedContent,
      analysisSummary,
      metadata,
      status: 'complete',
      processingCompletedAt: new Date(),
      analyzedAt: new Date(),
    });

    console.log(`✅ [EVIDENCE PROCESSOR] Successfully processed evidence ${evidenceId} (${type})`);
    console.log(`   - Analyzed content: ${analyzedContent.length} chars`);
    console.log(`   - Analysis summary: ${analysisSummary.length} chars`);
    console.log(`   - Has metadata: ${Object.keys(metadata).length > 0}`);

  } catch (error) {
    console.error(`❌ [EVIDENCE PROCESSOR] Error processing evidence ${evidenceId}:`, error);
    
    // Mark as complete with error information
    await Evidence.findByIdAndUpdate(evidenceId, {
      status: 'failed',
      analyzedContent: `Error: ${error instanceof Error ? error.message : 'Processing failed'}\nOriginal value: ${value.substring(0, 500)}`,
      analysisError: error instanceof Error ? error.message : 'Processing failed',
      processingCompletedAt: new Date(),
      processedWithError: true,
    });
  }
}
// ENHANCED website analysis with JavaScript site support
async function analyzeWebsiteEnhanced(url: string): Promise<{
  content: string;
  summary: string;
  metadata: any;
}> {
  console.log(`🌐 [WEBSITE ANALYZER] Starting ENHANCED analysis for: ${url}`);
  
  try {
    // First, try standard crawl
    console.log(`🔍 [WEBSITE ANALYZER] Attempting standard crawl...`);
    let websiteData: WebsiteData;
    
    try {
      websiteData = await crawlWebsite(url);
      console.log(`✅ [WEBSITE ANALYZER] Standard crawl completed`);
    } catch (crawlError) {
      console.warn(`⚠️ [WEBSITE ANALYZER] Standard crawl failed:`, crawlError instanceof Error ? crawlError.message : 'Unknown error');
      
      // Create minimal website data
      websiteData = {
        url,
        title: '',
        metaDescription: '',
        metaKeywords: [],
        headings: { h1: [], h2: [], h3: [] },
        bodyContent: 'Crawl failed',
        links: [],
        images: [],
        scripts: [],
        styles: [],
        socialMeta: {},
        structuredData: [],
        loadTime: 0,
        statusCode: 500,
        wordCount: 0,
        readingLevel: 'Unknown',
        error: crawlError instanceof Error ? crawlError.message : 'Crawl failed',
      };
    }
    
    // Check if this is likely a JavaScript site
    let isJavaScriptSite = websiteData.isJavaScriptSite || false;
    let jsCrawlResult = null;
    
    if (websiteData.wordCount < 50 || websiteData.error) {
      console.log(`🔄 [WEBSITE ANALYZER] Minimal content, trying JavaScript-specific crawler...`);
      
      try {
        jsCrawlResult = await crawlJavaScriptSite(url);
        
        if (jsCrawlResult.success) {
          console.log(`✅ [WEBSITE ANALYZER] JavaScript crawler successful`);
          isJavaScriptSite = true;
          
          // Enhance website data with JS crawler results
          if (jsCrawlResult.title && !websiteData.title) {
            websiteData.title = jsCrawlResult.title;
          }
          if (jsCrawlResult.description && !websiteData.metaDescription) {
            websiteData.metaDescription = jsCrawlResult.description;
          }
          if (jsCrawlResult.text) {
            websiteData.bodyContent = jsCrawlResult.text.substring(0, 5000);
            websiteData.wordCount = countWords(jsCrawlResult.text);
          }
        }
      } catch (jsError) {
        console.warn(`⚠️ [WEBSITE ANALYZER] JavaScript crawler also failed:`, jsError instanceof Error ? jsError.message : 'Unknown error');
      }
    }
    
    // Prepare content for analysis
    let structuredContent = '';
    
    if (isJavaScriptSite && jsCrawlResult?.success) {
      // Use JavaScript crawler results
      structuredContent = `
JAVASCRIPT WEBSITE DETECTED: ${url}
=====================================

NOTE: This is a modern JavaScript-rendered website (React/Vue/Angular/SPA).
Content extraction is limited as the site requires browser execution.

EXTRACTED INFORMATION:
======================
Title: ${jsCrawlResult.title || 'Not available'}
Description: ${jsCrawlResult.description || 'Not available'}

EXTRACTED TEXT:
===============
${jsCrawlResult.text || 'No text content could be extracted.'}

METADATA:
=========
Keywords: ${jsCrawlResult.keywords?.join(', ') || 'None'}
Headings Found: ${jsCrawlResult.headings ? 
  `H1: ${jsCrawlResult.headings.h1.length}, H2: ${jsCrawlResult.headings.h2.length}, H3: ${jsCrawlResult.headings.h3.length}` : 
  'None'}
`.trim();
    } else {
      // Use standard crawl results
      structuredContent = `
WEBSITE ANALYSIS: ${url}
================================

BASIC INFO:
- URL: ${websiteData.url}
- Title: ${websiteData.title || 'Not available'}
- Meta Description: ${websiteData.metaDescription || 'Not available'}
- Status Code: ${websiteData.statusCode}
- Load Time: ${websiteData.loadTime}ms
- Word Count: ${websiteData.wordCount}
- Reading Level: ${websiteData.readingLevel}
- JavaScript Site: ${isJavaScriptSite ? 'Yes' : 'No'}

HEADINGS:
=========
# H1: ${websiteData.headings.h1.join(' | ') || 'None'}
## H2: ${websiteData.headings.h2.slice(0, 5).join(' | ') || 'None'}
### H3: ${websiteData.headings.h3.slice(0, 3).join(' | ') || 'None'}

CONTENT EXTRACT:
================
${websiteData.bodyContent.substring(0, 4000)}${websiteData.bodyContent.length > 4000 ? '...' : ''}

SOCIAL METADATA:
================
OG Title: ${websiteData.socialMeta.ogTitle || 'N/A'}
OG Description: ${websiteData.socialMeta.ogDescription || 'N/A'}

TECHNICAL INFO:
===============
Internal Links: ${websiteData.links.filter(l => l.internal).length}
External Links: ${websiteData.links.filter(l => !l.internal).length}
Images: ${websiteData.images.length}
Scripts: ${websiteData.scripts.length}
Structured Data: ${websiteData.structuredData.length > 0 ? 'Yes' : 'No'}
`.trim();
    }
    
    // AI Analysis
    console.log(`🤖 [WEBSITE ANALYZER] Calling AI for analysis...`);
    
    const aiPrompt = `Analyze this website content for brand insights:

${structuredContent}

IMPORTANT: If this is marked as a JavaScript website, the content may be limited.
Do your best with whatever information is available.

Provide insights about:

1. BRAND IDENTITY:
   - What is the likely brand name and industry?
   - What values or mission can be inferred?
   - What is the professional tone?

2. TARGET AUDIENCE:
   - Who is this website targeting?
   - What demographic clues exist?
   - What pain points might they address?

3. PRODUCT/SERVICE:
   - What is likely being offered?
   - What features or benefits are suggested?
   - What pricing level is indicated?

4. MARKET POSITION:
   - Where does this brand likely sit in the market?
   - What competitive advantages are suggested?
   - What unique selling points exist?

Be specific based on the available evidence. If information is limited, make reasonable inferences and note the limitations.`;

    const aiResponse = await createAnalysisCompletion(
      'You are a senior brand strategist skilled at extracting insights from both complete and partial website data.',
      aiPrompt
    );

    console.log(`✅ [WEBSITE ANALYZER] AI analysis complete: ${aiResponse.length} chars`);

    // Prepare metadata
    const metadata: any = {
      url,
      title: websiteData.title || jsCrawlResult?.title,
      description: websiteData.metaDescription || jsCrawlResult?.description,
      statusCode: websiteData.statusCode,
      wordCount: websiteData.wordCount,
      crawled: true,
      contentAvailable: websiteData.wordCount > 0 || (jsCrawlResult?.text?.length || 0) > 0,
      isJavaScriptSite,
      crawledAt: new Date(),
    };
    
    if (jsCrawlResult?.success) {
      metadata.jsCrawlUsed = true;
      metadata.jsCrawlTextLength = jsCrawlResult.text?.length || 0;
    }

    return {
      content: structuredContent,
      summary: aiResponse || `Analysis of ${url}`,
      metadata,
    };

  } catch (error) {
    console.error(`❌ [WEBSITE ANALYZER] Enhanced analysis error for ${url}:`, error);
    
    // Ultimate fallback
    const fallbackContent = `
WEBSITE ANALYSIS FAILED: ${url}
================================

Error: ${error instanceof Error ? error.message : 'Unknown error'}

This website could not be analyzed due to:
1. JavaScript rendering requirements (React/Vue/Angular/SPA)
2. Security restrictions or bot blocking
3. Network or technical issues

RECOMMENDATION:
- Try adding the brand manually using the "Description" option
- Or provide social media profiles/documents instead
`.trim();
    
    const fallbackSummary = `Unable to analyze ${url}. This is likely a modern JavaScript website that cannot be crawled with available methods. Consider adding brand information manually.`;
    
    return {
      content: fallbackContent,
      summary: fallbackSummary,
      metadata: {
        url,
        crawled: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
        isJavaScriptSite: true,
        fallbackAnalysis: true,
      }
    };
  }
}

// Helper function
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Keep the other analysis functions as they were
async function analyzeDocument(content: string): Promise<{
  content: string;
  summary: string;
}> {
  try {
    console.log(`📄 [DOCUMENT ANALYZER] Starting analysis (${content.length} chars)`);
    
    const prompt = `Analyze this document content for brand insights:
    
    ${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}
    
    Extract:
    1. BRAND MISSION AND VALUES
    2. TARGET MARKET INFORMATION
    3. COMPETITIVE POSITIONING
    4. STRATEGIC GOALS
    5. KEY MESSAGING POINTS
    6. TONE AND STYLE INDICATORS
    7. PRODUCT/SERVICE DETAILS
    
    Be specific and reference quotes when possible.`;
    
    const response = await createAnalysisCompletion(
      'You are a document analysis expert. Extract structured brand insights from documents.',
      prompt
    );
    
    console.log(`✅ [DOCUMENT ANALYZER] Analysis complete: ${response.length} chars`);
    
    return {
      content: content.substring(0, 8000),
      summary: response || `Document content: ${content.substring(0, 200)}...`,
    };
    
  } catch (error) {
    console.error('Document analysis error:', error);
    return {
      content: content.substring(0, 5000),
      summary: `Document analysis incomplete. Original content: ${content.substring(0, 300)}...`,
    };
  }
}

async function analyzeSocial(content: string): Promise<{
  content: string;
  summary: string;
}> {
  try {
    console.log(`💬 [SOCIAL ANALYZER] Starting analysis (${content.length} chars)`);
    
    const prompt = `Analyze this social media content for brand insights:
    
    ${content}
    
    Identify:
    1. ENGAGEMENT STYLE
    2. AUDIENCE INTERACTION
    3. CONTENT THEMES
    4. BRAND PERSONALITY
    5. TARGET AUDIENCE
    6. VALUE PROPOSITION
    7. CALL-TO-ACTION PATTERNS`;
    
    const response = await createAnalysisCompletion(
      'You are a social media analysis expert. Extract brand insights from social content.',
      prompt
    );
    
    console.log(`✅ [SOCIAL ANALYZER] Analysis complete: ${response.length} chars`);
    
    return {
      content,
      summary: response || `Social content analysis`,
    };
    
  } catch (error) {
    console.error('Social analysis error:', error);
    return {
      content,
      summary: `Social content: ${content.substring(0, 200)}...`,
    };
  }
}

async function analyzeManualInput(content: string): Promise<{
  content: string;
  summary: string;
}> {
  try {
    console.log(`✍️ [MANUAL ANALYZER] Starting analysis (${content.length} chars)`);
    
    const prompt = `Structure and analyze this brand information:
    
    ${content}
    
    Organize into clear, actionable insights:
    1. BRAND IDENTITY
    2. TARGET AUDIENCE
    3. VALUE PROPOSITION
    4. KEY MESSAGING
    5. TONE AND VOICE
    6. PRODUCT/SERVICE
    7. MARKET POSITION`;
    
    const response = await createAnalysisCompletion(
      'You are a brand strategy expert. Structure brand information into actionable insights.',
      prompt
    );
    
    console.log(`✅ [MANUAL ANALYZER] Analysis complete: ${response.length} chars`);
    
    return {
      content,
      summary: response || content,
    };
    
  } catch (error) {
    console.error('Manual input analysis error:', error);
    return {
      content,
      summary: content,
    };
  }
}