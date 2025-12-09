// /lib/backend/js-crawler.ts - API-based crawler for JavaScript sites
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface JSCrawlResult {
  success: boolean;
  url: string;
  title?: string;
  description?: string;
  text?: string;
  keywords?: string[];
  headings?: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  links?: string[];
  error?: string;
}

export async function crawlJavaScriptSite(url: string): Promise<JSCrawlResult> {
  console.log(`🤖 [JS-CRAWLER] Attempting to crawl JavaScript site: ${url}`);
  
  try {
    // Try to get basic HTML first
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
      maxRedirects: 5,
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract basic metadata
    const title = $('title').text().trim() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || 
                           $('meta[property="og:description"]').attr('content') || '';
    
    const metaKeywords = ($('meta[name="keywords"]').attr('content') || '')
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    // Extract headings
    const headings = {
      h1: $('h1').map((_, el) => $(el).text().trim()).get(),
      h2: $('h2').map((_, el) => $(el).text().trim()).get(),
      h3: $('h3').map((_, el) => $(el).text().trim()).get(),
    };
    
    // Extract links
    const links = $('a[href]').map((_, el) => {
      const href = $(el).attr('href') || '';
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        try {
          return new URL(href, url).toString();
        } catch (e) {
          return null;
        }
      }
      return null;
    }).get().filter(link => link !== null) as string[];
    
    // Strategy 1: Try to get text from common content containers
    let extractedText = '';
    
    // Common content selectors for JS frameworks
    const contentSelectors = [
      'div[data-testid]', // React testing library
      'div[class*="content"]', 
      'div[class*="article"]',
      'div[class*="post"]',
      'div[class*="blog"]',
      'main', 'article', 'section',
      'div[role="main"]',
      'div#app', 'div#root', 'div#__next', // Common JS app roots
    ];
    
    for (const selector of contentSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        const text = elements.map((_, el) => $(el).text()).get().join(' ');
        if (text.length > extractedText.length) {
          extractedText = text;
        }
      }
    }
    
    // Strategy 2: If still minimal content, try getting all paragraph text
    if (extractedText.length < 200) {
      extractedText = $('p').map((_, el) => $(el).text()).get().join(' ');
    }
    
    // Strategy 3: If still minimal, try getting all text and clean it
    if (extractedText.length < 100) {
      extractedText = $('body').text()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s.,!?\-]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    
    // Check for JSON-LD structured data (common in JS sites)
    let structuredData: any = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '');
        structuredData = json;
      } catch (e) {
        // Ignore parse errors
      }
    });
    
    // If we found structured data, extract info from it
    if (structuredData) {
      console.log(`📊 [JS-CRAWLER] Found structured data for ${url}`);
      
      if (structuredData.name && !title) {
        extractedText += `\n\nBrand: ${structuredData.name}`;
      }
      if (structuredData.description) {
        extractedText += `\n\nDescription: ${structuredData.description}`;
      }
      if (structuredData.keywords) {
        extractedText += `\n\nKeywords: ${structuredData.keywords}`;
      }
    }
    
    // Check for common JS framework indicators
    const isReact = html.includes('react') || html.includes('React') || html.includes('__NEXT_DATA__');
    const isVue = html.includes('vue') || html.includes('Vue');
    const isAngular = html.includes('ng-') || html.includes('data-ng-');
    const isNextJS = html.includes('__NEXT_DATA__');
    
    const framework = isReact ? 'React' : isVue ? 'Vue' : isAngular ? 'Angular' : isNextJS ? 'Next.js' : 'Unknown';
    
    // Clean and limit text
    const cleanText = extractedText
      .substring(0, 3000)
      .replace(/\s+/g, ' ')
      .trim();
    
    const result: JSCrawlResult = {
      success: true,
      url,
      title: title || 'JavaScript-rendered site',
      description: metaDescription,
      text: cleanText || 'JavaScript site detected. Content extraction limited due to client-side rendering.',
      keywords: metaKeywords,
      headings,
      links: links.slice(0, 10),
    };
    
    console.log(`✅ [JS-CRAWLER] Successfully extracted from JS site:`, {
      titleLength: result.title?.length || 0,
      textLength: result.text?.length || 0,
      framework,
      hasStructuredData: !!structuredData,
    });
    
    return result;
    
  } catch (error: any) {
    console.error(`❌ [JS-CRAWLER] Failed to crawl ${url}:`, error.message);
    
    // Try one more time with simpler headers
    try {
      console.log(`🔄 [JS-CRAWLER] Retrying with simpler request...`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'text/html',
        },
      });
      
      const $ = cheerio.load(response.data);
      const title = $('title').text().trim() || '';
      
      return {
        success: true,
        url,
        title,
        text: `JavaScript-rendered website. Minimal content extracted. Title: ${title}`,
      };
      
    } catch (retryError) {
      return {
        success: false,
        url,
        error: `Failed to crawl JavaScript site: ${error.message}`,
      };
    }
  }
}

// Helper function to detect if site is JavaScript-rendered
export function detectJavaScriptSite(html: string): boolean {
  const indicators = [
    // React/Next.js
    /react/i.test(html),
    /__NEXT_DATA__/.test(html),
    /webpack/i.test(html),
    
    // Vue
    /vue/i.test(html),
    /v-[\w-]+/i.test(html),
    
    // Angular
    /ng-[\w-]+/i.test(html),
    /data-ng/i.test(html),
    
    // SPA indicators
    /single[\s-]*page[\s-]*application/i.test(html),
    /spa/i.test(html) && html.indexOf('spa') < 1000,
    
    // Minimal server-rendered content
    (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]?.replace(/<[^>]+>/g, '')?.trim()?.length || 0) < 200,
    
    // Common JS app containers
    /<div[^>]*id=["'](app|root|__next)["']/i.test(html),
    /<div[^>]*data-reactroot/i.test(html),
  ];
  
  return indicators.some(indicator => indicator === true);
}