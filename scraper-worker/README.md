# SellerCtrl Scrape Worker (Docker + Playwright)

Headless worker that runs the actual scraping for the "السحب الذكي" feature. It
**polls** the app for pending scrape jobs and writes results back — so it never
needs an inbound port and works fine behind NAT on your local machine.

```
Edge extension  ──(builds recipe + creates job)──▶  App (Vercel)  ◀──(polls /api/scrape/worker/next)── this worker
                                                          ▲                                                  │
                                                          └──────────────(posts /worker/result)─────────────┘
```

It is a **fully isolated** Compose project (`name: sellerctrl-scraper`) and will
not touch any of your other containers, networks, or volumes.

## Run

1. Copy env and fill in:
   ```bash
   cp .env.example .env
   # set APP_URL and SCRAPER_TOKEN (same token as the app)
   ```
2. Build & start:
   ```bash
   docker compose up -d --build
   ```
3. Watch logs:
   ```bash
   docker compose logs -f
   ```
4. Stop:
   ```bash
   docker compose down
   ```

## Notes

- `SCRAPER_TOKEN` must be **identical** to the app's `SCRAPER_TOKEN` env var
  (set in Vercel → Project → Settings → Environment Variables).
- Pointing at a **local** app instead of Vercel? Set
  `APP_URL=http://host.docker.internal:3000`.
- The worker only **fills missing fields** on draft products and keeps them as
  drafts — a reviewer still confirms each product in the app before it reaches
  employees.
- Uses bundled Chromium. To use Microsoft Edge specifically, set
  `BROWSER_CHANNEL=msedge` (requires Edge installed in the image).
