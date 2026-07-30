# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for security problems. Use GitHub's private vulnerability reporting instead: the **Security** tab of this repository → **Report a vulnerability**. It is private between you and the maintainer, and it is the only reporting channel — there is no published email address. You will get an acknowledgement within a few days.

If the Security tab shows no reporting button, private reporting has not been enabled on the repository; please open a normal issue saying only *"I need a private channel to report a security problem"*, with no details, and it will be enabled.

## Scope and threat model

AI Interpreter processes live voice audio and holds API keys, so the main assets are:

- **API keys** — stored locally, encrypted with Windows DPAPI (`safeStorage`). They live only in the Electron main process, are sent only to the corresponding provider over HTTPS, and are redacted from logs. If DPAPI is unavailable the app stores them unencrypted and records a warning in the log.
- **Voice audio and transcripts** — audio segments are sent to the selected cloud AI provider for transcription/synthesis; translated text is sent for translation. Nothing is uploaded anywhere else. Transcripts are kept in memory only (not written to disk). See [docs/privacy.md](docs/privacy.md).
- **Renderer isolation** — the UI runs with `contextIsolation: true`, `nodeIntegration: false` and `sandbox: true`; it can only reach the main process through the typed `window.interpreter` bridge. Provider HTTP calls and key handling never happen in the renderer. A Content-Security-Policy in `src/renderer/index.html` blocks remote scripts and connections.

## Supported versions

Only the latest release receives security fixes.
