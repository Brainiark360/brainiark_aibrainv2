// /app/api/brands/[slug]/onboarding/chat/route.ts
import { connectToDatabase } from '@/db/db-optimized';
import { createChatCompletion, streamToResponse } from '@/lib/ai/openai';
import { optimizedRequireAuth } from '@/lib/optimized-middleware';
import { chatRequestSchema, validateRequest } from '@/lib/validators/validation';
import { BrandBrain } from '@/models/BrandBrain';
import { Evidence } from '@/models/Evidence';
import { BrandWorkspace } from '@/models/Workspace';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Validate request
    const validation = await validateRequest(chatRequestSchema, request);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error, details: validation.details },
        { status: 400 }
      );
    }
    
    const { message, context, step } = validation.data;
    
    // Update workspace activity
    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      lastActiveAt: new Date(),
    });
    
    // Get context data for AI
    const [evidenceItems, brandBrain] = await Promise.all([
      Evidence.find({ brandSlug: slug, status: 'complete' })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      BrandBrain.findOne({ brandSlug: slug }).lean()
    ]);
    
    // Build evidence context
    let evidenceContext = '';
    if (evidenceItems.length > 0) {
      evidenceContext = `\n\nCollected Evidence (${evidenceItems.length} items):\n${evidenceItems
        .slice(0, 5)
        .map((e, i) => `${i + 1}. [${e.type}] ${e.analyzedContent || e.value.substring(0, 100)}...`)
        .join('\n')}`;
    }
    
    // Build system prompt
    const systemPrompt = `You are Brainiark AI, a brand strategy onboarding assistant.
Your job is to converse naturally with the user, guide them through onboarding,
ask helpful questions, and provide strategic insights.

Current Onboarding Step: ${step}
Brand Name: ${workspace.name}
Brand Slug: ${slug}${evidenceContext}

Rules:
1. Keep messages short, warm, and conversational
2. Provide clear, actionable suggestions
3. Encourage the user to add evidence when in "collecting_evidence" step
4. Maintain context from previous messages and provided evidence
5. Do NOT invent brand data — always respond based on what the user has said
6. When evidence is provided, acknowledge it and ask relevant follow-up questions
7. When analysis is complete, guide the user through reviewing the brand brain
8. Be encouraging and supportive throughout the process

${step === 'collecting_evidence' ? 'Focus on asking for specific types of evidence: websites, social media, documents, or manual descriptions.' : ''}
${step === 'reviewing_brand_brain' ? 'Help the user review and refine their brand brain sections.' : ''}

User Context: ${JSON.stringify(context || {}, null, 2)}`;

    // Create messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message }
    ];
    
    // Generate streaming response
    const stream = await createChatCompletion(messages, true);
    
    // Return streaming response
    return new Response(streamToResponse(stream), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}