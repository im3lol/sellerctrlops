"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const MODE = process.env.NEXT_PUBLIC_REALTIME ?? "sse";

/**
 * When realtime runs in "poll" mode (Vercel/serverless, where SSE isn't viable),
 * periodically re-fetch the current route's server data so notifications, kanban,
 * and product changes stay reasonably fresh. No-op in "sse" mode.
 */
export function PollRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (MODE !== "poll") return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
