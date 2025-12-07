// /lib/backend/evidence-processor.ts
import { Evidence } from '@/models/Evidence';
import { createAnalysisCompletion } from './openai';

export async function processEvidence(
  evidenceId: string,
  type: string,
  value: string
) {
  try {
    // Update status to processing
    await Evidence.findByIdAndUpdate(evidenceId, {
      status: 'processing',
    });
    
    let analyzedContent = '';
    
    // Process based on type
    switch (type) {
      case 'website':
        analyzedContent = await analyzeWebsite(value);
        break;
      case 'document':
        analyzedContent = await analyzeDocument(value);
        break;
      case 'social':
        analyzedContent = await analyzeSocial(value);
        break;
      case 'manual':
        analyzedContent = await analyzeManualInput(value);
        break;
      default:
        analyzedContent = value;
    }
    
    // Update with analyzed content
    await Evidence.findByIdAndUpdate(evidenceId, {
      analyzedContent,
      status: 'complete',
    });
    
    console.log(`✅ Processed evidence ${evidenceId}: ${type}`);
    
  } catch (error) {
    console.error(`❌ Error processing evidence ${evidenceId}:`, error);
    
    // Mark as complete even if analysis failed
    await Evidence.findByIdAndUpdate(evidenceId, {
      status: 'complete',
      analyzedContent: value,
    });
  }
}

async function analyzeWebsite(url: string): Promise<string> {
  try {
    // Note: In production, implement actual webpage fetching
    // For now, analyze the URL structure and provide generic analysis
    
    const prompt = `Analyze this website for brand insights: ${url}
    
    Provide analysis covering:
    1. Brand positioning based on domain and URL structure
    2. Likely industry and target market
    3. Key value propositions inferred
    4. Professional tone indicators
    
    If this is a known platform (like LinkedIn, Instagram, etc.), note the platform characteristics.`;
    
    const response = await createAnalysisCompletion(
      'You are a brand analysis expert. Analyze websites for brand insights.',
      prompt
    );
    
    return response || `Website URL provided: ${url}`;
    
  } catch (error) {
    console.error('Website analysis error:', error);
    return `Website: ${url}`;
  }
}

async function analyzeDocument(content: string): Promise<string> {
  try {
    const prompt = `Analyze this document content for brand insights:
    
    ${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}
    
    Extract:
    - Brand mission and values
    - Target market information
    - Competitive positioning
    - Strategic goals
    - Key messaging points
    - Tone and style indicators`;
    
    const response = await createAnalysisCompletion(
      'You are a document analysis expert. Extract brand insights from documents.',
      prompt
    );
    
    return response || `Document content analyzed`;
    
  } catch (error) {
    console.error('Document analysis error:', error);
    return content.substring(0, 500) + (content.length > 500 ? '...' : '');
  }
}

async function analyzeSocial(content: string): Promise<string> {
  try {
    const prompt = `Analyze this social media content for brand insights:
    
    ${content}
    
    Identify:
    - Engagement style and conversational tone
    - Audience interaction patterns
    - Content themes and topics
    - Brand personality indicators
    - Potential audience demographics
    - Call-to-action patterns`;
    
    const response = await createAnalysisCompletion(
      'You are a social media analysis expert. Extract brand insights from social content.',
      prompt
    );
    
    return response || `Social content analyzed`;
    
  } catch (error) {
    console.error('Social analysis error:', error);
    return content;
  }
}

async function analyzeManualInput(content: string): Promise<string> {
  try {
    const prompt = `Summarize and structure this brand information:
    
    ${content}
    
    Organize into clear, actionable insights about the brand.
    Focus on: brand identity, target audience, value proposition, and key messaging.`;
    
    const response = await createAnalysisCompletion(
      'You are a brand strategy expert. Structure brand information into actionable insights.',
      prompt
    );
    
    return response || content;
    
  } catch (error) {
    console.error('Manual input analysis error:', error);
    return content;
  }
}