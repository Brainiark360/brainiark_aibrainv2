// /app/api/brands/[slug]/onboarding/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase } from '@/db/db-optimized';
import { createChatCompletion, streamToResponse } from '@/lib/ai/openai';
import { optimizedRequireAuth } from '@/lib/optimized-middleware';
import { chatRequestSchema, validateRequest } from '@/lib/validators/validation';
import { BrandBrain } from '@/models/BrandBrain';
import { Evidence } from '@/models/Evidence';
import type { OnboardingStep } from '@/types/onboarding';
import { BrandWorkspace } from '@/models/Workspace';

interface ChatRequestData {
  message: string;
  context?: unknown;
  step: OnboardingStep;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse;

    // Validate incoming body against your zod schema
    const validation = await validateRequest(chatRequestSchema, request);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          details: validation.details,
        },
        { status: 400 }
      );
    }

    const { message, context, step } = validation.data as ChatRequestData;

    // Track workspace activity
    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      lastActiveAt: new Date(),
    });

    // Fetch recent evidence + Brand Brain for context
    const [evidenceItems, brandBrain] = await Promise.all([
      Evidence.find({ brandSlug: slug, status: 'complete' })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec(),
      BrandBrain.findOne({ brandSlug: slug }).lean().exec(),
    ]);

    // Build evidence context string
    const evidenceContext =
      evidenceItems.length > 0
        ? `\n\nCollected Evidence (${evidenceItems.length} items):\n${evidenceItems
            .slice(0, 5)
            .map((e, i) => {
              const base =
                (e.analyzedContent as string | undefined) ??
                (typeof e.value === 'string'
                  ? e.value.substring(0, 140)
                  : String(e.value).substring(0, 140));
              return `${i + 1}. [${e.type}] ${base}…`;
            })
            .join('\n')}`
        : '';

    const brainStatus = (brandBrain?.status as string | undefined) ?? 'not_started';
    const brainHasContent =
      Boolean(brandBrain?.summary) ||
      Boolean(brandBrain?.audience) ||
      Boolean(brandBrain?.tone) ||
      Boolean(brandBrain?.pillars && brandBrain.pillars.length > 0);

    const onboardingGuide = getOnboardingGuide(
      step,
      evidenceItems.length,
      brainStatus,
      brainHasContent
    );

    const systemPrompt = `You are Brainiark AI, a brand strategy onboarding assistant.

Your PRIMARY JOB is to guide users through the onboarding process step by step in a calm, intelligent, conversational way.

CURRENT ONBOARDING STEP: ${step}
BRAND NAME: ${workspace.name}
BRAND SLUG: ${slug}

${onboardingGuide}

EVIDENCE CONTEXT: ${evidenceContext}

IMPORTANT RULES:
1. You MUST guide the user to the next step when appropriate.
2. Ask specific questions that move the onboarding forward, never leave the user unsure what to do.
3. Provide clear next actions.
4. Use action buttons when appropriate (format: [ACTION:label:type:variant]) — for example:
   - [ACTION:Add a website:add-evidence:secondary]
   - [ACTION:Start Analysis:start-analysis:primary]
5. Keep responses conversational but focused on progress.
6. Acknowledge user input and relate it explicitly to onboarding progress.
7. Make it very obvious what the user should do next.

CURRENT EVIDENCE COUNT: ${evidenceItems.length}
BRAND BRAIN STATUS: ${brainStatus}
${brainHasContent ? 'BRAND BRAIN HAS CONTENT: Yes - ready for review' : 'BRAND BRAIN HAS CONTENT: Not yet - needs analysis'}

USER'S LAST MESSAGE: "${message}"
USER CONTEXT: ${JSON.stringify(context ?? {}, null, 2)}

RESPONSE GUIDELINES:
- Respond in a warm, helpful, calm tone.
- Focus on moving onboarding forward.
- Suggest specific next steps (e.g. "paste your website URL", "click the analysis button on the right").
- Provide encouragement and clarity.
- Use action buttons for key decisions.
- DO NOT output raw JSON in chat; speak to the human user.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message },
    ];

    // --- MAIN STREAMING BLOCK: fall back instead of 500 on failure ---
    try {
      const stream = await createChatCompletion(messages, true);

      return new Response(streamToResponse(stream), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (streamError) {
      console.error('Chat streaming error (OpenAI)', streamError);

      // Fallback response so the client does NOT see a 500
      const fallback = buildFallbackAssistantMessage(step, evidenceItems.length);

      return new Response(fallback, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    }
  } catch (error: unknown) {
    console.error('Chat endpoint error (outer):', error);

    // Keep error shape for debugging, but the client is already handling non-OK as a failure
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// -------------------------
// Onboarding guidance helper
// -------------------------
function getOnboardingGuide(
  step: OnboardingStep,
  evidenceCount: number,
  brainStatus: string,
  brainHasContent: boolean
): string {
  switch (step) {
    case 'intro':
      return `ONBOARDING PHASE: INTRODUCTION
