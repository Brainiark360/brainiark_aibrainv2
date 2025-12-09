// /lib/backend/web-crawler.ts - COMPLETE REWRITE
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface WebsiteData {
  url: string;
  title: string;
  metaDescription: string;
  metaKeywords: string[];
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  bodyContent: string;
  mainContent?: string;
  links: Array<{
    text: string;
    url: string;
    internal: boolean;
  }>;
  images: Array<{
    src: string;
    alt: string;
  }>;
  scripts: string[];
  styles: string[];
  socialMeta: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
    twitterSite?: string;
  };
  structuredData: any[];
  loadTime: number;
  statusCode: number;
  wordCount: number;
  readingLevel: string;
  screenshotUrl?: string;
  error?: string;
  isJavaScriptSite?: boolean;
}

export async function crawlWebsite(url: string): Promise<WebsiteData> {
  const startTime = Date.now();
  
  try {
    // Validate and normalize URL
    const validatedUrl = validateUrl(url);
    
    console.log(`🕷️ [CRAWLER] Starting crawl for: ${validatedUrl}`);
    
    // Try multiple approaches
    let html = '';
    let statusCode = 200;
    
    // APPROACH 1: Try with axios first (standard fetch)
    try {
      console.log(`🔍 [CRAWLER] Attempting standard fetch...`);
      const response = await axios.get(validatedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      
      html = response.data;
      statusCode = response.status;
      console.log(`✅ [CRAWLER] Standard fetch successful: ${statusCode}`);
      
    } catch (axiosError) {
      console.warn(`⚠️ [CRAWLER] Standard fetch failed:`, axiosError.message);
      
      // APPROACH 2: Try with a different user agent
      try {
        console.log(`🔍 [CRAWLER] Trying with Googlebot user agent...`);
        const response = await axios.get(validatedUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
        
        html = response.data;
        statusCode = response.status;
        console.log(`✅ [CRAWLER] Googlebot fetch successful`);
        
      } catch (googlebotError) {
        console.warn(`⚠️ [CRAWLER] Googlebot fetch also failed:`, googlebotError.message);
        
        // APPROACH 3: Try puppeteer/playwright simulation (simpler approach first)
        html = await attemptJavaScriptRendering(validatedUrl);
        statusCode = html ? 200 : 500;
        
        if (!html) {
          throw new Error('All fetch attempts failed');
        }
      }
    }
    
    const loadTime = Date.now() - startTime;
    
    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    
    // Check if this looks like a JavaScript-rendered site
    const isJavaScriptSite = checkIfJavaScriptSite($, html);
    
    if (isJavaScriptSite) {
      console.log(`⚠️ [CRAWLER] Detected JavaScript-rendered site, content may be limited`);
    }
    
    // Extract data
    const title = $('title').text().trim() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = ($('meta[name="keywords"]').attr('content') || '')
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    // Extract headings
    const headings = {
      h1: $('h1').map((_, el) => cleanText($(el).text())).get(),
      h2: $('h2').map((_, el) => cleanText($(el).text())).get(),
      h3: $('h3').map((_, el) => cleanText($(el).text())).get(),
    };
    
    // Try multiple content extraction strategies
    let mainContent = '';
    
    // Strategy 1: Look for main content areas
    const contentSelectors = [
      'main', 'article', '#content', '.content', '#main', '.main',
      '[role="main"]', '.post-content', '.article-content', '.entry-content'
    ];
    
    for (const selector of contentSelectors) {
      const content = $(selector).first();
      if (content.length > 0) {
        mainContent = extractReadableText(content);
        if (mainContent.length > 200) {
          console.log(`✅ [CRAWLER] Found content with selector: ${selector}`);
          break;
        }
      }
    }
    
    // Strategy 2: If no main content found, try body
    if (!mainContent || mainContent.length < 200) {
      mainContent = extractReadableText($('body'));
    }
    
    // Strategy 3: If still no content, try to extract text from common containers
    if (!mainContent || mainContent.length < 100) {
      const containerSelectors = [
        'div.container', 'div.wrapper', 'section', 'div#page', 'div.page'
      ];
      
      for (const selector of containerSelectors) {
        const content = $(selector).first();
        if (content.length > 0) {
          const text = extractReadableText(content);
          if (text.length > mainContent.length) {
            mainContent = text;
          }
        }
      }
    }
    
    // Extract clean body text
    const bodyText = cleanText($('body').text());
    
    // Extract links
    const links = $('a[href]').map((_, el) => {
      const href = $(el).attr('href') || '';
      const text = cleanText($(el).text());
      
      if (!href || href.startsWith('javascript:') || href.startsWith('#')) {
        return null;
      }
      
      try {
        const absoluteUrl = new URL(href, validatedUrl).toString();
        const internal = absoluteUrl.includes(new URL(validatedUrl).hostname);
        
        return { text, url: absoluteUrl, internal };
      } catch (e) {
        return null;
      }
    }).get()
      .filter(link => link !== null && link.text.length > 0)
      .slice(0, 50);
    
    // Extract images with meaningful alt text
    const images = $('img[src]').map((_, el) => ({
      src: $(el).attr('src') || '',
      alt: cleanText($(el).attr('alt') || '')
    })).get()
      .filter(img => img.src && img.src.length > 0)
      .slice(0, 20);
    
    // Extract scripts and styles
    const scripts = $('script[src]').map((_, el) => $(el).attr('src') || '').get();
    const styles = $('link[rel="stylesheet"]').map((_, el) => $(el).attr('href') || '').get();
    
    // Extract social meta tags
    const socialMeta = {
      ogTitle: $('meta[property="og:title"]').attr('content'),
      ogDescription: $('meta[property="og:description"]').attr('content'),
      ogImage: $('meta[property="og:image"]').attr('content'),
      twitterCard: $('meta[name="twitter:card"]').attr('content'),
      twitterSite: $('meta[name="twitter:site"]').attr('content'),
    };
    
    // Extract structured data (JSON-LD)
    const structuredData: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '');
        structuredData.push(json);
      } catch (e) {
        // Skip invalid JSON
      }
    });
    
    // Calculate metrics
    const wordCount = countWords(mainContent);
    const readingLevel = calculateReadingLevel(mainContent);
    
    // Check if we got any meaningful content
    const hasMeaningfulContent = wordCount > 50 || mainContent.length > 200;
    
    if (!hasMeaningfulContent) {
      console.warn(`⚠️ [CRAWLER] Minimal content extracted: ${wordCount} words, ${mainContent.length} chars`);
      
      // Try to get at least some text from common text containers
      const textContainers = $('p, h1, h2, h3, h4, li').map((_, el) => cleanText($(el).text())).get();
      const containerText = textContainers.filter(text => text.length > 10).join(' ');
      
      if (containerText.length > mainContent.length) {
        mainContent = containerText;
      }
    }
    
    const websiteData: WebsiteData = {
      url: validatedUrl,
      title,
      metaDescription,
      metaKeywords,
      headings,
      bodyContent: bodyText,
      mainContent: mainContent.substring(0, 15000),
      links,
      images,
      scripts,
      styles,
      socialMeta,
      structuredData,
      loadTime,
      statusCode,
      wordCount: countWords(mainContent),
      readingLevel: calculateReadingLevel(mainContent),
      isJavaScriptSite,
    };
    
    console.log(`✅ [CRAWLER] Crawl complete: ${validatedUrl}`);
    console.log(`   - Title: ${title.substring(0, 50)}`);
    console.log(`   - Word count: ${websiteData.wordCount}`);
    console.log(`   - Status: ${statusCode}`);
    console.log(`   - Time: ${loadTime}ms`);
    console.log(`   - JavaScript site: ${isJavaScriptSite}`);
    
    return websiteData;
    
  } catch (error: any) {
    console.error(`❌ [CRAWLER] Crawl failed for ${url}:`, error.message);
    
    // Return error data with as much info as possible
    const loadTime = Date.now() - startTime;
    
    // Try to get basic info even if crawl failed
    let title = '';
    let metaDescription = '';
    
    try {
      // Make a HEAD request to get at least some info
      const headResponse = await axios.head(url, { timeout: 5000 });
      // Could check headers or make a minimal GET for just the head
    } catch (headError) {
      // Ignore head errors
    }
    
    return {
      url,
      title,
      metaDescription,
      metaKeywords: [],
      headings: { h1: [], h2: [], h3: [] },
      bodyContent: `Crawl failed: ${error.message}. This site may require JavaScript or be blocked by security measures.`,
      mainContent: '',
      links: [],
      images: [],
      scripts: [],
      styles: [],
      socialMeta: {},
      structuredData: [],
      loadTime,
      statusCode: 500,
      wordCount: 0,
      readingLevel: 'Unknown',
      error: error.message,
      isJavaScriptSite: true, // Assume JS site if crawl failed
    };
  }
}

