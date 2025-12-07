'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to send reset email');
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="h3-os text-[rgb(var(--foreground))]">Check your email</h3>
        <p className="body-os text-[rgb(var(--muted-foreground))]">
          We've sent password reset instructions to {email}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      <div className="space-y-2">
        <p className="body-os text-[rgb(var(--muted-foreground))]">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <AuthInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        required
        autoComplete="email"
      />

      <AuthButton type="submit" isLoading={isLoading}>
        Send reset instructions
      </AuthButton>
    </form>
  );
}