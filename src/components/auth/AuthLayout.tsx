'use client'

import Link from 'next/link';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[rgb(var(--background))]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))]" />
              <span className="h2-os text-[rgb(var(--foreground))]">
                Brainiark
              </span>
            </div>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="card-base p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="h2-os text-[rgb(var(--foreground))]">{title}</h1>
            <p className="body-os text-[rgb(var(--muted-foreground))]">
              {subtitle}
            </p>
          </div>

          {children}

          {/* Footer */}
          <div className="pt-6 border-t border-[rgb(var(--border))] text-center">
            <p className="caption-os text-[rgb(var(--muted-foreground))]">
              {footerText}{' '}
              <Link
                href={footerLinkHref}
                className="text-[rgb(var(--os-accent))] hover:underline"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="caption-os text-center mt-6 text-[rgb(var(--muted-foreground))]">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-[rgb(var(--os-accent))] hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[rgb(var(--os-accent))] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}