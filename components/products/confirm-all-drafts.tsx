"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { publishWorkspaceReadyDraftsAction } from "@/app/actions/products";

/**
 * Confirms ALL ready drafts (name+image+price) in the workspace — beyond the
 * current page — so pagination doesn't limit bulk confirmation.
 */
export function ConfirmAllDrafts({ workspaceId, readyCount }: { workspaceId: string; readyCount: number }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  if (readyCount === 0) return null;

  return (
    <div className="mb-3 flex items-center justify-end">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await publishWorkspaceReadyDraftsAction(workspaceId);
            if (res.ok) {
              toast.success(
                res.published
                  ? `تم تأكيد ${res.published} منتج جاهز وإتاحتها للموظفين`
                  : "لا توجد مسودات جاهزة (اسم + صورة + سعر) للتأكيد",
              );
              router.refresh();
            } else {
              toast.error(res.error ?? "تعذّر التأكيد");
            }
          })
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
        تأكيد كل المسودات الجاهزة في هذه المساحة ({readyCount})
      </button>
    </div>
  );
}
