import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

const SECRET_PATTERN = /(sk-[A-Za-z0-9_-]{8,}|sk-ant-[A-Za-z0-9_-]{8,}|Bearer\s+\S+)/g

let logFile: string | null = null

function redact(text: string): string {
  return text.replace(SECRET_PATTERN, '[REDACTED]')
}

export function getLogPath(): string {
  if (!logFile) {
    const dir = path.join(app.getPath('userData'), 'logs')
    fs.mkdirSync(dir, { recursive: true })
    logFile = path.join(dir, 'ai-interpreter.log')
  }
  return logFile
}

const MAX_LOG_BYTES = 2 * 1024 * 1024

function rotateIfLarge(file: string): void {
  try {
    if (fs.statSync(file).size < MAX_LOG_BYTES) return
    fs.renameSync(file, `${file}.old`)
  } catch {
    return
  }
}

export function log(level: 'info' | 'warn' | 'error' | 'debug', message: string): void {
  const line = `${new Date().toISOString()} [${level.toUpperCase()}] ${redact(message)}\n`
  try {
    const file = getLogPath()
    rotateIfLarge(file)
    fs.appendFileSync(file, line)
  } catch {
    return
  }
  if (level === 'error') console.error(line.trimEnd())
}

export function clearLogs(): void {
  try {
    fs.writeFileSync(getLogPath(), '')
    fs.rmSync(`${getLogPath()}.old`, { force: true })
  } catch {
    return
  }
}
