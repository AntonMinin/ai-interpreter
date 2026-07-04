export const IPC = {
  getSettings: 'settings:get',
  updateSettings: 'settings:update',
  getKeyStatus: 'secrets:status',
  setApiKey: 'secrets:set',
  testApiKey: 'secrets:test',
  transcribe: 'pipeline:transcribe',
  translate: 'pipeline:translate',
  synthesize: 'pipeline:synthesize',
  mainDiagnostics: 'diagnostics:main',
  log: 'log:write',
  getLogPath: 'log:path',
  clearLogs: 'log:clear',
  openExternal: 'shell:openExternal'
} as const
