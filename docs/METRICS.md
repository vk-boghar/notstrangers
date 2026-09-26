# Anonymous learning-module counter

Counts how many people complete learning modules, as a privacy-preserving proxy for "people helped".
No accounts, no emails, no IPs, no user agents, no fingerprints, no cookies, no third-party scripts.

## What is counted

| Event | When | Counted once per |
|---|---|---|
| `module_complete` + slug (`parents-01` … `parents-08`, `teens-01` … `teens-03`, `kids-01` … `kids-03`) | The visitor clicks **Next / Back to Learn** at the end of a module, or **Mark this module done** | browser + module (`localStorage["ns_c1_<slug>"]`) |
| `module_complete` + `family-safety-plan` | The visitor prints the family safety plan (also counts `parents-08`) | browser |
| `learner` | The first module a browser ever completes | browser (`localStorage["ns_c1_learner"]`) |

Clearing browser storage can double-count. That's acceptable for a directional number.

## Where the numbers show

- End of every module: "🧡 N parents (or teens) have completed this module."
- Learn page and home page: "N people are learning how to keep children safe." (the `learner` count)
- Always with: "Counted anonymously — no names, no emails, nothing stored about you."

**Real counts only.** A line stays hidden until its real count reaches `COUNTER_SHOW_FROM` (108) in
`site/src/config/site.ts`, so a new site never shows a tiny number. The count is never padded.

## Pieces

- `metrics/`: Cloudflare Worker + one SQLite-backed Durable Object (free plan). A single object
  serialises writes, so increments are atomic (Workers KV can't increment atomically).
  - `POST /event` `{"event":"module_complete","module":"parents-01","v":1}` returns 204. Allow-listed
    events and slugs only (anything else gets 400), allowed origins only (403), and an edge rate limit of
    10 per minute per client (429). The rate limiter keeps its key in memory at the edge only.
  - `GET /counts` returns `{updated_at, total, learners, by_module, last_30_days}`, cached for 1 minute.
- Site: `site/src/components/learn/LearnKit.astro` sends events (a `fetch` with `keepalive`. We don't
  use `sendBeacon`, because the site's no-referrer policy would make its Origin `null` and the Worker
  would reject it). `CountScript.astro` fills the count lines and hides them silently on any error.
- `METRICS_URL = ''` in `site/src/config/site.ts` switches everything off: no requests at all.

## Live

Worker: https://notstrangers-metrics.vaikunthln.workers.dev (`/counts` is public).

## One-time setup (about 10 minutes, done)

1. Create a free Cloudflare account at dash.cloudflare.com.
2. **Account ID:** Workers & Pages → Overview, then copy the Account ID from the right-hand panel.
3. **API token:** My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template →
   Account Resources: your account → Continue → Create. Copy the token (it is shown once).
4. GitHub → repo **Settings → Secrets and variables → Actions → New repository secret**:
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
5. GitHub → **Actions → Deploy metrics worker → Run workflow**. The log prints the Worker URL, e.g.
   `https://notstrangers-metrics.<your-subdomain>.workers.dev`. (The first time, Cloudflare asks you to
   pick a workers.dev subdomain in the dashboard: Workers & Pages → Overview.)
6. Put that URL in `METRICS_URL` in `site/src/config/site.ts`, then commit and push.

Later, if the domain's DNS moves to Cloudflare, the Worker can live at `metrics.notstrangers.org`
(Workers → Settings → Domains & Routes). Update `METRICS_URL` if you do.
