// /lib/backend/evidence-monitor.ts
import { Evidence } from '@/models/Evidence';

export async function monitorEvidencePipeline(slug: string) {
  try {
    const evidenceItems = await Evidence.find({ 
      brandSlug: slug,
      type: 'website'
    }).lean();
    
    const pipelineStatus = {
      totalWebsites: evidenceItems.length,
      crawled: evidenceItems.filter(e => 
        e.analyzedContent && 
        e.analyzedContent.includes('WEBSITE CRAWL RESULTS')
      ).length,
      failed: evidenceItems.filter(e => 
        e.analyzedContent && 
        e.analyzedContent.includes('Crawl failed')
      ).length,
      pending: evidenceItems.filter(e => 
        e.status !== 'complete' || 
        !e.analyzedContent
      ).length,
      details: evidenceItems.map(e => ({
        id: e._id.toString(),
        url: e.value.substring(0, 50),
        status: e.status,
        hasCrawl: e.analyzedContent?.includes('WEBSITE CRAWL RESULTS') || false,
        contentLength: e.analyzedContent?.length || 0,
        analyzedAt: e.analyzedAt || 'Not analyzed'
      }))
    };
    
    console.log('🔍 Evidence Pipeline Status:', pipelineStatus);
    return pipelineStatus;
  } catch (error) {
    console.error('Monitoring failed:', error);
    return { error: 'Monitoring failed' };
  }
}