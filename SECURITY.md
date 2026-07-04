# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for security problems. Instead, use GitHub's private vulnerability reporting ("Report a vulnerability" on the Security tab) or email the maintainer listed in `package.json`. You will get an acknowledgement within a few days.

## Scope and threat model

AI Interpreter processes live voice audio and holds API keys, so the main assets are:

- **API keys** — stored locally, encrypted with Windows DPAPI (`safeStorage`). They live only in the Electron main process, are sent only to the corresponding provider over HTTPS, and are redacted from logs. If DPAPI is unavailable the app stores them unencrypted and records a warning in the log.
- **Voice audio and transcripts** — audio segments are sent to the selected cloud AI provider for transcription/synthesis; translated text is sent for translation. Nothing is uploaded anywhere else. Transcripts are kept in memory only (not written to disk). See [docs/privacy.md](docs/privacy.md).
- **Renderer isolation** — the UI runs with `contextIsolation: true` and `nodeIntegration: false`; it can only reach the main process through the typed `window.interpreter` bridge. Provider HTTP calls and key handling never happen in the renderer.

## Supported versions

Only the latest release receives security fixes.
