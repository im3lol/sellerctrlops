export async function register() {
  // node-cron only works on a long-running server. On Vercel/serverless the
  // process is ephemeral, so we use Vercel Cron (see vercel.json + /api/cron/*).
  if (process.env.VERCEL) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCron } = await import("@/lib/cron");
    startCron();
  }
}
