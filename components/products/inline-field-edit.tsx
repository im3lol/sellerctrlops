"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateProductFieldAction } from "@/app/actions/products";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Inline-editable product field shown directly in the table (no need to open the product). */
export function InlineFieldEdit({
  productId,
  field,
  value,
  placeholder = "إضافة",
  multiline = false,
  mono = false,
  disabled = false,
}: {
  productId: string;
  field: "notes" | "amazonCode" | "internalNotes";
  value: string | null;
  placeholder?: string;
  multiline?: boolean;
  mono?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(value ?? "");
  const [pending, start] = useTransition();

  const display = (
    <span className={cn("block max-w-[180px] truncate text-sm", !value && "text-muted-foreground/60")} dir={mono ? "ltr" : undefined}>
      {value || placeholder}
    </span>
  );

  if (disabled) return display;

  const save = () =>
    start(async () => {
      try {
        await updateProductFieldAction(productId, field, val);
        toast.success("تم الحفظ");
        setOpen(false);
      } catch {
        toast.error("تعذّر الحفظ");
      }
    });

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setVal(value ?? ""); }}>
      <PopoverTrigger asChild>
        <button className="group flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-right hover:bg-accent/60">
          {display}
          <Pencil className="size-3 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-2">
        {multiline ? (
          <Textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} placeholder={placeholder} autoFocus />
        ) : (
          <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder} dir={mono ? "ltr" : undefined} autoFocus />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            حفظ
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
