import { locales, ui, type Locale, type UiKey } from './ui'

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

export function localeFromUrl(url: URL): Locale {
  const first = url.pathname.split('/').filter(Boolean)[0]
  return isLocale(first) ? first : 'en'
}

export function useTranslations(locale: Locale) {
  return (key: UiKey): string => ui[locale][key] ?? ui.en[key] ?? key
}

/** Prefix a root-relative path with the locale ('en' stays unprefixed). */
export function localePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+/, '')
  const base = locale === 'en' ? '' : `/${locale}`
  return clean ? `${base}/${clean}` : base || '/'
}

/** The same page in another locale. */
export function switchLocalePath(url: URL, target: Locale): string {
  const segments = url.pathname.split('/').filter(Boolean)
  if (isLocale(segments[0])) segments.shift()
  return localePath(target, segments.join('/'))
}
