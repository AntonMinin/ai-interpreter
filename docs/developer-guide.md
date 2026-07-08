# Developer Guide

## Prerequisites

- Node.js ≥ 20
- Windows 10/11 for the full experience (loopback capture and DPAPI are Windows features; the UI itself runs anywhere Electron runs)

## Commands

```bash
npm install        # install dependencies
npm run dev        # Electron with hot reload (renderer HMR, main/preload rebuild)
npm run typecheck  # tsc --noEmit over the whole project
npm test           # vitest unit tests (tests/)
npm run build      # production bundles into out/
npm run dist       # build + NSIS installer into release/
npm run dist:dir   # build + unpacked app into release/ (faster, for smoke tests)
```

## Developing without API keys

Switch all three providers to **Mock** in Settings (or during onboarding). The mock provider returns canned transcripts/translations and synthesizes beep tones, so the entire capture → segment → IPC → playback path can be exercised offline.

For real-provider development you can export keys instead of entering them in the UI:

```powershell
$env:OPENAI_API_KEY = "sk-..."
$env:ANTHROPIC_API_KEY = "sk-ant-..."
npm run dev
```

Environment keys are used only when no key is saved in the app. `.env.example` documents them; note that the main process reads the real environment, not a `.env` file.

## Testing

Unit tests cover the pure core (`src/core`): the pipeline state machine, the VAD phrase segmenter and the audio codecs. They run in plain Node — no Electron needed:

```bash
npm test
```

Manual verification uses [manual-test-checklist.md](manual-test-checklist.md). Audio behavior (device routing, loopback, echo gating) can only be validated manually; do a checklist pass before every release.

## Debugging

- **Renderer**: `Ctrl+Shift+I` in dev mode opens DevTools.
- **Main process logs**: `%APPDATA%\ai-interpreter\logs\ai-interpreter.log`. Enable "Verbose logging" in Settings to include renderer debug lines.
- **IPC surface**: everything goes through `window.interpreter` (typed in `src/preload/index.ts`), which makes the boundary easy to stub.

## Interface localization (i18n)

The UI ships in English and Russian via a small built-in i18n layer — no external library:

- `src/renderer/src/i18n/en.ts` and `ru.ts` — flat key → string dictionaries
- `src/renderer/src/i18n/index.ts` — `UI_LANGUAGES`, `I18nContext`, `useT()` hook (components) and `makeT(lang)` (outside the provider); missing keys fall back to English, then to the key itself
- The active language comes from the persisted `interfaceLanguage` setting (Settings → Interface language, also offered on onboarding step 1)

Rules: user-facing strings go through `t('key')` with the key present in **both** dictionaries; interpolation uses `{name}` placeholders (`t('ob.step', { n: 1, total: 8 })`). The interface language is deliberately separate from `sourceLanguage`/`targetLanguage` used by the translation pipeline. Internal log messages stay English. Provider error texts are currently generated in English in the main process — localizing them is an open task.

## Release build

```bash
npm run dist
```

Produces `release/AI Interpreter Setup <version>.exe` (NSIS, per-user or custom dir). The build is currently unsigned; Windows SmartScreen will warn users — code signing is a v1.0 roadmap item.

## Publishing a release (maintainers)

1. Bump `version` in `package.json` (e.g. `0.1.0-alpha`), run the checks (`npm run typecheck && npm test && npm run build`).
2. `npm run dist` and smoke-test the installer from `release/` on a clean machine using [manual-test-checklist.md](manual-test-checklist.md).
3. Tag: `git tag v0.1.0-alpha && git push --tags`.
4. Create a GitHub Release for the tag, mark it as **pre-release**, attach the installer, and paste the notes from [release-notes-v0.1.0-alpha.md](release-notes-v0.1.0-alpha.md) (create the next version's notes file for future releases).

## Conventions

- TypeScript strict; no `any` unless unavoidable.
- `src/core` must stay dependency-free and DOM/Electron-free.
- Human-facing error messages are created in the main process (`ProviderError.userMessage`) so the renderer can show them verbatim.
- Never add logging of request payloads that may contain audio or keys.
