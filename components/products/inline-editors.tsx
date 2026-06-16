"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setProductStatusAction, assignProductAction } from "@/app/actions/products";
import { StatusBadge } from "@/components/products/status-badge";

export type StatusOption = { id: string; name: string; color: string };
export type AssigneeOption = { id: string; name: string; avatarUrl: string | null };

/**
 * Native <select> editors — reliably open on a single click in dense tables
 * (no popup/pointer quirks), optimistic so the value updates instantly and only
 * reverts if the server rejects.
 */
export function ProductStatusSelect({
  productId,
  statusId,
  statuses,
  disabled,
}: {
  productId: string;
  statusId: string | null;
  statuses: StatusOption[];
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const [value, setValue] = useState<string | null>(statusId);
  useEffect(() => setValue(statusId), [statusId]);
  const current = statuses.find((s) => s.id === value);

  if (disabled) return <StatusBadge name={current?.name ?? null} color={current?.color ?? null} />;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: current?.color ?? "#94a3b8" }} />
      <select
        value={value ?? ""}
        disabled={pending}
        aria-label="الحالة"
        onChange={(e) => {
          const v = e.target.value;
          const prev = value;
          setValue(v);
          start(async () => {
            try {
              await setProductStatusAction(productId, v);
              router.refresh();
            } catch {
              setValue(prev);
              toast.error("تعذّر تحديث الحالة");
            }
          });
        }}
        className="cursor-pointer rounded-lg border bg-background px-2 py-1 text-sm font-medium outline-none hover:bg-accent focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
      >
        {!current && <option value="">اختر الحالة</option>}
        {statuses.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ProductAssigneeSelect({
  productId,
  assignedTo,
  assignees,
  disabled,
}: {
  productId: string;
  assignedTo: string | null;
  assignees: AssigneeOption[];
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const [value, setValue] = useState<string | null>(assignedTo);
  useEffect(() => setValue(assignedTo), [assignedTo]);
  const current = assignees.find((a) => a.id === value);

  if (disabled) {
    return <span className="text-sm">{current?.name ?? "غير معيّن"}</span>;
  }

  return (
    <select
      value={value ?? "none"}
      disabled={pending}
      aria-label="المسؤول"
      onChange={(e) => {
        const v = e.target.value;
        const prev = value;
        setValue(v === "none" ? null : v);
        start(async () => {
          try {
            await assignProductAction(productId, v === "none" ? null : v);
            router.refresh();
          } catch {
            setValue(prev);
            toast.error("تعذّر التعيين");
          }
        });
      }}
      className="cursor-pointer rounded-lg border bg-background px-2 py-1 text-sm outline-none hover:bg-accent focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
    >
      <option value="none">غير معيّن</option>
      {assignees.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
