import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function PartnerLoginPage() {
  return (
    <AuthShell
      heading="بوابتك لمتابعة عملك… بكل احترافية"
      text="من مكان واحد تابع تقدّم العمل على منتجاتك ونتائجه أولاً بأول — بشفافية كاملة وفي أي وقت."
      points={[
        "متابعة حالة كل منتج لحظياً (جديد · قيد العمل · مكتمل)",
        "تقارير ونِسب إنجاز واضحة لكل متجر",
        "بياناتك ومنتجاتك منظّمة وآمنة في مكان واحد",
        "شفافية كاملة في سير العمل دون أي تعقيد",
      ]}
    >
      <LoginForm
        callbackUrl="/portal"
        title="بوابة الشركاء"
        subtitle="تابع تقدّم العمل على متجرك ومنتجاتك"
        welcome="🤝 أهلاً بشركائنا — سعداء بالعمل معك. سجّل الدخول لمتابعة منتجاتك ونتائجك لحظياً."
      />
    </AuthShell>
  );
}
