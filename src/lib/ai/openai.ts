// /src/lib/ai/openai.ts
import crypto from "crypto"

export interface AIThreadInitResult {
  threadId: string
  usedRemote: boolean
}

interface OpenAIThreadResponse {
  id: string
}

export async function initBrandThread(brandId: string): Promise<AIThreadInitResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    // Fallback for local/dev without API key
    return {
      threadId: `local-thread-${brandId}-${Date.now()}`,
      usedRemote: false,
    }
  }

  const response = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ metadata: { brandId } }),
  })

  if (!response.ok) {
    // Fallback behavior if OpenAI creation fails
    return {
      threadId: `fallback-thread-${brandId}-${crypto.randomUUID()}`,
      usedRemote: false,
    }
  }

  const data = (await response.json()) as OpenAIThreadResponse

  return {
    threadId: data.id,
    usedRemote: true,
  }
}
