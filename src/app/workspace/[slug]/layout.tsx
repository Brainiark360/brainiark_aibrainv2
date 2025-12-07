// /app/workspace/[slug]/layout.tsx - FINAL FIXED VERSION
import { ReactNode } from 'react';
import { verifySession } from '@/lib/auth/session';
import { connectToDatabase } from '@/db/db';
import { BrandWorkspace } from '@/models/Workspace';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/workspace/Sidebar';
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader';

interface WorkspaceLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function WorkspaceLayout({ 
  children, 
  params 
}: WorkspaceLayoutProps) {
  // Auth check
  const session = await verifySession();
  if (!session) {
    redirect('/auth/login');
  }

  // Database connection
  await connectToDatabase();
  const { slug } = await params;

  // Fetch workspace data
  const brand = await BrandWorkspace.findOne({ 
    slug,
    ownerUserId: session.userId 
  });

  if (!brand) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Fixed Sidebar - HIGHER Z-INDEX, FULL HEIGHT */}
      <div className="fixed left-0 top-0 bottom-0 z-50 w-20 lg:w-64">
        <Sidebar 
          brandName={brand.name}
          brandSlug={brand.slug}
        />
      </div>

      {/* Fixed Header - OFFSET BY SIDEBAR WIDTH, LOWER Z-INDEX */}
      <div className="fixed left-20 lg:left-64 top-0 right-0 z-40">
        <WorkspaceHeader
          brandName={brand.name}
          brandSlug={brand.slug}
          userId={session.userId}
          userName={session.userId.slice(0, 8)}
        />
      </div>

      {/* Main Content Area - OFFSET BY BOTH HEADER & SIDEBAR */}
      <div className="pl-20 lg:pl-64 pt-16 min-h-screen">
        <main className="h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}