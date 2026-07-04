import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { DEFAULT_SETTINGS, type Settings } from '../shared/types'
import { log } from './logger'

let cached: Settings | null = null

function settingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

export function getSettings(): Settings {
  if (cached) return cached
  try {
    const raw = fs.readFileSync(settingsPath(), 'utf8')
    const parsed = JSON.parse(raw)
    cached = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      outbound: { ...DEFAULT_SETTINGS.outbound, ...parsed.outbound },
      inbound: { ...DEFAULT_SETTINGS.inbound, ...parsed.inbound }
    }
  } catch {
    cached = { ...DEFAULT_SETTINGS }
  }
  return cached!
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const current = getSettings()
  cached = {
    ...current,
    ...patch,
    outbound: { ...current.outbound, ...(patch.outbound ?? {}) },
    inbound: { ...current.inbound, ...(patch.inbound ?? {}) }
  }
  try {
    fs.writeFileSync(settingsPath(), JSON.stringify(cached, null, 2))
  } catch (error) {
    log('error', `Failed to save settings: ${String(error)}`)
  }
  return cached
}
