// /lib/backend/openai.ts
import { OpenAIMessage } from '@/types/onboarding';
import OpenAI from 'openai';

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
      max_tokens: 2000,
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
      // Clean up if stream is cancelled
      console.log('Stream cancelled by client');
    }
  });
}