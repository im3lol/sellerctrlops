import { Construction } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

/** Professional placeholder for a report whose data source isn't wired yet. */
export function ReportScaffold({
  title,
  description,
  kpis,
  columns,
  note,
}: {
  title: string;
  description: string;
  kpis: string[];
  columns: string[];
  note: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((label) => (
          <Card key={label} className="p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold text-muted-foreground/40">—</p>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col items-center gap-3 border-dashed py-10 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-secondary/40 text-amber-600">
          <Construction className="size-7" />
        </div>
        <div>
          <p className="font-semibold">هذا التقرير قيد الإعداد</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{note}</p>
        </div>
      </Card>

      <Card className="overflow-hidden p-0 opacity-60">
        <div className="border-b p-4 text-sm font-medium">معاينة بنية التقرير</div>
        <div className="grid gap-px bg-border" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))` }}>
          {columns.map((c) => (
            <div key={c} className="bg-muted/50 p-2.5 text-right text-xs font-medium">{c}</div>
          ))}
          {Array.from({ length: 3 }).flatMap((_, r) =>
            columns.map((c) => (
              <div key={`${r}-${c}`} className="bg-card p-2.5">
                <span className="inline-block h-3 w-16 rounded bg-muted" />
              </div>
            )),
          )}
        </div>
      </Card>
    </div>
  );
}
