// src/components/onboarding/BrandWorkspaceSelector.tsx
"use client";

import type { BrandWorkspaceSummary } from "@/types/brand";
import { BrandWorkspaceCard } from "./BrandWorkspaceCard";
import { NewBrandCard } from "./CreateBrandCard";

interface BrandWorkspaceSelectorProps {
  workspaces: BrandWorkspaceSummary[];
}

export const BrandWorkspaceSelector: React.FC<BrandWorkspaceSelectorProps> = ({
  workspaces,
}) => {
  const hasBrands = workspaces.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
          Choose a brand workspace
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
          Select an existing brand or create a new one to begin onboarding.
        </p>
      </div>

      {hasBrands ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {workspaces.map((w) => (
            <BrandWorkspaceCard key={w.slug} name={w.name} slug={w.slug} />
          ))}
          <NewBrandCard />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            You don&apos;t have any brand workspaces yet. Let&apos;s create your
            first one.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <NewBrandCard />
          </div>
        </div>
      )}

      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        Trusted by marketers, founders, and creators globally.
      </p>
    </div>
  );
};
