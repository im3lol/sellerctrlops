"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Opt = { id: string; name: string };
export type ProductFormValues = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  features: string | null;
  sizes: string | null;
  price: string | null;
  imageUrl: string | null;
  galleryUrl: string | null;
  productUrl: string | null;
  statusId: string | null;
  assignedTo: string | null;
};

export function ProductFormDialog({
  mode,
  product,
  workspaceId,
  workspaces,
  statuses,
  assignees,
}: {
  mode: "create" | "edit";
  product?: ProductFormValues;
  workspaceId?: string;
  workspaces?: Opt[];
  statuses: { id: string; name: string }[];
  assignees: Opt[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const action = mode === "create" ? createProductAction : updateProductAction;
  const [state, formAction] = useActionState<ProductFormState, FormData>(action, {});
  const p = product;

  useEffect(() => {
    if (state.ok) {
      toast.success(mode === "create" ? "تم إضافة المنتج" : "تم حفظ التعديلات");
      setOpen(false);
      router.refresh();
    } else if (state.error) toast.error(state.error);
  }, [state, mode, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button><Plus className="size-4" />إضافة منتج</Button>
        ) : (
          <Button variant="outline"><Pencil className="size-4" />تعديل المنتج</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "إضافة منتج" : "تعديل المنتج"}</DialogTitle>
          </DialogHeader>

          {mode === "edit" && <input type="hidden" name="productId" value={p!.id} />}
          {mode === "create" && workspaceId && <input type="hidden" name="workspaceId" value={workspaceId} />}

          {mode === "create" && !workspaceId && workspaces && (
            <div className="space-y-2">
              <Label>مساحة العمل</Label>
              <Select name="workspaceId" required>
                <SelectTrigger><SelectValue placeholder="اختر مساحة العمل" /></SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pf-name">اسم المنتج *</Label>
            <Input id="pf-name" name="name" defaultValue={p?.name ?? ""} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf-price">السعر</Label>
              <Input id="pf-price" name="price" defaultValue={p?.price ?? ""} dir="ltr" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-size">المقاسات</Label>
              <Input id="pf-size" name="sizes" defaultValue={p?.sizes ?? ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-img">لينك صورة العرض</Label>
            <Input id="pf-img" name="imageUrl" defaultValue={p?.imageUrl ?? ""} dir="ltr" placeholder="https://…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf-purl">لينك المنتج على الموقع</Label>
              <Input id="pf-purl" name="productUrl" defaultValue={p?.productUrl ?? ""} dir="ltr" placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-gurl">صور المنتج (درايف)</Label>
              <Input id="pf-gurl" name="galleryUrl" defaultValue={p?.galleryUrl ?? ""} dir="ltr" placeholder="https://…" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-desc">وصف المنتج</Label>
            <Textarea id="pf-desc" name="description" defaultValue={p?.description ?? ""} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-feat">مميزات المنتج / المواصفات</Label>
            <Textarea id="pf-feat" name="features" defaultValue={p?.features ?? ""} rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select name="statusId" defaultValue={p?.statusId ?? ""}>
                <SelectTrigger><SelectValue placeholder="الافتراضية" /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المسؤول</Label>
              <Select name="assignedTo" defaultValue={p?.assignedTo ?? ""}>
                <SelectTrigger><SelectValue placeholder="غير معيّن" /></SelectTrigger>
                <SelectContent>
                  {assignees.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Submit mode={mode} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Submit({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {mode === "create" ? "إضافة" : "حفظ"}
    </Button>
  );
}
