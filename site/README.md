# AI Interpreter — website

Landing page and documentation for AI Interpreter. Static, no database, no backend, no third-party requests.

Stack: [Astro](https://astro.build) (static output) · [Preact](https://preactjs.com) islands · [Tailwind CSS](https://tailwindcss.com) v4 · English + Russian.

## Local development

```bash
cd site
npm install
npm run dev        # http://localhost:4321
```

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

## Security

There are no external requests: no CDN, no web fonts, no analytics, no embeds. Everything is same-origin, which is what makes a strict CSP possible.

**The Content-Security-Policy lives in `astro.config.mjs`, not in `vercel.json`.** Astro generates `script-src` and `style-src` itself, including SHA-256 hashes for its own inline hydration bootstrap — that is what lets the policy work without `'unsafe-inline'`. Sending a second policy as an HTTP header would not add security: two policies intersect, so a header without those hashes would silently break island hydration instead.

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
