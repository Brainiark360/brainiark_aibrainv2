'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError('Network error. Please check your connection and try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <p className="text-xs text-red-500 dark:text-red-300 mt-1">
            Please check your details and try again.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <AuthInput
          label="First name"
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="John"
          required
          autoComplete="given-name"
          disabled={isLoading}
        />

        <AuthInput
          label="Last name"
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Doe"
          required
          autoComplete="family-name"
          disabled={isLoading}
        />
      </div>

      <AuthInput
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="you@company.com"
        required
        autoComplete="email"
        disabled={isLoading}
      />

      <AuthInput
        label="Phone (optional)"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="+1 (555) 123-4567"
        autoComplete="tel"
        disabled={isLoading}
      />

      <AuthInput
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        required
        autoComplete="new-password"
        disabled={isLoading}
      />

      <div className="space-y-2">
        <p className="caption-os text-[rgb(var(--muted-foreground))]">
          Password must be at least 8 characters long
        </p>
      </div>

      <AuthButton type="submit" isLoading={isLoading}>
        Create account
      </AuthButton>
    </form>
  );
}