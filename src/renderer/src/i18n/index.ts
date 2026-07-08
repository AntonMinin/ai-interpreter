import { createContext, useContext, useMemo } from 'react'
import { en } from './en'
import { ru } from './ru'

export type UiLanguage = 'en' | 'ru'

export const UI_LANGUAGES: { code: UiLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' }
]

const dictionaries: Record<UiLanguage, Record<string, string>> = { en, ru }

export function normalizeUiLanguage(code: string): UiLanguage {
  return code === 'ru' ? 'ru' : 'en'
}

export type Translator = (key: string, vars?: Record<string, string | number>) => string

export function makeT(language: string): Translator {
  const dict = dictionaries[normalizeUiLanguage(language)]
  return (key, vars) => {
    let text = dict[key] ?? en[key] ?? key
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, String(value))
      }
    }
    return text
  }
}

export const I18nContext = createContext<UiLanguage>('en')

export function useT(): Translator {
  const language = useContext(I18nContext)
  return useMemo(() => makeT(language), [language])
}
