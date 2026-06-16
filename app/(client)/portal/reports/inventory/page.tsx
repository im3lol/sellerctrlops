import { and, eq, inArray, sql } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { products, productStatuses, workspaces } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/products/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";

export default async function InventoryReportPage() {
  const user = await requireUser();
  const myWorkspaces = await db
    .select({ id: workspaces.id, name: workspaces.name })
    .from(workspaces)
    .where(and(eq(workspaces.clientUserId, user.id), eq(workspaces.isArchived, false)));
  const wsIds = myWorkspaces.map((w) => w.id);

  if (wsIds.length === 0) {
    return (
      <div>
        <PageHeader title="تقرير المخزون" description="حالة منتجاتك وتوزيعها" />
        <EmptyState icon="Boxes" title="لا توجد بيانات" description="لم تُربط متاجر بحسابك بعد." />
      </div>
    );
  }

  const [byStatus, byWorkspace, [{ total }]] = await Promise.all([
    db
      .select({ name: productStatuses.name, color: productStatuses.color, count: sql<number>`count(*)::int` })
      .from(products)
      .innerJoin(productStatuses, eq(products.statusId, productStatuses.id))
      .where(and(inArray(products.workspaceId, wsIds), eq(products.isDraft, false)))
      .groupBy(productStatuses.name, productStatuses.color, productStatuses.sortOrder)
      .orderBy(productStatuses.sortOrder),
    db
      .select({
        name: workspaces.name,
        total: sql<number>`count(*)::int`,
        done: sql<number>`count(*) filter (where ${productStatuses.isTerminal})::int`,
      })
      .from(products)
      .leftJoin(productStatuses, eq(products.statusId, productStatuses.id))
      .leftJoin(workspaces, eq(products.workspaceId, workspaces.id))
      .where(and(inArray(products.workspaceId, wsIds), eq(products.isDraft, false)))
      .groupBy(workspaces.name),
    db.select({ total: sql<number>`count(*)::int` }).from(products).where(and(inArray(products.workspaceId, wsIds), eq(products.isDraft, false))),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="تقرير المخزون" description="حالة منتجاتك وتوزيعها عبر المتاجر" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="إجمالي المنتجات" value={total} icon="Boxes" tone="blue" />
        {byStatus.slice(0, 3).map((s) => (
          <StatCard key={s.name} label={s.name} value={s.count} icon="Package" tone="slate" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">حسب الحالة</h2>
          <div className="space-y-3">
            {byStatus.map((s) => {
              const pct = total ? Math.round((s.count / total) * 100) : 0;
              return (
                <div key={s.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <StatusBadge name={s.name} color={s.color} />
                    <span className="tabular-nums text-muted-foreground">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: s.color ?? "#0A33D1" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b p-5">
            <h2 className="font-semibold">حسب المتجر</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right">المتجر</TableHead>
                <TableHead className="text-right">المنتجات</TableHead>
                <TableHead className="text-right">مكتمل</TableHead>
                <TableHead className="text-right">نسبة الإنجاز</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byWorkspace.map((w) => {
                const pct = w.total ? Math.round((w.done / w.total) * 100) : 0;
                return (
                  <TableRow key={w.name}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell className="tabular-nums">{w.total}</TableCell>
                    <TableCell className="tabular-nums">{w.done}</TableCell>
                    <TableCell className="tabular-nums">{pct}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
