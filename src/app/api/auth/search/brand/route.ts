// /app/api/search/brand/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { brandName } = await request.json();
    
    if (!brandName) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 [SEARCH API] Searching for brand: "${brandName}"`);
    
    // Perform searches (server-side only)
    const searchResults = await performServerSideSearch(brandName);
    
    return NextResponse.json({
      success: true,
      data: searchResults,
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Search failed' 
      },
      { status: 500 }
    );
  }
}

async function performServerSideSearch(brandName: string) {
  // This runs on the server, so we can use Node.js modules
  const results: any[] = [];
  
  try {
    // Search DuckDuckGo
    const ddgResult = await searchDuckDuckGo(brandName);
    if (ddgResult) results.push(ddgResult);
    
    // Search Wikipedia
    const wikiResult = await searchWikipedia(brandName);
    if (wikiResult) results.push(wikiResult);
    
  } catch (error) {
    console.error('Server-side search error:', error);
  }
  
  // Extract social profiles
  const socialProfiles = extractSocialProfiles(brandName);
  
  // Analyze results
  const allText = results.map(r => `${r.title}. ${r.snippet}`).join('\n\n');
  
  return {
    brandName,
    descriptionCandidates: results.slice(0, 3).map(r => r.snippet).filter(Boolean),
    industryCandidates: extractIndustryKeywords(allText),
    audienceSignals: extractAudienceSignals(allText),
    toneSignals: extractToneSignals(allText),
    rawResults: results,
    socialProfiles,
    foundAt: new Date(),
  };
}

async function searchDuckDuckGo(brandName: string) {
  try {
    const searchQuery = encodeURIComponent(`${brandName} about company`);
    const url = `https://api.duckduckgo.com/?q=${searchQuery}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'BrainiarkOS-Brand-Search/1.0',
      },
    });
    
    if (response.data.Abstract) {
      return {
        title: response.data.Heading || brandName,
        url: response.data.AbstractURL || '',
        snippet: response.data.Abstract,
        source: 'duckduckgo' as const,
        relevance: 0.9,
      };
    }
    
    return null;
  } catch (error) {
    console.warn('DuckDuckGo search failed:', error);
    return null;
  }
}

async function searchWikipedia(brandName: string) {
  try {
    const searchQuery = encodeURIComponent(brandName);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${searchQuery}`;
    
    const response = await axios.get(url, { timeout: 8000 });
    
    if (response.data.extract) {
      return {
        title: response.data.title || brandName,
        url: response.data.content_urls?.desktop?.page || '',
        snippet: response.data.extract,
        source: 'wikipedia' as const,
        relevance: 0.95,
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Wikipedia search failed:', error);
    return null;
  }
}

function extractSocialProfiles(brandName: string) {
  const socialPlatforms = [
    { name: 'twitter', url: `https://twitter.com/${brandName.replace(/\s+/g, '')}` },
    { name: 'linkedin', url: `https://linkedin.com/company/${brandName.toLowerCase().replace(/\s+/g, '-')}` },
    { name: 'facebook', url: `https://facebook.com/${brandName.replace(/\s+/g, '')}` },
    { name: 'instagram', url: `https://instagram.com/${brandName.toLowerCase().replace(/\s+/g, '')}` },
  ];
  
  return socialPlatforms.map(platform => ({
    platform: platform.name,
    url: platform.url,
    handle: brandName.replace(/\s+/g, ''),
    description: `${brandName} on ${platform.name}`,
  })).slice(0, 3);
}

function extractIndustryKeywords(text: string): string[] {
  const industries = [
    'Technology', 'Software', 'SaaS', 'AI', 'Machine Learning',
    'Marketing', 'Advertising', 'Consulting', 'Agency',
    'E-commerce', 'Retail', 'Fashion', 'Apparel',
    'Finance', 'Banking', 'Fintech', 'Investment',
    'Healthcare', 'Medical', 'Wellness', 'Fitness',
    'Education', 'E-learning', 'Edtech', 'Training',
    'Food', 'Beverage', 'Restaurant', 'Hospitality',
    'Real Estate', 'Property', 'Construction',
    'Entertainment', 'Media', 'Gaming', 'Streaming',
    'Automotive', 'Transportation', 'Logistics',
  ];
  
  const found = industries.filter(industry => 
    text.toLowerCase().includes(industry.toLowerCase())
  );
  
  return found.length > 0 ? found : [];
}

function extractAudienceSignals(text: string): string[] {
  const signals = [];
  
  if (text.toLowerCase().includes('b2b') || text.toLowerCase().includes('business to business')) {
    signals.push('B2B/Enterprise customers');
  }
  
  if (text.toLowerCase().includes('b2c') || text.toLowerCase().includes('consumers')) {
    signals.push('B2C/General consumers');
  }
  
  if (text.toLowerCase().includes('startup') || text.toLowerCase().includes('small business')) {
    signals.push('Startups/Small businesses');
  }
  
  if (text.toLowerCase().includes('enterprise') || text.toLowerCase().includes('corporation')) {
    signals.push('Large enterprises');
  }
  
  if (text.toLowerCase().includes('developer') || text.toLowerCase().includes('technical')) {
    signals.push('Developers/Technical users');
  }
  
  if (text.toLowerCase().includes('creative') || text.toLowerCase().includes('designer')) {
    signals.push('Creative professionals');
  }
  
  return signals.length > 0 ? signals : ['General audience'];
}

function extractToneSignals(text: string): string[] {
  const signals = [];
  
  const toneIndicators = [
    { keyword: 'professional', tone: 'Professional/Formal' },
    { keyword: 'friendly', tone: 'Friendly/Casual' },
    { keyword: 'innovative', tone: 'Innovative/Forward-thinking' },
    { keyword: 'luxury', tone: 'Luxury/Premium' },
    { keyword: 'affordable', tone: 'Affordable/Accessible' },
    { keyword: 'sustainable', tone: 'Sustainable/Eco-friendly' },
    { keyword: 'cutting-edge', tone: 'Cutting-edge/Technical' },
    { keyword: 'simple', tone: 'Simple/Minimalist' },
  ];
  
  for (const indicator of toneIndicators) {
    if (text.toLowerCase().includes(indicator.keyword)) {
      signals.push(indicator.tone);
    }
  }
  
  return signals.length > 0 ? signals : ['Professional brand communication'];
}