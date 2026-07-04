import { app, safeStorage } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { log } from './logger'

type SecretName = 'openai' | 'anthropic'

interface SecretsFile {
  encrypted: boolean
  values: Record<string, string>
}

let cached: Record<string, string> | null = null

function secretsPath(): string {
  return path.join(app.getPath('userData'), 'secrets.json')
}

function loadAll(): Record<string, string> {
  if (cached) return cached
  cached = {}
  try {
    const raw = fs.readFileSync(secretsPath(), 'utf8')
    const file: SecretsFile = JSON.parse(raw)
    for (const [name, value] of Object.entries(file.values)) {
      if (file.encrypted && safeStorage.isEncryptionAvailable()) {
        cached[name] = safeStorage.decryptString(Buffer.from(value, 'base64'))
      } else if (!file.encrypted) {
        cached[name] = value
      }
    }
  } catch {
    cached = {}
  }
  applyEnvOverrides(cached)
  return cached
}

function applyEnvOverrides(store: Record<string, string>): void {
  if (process.env.OPENAI_API_KEY && !store.openai) store.openai = process.env.OPENAI_API_KEY
  if (process.env.ANTHROPIC_API_KEY && !store.anthropic) {
    store.anthropic = process.env.ANTHROPIC_API_KEY
  }
}

function persist(): void {
  const store = loadAll()
  const encrypted = safeStorage.isEncryptionAvailable()
  const values: Record<string, string> = {}
  for (const [name, value] of Object.entries(store)) {
    values[name] = encrypted
      ? safeStorage.encryptString(value).toString('base64')
      : value
  }
  if (!encrypted) {
    log('warn', 'OS-level encryption unavailable; storing API keys unencrypted')
  }
  fs.writeFileSync(secretsPath(), JSON.stringify({ encrypted, values } satisfies SecretsFile))
}

export function getSecret(name: SecretName): string | null {
  return loadAll()[name] ?? null
}

export function setSecret(name: SecretName, value: string): void {
  const store = loadAll()
  if (value.trim() === '') {
    delete store[name]
  } else {
    store[name] = value.trim()
  }
  persist()
}

export function secretStatus(): { openai: boolean; anthropic: boolean } {
  const store = loadAll()
  return { openai: Boolean(store.openai), anthropic: Boolean(store.anthropic) }
}
