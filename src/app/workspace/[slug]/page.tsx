// src/app/workspace/[slug]/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { BrandWorkspace } from "@/models/Workspace";
import { BrandBrain } from "@/models/BrandBrain";

interface WorkspacePageProps {
  params: { slug: string };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

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
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[rgb(var(--foreground))]">
              {workspace.name}
            </h1>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Strategy-first workspace · /workspace/{workspace.slug}
            </p>
          </div>
          {/* TODO: BrandSwitcher component */}
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[rgb(var(--foreground))]">
                Brand Summary
              </h2>
              <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                {brain?.summary || "Once we complete onboarding, this will show your brand summary."}
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">
                Next steps
              </h3>
              <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                Complete onboarding to unlock the full strategy, calendar, and content
                modules for this brand.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