// Helper function to attempt JavaScript rendering simulation
async function attemptJavaScriptRendering(url: string): Promise<string> {
  console.log(`🤖 [CRAWLER] Attempting JavaScript rendering simulation...`);
  
  try {
    // For now, we'll use a simple approach that works for some JS sites
    // In production, you might want to use Puppeteer or Playwright
    
    // Try with axios and a browser-like user agent
    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
    });
    
    // Check if this looks like a JS-rendered page
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Common patterns for JS sites
    const hasReactApp = html.includes('react') || html.includes('React') || html.includes('__NEXT_DATA__');
    const hasVueApp = html.includes('vue') || html.includes('Vue');
    const hasAngularApp = html.includes('ng-') || html.includes('data-ng-');
    const hasAppDiv = $('div#app, div#root, div#__next').length > 0;
    const hasMinimalContent = $('body').text().trim().length < 100;
    
    const isJsSite = hasReactApp || hasVueApp || hasAngularApp || hasAppDiv || hasMinimalContent;
    
    if (isJsSite) {
      console.log(`⚠️ [CRAWLER] This appears to be a JavaScript-rendered site`);
      
      // Try to extract any JSON-LD or meta data
      const jsonLd = $('script[type="application/ld+json"]').html() || '';
      const metaTitle = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
      
      // Construct minimal page
      let minimalHtml = `<html><head><title>${metaTitle}</title></head><body>`;
      if (metaDesc) minimalHtml += `<meta name="description" content="${metaDesc}">`;
      minimalHtml += `<p>JavaScript-rendered website detected. Content extraction limited.</p>`;
      
      // Add any text we can find
      const allText = $('body').text().substring(0, 1000);
      if (allText.trim().length > 50) {
        minimalHtml += `<p>Partial content: ${cleanText(allText)}</p>`;
      }
      
      minimalHtml += `</body></html>`;
      
      return minimalHtml;
    }
    
    return html;
    
  } catch (error) {
    console.error(`❌ [CRAWLER] JavaScript rendering attempt failed:`, error.message);
    return '';
  }
}

