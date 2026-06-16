"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaces } from "@/db/schema";
import { requireCapability } from "@/lib/session";
import {
  distributeWorkspace,
  resetAssignments,
  type Strategy,
  type DistributionResult,
} from "@/lib/distribution";

/** Distribute unassigned products. With `reset`, clears all assignments first
 *  (redistribute from scratch). */
export async function runDistributionAction(
  workspaceId: string,
  strategy: Strategy,
  reset = false,
): Promise<DistributionResult> {
  const user = await requireCapability("product.distribute");
  if (reset) await resetAssignments(workspaceId);
  const result = await distributeWorkspace(workspaceId, strategy, user.id);
  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath("/admin/distribution");
  revalidatePath("/products");
  return result;
}

/** Clear all product assignments in a workspace (no redistribution). */
export async function resetDistributionAction(
  workspaceId: string,
): Promise<{ ok: boolean; cleared: number }> {
  await requireCapability("product.distribute");
  const cleared = await resetAssignments(workspaceId);
  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath("/admin/distribution");
  revalidatePath("/products");
  return { ok: true, cleared };
}

/** Toggle auto-distribute (runs once no drafts remain) + its strategy. */
export async function setAutoDistributeAction(
  workspaceId: string,
  enabled: boolean,
  strategy: Strategy,
): Promise<{ ok: boolean }> {
  await requireCapability("product.distribute");
  await db
    .update(workspaces)
    .set({ autoDistribute: enabled, autoDistributeStrategy: strategy, updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId));
  revalidatePath("/admin/distribution");
  return { ok: true };
}
