"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthWindow from "@/components/auth/AuthWindow";
import AuthError from "@/components/auth/AuthError";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import { loginSchema, type LoginInput } from "@/lib/zod-schemas";

export default function LoginPage() {
  const router = useRouter();

  const [values, setValues] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = await res.json();

      if (!json.success) {
        setErrors({ form: json.error ?? "Login failed." });
        setLoading(false);
        return;
      }

      router.push(json.data.redirectTo);
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : "Network error. Please try again.",
      });
      setLoading(false);
    }
  };

  const allValid = Boolean(values.email && values.password);

  return (
    <AuthShell>
      <AuthWindow
        title="Welcome Back"
        subtitle="Log in to continue your journey."
      >
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {errors.form && <AuthError message={errors.form} />}

          <AuthInput
            name="email"
            label="Email"
            type="email"
            requiredLabel
            error={errors.email}
            value={values.email}
            onChange={(e) =>
              setValues((v) => ({ ...v, email: e.target.value }))
            }
            placeholder="john@example.com"
          />

          <AuthInput
            name="password"
            label="Password"
            type="password"
            requiredLabel
            error={errors.password}
            value={values.password}
            onChange={(e) =>
              setValues((v) => ({ ...v, password: e.target.value }))
            }
            placeholder="Your password"
          />

          <AuthButton loading={loading} disabled={!allValid || loading}>
            Continue
          </AuthButton>

          <div className="text-xs text-[rgb(var(--muted-foreground))] text-center">
            Don’t have an account?{" "}
            <Link href="/auth/register" className="hover:underline">
              Create one
            </Link>
          </div>
        </form>
      </AuthWindow>
    </AuthShell>
  );
}
