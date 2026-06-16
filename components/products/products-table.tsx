"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ExternalLink, CheckCircle2, Loader2, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ProductStatusSelect,
  ProductAssigneeSelect,
  type StatusOption,
  type AssigneeOption,
} from "@/components/products/inline-editors";
import { ProductThumb } from "@/components/products/product-thumb";
import { InlineFieldEdit } from "@/components/products/inline-field-edit";
import { ListingButton } from "@/components/products/listing-button";
import { publishProductAction } from "@/app/actions/products";
import { useRealtime } from "@/components/realtime/use-realtime";
import type { ProductRow } from "@/lib/queries/products";

export function ProductsTable({
  rows,
  statuses,
  assignees,
  canEdit,
  showWorkspace = false,
  showAssignee = true,
}: {
  rows: ProductRow[];
  statuses: StatusOption[];
  assignees: AssigneeOption[];
  canEdit: boolean;
  showWorkspace?: boolean;
  showAssignee?: boolean;
}) {
  const router = useRouter();

  // Live refresh when any product in a visible workspace changes (§15/§17).
  useRealtime((e) => {
    if (e.type === "product_updated") router.refresh();
  });

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-14 text-right">الصورة</TableHead>
            <TableHead className="text-right">المنتج</TableHead>
            <TableHead className="text-right">السعر</TableHead>
            {showWorkspace && <TableHead className="text-right">مساحة العمل</TableHead>}
            {/* open columns (app-owned, after the imported data) */}
            {showAssignee && <TableHead className="text-right">المسؤول</TableHead>}
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">ملاحظات</TableHead>
            <TableHead className="text-right">كود المنصة</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.id} className="group">
              <TableCell>
                <ProductThumb src={p.imageUrl} name={p.name} />
              </TableCell>
              <TableCell className="max-w-[240px]">
                <div className="flex items-center gap-1.5">
                  <Link href={`/products/${p.id}`} className="truncate font-medium hover:text-primary">
                    {p.name}
                  </Link>
                  {p.isDraft && (
                    <Badge variant="outline" className="shrink-0 gap-1 border-amber-300 bg-amber-50 text-amber-700">
                      <EyeOff className="size-3" />
                      مسودة
                    </Badge>
                  )}
                  {p.productUrl && (
                    <a
                      href={p.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="رابط المنتج على الموقع"
                      className="shrink-0 text-muted-foreground hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="tabular-nums text-sm" dir="ltr">
                {p.price ? `${p.price} ر.س` : "—"}
              </TableCell>
              {showWorkspace && (
                <TableCell className="text-sm text-muted-foreground">{p.workspaceName}</TableCell>
              )}
              {showAssignee && (
                <TableCell>
                  <ProductAssigneeSelect
                    productId={p.id}
                    assignedTo={p.assignedTo}
                    assignees={assignees}
                    disabled={!canEdit}
                  />
                </TableCell>
              )}
              <TableCell>
                <ProductStatusSelect
                  productId={p.id}
                  statusId={p.statusId}
                  statuses={statuses}
                  disabled={!canEdit}
                />
              </TableCell>
              <TableCell>
                <InlineFieldEdit productId={p.id} field="notes" value={p.notes} multiline placeholder="إضافة ملاحظة" disabled={!canEdit} />
              </TableCell>
              <TableCell>
                <InlineFieldEdit productId={p.id} field="amazonCode" value={p.amazonCode} mono placeholder="إضافة الكود" disabled={!canEdit} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-0.5">
                  {canEdit && p.isDraft && <PublishButton productId={p.id} />}
                  <ListingButton productId={p.id} variant="icon" />
                  <Link
                    href={`/products/${p.id}`}
                    title="فتح المنتج"
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">لا توجد منتجات</div>
      )}
    </div>
  );
}

/** Confirm a draft product → makes it visible to employees. */
function PublishButton({ productId }: { productId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title="تأكيد البيانات وإتاحة المنتج للموظفين"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await publishProductAction(productId);
          if (res.ok) toast.success("تم تأكيد المنتج وإتاحته للموظفين");
          else toast.error(res.error ?? "تعذّر التأكيد");
        })
      }
      className="grid size-8 place-items-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
    </button>
  );
}
