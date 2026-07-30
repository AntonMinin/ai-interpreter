import { defineConfig, envField } from 'astro/config'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'

const TURNSTILE = 'https://challenges.cloudflare.com'

export default defineConfig({
  site: 'https://ai-interpreter.vercel.app',
  // Every page is prerendered. Only src/pages/api/feedback.ts opts out
  // (`export const prerender = false`), so exactly one serverless function
  // is deployed and the rest of the site stays static files on a CDN.
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  redirects: {
    '/docs': '/docs/install',
    '/ru/docs': '/ru/docs/install'
  },
  integrations: [
    preact({ compat: false }),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ru: 'ru' } },
      filter: (page) => !page.includes('/api/')
    })
  ],

  // Secrets are declared here rather than read through import.meta.env, which
  // Astro inlines at build time. `access: 'secret'` keeps them out of the
  // bundle and reads them at runtime, so rotating a key in the Vercel
  // dashboard takes effect without a redeploy. All optional, so a build with
  // no keys still succeeds — the endpoint reports the misconfiguration itself.
  env: {
    schema: {
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true
      }),
      TELEGRAM_BOT_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true
      }),
      TELEGRAM_CHAT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true
      })
    }
  },

  // Astro 7 defaults this to 'jsx', which strips whitespace between inline
  // elements the way React does. The markup here was written and checked
  // against the previous behaviour, so keep it rather than hunt for collapsed
  // spaces. Revisit deliberately, not as a side effect of an upgrade.
  compressHTML: true,

  // Astro emits script-src/style-src itself, with hashes for its own inline
  // hydration bootstrap. Everything else is listed here. Do not also send a
  // Content-Security-Policy header from vercel.json: two policies intersect,
  // and a header without these hashes would block island hydration.
  security: {
    csp: {
      algorithm: 'SHA-256',
      // `resources` replaces Astro's default list, so 'self' must stay.
      // Turnstile is the only third party the site talks to, and only on
      // pages that render the feedback form.
      scriptDirective: { resources: ["'self'", TURNSTILE] },
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        `connect-src 'self' ${TURNSTILE}`,
        "media-src 'self'",
        "object-src 'none'",
        `frame-src ${TURNSTILE}`,
        "frame-ancestors 'none'",
        "base-uri 'none'",
        "form-action 'none'",
        "worker-src 'self'",
        "manifest-src 'self'",
        'upgrade-insecure-requests'
      ]
    }
  },

  vite: { plugins: [tailwindcss()] }
})
