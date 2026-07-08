import { describe, expect, it } from 'vitest'
import { en } from '../src/renderer/src/i18n/en'
import { ru } from '../src/renderer/src/i18n/ru'
import { makeT, normalizeUiLanguage } from '../src/renderer/src/i18n'

describe('i18n dictionaries', () => {
  it('ru covers every en key', () => {
    const missing = Object.keys(en).filter((key) => !(key in ru))
    expect(missing).toEqual([])
  })

  it('ru has no extra keys', () => {
    const extra = Object.keys(ru).filter((key) => !(key in en))
    expect(extra).toEqual([])
  })

  it('has no empty strings', () => {
    for (const dict of [en, ru]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.length, key).toBeGreaterThan(0)
      }
    }
  })

  it('keeps placeholder sets consistent between languages', () => {
    const placeholders = (text: string): string[] => (text.match(/\{[a-zA-Z]+\}/g) ?? []).sort()
    for (const key of Object.keys(en)) {
      expect(placeholders(ru[key]), key).toEqual(placeholders(en[key]))
    }
  })
})

describe('makeT', () => {
  it('translates known keys per language', () => {
    expect(makeT('en')('main.start')).toBe('Start')
    expect(makeT('ru')('main.start')).toBe('Старт')
  })

  it('falls back to English for unknown language codes', () => {
    expect(normalizeUiLanguage('de')).toBe('en')
    expect(makeT('de')('main.start')).toBe('Start')
  })

  it('falls back to the key when missing everywhere', () => {
    expect(makeT('ru')('nonexistent.key')).toBe('nonexistent.key')
  })

  it('interpolates variables', () => {
    expect(makeT('en')('ob.step', { n: 2, total: 8 })).toBe('Step 2 of 8')
    expect(makeT('ru')('ob.step', { n: 2, total: 8 })).toBe('Шаг 2 из 8')
  })
})
