import { ReportScaffold } from "@/components/portal/report-scaffold";

export default function SalesReportPage() {
  return (
    <ReportScaffold
      title="تقرير المبيعات"
      description="أداء المبيعات عبر الفترات الزمنية"
      kpis={["إجمالي المبيعات", "عدد الطلبات", "متوسط قيمة الطلب", "الأكثر مبيعاً"]}
      columns={["المنتج", "الكمية المباعة", "الإيراد", "الفترة"]}
      note="سنضبط مصدر بيانات المبيعات معاً (رفع تقارير المنصة أو ربط مباشر) ثم تظهر هنا الأرقام والرسوم البيانية."
    />
  );
}
