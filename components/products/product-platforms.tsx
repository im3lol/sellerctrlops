"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/products/status-badge";
import { createListingAction } from "@/app/actions/products";

const WS_TYPE: Record<string, string> = { amazon: "أمازون", noon: "نون", brand: "براند", other: "أخرى" };

type Listing = {
  id: string;
  workspaceId: string;
  workspaceName: string | null;
  workspaceType: string | null;
  amazonCode: string | null;
  isDraft: boolean;
  statusName: string | null;
  statusColor: string | null;
};

export function ProductPlatforms({
  productId,
  currentId,
  listings,
  addableWorkspaces,
}: {
  productId: string;
  currentId: string;
  listings: Listing[];
  addableWorkspaces: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [ws, setWs] = useState("");

  const used = new Set(listings.map((l) => l.workspaceId));
  const options = addableWorkspaces.filter((w) => !used.has(w.id));

  const add = () => {
    if (!ws) return;
    start(async () => {
      const res = await createListingAction(productId, ws);
      if (res.ok) {
        toast.success("تم نشر المنتج على المنصة الجديدة");
        setWs("");
        router.refresh();
      } else toast.error(res.error ?? "تعذّر النشر");
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Store className="size-4 text-primary" />
        <h2 className="font-semibold">المنصات</h2>
        <span className="text-xs text-muted-foreground">({listings.length})</span>
      </div>

      <div className="divide-y rounded-xl border">
        {listings.map((l) => {
          const isCurrent = l.id === currentId;
          return (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div className="flex items-center gap-2">
                {isCurrent ? (
                  <span className="font-medium">{l.workspaceName}</span>
                ) : (
                  <Link href={`/products/${l.id}`} className="font-medium hover:text-primary">{l.workspaceName}</Link>
                )}
                {l.workspaceType && <Badge variant="outline" className="text-[10px]">{WS_TYPE[l.workspaceType] ?? l.workspaceType}</Badge>}
                {isCurrent && <Badge variant="secondary" className="text-[10px]">الحالية</Badge>}
                {l.isDraft && <Badge variant="outline" className="border-amber-300 text-amber-700 text-[10px]">مسودة</Badge>}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground" dir="ltr">{l.amazonCode ?? "—"}</span>
                <StatusBadge name={l.statusName} color={l.statusColor} />
              </div>
            </div>
          );
        })}
      </div>

      {options.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={ws}
            onChange={(e) => setWs(e.target.value)}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">انشر على منصة أخرى…</option>
            {options.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <Button onClick={add} disabled={!ws || pending} size="sm">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            نشر
          </Button>
        </div>
      )}
    </div>
  );
}
