import { and, eq, inArray, desc } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { products, productStatuses, workspaces } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { PartnerProductsTable } from "@/components/portal/partner-products-table";

export default async function PortalProductsPage() {
  const user = await requireUser();

  const myWorkspaces = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(and(eq(workspaces.clientUserId, user.id), eq(workspaces.isArchived, false)));
  const wsIds = myWorkspaces.map((w) => w.id);

  const rows = wsIds.length
    ? await db
        .select({
          id: products.id,
          sku: products.sku,
          name: products.name,
          brand: products.brand,
          price: products.price,
          imageUrl: products.imageUrl,
          amazonCode: products.amazonCode,
          notes: products.notes,
          statusName: productStatuses.name,
          statusColor: productStatuses.color,
          workspaceName: workspaces.name,
        })
        .from(products)
        .leftJoin(productStatuses, eq(products.statusId, productStatuses.id))
        .leftJoin(workspaces, eq(products.workspaceId, workspaces.id))
        .where(and(inArray(products.workspaceId, wsIds), eq(products.isDraft, false)))
        .orderBy(desc(products.updatedAt))
        .limit(500)
    : [];

  return (
    <div>
      <PageHeader title="المنتجات" description={`${rows.length} منتج عبر متاجرك`} />
      {rows.length === 0 ? (
        <EmptyState icon="Package" title="لا توجد منتجات" description="لم تُضف منتجات لمتاجرك بعد." />
      ) : (
        <PartnerProductsTable rows={rows} showWorkspace />
      )}
    </div>
  );
}
