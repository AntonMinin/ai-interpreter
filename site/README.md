# AI Interpreter — website

Landing page and documentation for AI Interpreter. Static, no database, no backend, no third-party requests.

Stack: [Astro](https://astro.build) 7 · [Preact](https://preactjs.com) islands · [Tailwind CSS](https://tailwindcss.com) v4 · English + Russian. Needs Node 22.12 or newer (Astro 7 requirement).

## Local development

```bash
cd site
npm install
npm run dev        # http://localhost:4321
```

`astro dev` runs as a background daemon in Astro 7. `npx astro dev status`, `npx astro dev logs` and `npx astro dev stop` manage it — if a port looks occupied, an earlier daemon is probably still up.

```bash
npm run build      # static output into dist/
npm run preview    # serve dist/ exactly as it will be served in production
npm run check      # TypeScript + Astro diagnostics
```

## Layout

```
src/
  content/docs/{en,ru}/*.md   documentation pages (one file per language)
  i18n/ui.ts                  every landing-page string, both languages
  components/                 .astro = static, .tsx = Preact island
  layouts/                    Base (shell) and Docs (sidebar + table of contents)
  pages/                      thin routes; /ru/* mirrors the English tree
```

### Adding a documentation page

Create the same filename under `content/docs/en/` and `content/docs/ru/`, with frontmatter:

```yaml
---
title: Page title
description: One sentence shown under the heading and in search results.
section: start | use | about
order: 7
---
```

The sidebar, the previous/next links and the sitemap pick it up automatically. `order` controls the position; `section` controls the sidebar group.

### Adding a landing-page string

Add the key to **both** locales in `src/i18n/ui.ts`. The object is typed, so a key missing from one language fails `npm run check`.

### Adding a language

Add the code to `locales` in `src/i18n/ui.ts` and `astro.config.mjs`, add a full block to `ui`, copy `src/content/docs/en/` to the new folder, and add `src/pages/<code>/`. Nothing else is language-aware.

## The feedback form

One serverless function, `src/pages/api/feedback.ts`, marked `export const prerender = false`. Every other route is prerendered, so the deployment is static files plus a single function.

Flow: Preact island renders the Cloudflare Turnstile widget → posts JSON to `/api/feedback` → the function rate-limits, verifies the Turnstile token server-side, then sends the message to a Telegram chat. No database, and nothing is stored anywhere.

Environment variables are declared as a typed schema in `astro.config.mjs` under `env.schema`, and read through `astro:env` — not `import.meta.env`. That matters: Astro inlines `import.meta.env` at build time, so a secret read that way is baked into the bundle and rotating a key needs a redeploy. `access: 'secret'` fields are read at runtime instead. See `.env.example`.

| Variable | Imported from | Notes |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | `astro:env/client` | Public by definition — it ends up in the HTML. |
| `TURNSTILE_SECRET_KEY` | `astro:env/server` | Runtime secret. |
| `TELEGRAM_BOT_TOKEN` | `astro:env/server` | Runtime secret. From @BotFather. |
| `TELEGRAM_CHAT_ID` | `astro:env/server` | Runtime secret. From `getUpdates` after messaging your bot. |

All four are `optional: true`, so a build without keys still succeeds — otherwise a fresh clone could not be built at all. The endpoint reports the misconfiguration itself: production returns `server_misconfigured` rather than silently accepting a message it cannot deliver, because a missing key is a deployment bug, not a user error. In `astro dev` with no keys, Turnstile falls back to Cloudflare's documented always-passes test pair so the form is usable locally.

### Rate limiting, honestly

`src/lib/rateLimit.ts` is a fixed window held in the function instance's memory: 3 messages per address per 10 minutes. **This is best-effort.** Serverless runs several instances and recycles them, so someone spreading requests across cold starts gets more than three through.

That is an accepted trade-off, not an oversight. The real bot barrier is the Turnstile token, which Cloudflare invalidates after one use — scripted floods need a fresh solved challenge every time. The limiter exists to stop one client hammering a warm instance.

If abuse actually happens, replace that module with a shared store — `@upstash/ratelimit` on Upstash Redis is a drop-in and the call site keeps its shape. Do not "fix" it by raising the limit.

### Adding another delivery target

`sendToTelegram` in the endpoint is the only delivery code. Swap or add alongside it; everything before it — validation, limits, captcha — is independent of where the message goes. Telegram is called with `parse_mode` omitted on purpose, so user text is never interpreted as markup.

## Security

No CDN, no web fonts, no analytics. The only third party is Cloudflare Turnstile, loaded for the feedback form — it is the one host in the CSP that is not `'self'`.

**The Content-Security-Policy lives in `astro.config.mjs` under `security.csp`, not in `vercel.json`.** Note that `scriptDirective.resources` *replaces* Astro's default list rather than extending it, which is why `'self'` sits next to the Turnstile host — drop it and the site's own scripts stop loading. Astro generates `script-src` and `style-src` itself, including SHA-256 hashes for its own inline hydration bootstrap — that is what lets the policy work without `'unsafe-inline'`. Sending a second policy as an HTTP header would not add security: two policies intersect, so a header without those hashes would silently break island hydration instead.

`vercel.json` carries the headers Astro cannot emit as a meta tag: HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and the cross-origin isolation pair.

After deploying, confirm both halves are live:

```bash
curl -sI https://<your-domain> | grep -i "strict-transport\|x-frame\|permissions-policy"
curl -s  https://<your-domain> | grep -o 'content-security-policy[^>]*'
```

Then open the site with DevTools → Console and click the mobile menu and the cost estimator. Zero CSP violations means the hashes match.

## Content accuracy

The cost estimator in `src/components/CostEstimator.tsx` uses a single constant, `USD_PER_SPOKEN_MINUTE`, derived from published provider list prices at a normal speaking rate. It is deliberately rounded up and labelled as an estimate. **Provider prices change** — re-check that constant when you touch pricing copy, and keep the disclaimer next to it.

Documentation text mirrors the app's actual behaviour, including its current limitations. When the app changes, update `content/docs/` in both languages in the same commit.
