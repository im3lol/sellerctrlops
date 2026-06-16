import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scrapeJobs } from "@/db/schema";
import { scraperTokenOk, jsonCors } from "@/lib/scrape";

export const runtime = "nodejs";

/**
 * The worker marks a job finished.
 * Body: { jobId, status?: "done" | "error", error?: string }
 */
export async function POST(req: Request) {
  if (!scraperTokenOk(req)) return jsonCors({ error: "unauthorized" }, 401);

  let body: { jobId?: string; status?: string; error?: string };
  try {
    body = await req.json();
  } catch {
    return jsonCors({ error: "invalid json" }, 400);
  }
  if (!body.jobId) return jsonCors({ error: "jobId required" }, 400);

  const status = body.status === "error" ? "error" : "done";
  await db
    .update(scrapeJobs)
    .set({
      status,
      lastError: body.error ?? null,
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scrapeJobs.id, body.jobId));

  return jsonCors({ ok: true });
}
