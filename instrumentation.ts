export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Fail fast on missing required env (DATABASE_URL / AUTH_SECRET).
    const { validateEnv } = await import("@/lib/env");
    validateEnv();
  }

  // node-cron only works on a long-running server. On Vercel/serverless the
  // process is ephemeral, so we use Vercel Cron (see vercel.json + /api/cron/*).
  if (process.env.VERCEL) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCron } = await import("@/lib/cron");
    startCron();
  }
}
