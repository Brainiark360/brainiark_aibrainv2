import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";


export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building intelligent brand strategies"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/auth/login"
    >
      <RegisterForm />
    </AuthLayout>
  );
}