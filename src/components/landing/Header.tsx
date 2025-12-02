"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import AuthButton, { SignUpButton } from './AuthButtons'
import { ThemeToggle } from '../theme/theme-toggle'


const navigation = [
  { name: 'Product', href: '#product' },
  { name: 'Strategy', href: '#strategy' },
  { name: 'AI Flow', href: '#ai-flow' },
  { name: 'Brand Brain', href: '#brand-brain' },
  { name: 'Features', href: '#features' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[rgb(var(--os-border))] bg-[rgb(var(--os-surface))/0.8] backdrop-blur-sm">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent))/0.7]" />
              <span className="text-xl font-semibold tracking-tight">Brainiark</span>
              <span className="text-sm text-[rgb(var(--muted-foreground))] font-medium">OS</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3">
              <AuthButton variant="ghost" />
              <SignUpButton />
            </div>
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[rgb(var(--os-surface))] px-6 py-6"
            >
              <div className="flex items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent))/0.7]" />
                  <span className="text-xl font-semibold tracking-tight">Brainiark</span>
                  <span className="text-sm text-[rgb(var(--muted-foreground))] font-medium">OS</span>
                </a>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-12 flow-root">
                <div className="-my-6 divide-y divide-[rgb(var(--border))]">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--accent-foreground))] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="py-6 space-y-3">
                    <a
                      href="/auth/signin"
                      className="block w-full text-center rounded-md border border-[rgb(var(--border))] px-4 py-3 text-sm font-medium hover:bg-[rgb(var(--accent))] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </a>
                    <a
                      href="/auth/signup"
                      className="block w-full text-center rounded-md bg-[rgb(var(--foreground))] text-[rgb(var(--background))] px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Account
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}