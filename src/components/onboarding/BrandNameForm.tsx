// src/components/onboarding/BrandNameForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ThinkingIndicator } from "@/components/ui/ThinkingIndicator";
import { StreamingText } from "@/components/ui/StreamingText";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

const brandNameSchema = z
  .string()
  .min(2, "Brand name must be at least 2 characters.")
  .max(200, "Brand name is too long.");

interface CreateBrandResponse {
  success: boolean;
  data?: {
    slug: string;
    brandWorkspaceId: string;
    aiThreadId: string;
    brainId: string;
  };
  error?: string;
}

type Phase = "idle" | "submitting" | "processing" | "done";

export const BrandNameForm: React.FC = () => {
  const router = useRouter();
  const [brandName, setBrandName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<number>(0);

  const aiMessages = [
    "Creating your brand workspace...",
    "Preparing your strategy engine...",
    "Activating AI context for your brand...",
    "Almost ready...",
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = brandNameSchema.safeParse(brandName);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Please enter a valid brand name.";
      setError(msg);
      return;
    }

    setLoading(true);
    setPhase("submitting");
    setProgress(20);

    try {
      const res = await fetch("/api/brand-workspaces/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: parsed.data }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json = (await res.json()) as CreateBrandResponse;

      if (!json.success || !json.data) {
        setError(json.error ?? "Could not create brand workspace.");
        setPhase("idle");
        setProgress(0);
        setLoading(false);
        return;
      }

      const { slug } = json.data;
      if (!slug) {
        setError("Brand created but slug is missing from response.");
        setPhase("idle");
        setProgress(0);
        setLoading(false);
        return;
      }

      setPhase("processing");
      setProgress(65);

      // Add a small delay to ensure the database is updated
      setTimeout(() => {
        setProgress(100);
        setPhase("done");
        
        // Force a hard navigation with window.location to avoid Next.js caching issues
        setTimeout(() => {
          window.location.href = `/onboarding/${slug}/evidence-mode`;
        }, 500);
      }, 1200);
    } catch (e) {
      console.error("[BRAND_NAME_FORM_ERROR]", e);
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong while creating your brand. Please try again."
      );
      setPhase("idle");
      setProgress(0);
      setLoading(false);
    }
  };

  const isBrandNameValid = brandNameSchema.safeParse(brandName).success;
  const buttonDisabled = loading || !isBrandNameValid;
  const isStreamingActive = phase === "submitting" || phase === "processing";
  const isStreamingDone = phase === "done";

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <AuthInput
          label="Brand workspace name"
          requiredLabel
          name="brandName"
          value={brandName}
          error={error ?? undefined}
          onChange={(event) => {
            setBrandName(event.target.value);
            setError(null);
          }}
          placeholder="e.g. Wolf Media, Aurora Studio, GrowthHive"
        />
      </div>

      <AuthButton loading={loading} disabled={buttonDisabled}>
        Continue
      </AuthButton>

      {(phase === "submitting" || phase === "processing" || phase === "done") && (
        <div className="space-y-2 pt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--muted))]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ThinkingIndicator label="Configuring your brand brain..." />

          <StreamingText
            messages={aiMessages}
            active={isStreamingActive}
            done={isStreamingDone}
          />
        </div>
      )}
    </form>
  );
};