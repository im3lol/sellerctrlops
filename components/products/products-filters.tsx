"use client";

import { useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StatusOption, AssigneeOption } from "@/components/products/inline-editors";

export function ProductsFilters({
  statuses,
  assignees,
  showDraftFilter = false,
}: {
  statuses: StatusOption[];
  assignees: AssigneeOption[];
  showDraftFilter?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    next.delete("page"); // any filter change returns to page 1
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو SKU أو ASIN…"
          defaultValue={params.get("search") ?? ""}
          className="pr-9"
          onChange={(e) => {
            const v = e.target.value;
            if (searchTimer.current) clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => setParam("search", v), 350);
          }}
        />
      </div>

      {showDraftFilter && (
        <Select
          defaultValue={params.get("view") ?? "all"}
          onValueChange={(v) => setParam("view", v)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="العرض" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="drafts">المسودات فقط</SelectItem>
            <SelectItem value="ready">الجاهزة فقط</SelectItem>
            <SelectItem value="published">المنشورة فقط</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Select
        defaultValue={params.get("statusId") ?? "all"}
        onValueChange={(v) => setParam("statusId", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="كل الحالات" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الحالات</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={params.get("assignedTo") ?? "all"}
        onValueChange={(v) => setParam("assignedTo", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="كل المسؤولين" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل المسؤولين</SelectItem>
          <SelectItem value="unassigned">غير معيّن</SelectItem>
          {assignees.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
