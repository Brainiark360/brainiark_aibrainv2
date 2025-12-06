// /app/(app)/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme/theme-provider"
import Sidebar from "@/components/dashboard/Sidebar"
import HomeHeader from "@/components/dashboard/DashboardHeader"
import PageTransition from "@/components/dashboard/PageTransition"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Brainiark OS",
  description: "Strategy-First Marketing Operating System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} theme-os bg-[rgb(var(--background))] text-[rgb(var(--foreground))] h-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen overflow-hidden">
            {/* Fixed Sidebar - Never scrolls */}
            <div className="fixed left-0 top-0 h-screen z-50">
              <Sidebar />
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-0 md:ml-20 lg:ml-64 transition-all duration-300">
              {/* Fixed Header - Full width */}
              <div className="fixed top-0 right-0 z-40 w-full">
                <div className="ml-0 md:ml-20 lg:ml-64">
                  <HomeHeader />
                </div>
              </div>
              
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
        </ThemeProvider>
      </body>
    </html>
  )
}