# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for security problems. Use GitHub's private vulnerability reporting instead: the **Security** tab of this repository → **Report a vulnerability**. It is private between you and the maintainer, and it is the only reporting channel — there is no published email address. You will get an acknowledgement within a few days.

If the Security tab shows no reporting button, private reporting has not been enabled on the repository; please open a normal issue saying only *"I need a private channel to report a security problem"*, with no details, and it will be enabled.

## Scope and threat model

AI Interpreter processes live voice audio and holds API keys, so the main assets are:

- **API keys** — stored locally, encrypted with Windows DPAPI (`safeStorage`). They live only in the Electron main process, are sent only to the corresponding provider over HTTPS, and are redacted from logs. If DPAPI is unavailable the app stores them unencrypted and records a warning in the log.
- **Voice audio and transcripts** — audio segments are sent to the selected cloud AI provider for transcription/synthesis; translated text is sent for translation. Nothing is uploaded anywhere else. Transcripts are kept in memory only (not written to disk). See [docs/privacy.md](docs/privacy.md).
- **Renderer isolation** — the UI runs with `contextIsolation: true`, `nodeIntegration: false` and `sandbox: true`; it can only reach the main process through the typed `window.interpreter` bridge. Provider HTTP calls and key handling never happen in the renderer. A Content-Security-Policy in `src/renderer/index.html` blocks remote scripts and connections.

## Dependency advisories

`npm audit --omit=dev` reports **no vulnerabilities** in what ships to users, and CI enforces that on every push.

One advisory remains in the *development* tree and is knowingly accepted:

- **`brace-expansion` DoS ([GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg))**, reached only through `electron-builder`'s dependency chain. It is a build-time packaging tool, absent from the shipped app, and the only glob patterns it expands come from `electron-builder.yml` in this repository — there is no path for third-party input.

  It is not fixed because there is no fix that is not a regression. `npm audit fix --force` *downgrades* `electron-builder` 26 → 25. The vulnerable copies are `brace-expansion` 1.1.17 and 2.1.3, which are the newest releases in their major lines — no backported patch exists — so an `overrides` pin would force a major jump on `minimatch@3`, risking the packager for a DoS that cannot be triggered.

  This will resolve itself when `electron-builder` updates its own tree. Re-check with `npm audit` before each release.

The site's `path-to-regexp` advisory *is* fixed, via an `overrides` pin to the patched 6.3.0 in `site/package.json` — noted there because the alternative offered by `npm audit fix --force` was an adapter downgrade incompatible with Astro 7.

## Supported versions

Only the latest release receives security fixes.
