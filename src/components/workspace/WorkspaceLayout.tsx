'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';
import DashboardHeader from './WorkspaceHeader';
import OnboardingModal from '../onboarding/OnboardingModal';

interface WorkspaceLayoutProps {
  children: ReactNode;
  brandName: string;
  brandSlug: string;
  userId: string;
  userName?: string;
  showOnboarding?: boolean;
}

export function WorkspaceLayout({
  children,
  brandName,
  brandSlug,
  userId,
  userName = "User",
  showOnboarding = false,
}: WorkspaceLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  const handleNavigateToSettings = () => {
    router.push(`/workspace/${brandSlug}/settings`);
  };

  const handleNavigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Fixed Sidebar */}
        <Sidebar brandName={brandName} brandSlug={brandSlug} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col ml-0 md:ml-20 lg:ml-64 transition-all duration-300">
          {/* Fixed Header - Now properly positioned */}
          <DashboardHeader 
            userName={userName}
            brandName={brandName}
            onLogout={handleLogout}
            onSettings={handleNavigateToSettings}
            onDashboard={handleNavigateToDashboard}
          />
          
          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto mt-16">
            <PageTransition>
              <div className="max-w-7xl mx-auto px-6 py-8">
                {children}
              </div>
            </PageTransition>
          </main>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          brandName={brandName}
          brandSlug={brandSlug}
          onComplete={() => {
            // Handle onboarding completion
            console.log('Onboarding completed');
          }}
        />
      )}
    </>
  );
}