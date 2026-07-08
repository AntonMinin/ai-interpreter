# Contributing to AI Interpreter

Thanks for considering a contribution! The project is in **early alpha**, which means well-scoped work exists at every level and small PRs land fast. It aims to stay approachable for TypeScript/JavaScript developers — no native toolchains are required to build or run it.

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
- **UI translations** — the interface uses a small built-in i18n layer (`src/renderer/src/i18n/`): flat key dictionaries `en.ts` and `ru.ts`, a `useT()` hook, English fallback for missing keys. To add a language: create a dictionary file, register it in `i18n/index.ts` (`UI_LANGUAGES` + `dictionaries`). When adding UI strings, add the key to **both** `en.ts` and `ru.ts` — never hardcode user-facing text in components. Note: the interface language is a separate setting from the speech translation languages.
- **Docs** — clearer setup instructions save real users real pain.

## Ground rules

- TypeScript strict mode; `npm run typecheck` must pass.
- Keep `src/core` pure (no Electron, no DOM) so it stays unit-testable.
- Never log API keys or captured audio. The logger redacts key-shaped strings; don't work around it.
- Anything that changes what data leaves the user's machine must update [docs/privacy.md](docs/privacy.md) in the same PR.
- One feature per PR; include a manual test note ("how I verified this").

## License of contributions

AI Interpreter is distributed under the [AI Interpreter Source Available License](LICENSE) — it is source-available, not open source. By submitting a contribution you agree that it becomes part of the project and is distributed under that same license, and you grant the author the rights described in its "Contributions" section. Only submit work you have the right to license this way.

## Reporting bugs / proposing features

Use the issue templates. For audio problems, include the Diagnostics screen output and your Windows version.
