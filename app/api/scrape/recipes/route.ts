import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scrapeRecipes } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { canAccessWorkspace } from "@/lib/workspaces";
import { scraperTokenOk, sanitizeFields, corsPreflight, jsonCors, isUuid } from "@/lib/scrape";

export const runtime = "nodejs";

export function OPTIONS() {
  return corsPreflight();
}

/** A reviewer session, or the shared token. Returns the user id (null for token). */
async function authorize(req: Request, workspaceId: string): Promise<{ ok: boolean; userId: string | null }> {
  if (scraperTokenOk(req)) return { ok: true, userId: null };
  const user = await getCurrentUser();
  if (user && can(user.role, "product.review") && (await canAccessWorkspace(user, workspaceId))) {
    return { ok: true, userId: user.id };
  }
  return { ok: false, userId: null };
}

/** List recipes for a workspace. */
export async function GET(req: Request) {
  const workspaceId = new URL(req.url).searchParams.get("workspaceId");
  if (!isUuid(workspaceId)) return jsonCors({ error: "معرّف مساحة العمل غير صالح (UUID)" }, 400);
  const { ok } = await authorize(req, workspaceId);
  if (!ok) return jsonCors({ error: "unauthorized" }, 401);

  const rows = await db
    .select()
    .from(scrapeRecipes)
    .where(eq(scrapeRecipes.workspaceId, workspaceId))
    .orderBy(desc(scrapeRecipes.updatedAt));
  return jsonCors({ recipes: rows });
}

/** Save a recipe (selectors captured by the Edge extension). */
export async function POST(req: Request) {
  let body: { workspaceId?: string; name?: string; originHost?: string; fields?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonCors({ error: "invalid json" }, 400);
  }
  const workspaceId = String(body.workspaceId ?? "");
  if (!isUuid(workspaceId)) return jsonCors({ error: "معرّف مساحة العمل غير صالح (UUID)" }, 400);

  const { ok, userId } = await authorize(req, workspaceId);
  if (!ok) return jsonCors({ error: "unauthorized" }, 401);

  const fields = sanitizeFields(body.fields);
  if (Object.keys(fields).length === 0) return jsonCors({ error: "no valid selectors" }, 400);

  const [recipe] = await db
    .insert(scrapeRecipes)
    .values({
      workspaceId,
      name: (body.name ?? "وصفة سحب").toString().slice(0, 120),
      originHost: body.originHost ? String(body.originHost).slice(0, 200) : null,
      fields,
      createdById: userId,
    })
    .returning({ id: scrapeRecipes.id });

  return jsonCors({ id: recipe.id });
}
