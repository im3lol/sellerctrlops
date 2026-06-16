import { runDueRecurrences } from "@/lib/recurring";
import { syncAllDue } from "@/lib/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled jobs for serverless (Vercel Cron). Replaces node-cron.
 * Protected by CRON_SECRET (Vercel sends it as `Authorization: Bearer <secret>`).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  }

  const result = { recurringCreated: 0, sheetsSynced: false as boolean };
  try {
    result.recurringCreated = await runDueRecurrences();
  } catch (e) {
    console.error("[cron] recurring failed", e);
  }
  // Google Sheets sync is disabled for now; safe no-op if no connections.
  try {
    await syncAllDue();
    result.sheetsSynced = true;
  } catch (e) {
    console.error("[cron] sheets sync failed", e);
  }

  return Response.json({ ok: true, ...result });
}
