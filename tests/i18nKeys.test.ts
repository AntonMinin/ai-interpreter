import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { en } from '../src/renderer/src/i18n/en'

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.tsx?$/.test(entry) && !full.includes(`i18n${path.sep}`) ? [full] : []
  })
}

const referenced = new Map<string, string[]>()
for (const file of sourceFiles(path.join(__dirname, '..', 'src'))) {
  const text = readFileSync(file, 'utf8')
  for (const match of text.matchAll(/'((?:err|diag|warn|set|main|ob|test|status|prov)\.\w+)'/g)) {
    const key = match[1]
    referenced.set(key, [...(referenced.get(key) ?? []), path.basename(file)])
  }
}

describe('i18n key references', () => {
  it('finds keys to check', () => {
    expect(referenced.size).toBeGreaterThan(50)
  })

  it('every key referenced in source exists in the dictionary', () => {
    const missing = [...referenced.entries()]
      .filter(([key]) => !(key in en))
      .map(([key, files]) => `${key} (${[...new Set(files)].join(', ')})`)
    expect(missing).toEqual([])
  })
})
