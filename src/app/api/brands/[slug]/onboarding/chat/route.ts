import { connectToDatabase } from '@/db/db-optimized';
import { createChatCompletion, streamToResponse } from '@/lib/ai/openai';
import { optimizedRequireAuth } from '@/lib/optimized-middleware';
import { chatRequestSchema, validateRequest } from '@/lib/validators/validation';
import { BrandBrain } from '@/models/BrandBrain';
import { Evidence } from '@/models/Evidence';
import { BrandWorkspace } from '@/models/Workspace';
import { NextRequest, NextResponse } from 'next/server';
import { OnboardingStep } from '@/types/onboarding';

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
    
    // Get brand brain status for context
    const brandBrainStatus = brandBrain?.status || 'not_started';
    const brandBrainHasContent = brandBrain && (
      brandBrain.summary || 
      brandBrain.audience || 
      brandBrain.tone || 
      (brandBrain.pillars && brandBrain.pillars.length > 0)
    );
    
    // Build onboarding progression context
    const onboardingGuide = getOnboardingGuide(step as OnboardingStep, evidenceItems.length, brandBrainStatus, brandBrainHasContent);
    
    // Build system prompt with onboarding progression
    const systemPrompt = `You are Brainiark AI, a brand strategy onboarding assistant.
Your PRIMARY JOB is to guide users through the onboarding process step by step.

CURRENT ONBOARDING STEP: ${step}
BRAND NAME: ${workspace.name}
BRAND SLUG: ${slug}

${onboardingGuide}

EVIDENCE CONTEXT: ${evidenceContext}

IMPORTANT RULES:
1. You MUST guide the user to the next step when appropriate
2. Ask specific questions that move the onboarding forward
3. Provide clear next actions
4. Use action buttons when appropriate (format: [ACTION:label:type:variant])
5. Keep responses conversational but focused on progress
6. Acknowledge user input and relate it to onboarding progress

CURRENT EVIDENCE COUNT: ${evidenceItems.length}
BRAND BRAIN STATUS: ${brandBrainStatus}
${brandBrainHasContent ? 'BRAND BRAIN HAS CONTENT: Yes - ready for review' : 'BRAND BRAIN HAS CONTENT: Not yet - needs analysis'}

USER'S LAST MESSAGE: "${message}"
USER CONTEXT: ${JSON.stringify(context || {}, null, 2)}

RESPONSE GUIDELINES:
- Respond in a warm, helpful tone
- Focus on moving onboarding forward
- Suggest specific next steps
- Provide encouragement and clarity
- Use action buttons for key decisions`;

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

// Helper function to generate step-specific onboarding guidance
function getOnboardingGuide(
  step: OnboardingStep, 
  evidenceCount: number, 
  brainStatus: string,
  brainHasContent: boolean
): string {
  switch (step) {
    case 'intro':
      return `ONBOARDING PHASE: INTRODUCTION
OBJECTIVE: Get to know the brand and guide to evidence collection
ACTION PLAN:
1. Ask about the brand (name, purpose, values)
2. After 1-2 exchanges, suggest moving to evidence collection
3. Explain what evidence can be added (websites, social, documents, descriptions)
4. Provide action buttons for evidence collection options

SUGGESTED NEXT STEP: After initial conversation, say: "Now let's collect some materials about your brand. You can add your website, social media profiles, documents, or describe your brand in your own words."`;

    case 'collecting_evidence':
      return `ONBOARDING PHASE: EVIDENCE COLLECTION
OBJECTIVE: Collect brand materials for analysis
EVIDENCE COLLECTED: ${evidenceCount} items
ACTION PLAN:
1. Help user add evidence (websites, social, documents, manual descriptions)
2. Acknowledge each piece of evidence added
3. When evidence is added, ask relevant follow-up questions
4. When at least 1 evidence item exists, suggest starting analysis
5. Provide action button: [ACTION:Start Analysis:start-analysis:primary]

${evidenceCount >= 1 
  ? 'READY FOR ANALYSIS: Yes - suggest starting analysis now'
  : 'READY FOR ANALYSIS: Not yet - encourage adding at least one evidence item'
}

SUGGESTED NEXT STEP: ${evidenceCount >= 1 
  ? `"Great! With ${evidenceCount} evidence item${evidenceCount > 1 ? 's' : ''}, I can analyze your brand. Ready to build your Brand Brain?"`
  : '"What would you like to add first? You can share your website, social media, documents, or describe your brand."'}`;

    case 'waiting_for_analysis':
      return `ONBOARDING PHASE: READY FOR ANALYSIS
OBJECTIVE: Confirm readiness and start analysis
EVIDENCE COLLECTED: ${evidenceCount} items
ACTION PLAN:
1. Confirm user is ready to analyze
2. Explain what analysis will do (build Brand Brain with insights)
3. Start analysis when user confirms
4. Provide action button: [ACTION:Yes, Analyze Now:start-analysis:primary]

SUGGESTED NEXT STEP: "Perfect! I have your materials ready. Would you like me to start analyzing them now to build your Brand Brain?"`;

    case 'analyzing':
      return `ONBOARDING PHASE: ANALYSIS IN PROGRESS
OBJECTIVE: Keep user informed during analysis
BRAND BRAIN STATUS: ${brainStatus}
ACTION PLAN:
1. Explain what's happening during analysis
2. Provide updates on progress
3. When analysis is complete, guide to review
4. Transition to review phase when ready

SUGGESTED NEXT STEP: ${brainHasContent 
  ? '"Analysis complete! I\'ve built your Brand Brain with insights about your brand. Ready to review them section by section?"'
  : '"I\'m analyzing your brand materials now. This usually takes about a minute. I\'ll let you know when your Brand Brain is ready!"'}`;

    case 'reviewing_brand_brain':
      return `ONBOARDING PHASE: BRAND BRAIN REVIEW
OBJECTIVE: Guide user through reviewing each section
BRAND BRAIN HAS CONTENT: ${brainHasContent ? 'Yes' : 'No'}
ACTION PLAN:
1. Help review each section: summary, audience, tone, pillars, recommendations
2. Suggest edits and refinements
3. Ask for feedback on each section
4. When all sections are reviewed, guide to completion
5. Provide action buttons for each section

SUGGESTED NEXT STEP: "Let's review your Brand Brain section by section. Would you like to start with the Brand Summary, Target Audience, or Brand Tone?"`;

    case 'complete':
      return `ONBOARDING PHASE: COMPLETION
OBJECTIVE: Congratulate user and explain next steps
ACTION PLAN:
1. Congratulate on completing onboarding
2. Explain what happens next (Brand Brain activation)
3. Provide guidance on using the platform
4. Offer support for next steps

SUGGESTED NEXT STEP: "Congratulations! Your brand onboarding is complete. Your Brand Brain is now active and ready to power your content strategy."`;

    default:
      return `ONBOARDING PHASE: UNKNOWN
OBJECTIVE: Guide user through the onboarding process
ACTION PLAN: Ask questions to understand where the user is in the process and provide appropriate guidance.`;
  }
}