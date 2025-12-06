// src/app/onboarding/[slug]/brand-brain/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { BrandWorkspace } from "@/models/Workspace";
import { BrandBrain } from "@/models/BrandBrain";

interface BrandBrainPageProps {
  params: { slug: string };
}

export default async function BrandBrainPage({ params }: BrandBrainPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  await connectDB();
  const workspace = await BrandWorkspace.findOne({
    slug: params.slug,
    ownerUserId: user.id,
  }).exec();

  if (!workspace) {
    redirect("/onboarding/select-brand");
  }

  const brain = await BrandBrain.findOne({
    brandWorkspaceId: workspace._id,
  }).exec();

  return (
    <main className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-[rgb(var(--foreground))]">
            Brand Brain draft for “{workspace.name}”
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Here&apos;s how I understand your brand so far. Refine anything —
            this is your strategic foundation.
          </p>
        </header>

        <section className="space-y-4">
          {/* TODO: BrandBrainSection components with streaming and inline editing */}
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
            <h2 className="text-sm font-semibold text-[rgb(var(--foreground))]">
              Summary
            </h2>
            <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
              {brain?.summary || "AI-generated summary will appear here."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
