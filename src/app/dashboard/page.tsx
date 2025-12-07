import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { BrandCard } from '@/components/dashboard/BrandCard';
import { CreateBrandCard } from '@/components/dashboard/CreateBrandCard';
import { connectToDatabase } from '@/db/db-optimized';
import { BrandWorkspace } from '@/models/Workspace';
import OnboardingPrompt from '@/components/onboarding/OnboardingPrompt';
import { BrandBrain } from '@/models/BrandBrain';

export default async function DashboardPage() {
  const session = await verifySession();
  
  if (!session) {
    redirect('/auth/login');
  }

  await connectToDatabase();
  
  const brands = await BrandWorkspace.find({ 
    ownerUserId: session.userId 
  }).sort({ createdAt: -1 }).lean();

  // Check for incomplete onboarding
  const incompleteBrands = await Promise.all(
    brands.map(async (brand) => {
      const brandBrain = await BrandBrain.findOne({ 
        brandWorkspaceId: brand._id 
      }).lean();
      
      const completionScore = brandBrain?.status === 'ready' ? 100 : 
                             brandBrain?.status === 'in_progress' ? 50 : 0;
      
      return {
        brand,
        completionScore,
        needsOnboarding: brandBrain?.status !== 'ready',
      };
    })
  );

  // Find the first brand that needs onboarding
  const brandNeedingOnboarding = incompleteBrands.find(b => b.needsOnboarding);

  return (
    <DashboardLayout userName={session.userId.slice(0, 8)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onboarding Prompt */}
        {brandNeedingOnboarding && (
          <OnboardingPrompt 
            brandName={brandNeedingOnboarding.brand.name}
            brandSlug={brandNeedingOnboarding.brand.slug}
            completionScore={brandNeedingOnboarding.completionScore}
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="h1-os text-[rgb(var(--foreground))] mb-2">
            Your Brands
          </h1>
          <p className="body-os text-[rgb(var(--muted-foreground))]">
            Select a brand to continue or create a new one to get started
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => {
            const brandInfo = incompleteBrands.find(b => b.brand._id.toString() === brand._id.toString());
            return (
              <BrandCard
                key={brand._id.toString()}
                id={brand._id.toString()}
                name={brand.name}
                slug={brand.slug}
                createdAt={brand.createdAt}
                completionScore={brandInfo?.completionScore || 0}
              />
            );
          })}
          <CreateBrandCard />
        </div>

        {/* Empty State */}
        {brands.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgb(var(--secondary))] flex items-center justify-center">
              <svg className="w-8 h-8 text-[rgb(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="h3-os text-[rgb(var(--foreground))] mb-2">
              No brands yet
            </h3>
            <p className="body-os text-[rgb(var(--muted-foreground))] mb-6">
              Create your first brand to start building intelligent strategies
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}