import { ReportScaffold } from "@/components/portal/report-scaffold";

export default function ReturnsReportPage() {
  return (
    <ReportScaffold
      title="تقرير المرتجعات"
      description="نسب وأسباب المرتجعات عبر منتجاتك"
      kpis={["إجمالي المرتجعات", "نسبة الإرجاع", "أعلى منتج إرجاعاً", "أهم سبب"]}
      columns={["المنتج", "عدد المرتجعات", "نسبة الإرجاع", "السبب الأبرز"]}
      note="سنضبط مصدر بيانات المرتجعات معاً (رفع تقارير المنصة أو ربط مباشر) ثم تظهر هنا الأرقام والتحليلات."
    />
  );
}
