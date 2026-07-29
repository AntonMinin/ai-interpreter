import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://ai-interpreter.vercel.app',
  output: 'static',
  trailingSlash: 'never',
  redirects: {
    '/docs': '/docs/install',
    '/ru/docs': '/ru/docs/install'
  },
  integrations: [
    preact({ compat: false }),
    sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', ru: 'ru' } } })
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: { prefixDefaultLocale: false }
  },
  // Astro emits script-src/style-src itself, with hashes for its own inline
  // hydration bootstrap. Everything else is listed here. Do not also send a
  // Content-Security-Policy header from vercel.json: two policies intersect,
  // and a header without these hashes would block island hydration.
  experimental: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "frame-src 'none'",
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
