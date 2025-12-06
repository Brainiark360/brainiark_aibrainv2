// src/app/onboarding/[slug]/activate/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { BrandWorkspace } from "@/models/Workspace";

interface ActivatePageProps {
  params: { slug: string };
}

export default async function ActivatePage({ params }: ActivatePageProps) {
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

  return (
    <main className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-16">
        <section className="space-y-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-[rgb(var(--foreground))]">
            Your Brand Brain is ready.
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            You&apos;re all set to begin creating content and strategy with
            intelligence for “{workspace.name}”.
          </p>
          <div className="pt-4">
            <a
              href={`/workspace/${workspace.slug}`}
              className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--primary))] px-4 py-2 text-sm font-medium text-[rgb(var(--primary-foreground))] transition hover:opacity-90"
            >
              Go to Workspace
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
