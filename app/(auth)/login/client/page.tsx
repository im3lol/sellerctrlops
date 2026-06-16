import { LoginForm } from "@/components/auth/login-form";

export default function ClientLoginPage() {
  return (
    <LoginForm
      callbackUrl="/portal"
      title="دخول العملاء"
      subtitle="تابع تقدّم العمل على متجرك ومنتجاتك"
    />
  );
}
