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

## Release build

```bash
npm run dist
```

Produces `release/AI Interpreter Setup <version>.exe` (NSIS, per-user or custom dir). The build is currently unsigned; Windows SmartScreen will warn users — code signing is a v1.0 roadmap item.

## Conventions

- TypeScript strict; no `any` unless unavoidable.
- `src/core` must stay dependency-free and DOM/Electron-free.
- Human-facing error messages are created in the main process (`ProviderError.userMessage`) so the renderer can show them verbatim.
- Never add logging of request payloads that may contain audio or keys.
