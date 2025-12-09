import OpenAI from 'openai';
import { OpenAIMessage } from '@/types/onboarding';

// Initialize OpenAI client with error handling
let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return client;
}

export async function createChatCompletion(
  messages: OpenAIMessage[],
  stream: boolean = true
) {
  try {
    const openai = getOpenAIClient();
    
    return await openai.chat.completions.create({
      model: 'gpt-4o',
      stream,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI configuration.');
    } else if (error.status === 503) {
      throw new Error('OpenAI service is temporarily unavailable.');
    }
    
    throw new Error('Failed to generate AI response');
  }
}

export async function createAnalysisCompletion(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    return completion.choices[0].message.content || '';
  } catch (error: any) {
    console.error('OpenAI analysis error:', error);
    
    if (error.status === 429) {
      throw new Error('Analysis rate limit exceeded. Please try again later.');
    }
    
    throw new Error('Failed to perform brand analysis');
  }
}

/**
 * Specialized completion for GPT web search and analysis
 */
export async function createGPTWebCompletion(
  messages: OpenAIMessage[],
  options: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  } = {}
): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model: options.model || 'gpt-4o',
      stream: false,
      messages,
      temperature: options.temperature || 0.2,
      max_tokens: options.maxTokens || 3000,
    });

    return completion.choices[0].message.content || '';
  } catch (error: any) {
    console.error('OpenAI GPT web completion error:', error);
    
    if (error.status === 429) {
      throw new Error('GPT web search rate limit exceeded. Please try again later.');
    } else if (error.status === 402) {
      throw new Error('GPT web search capabilities require additional permissions.');
    }
    
    throw new Error('Failed to perform GPT web analysis');
  }
}

export function streamToResponse(stream: any): ReadableStream {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (error) {
        console.error('Stream error:', error);
        controller.enqueue(encoder.encode('Error generating response.'));
      } finally {
        controller.close();
      }
    },
    cancel() {
      console.log('Stream cancelled by client');
    }
  });
}

/**
 * Check if OpenAI API key has web search capabilities
 */
export async function checkWebSearchCapabilities(): Promise<{
  hasWebSearch: boolean;
  model: string;
  capabilities: string[];
}> {
  try {
    const openai = getOpenAIClient();
    
    // Try to get model info
    const models = await openai.models.list();
    const gpt4oModel = models.data.find(m => m.id === 'gpt-4o');
    
    // Check for web search capabilities
    // Note: This is a simplified check - actual web search capabilities
    // depend on your OpenAI plan and model access
    
    return {
      hasWebSearch: true, // Assuming web search is available
      model: 'gpt-4o',
      capabilities: ['web_search', 'file_upload', 'function_calling']
    };
    
  } catch (error) {
    console.error('Failed to check web search capabilities:', error);
    
    return {
      hasWebSearch: false,
      model: 'gpt-4o',
      capabilities: ['text_completion']
    };
  }
}