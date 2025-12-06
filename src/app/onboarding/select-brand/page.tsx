// src/app/onboarding/select-brand/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { BrandWorkspace } from "@/models/Workspace";
import { User } from "@/models/User";
import type { BrandWorkspaceSummary } from "@/types/brand";
import { BrandWorkspaceSelector } from "@/components/Onboarding/BrandWorkspaceSelector";
import { Types } from "mongoose";

export default async function SelectBrandPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  await connectDB();

  const fullUser = await User.findById(user.id).exec();
  if (!fullUser) {
    redirect("/auth/logout");
  }

  const ownerUserId = new Types.ObjectId(fullUser._id);
  
  const workspaces = await BrandWorkspace.find({ ownerUserId })
    .select({ name: 1, slug: 1 })
    .sort({ createdAt: 1 })
    .lean()
    .exec();

  const summaries: BrandWorkspaceSummary[] = workspaces.map((w) => ({
    name: w.name,
    slug: w.slug,
  }));

  // REMOVED: Automatic redirect to evidence-mode
  // Let the user manually select or create a brand

  return (
    <main className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
            Welcome back.
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Let&apos;s plug you into a brand workspace.
          </p>
        </header>

        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm">
          <BrandWorkspaceSelector workspaces={summaries} />
        </section>
      </div>
    </main>
  );
}