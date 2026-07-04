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

export function log(level: 'info' | 'warn' | 'error' | 'debug', message: string): void {
  const line = `${new Date().toISOString()} [${level.toUpperCase()}] ${redact(message)}\n`
  try {
    fs.appendFileSync(getLogPath(), line)
  } catch {
    return
  }
  if (level === 'error') console.error(line.trimEnd())
}

export function clearLogs(): void {
  try {
    fs.writeFileSync(getLogPath(), '')
  } catch {
    return
  }
}
