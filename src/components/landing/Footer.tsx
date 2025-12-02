import { Brain, Github, Twitter, Linkedin } from 'lucide-react'
import { SignUpButton } from './AuthButtons'

export default function Footer() {
  return (
    <footer className="border-t border-[rgb(var(--border))] bg-[rgb(var(--os-surface))]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent))/0.7]" />
              <div>
                <div className="text-xl font-semibold tracking-tight">Brainiark</div>
                <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium">OS</div>
              </div>
            </div>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6">
              The AI-native Marketing Operating System for strategic thinkers.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Features</a></li>
              <li><a href="#strategy" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Strategy Canvas</a></li>
              <li><a href="#ai-flow" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">AI Flow Engine</a></li>
              <li><a href="#brand-brain" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Brand Brain</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/docs" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Documentation</a></li>
              <li><a href="/guides" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Guides</a></li>
              <li><a href="/api" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">API</a></li>
              <li><a href="/changelog" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Changelog</a></li>
            </ul>
          </div>

          {/* Auth CTA */}
          <div>
            <h3 className="font-semibold mb-4">Ready to strategize?</h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6">
              Join thousands of marketers transforming their workflow with Brainiark OS.
            </p>
            <div className="space-y-3">
              <SignUpButton className="w-full" />
              <a
                href="/auth/signin"
                className="block w-full text-center rounded-md border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium hover:bg-[rgb(var(--accent))] transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[rgb(var(--border))]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              © {new Date().getFullYear()} Brainiark OS. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-[rgb(var(--muted-foreground))]">
              <a href="/privacy" className="hover:text-[rgb(var(--foreground))]">Privacy</a>
              <a href="/terms" className="hover:text-[rgb(var(--foreground))]">Terms</a>
              <a href="/cookies" className="hover:text-[rgb(var(--foreground))]">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}