import { pool } from "@/lib/db";
import { scraperTokenOk, jsonCors } from "@/lib/scrape";

export const runtime = "nodejs";

/**
 * The Docker worker polls this to claim the next pending job. Atomic via
 * SELECT ... FOR UPDATE SKIP LOCKED so concurrent workers never grab the same
 * job. Returns 204 when there's nothing to do.
 */
export async function GET(req: Request) {
  if (!scraperTokenOk(req)) return jsonCors({ error: "unauthorized" }, 401);

  const { rows } = await pool.query(
    `UPDATE scrape_jobs
        SET status = 'running', started_at = now(), updated_at = now()
      WHERE id = (
        SELECT id FROM scrape_jobs
         WHERE status = 'pending'
         ORDER BY created_at ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED
      )
      RETURNING id, fields, items`,
  );

  if (rows.length === 0) return new Response(null, { status: 204 });
  const job = rows[0];
  return jsonCors({ id: job.id, fields: job.fields, items: job.items });
}
