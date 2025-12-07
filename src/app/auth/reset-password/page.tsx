import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";


export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive reset instructions"
      footerText="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/auth/login"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}