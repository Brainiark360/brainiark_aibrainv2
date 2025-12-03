import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme/theme-provider'
import AuthShell from '@/components/auth/AuthShell'

export const metadata: Metadata = {
  title: 'Brainiark OS — Authentication',
  description: 'Sign in to your Brainiark OS workspace',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthShell>
        {children}
      </AuthShell>
    </ThemeProvider>
  )
}