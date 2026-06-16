import Link from "next/link";
import { and, eq, inArray, sql } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { products, productStatuses, workspaces } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { StatusDonut } from "@/components/charts/status-donut";
import { Icon } from "@/components/icon";

const REPORTS = [
  { href: "/portal/reports/inventory", title: "تقرير المخزون", desc: "حالة منتجاتك وتوزيعها", icon: "Boxes", tone: "bg-primary/10 text-primary" },
  { href: "/portal/reports/sales", title: "تقرير المبيعات", desc: "أداء المبيعات عبر الفترات", icon: "TrendingUp", tone: "bg-success/10 text-success" },
  { href: "/portal/reports/returns", title: "تقرير المرتجعات", desc: "نسب وأسباب المرتجعات", icon: "Undo2", tone: "bg-destructive/10 text-destructive" },
];

export default async function PortalReportsPage() {
  const user = await requireUser();
  const myWorkspaces = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(and(eq(workspaces.clientUserId, user.id), eq(workspaces.isArchived, false)));
  const wsIds = myWorkspaces.map((w) => w.id);

  const [[{ total }], [{ done }], dist] = wsIds.length
    ? await Promise.all([
        db.select({ total: sql<number>`count(*)::int` }).from(products).where(and(inArray(products.workspaceId, wsIds), eq(products.isDraft, false))),
        db
          .select({ done: sql<number>`count(*)::int` })
          .from(products)
          .innerJoin(productStatuses, eq(products.statusId, productStatuses.id))
          .where(and(inArray(products.workspaceId, wsIds), eq(products.isDraft, false), eq(productStatuses.isTerminal, true))),
        db
          .select({ name: productStatuses.name, color: productStatuses.color, value: sql<number>`count(${products.id})::int` })
          .from(products)
          .innerJoin(productStatuses, eq(products.statusId, productStatuses.id))
          .where(and(inArray(products.workspaceId, wsIds), eq(products.isDraft, false)))
          .groupBy(productStatuses.name, productStatuses.color, productStatuses.sortOrder)
          .orderBy(productStatuses.sortOrder),
      ])
    : [[{ total: 0 }], [{ done: 0 }], [] as { name: string; color: string; value: number }[]];

  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="تقارير وإحصائيات" description="نظرة شاملة على أداء منتجاتك ومتاجرك" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="إجمالي المنتجات" value={total} icon="Package" tone="blue" />
        <StatCard label="مكتملة" value={done} icon="CheckCircle2" tone="green" />
        <StatCard label="نسبة الإنجاز" value={`${rate}%`} icon="TrendingUp" tone="yellow" />
        <StatCard label="متاجرك" value={myWorkspaces.length} icon="Briefcase" tone="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-1">
          {REPORTS.map((r) => (
            <Link key={r.href} href={r.href}>
              <Card className="flex flex-row items-center gap-4 p-5 transition-shadow hover:shadow-md">
                <div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${r.tone}`}>
                  <Icon name={r.icon} className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{r.desc}</p>
                </div>
                <ChevronLeft className="size-5 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold">توزيع المنتجات حسب الحالة</h2>
          <StatusDonut data={dist} />
        </Card>
      </div>
    </div>
  );
}
