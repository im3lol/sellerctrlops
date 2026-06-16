import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scrapeJobs } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { canAccessWorkspace } from "@/lib/workspaces";
import { scraperTokenOk, corsPreflight, jsonCors, isUuid } from "@/lib/scrape";

export const runtime = "nodejs";

export function OPTIONS() {
  return corsPreflight();
}

/** Job progress (for the app UI / extension polling). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return jsonCors({ error: "معرّف غير صالح" }, 400);
  const [job] = await db.select().from(scrapeJobs).where(eq(scrapeJobs.id, id)).limit(1);
  if (!job) return jsonCors({ error: "not found" }, 404);

  if (!scraperTokenOk(req)) {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "product.review") || !(await canAccessWorkspace(user, job.workspaceId))) {
      return jsonCors({ error: "unauthorized" }, 401);
    }
  }

  return jsonCors({
    id: job.id,
    status: job.status,
    total: job.total,
    done: job.done,
    updatedCount: job.updatedCount,
    lastError: job.lastError,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
  });
}
