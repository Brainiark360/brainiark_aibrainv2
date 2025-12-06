// src/app/onboarding/[slug]/evidence/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { BrandWorkspace } from "@/models/Workspace";
import type { EvidenceMode } from "@/types/onboarding";
import { EvidenceIntakePanel } from "@/components/Onboarding/EvidenceIntakePanel";

interface EvidencePageProps {
  params: { slug: string };
  searchParams?: { mode?: EvidenceMode };
}

export default async function EvidencePage({ params, searchParams }: EvidencePageProps) {
  const { slug } = params;
  const mode = searchParams?.mode;

  // Must have an evidence mode
  if (!mode) {
    redirect(`/onboarding/${slug}/evidence-mode`);
  }

  // Auth check
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // Workspace lookup
  await connectDB();
  const workspace = await BrandWorkspace.findOne({
    slug,
    ownerUserId: user.id,
  }).lean();

  if (!workspace) redirect("/onboarding/select-brand");

  return (
    <main className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">

        {/* HEADER */}
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-[rgb(var(--foreground))]">
            Share evidence for “{workspace.name}”
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            I’ll analyze everything you provide and begin forming your Brand Brain.
          </p>
        </header>

        {/* THREE-COLUMN EVIDENCE PANEL (Inputs + Gradient Visual + AI Stream) */}
        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm">
          <EvidenceIntakePanel brandId={workspace._id.toString()} mode={mode} />
        </section>
      </div>
    </main>
  );
}
