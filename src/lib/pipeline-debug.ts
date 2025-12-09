// /lib/debug/pipeline-debug.ts
import { Evidence } from '@/models/Evidence';
import { BrandBrain } from '@/models/BrandBrain';
import { connectToDatabase } from '@/db/db-optimized';

export async function debugEvidencePipeline(slug: string) {
  try {
    await connectToDatabase();
    
    console.log('🔍 === EVIDENCE PIPELINE DEBUG START ===');
    console.log(`Brand Slug: ${slug}`);
    
    // 1. Check all evidence for this brand
    const allEvidence = await Evidence.find({ brandSlug: slug }).lean();
    console.log(`Total evidence items: ${allEvidence.length}`);
    
    // 2. Analyze each evidence item
    const evidenceAnalysis = allEvidence.map((item, index) => {
      const hasAnalyzedContent = !!item.analyzedContent;
      const analyzedLength = item.analyzedContent?.length || 0;
      const isWebsite = item.type === 'website';
      const hasCrawlData = isWebsite && item.analyzedContent?.includes('WEBSITE CRAWL RESULTS');
      
      return {
        index: index + 1,
        type: item.type,
        value: item.value.substring(0, 50),
        status: item.status,
        hasAnalyzedContent,
        analyzedLength,
        isWebsite,
        hasCrawlData,
        preview: hasAnalyzedContent ? item.analyzedContent?.substring(0, 100) : 'NO CONTENT'
      };
    });
    
    console.log('Evidence Analysis:', evidenceAnalysis);
    
    // 3. Check BrandBrain status
    const brandBrain = await BrandBrain.findOne({ brandSlug: slug }).lean();
    console.log('BrandBrain Status:', {
      exists: !!brandBrain,
      status: brandBrain?.status,
      hasContent: {
        summary: brandBrain?.summary?.length > 0,
        audience: brandBrain?.audience?.length > 0,
        tone: brandBrain?.tone?.length > 0,
        pillars: brandBrain?.pillars?.length > 0,
        offers: brandBrain?.offers?.length > 0,
      }
    });
    
    // 4. Check for processing errors
    const failedEvidence = allEvidence.filter(e => 
      e.analyzedContent?.includes('Crawl failed') || 
      e.analyzedContent?.includes('Processing failed')
    );
    
    if (failedEvidence.length > 0) {
      console.warn('⚠️ Failed evidence items:', failedEvidence.length);
      failedEvidence.forEach((item, i) => {
        console.warn(`  ${i + 1}. ${item.type}: ${item.value.substring(0, 50)}`);
        console.warn(`     Error: ${item.analyzedContent?.substring(0, 150)}`);
      });
    }
    
    // 5. Summarize pipeline health
    const websiteEvidence = allEvidence.filter(e => e.type === 'website');
    const crawledWebsites = websiteEvidence.filter(e => 
      e.analyzedContent?.includes('WEBSITE CRAWL RESULTS')
    );
    
    console.log('📊 PIPELINE HEALTH SUMMARY:');
    console.log(`   Total Evidence: ${allEvidence.length}`);
    console.log(`   Website Evidence: ${websiteEvidence.length}`);
    console.log(`   Successfully Crawled: ${crawledWebsites.length}`);
    console.log(`   Failed Crawls: ${failedEvidence.length}`);
    console.log(`   Evidence with Analysis: ${allEvidence.filter(e => e.analyzedContent).length}`);
    
    console.log('🔍 === EVIDENCE PIPELINE DEBUG END ===');
    
    return {
      totalEvidence: allEvidence.length,
      websiteEvidence: websiteEvidence.length,
      crawledWebsites: crawledWebsites.length,
      failedEvidence: failedEvidence.length,
      brandBrainExists: !!brandBrain,
      brandBrainHasContent: brandBrain?.summary?.length > 0,
      evidenceAnalysis
    };
    
  } catch (error) {
    console.error('Pipeline debug error:', error);
    throw error;
  }
}