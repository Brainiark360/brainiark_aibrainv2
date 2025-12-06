// src/app/onboarding/new-brand/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BrandNameForm } from "@/components/Onboarding/BrandNameForm";

export default async function NewBrandPage() {
  // 🔐 Auth guard — but DO NOT loop back to select-brand
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
            Create a Brand Workspace
          </h1>

          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            What brand are we building today? I&apos;ll wire up an intelligent
            strategy workspace around it.
          </p>
        </header>

        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm">
          {/* 
            🚀 BrandNameForm now handles:
            - validation
            - POST /api/brand-workspaces/create
            - AI animation
            - redirect(`/onboarding/${slug}/evidence-mode`)
          */}
          <BrandNameForm />
        </section>

        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          Nice. I&apos;ll set the rails; you stay focused on strategy.
        </p>
      </div>
    </main>
  );
}
