// src/app/onboarding/[slug]/evidence-mode/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { BrandWorkspace } from "@/models/Workspace";
import { User } from "@/models/User";
import { EvidenceModeGrid } from "@/components/Onboarding/EvidenceModeGrid";
import { Types } from "mongoose";

interface EvidenceModePageProps {
  params: { slug: string };
}

export default async function EvidenceModePage({ params }: EvidenceModePageProps) {
  const { slug } = params;

  console.log(`[EVIDENCE_MODE] Loading page for slug: ${slug}`);

  const user = await getCurrentUser();
  if (!user) {
    console.log(`[EVIDENCE_MODE] No user, redirecting to login`);
    redirect("/auth/login");
  }

  console.log(`[EVIDENCE_MODE] User found: ${user.id}`);

  await connectDB();
  console.log(`[EVIDENCE_MODE] Database connected`);

  const fullUser = await User.findById(user.id).exec();
  if (!fullUser) {
    console.log(`[EVIDENCE_MODE] Full user not found, logging out`);
    redirect("/auth/logout");
  }

  console.log(`[EVIDENCE_MODE] Full user: ${fullUser._id}`);
  console.log(`[EVIDENCE_MODE] User onboardingStatus: ${fullUser.onboardingStatus}`);

  const ownerUserId = new Types.ObjectId(fullUser._id);
  
  console.log(`[EVIDENCE_MODE] Looking for workspace with slug: ${slug}, owner: ${ownerUserId}`);
  
  const workspace = await BrandWorkspace.findOne({
    slug,
    ownerUserId,
  }).lean();

  console.log(`[EVIDENCE_MODE] Workspace found:`, workspace);

  if (!workspace) {
    console.log(`[EVIDENCE_MODE] Workspace not found, redirecting to select-brand`);
    redirect("/onboarding/select-brand");
  }

  console.log(`[EVIDENCE_MODE] Rendering evidence mode for workspace: ${workspace.name}`);

  return (
    <main className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-[rgb(var(--foreground))]">
            How should I learn about &ldquo;{workspace.name}&rdquo;?
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] max-w-lg">
            Choose one or more evidence sources. I&apos;ll analyze everything and build your 
            strategic Brand Brain from it.
          </p>
        </header>

        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 shadow-sm">
          <EvidenceModeGrid slug={slug} />
        </section>
      </div>
    </main>
  );
}