OBJECTIVE: Welcome the user, understand the brand at a high level, and gently guide them to add evidence.

ACTION PLAN:
1. Greet the user by name (if provided via context) or greet them warmly without a name.
2. Briefly explain what Brainiark will do: "I'll help you set up a Brand Brain, your strategic brand OS."
3. Ask 1–2 simple questions about the brand (what it does, who it's for).
4. Then clearly suggest adding evidence: website URLs, social profiles, documents, or a short description.
5. Suggest the right-side panel: "You can paste links or descriptions on the right-hand side panel too."
6. Offer action buttons like:
   - [ACTION:Add a website:add-evidence:secondary]
   - [ACTION:Describe my brand:add-evidence:secondary]

SUGGESTED NEXT STEP:
After 1–2 questions, say something like:
"Now let's collect some material about your brand. You can paste your website, social profiles, or a short description, and I'll use that to understand your brand."`;

    case 'collecting_evidence':
      return `ONBOARDING PHASE: EVIDENCE COLLECTION
OBJECTIVE: Help the user add enough evidence to run a strong analysis.

EVIDENCE COLLECTED: ${evidenceCount} items

ACTION PLAN:
1. Encourage the user to add at least one strong source (website, social, or document).
2. Each time evidence is added, acknowledge it and briefly describe how it will help.
3. Ask context-specific follow-ups (e.g. "Is this your main website?", "Do you have other key pages?").
4. When at least 1 evidence item exists, start gently pushing toward analysis.
5. Suggest the analysis button on the right panel.
6. Provide a clear action button:
   - [ACTION:Start Analysis:start-analysis:primary]

${
  evidenceCount >= 1
    ? 'READY FOR ANALYSIS: Yes — suggest starting analysis now.'
    : 'READY FOR ANALYSIS: Not yet — encourage adding at least one evidence item.'
}

SUGGESTED NEXT STEP:
${
  evidenceCount >= 1
    ? `"Great — with ${evidenceCount} evidence item${evidenceCount > 1 ? 's' : ''}, I have enough to start analyzing your brand. When you're ready, click the analysis button on the right or tell me "let\'s analyze".`
    : 'Ask something like: "What would you like to add first? You can share your website, a social profile, or just describe your brand in your own words."'
}`;

    case 'waiting_for_analysis':
      return `ONBOARDING PHASE: READY FOR ANALYSIS
OBJECTIVE: Confirm user readiness and trigger analysis.

EVIDENCE COLLECTED: ${evidenceCount} items

ACTION PLAN:
1. Reassure the user you have what you need to start analysis.
2. Briefly explain what the analysis will do (build their Brand Brain).
3. Ask for confirmation to start.
4. Refer explicitly to the "Proceed to Analysis" button on the right.
5. Provide a clear action button:
   - [ACTION:Yes, Analyze Now:start-analysis:primary]

SUGGESTED NEXT STEP:
"Perfect — I have your materials ready. When you’re ready, click the analysis button on the right or tap the action below and I’ll start building your Brand Brain."`;

    case 'analyzing':
      return `ONBOARDING PHASE: ANALYSIS IN PROGRESS
OBJECTIVE: Keep the user calm and informed while analysis runs.

BRAND BRAIN STATUS: ${brainStatus}

ACTION PLAN:
1. Explain in plain language what is happening (searching web, crawling content, extracting tone, building Brand Brain).
2. Mirror the progress indicators in the UI:
   - Searching for brand information
   - Crawling website
   - Extracting messaging & tone
   - Building Brand Brain
3. Set expectations: this is fast, but not instant.
4. Encourage them to ask questions while waiting.
5. When analysis is complete (once brand brain has content), shift your language to the review phase.

SUGGESTED NEXT STEP:
${
  brainHasContent
    ? "Say something like: “Your Brand Brain is ready. Next we’ll review your summary, audience, tone and pillars one by one so you can adjust anything you like.”"
    : "Reassure the user: “I’m working on your Brand Brain now — you’ll see progress on the right. I’ll tell you as soon as it’s ready to review.”"
}`;

    case 'reviewing_brand_brain':
      return `ONBOARDING PHASE: BRAND BRAIN REVIEW
OBJECTIVE: Guide the user through each section of the Brand Brain and help refine it.

BRAND BRAIN HAS CONTENT: ${brainHasContent ? 'Yes' : 'No'}

ACTION PLAN:
1. Introduce the Brand Brain as their "strategic snapshot" or "source of truth."
2. Walk through key sections: summary, audience, tone, pillars, offers, competitors, channels, recommendations.
3. For each section, ask:
   - "Does this feel accurate?"
   - "What would you change?"
4. Encourage inline edits in the right panel.
5. Offer refinements with buttons, e.g.:
   - [ACTION:Refine tone:refine-tone:secondary]
   - [ACTION:Rewrite summary:refine-summary:secondary]
6. When all sections feel right, gently guide them to complete onboarding.

SUGGESTED NEXT STEP:
"Let’s start with your Brand Summary. Read it on the right, then tell me what feels right and what feels off — or I can propose an alternate version for you."`;

    case 'complete':
      return `ONBOARDING PHASE: COMPLETION
OBJECTIVE: Celebrate completion and orient the user to next steps inside the workspace.

ACTION PLAN:
1. Congratulate the user in a calm, genuine way.
2. Explain that their Brand Brain is now active and can be used across Brainiark OS.
3. Tell them what they can do next:
   - Generate content
   - Explore strategy tools
   - Review or refine Brand Brain later
4. Reinforce that nothing is permanent; they can always improve it.

SUGGESTED NEXT STEP:
"Congratulations — your Brand Brain is live. From here, you can use it to brief content, explore strategy views, and keep refining your brand over time."`;

    default:
      return `ONBOARDING PHASE: UNKNOWN
OBJECTIVE: Recover gracefully and keep the user moving forward.

ACTION PLAN:
1. Ask a simple question to understand where they are ("Have you already added any links or descriptions about your brand?").
2. If unsure, suggest adding evidence and then running analysis.
3. Keep tone calm and confident.`;
  }
}

// -------------------------
// Fallback chat message
// -------------------------
function buildFallbackAssistantMessage(
  step: OnboardingStep,
  evidenceCount: number
): string {
  const baseIntro =
    'I’m having a little trouble connecting to the full AI engine right now, but I can still guide you through onboarding.';

  switch (step) {
    case 'intro':
      return `${baseIntro}

To get started:
• Tell me what your brand does and who it’s for.
• Paste your main website URL or social profile into the right-hand panel.
Once we have at least one source, we’ll move to analysis.`;

    case 'collecting_evidence':
      return `${baseIntro}

Right now you have ${evidenceCount} evidence item${evidenceCount === 1 ? '' : 's'}.

Next steps:
• Add more evidence on the right if you have it (website, socials, docs, or descriptions).
• When you feel ready, click “Proceed to analysis” on the right to start building your Brand Brain.`;

    case 'waiting_for_analysis':
      return `${baseIntro}

You’re ready for analysis.

Next steps:
• Click the analysis button on the right (“Proceed to Brand Analysis”).
• I’ll then build a Brand Brain with summary, audience, tone, pillars, offers, and more.`;

    case 'analyzing':
      return `${baseIntro}

Your brand is currently being analyzed.

What’s happening:
• Searching for brand information
• Crawling your website and public content (if available)
• Extracting messaging, tone and positioning
• Building your Brand Brain

You can keep adding evidence or ask questions while this runs.`;

    case 'reviewing_brand_brain':
      return `${baseIntro}

Your Brand Brain should now be visible on the right.

Next steps:
• Read through the summary, audience, tone, and pillars.
• Edit anything that feels off directly in the right panel.
• When it feels right, click “Complete onboarding” to activate your Brand Brain.`;

    case 'complete':
      return `${baseIntro}

Your Brand Brain is already marked as complete.

Next steps:
• Explore your main workspace dashboard.
• Use your Brand Brain to guide content and strategy.
• You can always come back here to refine it.`;

    default:
      return `${baseIntro}

Try:
• Adding a website, social link or description on the right.
• Then click the analysis button to build your Brand Brain.`;
  }
}
