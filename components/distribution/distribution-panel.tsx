"use client";

import { useState, useTransition } from "react";
import { Shuffle, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  runDistributionAction,
  resetDistributionAction,
  setAutoDistributeAction,
} from "@/app/actions/distribution";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Strategy } from "@/lib/distribution";

type WS = {
  id: string;
  name: string;
  unassigned: number;
  employees: number;
  autoDistribute: boolean;
  autoDistributeStrategy: Strategy;
};

const STRATEGIES: { key: Strategy; label: string; desc: string }[] = [
  { key: "equal", label: "توزيع متساوٍ", desc: "نفس العدد لكل موظف بالتساوي" },
  { key: "performance", label: "حسب الأداء", desc: "الموظفون الأعلى إنجازاً يأخذون أكثر" },
  { key: "experience", label: "حسب الخبرة", desc: "الأقدم خبرةً يأخذون أكثر" },
];

export function DistributionPanel({ workspaces }: { workspaces: WS[] }) {
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [strategy, setStrategy] = useState<Strategy>(workspaces[0]?.autoDistributeStrategy ?? "equal");
  const [pending, start] = useTransition();
  const [busy, startBusy] = useTransition();
  const [result, setResult] = useState<Record<string, number> | null>(null);

  const ws = workspaces.find((w) => w.id === workspaceId);
  const [auto, setAuto] = useState(ws?.autoDistribute ?? false);

  const run = (reset = false) => {
    if (!workspaceId) return;
    setResult(null);
    start(async () => {
      const res = await runDistributionAction(workspaceId, strategy, reset);
      if (!res.ok) {
        toast.error(res.error ?? "تعذّر التوزيع");
        return;
      }
      toast.success(`${reset ? "أعيد التوزيع" : "تم توزيع"} ${res.assigned} منتج`);
      setResult(res.perEmployee);
    });
  };

  const reset = () => {
    if (!workspaceId) return;
    startBusy(async () => {
      const res = await resetDistributionAction(workspaceId);
      toast.success(`تم إلغاء تعيين ${res.cleared} منتج`);
      setResult(null);
    });
  };

  const toggleAuto = (next: boolean) => {
    setAuto(next);
    startBusy(async () => {
      await setAutoDistributeAction(workspaceId, next, strategy);
      toast.success(next ? "تم تفعيل التوزيع التلقائي" : "تم إيقاف التوزيع التلقائي");
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-6">
        <div className="space-y-2">
          <Label>مساحة العمل</Label>
          <Select
            value={workspaceId}
            onValueChange={(v) => {
              setWorkspaceId(v);
              setResult(null);
              const next = workspaces.find((w) => w.id === v);
              setAuto(next?.autoDistribute ?? false);
              if (next) setStrategy(next.autoDistributeStrategy);
            }}
          >
            <SelectTrigger><SelectValue placeholder="اختر مساحة العمل" /></SelectTrigger>
            <SelectContent>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name} — {w.unassigned} غير معيّن
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {ws && (
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-2xl font-bold text-primary">{ws.unassigned}</p>
              <p className="text-xs text-muted-foreground">منتج غير معيّن</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-2xl font-bold">{ws.employees}</p>
              <p className="text-xs text-muted-foreground">موظف</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>طريقة التوزيع</Label>
          <div className="space-y-2">
            {STRATEGIES.map((s) => (
              <button
                key={s.key}
                onClick={() => setStrategy(s.key)}
                className={`w-full rounded-xl border p-3 text-right transition ${
                  strategy === s.key ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <p className="font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={() => run(false)} disabled={pending || !ws || ws.unassigned === 0} className="w-full" size="lg">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Shuffle className="size-4" />}
          توزيع غير المعيّن ({ws?.unassigned ?? 0})
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={pending || busy || !ws || ws.employees === 0}>
                <RotateCcw className="size-4" />
                إعادة التوزيع من جديد
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>إعادة التوزيع من الصفر؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيُلغى كل التعيينات الحالية في هذه المساحة ثم تُوزَّع المنتجات من جديد على الموظفين.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={(e) => { e.preventDefault(); run(true); }}>
                  إعادة التوزيع
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={pending || busy || !ws} className="text-destructive">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                إلغاء كل التعيينات
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>إلغاء كل التعيينات؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سترجع كل منتجات المساحة «غير معيّنة». يمكنك التوزيع بعدها من جديد.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>تراجع</AlertDialogCancel>
                <AlertDialogAction onClick={(e) => { e.preventDefault(); reset(); }} className="bg-destructive text-white hover:bg-destructive/90">
                  إلغاء التعيينات
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Auto-distribute */}
        <div className="flex items-start justify-between gap-3 rounded-xl border p-3">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              توزيع تلقائي
            </Label>
            <p className="text-xs text-muted-foreground">
              يوزّع المنتجات تلقائياً (بالطريقة المختارة) بمجرد اكتمال كل المسودات وعدم بقاء أي بيانات ناقصة.
            </p>
          </div>
          <Switch checked={auto} onCheckedChange={toggleAuto} disabled={busy || !ws} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 font-semibold">نتيجة التوزيع</h3>
        {result ? (
          <ul className="space-y-2">
            {Object.entries(result).map(([name, count]) => (
              <li key={name} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm">{name}</span>
                <span className="font-bold tabular-nums text-primary">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">اختر مساحة عمل وطريقة توزيع ثم اضغط «توزيع المنتجات».</p>
        )}
      </Card>
    </div>
  );
}
