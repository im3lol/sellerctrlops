"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { publishProductAction } from "@/app/actions/products";

/**
 * Shown on a draft (incomplete-data) product for reviewers. Confirms the data
 * and makes the product visible to employees.
 */
export function DraftConfirmBanner({ productId }: { productId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <EyeOff className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-900">مسودة — بيانات ناقصة</p>
          <p className="text-xs text-amber-700">
            هذا المنتج مخفي عن الموظفين. أكمل البيانات المطلوبة ثم اضغط «تأكيد وإتاحة» ليظهر للموظف المسؤول.
          </p>
        </div>
      </div>
      <Button
        className="shrink-0 bg-amber-600 hover:bg-amber-700"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await publishProductAction(productId);
            if (res.ok) {
              toast.success("تم تأكيد المنتج وإتاحته للموظفين");
              router.refresh();
            } else {
              toast.error(res.error ?? "تعذّر التأكيد");
            }
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        تأكيد وإتاحة للموظفين
      </Button>
    </div>
  );
}