function checkIfJavaScriptSite($: cheerio.CheerioAPI, html: string): boolean {
  // Check for common JS framework indicators
  const indicators = [
    // React
    html.includes('react') || html.includes('React'),
    html.includes('__NEXT_DATA__'),
    $('div#__next').length > 0,
    
    // Vue
    html.includes('vue') || html.includes('Vue'),
    $('div#app').length > 0,
    
    // Angular
    html.includes('ng-') || html.includes('data-ng-'),
    
    // SPA indicators
    $('body').text().trim().length < 100, // Very little text
    $('script[src*=".js"]').length > 5, // Many JS files
    html.includes('single page application') || html.includes('SPA'),
    
    // Common patterns
    $('div#root').length > 0,
    html.includes('webpack'),
    html.includes('chunk'),
  ];
  
  return indicators.some(indicator => indicator === true);
}

function extractReadableText(element: cheerio.Cheerio): string {
  // Clone to avoid modifying original
  const clone = element.clone();
  
  // Remove unwanted elements
  clone.find('script, style, nav, footer, header, aside, iframe, noscript, svg, form, button, input, select, textarea').remove();
  
  // Get text and clean it
  const text = clone.text();
  return cleanText(text);
}

function validateUrl(url: string): string {
  let validated = url.trim();
  
  // Remove any query parameters that might break crawling
  validated = validated.split('?')[0];
  
  // Add protocol if missing
  if (!validated.startsWith('http://') && !validated.startsWith('https://')) {
    validated = 'https://' + validated;
  }
  
  try {
    const urlObj = new URL(validated);
    
    // Ensure we have a valid hostname
    if (!urlObj.hostname) {
      throw new Error('Invalid hostname');
    }
    
    return urlObj.toString();
  } catch (e) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/[^\w\s.,!?@#%&*()\-+:;'"\/\\|<>[\]{}=$£€¥₹¢~`]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function calculateReadingLevel(text: string): string {
  const words = countWords(text);
  const sentences = text.split(/[.!?]+/).length;
  const syllables = countSyllables(text);
  
  if (words === 0 || sentences === 0) return 'Unknown';
  
  // Flesch-Kincaid Grade Level
  const fkGrade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  
  if (fkGrade <= 6) return 'Easy (Elementary)';
  if (fkGrade <= 8) return 'Moderate (Middle School)';
  if (fkGrade <= 10) return 'Standard (High School)';
  if (fkGrade <= 12) return 'Advanced (College)';
  return 'Expert (Professional)';
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let totalSyllables = 0;
  
  for (const word of words) {
    if (word.length <= 3) {
      totalSyllables += 1;
      continue;
    }
    
    const cleaned = word
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .replace(/^y/, '');
    
    const syllables = cleaned.match(/[aeiouy]{1,2}/g);
    totalSyllables += syllables ? syllables.length : 1;
  }
  
  return totalSyllables;
}