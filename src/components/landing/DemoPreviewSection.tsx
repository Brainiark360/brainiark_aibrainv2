"use client"

import { motion } from 'framer-motion'
import { Play, CheckCircle } from 'lucide-react'
import { SignUpButton } from './AuthButtons'

export default function DemoPreviewSection() {
  return (
    <div id="demo" className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <span className="text-sm font-medium text-[rgb(var(--os-accent))] uppercase tracking-wider">
          Live Preview
        </span>
        <h2 className="h2-os mt-4 mb-6">
          Experience the OS.
          <br />
          No installation required.
        </h2>
        <p className="body-os max-w-2xl mx-auto mb-12">
          See Brainiark OS in action. This interactive demo shows how strategy, 
          AI flows, and brand intelligence work together in real-time.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative mb-12"
      >
        <div className="os-window max-w-4xl mx-auto">
          <div className="os-window-header">
            <div className="flex items-center gap-2">
              <div className="os-controls">
                <div className="os-control os-control-close" />
                <div className="os-control os-control-minimize" />
                <div className="os-control os-control-maximize" />
              </div>
              <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                Interactive Demo — Strategy Session
              </span>
            </div>
            <div className="text-xs text-[rgb(var(--muted-foreground))]">
              Live Preview Mode
            </div>
          </div>
          
          <div className="os-window-content h-[400px] canvas-grid flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[rgb(var(--os-accent))/0.1] border border-[rgb(var(--os-accent))/0.2] mb-6">
                <Play className="h-8 w-8 text-[rgb(var(--os-accent))]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Demo Ready</h3>
              <p className="text-[rgb(var(--muted-foreground))] mb-8 max-w-md">
                Click play to experience Brainiark OS in action. This demo showcases 
                real strategy mapping, AI conversations, and brand intelligence.
              </p>
              <button className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--os-accent))] text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity">
                <Play className="h-4 w-4 mr-2" />
                Launch Interactive Demo
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
        className="relative"
      >
        <div className="max-w-3xl mx-auto">
          <div className="os-window">
            <div className="os-window-content py-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                  Ready for production
                </span>
              </div>
              
              <h3 className="h3-os mb-4">Start strategizing today</h3>
              <p className="body-os max-w-2xl mx-auto mb-8">
                Brainiark OS is production-ready and trusted by marketing teams 
                worldwide. Create your account and experience the future of 
                marketing strategy.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SignUpButton size="lg" />
                <a
                  href="/auth/signin"
                  className="inline-flex items-center justify-center rounded-md border border-[rgb(var(--border))] px-8 py-3 text-sm font-medium hover:bg-[rgb(var(--accent))] transition-colors"
                >
                  Sign In to Your Account
                </a>
              </div>
              
              <div className="mt-8 pt-8 border-t border-[rgb(var(--border))]">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-[rgb(var(--os-accent))]">30K+</div>
                    <div className="text-sm text-[rgb(var(--muted-foreground))]">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-[rgb(var(--os-accent))]">99.9%</div>
                    <div className="text-sm text-[rgb(var(--muted-foreground))]">Uptime</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-[rgb(var(--os-accent))]">24/7</div>
                    <div className="text-sm text-[rgb(var(--muted-foreground))]">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}