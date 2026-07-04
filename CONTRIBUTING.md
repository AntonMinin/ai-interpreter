# Contributing to AI Interpreter

Thanks for considering a contribution! This project aims to stay approachable for TypeScript/JavaScript developers — no native toolchains are required to build or run it.

## Getting started

```bash
npm install
npm run dev
```

`npm run dev` starts Electron with hot reload. The offline **Mock provider** (Settings → AI providers) lets you exercise the whole pipeline without any API key or internet access.

Before opening a PR:

```bash
npm run typecheck
npm test
npm run build
```

## Project layout

```
src/core       pure, framework-free logic (state machine, VAD segmenter, WAV codecs) — unit tested
src/shared     types, language registry, IPC channel names
src/main       Electron main process: settings, encrypted secrets, logging, AI providers, IPC
src/preload    contextBridge API exposed to the renderer as window.interpreter
src/renderer   React UI: main screen, settings, onboarding wizard, diagnostics, audio capture/playback
tests          vitest unit tests for src/core
docs           user and developer documentation
```

See [docs/architecture.md](docs/architecture.md) for the full picture.

## What makes a good contribution

- **Bug fixes** with a reproduction description.
- **New providers** — implement the interfaces in `src/main/providers/types.ts`, register in `registry.ts`, add the option to the Settings UI. Keep provider code free of business logic.
- **New languages** — usually just an entry in `src/shared/languages.ts`, plus a check that your STT/TTS provider supports the language code.
- **Latency work** — streaming STT/TTS, smarter segmentation. Talk to us in an issue first; this is the roadmap's main theme.
- **Docs** — clearer setup instructions save real users real pain.

## Ground rules

- TypeScript strict mode; `npm run typecheck` must pass.
- Keep `src/core` pure (no Electron, no DOM) so it stays unit-testable.
- Never log API keys or captured audio. The logger redacts key-shaped strings; don't work around it.
- Anything that changes what data leaves the user's machine must update [docs/privacy.md](docs/privacy.md) in the same PR.
- One feature per PR; include a manual test note ("how I verified this").

## Reporting bugs / proposing features

Use the issue templates. For audio problems, include the Diagnostics screen output and your Windows version.
