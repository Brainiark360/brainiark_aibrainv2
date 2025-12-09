// /lib/search/search-engine.ts - BROWSER COMPATIBLE VERSION
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: 'google' | 'duckduckgo' | 'bing' | 'wikipedia' | 'social';
  relevance: number;
  freshness?: Date;
}

export interface BrandSearchContext {
  brandName: string;
  primaryWebsite?: string;
  descriptionCandidates: string[];
  industryCandidates: string[];
  audienceSignals: string[];
  toneSignals: string[];
  rawResults: SearchResult[];
  socialProfiles: {
    platform: string;
    handle?: string;
    url?: string;
    description?: string;
  }[];
  foundAt: Date;
}

class SearchEngine {
  private static instance: SearchEngine;
  
  private constructor() {}
  
  public static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine();
    }
    return SearchEngine.instance;
  }
  
  async searchBrand(brandName: string): Promise<BrandSearchContext> {
    console.log(`🔍 [SEARCH ENGINE] Starting deep search for: "${brandName}"`);
    
    try {
      // In a browser environment, we'll make API calls to server-side endpoints
      // This prevents CORS issues and allows us to use server-side search APIs
      const response = await fetch('/api/search/brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brandName }),
      });
      
      if (!response.ok) {
        throw new Error(`Search API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }
      
      console.log(`✅ [SEARCH ENGINE] Search completed via API`);
      
      return data.data;
      
    } catch (error) {
      console.error(`❌ [SEARCH ENGINE] Search failed:`, error);
      
      // Return fallback context
      return {
        brandName,
        descriptionCandidates: [`${brandName} appears to be a brand or company.`],
        industryCandidates: ['Unknown industry. Further research needed.'],
        audienceSignals: ['General audience. Specific demographics unknown.'],
        toneSignals: ['Professional brand tone.'],
        rawResults: [],
        socialProfiles: [],
        foundAt: new Date(),
      };
    }
  }
}

export default SearchEngine;