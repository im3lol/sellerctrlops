"use client";

import { useState } from "react";
import { Sparkles, Copy, Download, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Opens a dialog with an AI-ready Markdown prompt+data for the product's listing.
 * `variant="icon"` is used in the table; `variant="full"` on the detail page.
 */
export function ListingButton({ productId, variant = "icon" }: { productId: string; variant?: "icon" | "full" }) {
  const [open, setOpen] = useState(false);
  const [md, setMd] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async (o: boolean) => {
    setOpen(o);
    if (o && !md) {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}/listing`);
        setMd(await res.text());
      } catch {
        toast.error("تعذّر توليد المحتوى");
      } finally {
        setLoading(false);
      }
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success("تم النسخ — الصقه في أي منصة ذكاء اصطناعي");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={load}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <button
            title="توليد وصف بالذكاء الاصطناعي"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-primary"
          >
            <Sparkles className="size-4" />
          </button>
        ) : (
          <Button variant="outline">
            <Sparkles className="size-4" />
            توليد وصف للمنتج (AI)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>وصف المنتج الجاهز للذكاء الاصطناعي</DialogTitle>
          <DialogDescription>
            انسخ النص أو حمّله كملف .md ثم الصقه في ChatGPT / Claude / Gemini لإنشاء الـ listing الكامل.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <pre dir="rtl" className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-xs leading-relaxed">
            {md}
          </pre>
        )}

        <div className="flex gap-2">
          <Button onClick={copy} disabled={loading || !md} className="flex-1">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            نسخ النص
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <a href={`/api/products/${productId}/listing?download=1`} download>
              <Download className="size-4" />
              تحميل .md
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
