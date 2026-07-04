# Architecture

## Overview

AI Interpreter is an Electron app written entirely in TypeScript. There are no native modules: audio capture and playback use the Web Audio API in the renderer, Windows system-audio capture uses Electron's loopback support, and audio routing to the virtual microphone uses `HTMLAudioElement.setSinkId`.

```
┌────────────────────────────── renderer (React) ──────────────────────────────┐
│                                                                              │
│  Mic ──getUserMedia──► AudioWorklet ──frames──► PhraseSegmenter (VAD)        │
│  Meeting audio ──getDisplayMedia(loopback)──► AudioWorklet ──► Segmenter     │
│                                          │ phrase (Float32)                  │
│                              resample 16k + WAV encode                       │
│                                          │ IPC (base64 WAV)                  │
├──────────────────────────────── preload bridge ──────────────────────────────┤
│                              window.interpreter.*                            │
├──────────────────────────────── main process ────────────────────────────────┤
│  settings.json      secrets.json (DPAPI)      logger (redacting)             │
│                                                                              │
│  Provider registry:  STT ──► Translation ──► TTS                             │
│    openai (STT+MT+TTS)   anthropic (MT)   mock (all, offline)                │
├───────────────────────────────────────────────────────────────────────────────┤
│  results flow back to renderer:                                              │
│    outbound: TTS audio ──AudioQueuePlayer──► setSinkId(CABLE Input) ─► meeting│
│    inbound:  subtitles UI  (+ optional TTS ─► user's headphones)              │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Modules

| Path | Responsibility |
|---|---|
| `src/core/stateMachine.ts` | Pure reducer for pipeline state; derives the single UI status (`ready`/`listening`/`transcribing`/`translating`/`speaking`/`error`/`stopped`) from concurrent in-flight work |
| `src/core/segmenter.ts` | Energy-based VAD + phrase segmentation with preroll, min/max phrase length and silence timeout; pure and unit-tested |
| `src/core/audio.ts` | Linear resampling, PCM16 WAV encoding, test-tone generation, base64 helpers |
| `src/shared/types.ts` | Settings schema and defaults, IPC payload types, transcript/diagnostic types |
| `src/shared/languages.ts` | Language registry. Languages are data, not code — pairs are never hardcoded |
| `src/main/settings.ts` | JSON settings store in `%APPDATA%/ai-interpreter` |
| `src/main/secrets.ts` | API keys via Electron `safeStorage` (DPAPI on Windows); env-var fallback for dev |
| `src/main/logger.ts` | File logger with API-key redaction |
| `src/main/providers/*` | Provider implementations behind small interfaces (`SttProvider`, `TranslationProvider`, `TtsProvider`, `KeyValidator`) |
| `src/main/ipcHandlers.ts` | The entire IPC surface; converts provider errors into human-readable messages |
| `src/renderer/src/audio/*` | Mic/loopback capture (AudioWorklet), device enumeration, virtual-cable detection, sequential audio playback queue with sink routing |
| `src/renderer/src/pipeline/controller.ts` | Orchestrates capture → segment → STT → translate → TTS → playback for both directions; owns the state machine |
| `src/renderer/src/components/*` | Main screen, Settings, Onboarding wizard, Diagnostics |

## Key design decisions

**Phrase-based pipeline first, streaming later.** v0.1 sends complete phrases (bounded by silence or a max length) through STT→MT→TTS. Interfaces are per-stage, so a streaming STT provider can replace the batch one without touching orchestration; the segmenter already emits `onSpeechStart`/partial hooks the UI uses.

**Providers are dumb adapters.** Business logic (segmentation, ordering, gating, error surfacing) lives in the controller and IPC layer. A provider only maps one request to one HTTP call and one error type. Adding a provider = one file + one registry entry + one `<option>`.

**API keys never enter the renderer.** All provider HTTP happens in the main process. The renderer sends text/audio payloads over IPC and gets results back.

**Virtual microphone = routing, not drivers.** Playing TTS audio into VB-CABLE's *CABLE Input* render device makes it appear at *CABLE Output*, which meeting apps list as a microphone. This costs the user a one-time driver install but keeps the app 100% TypeScript. The `AudioQueuePlayer.getSinkId` indirection means a future branded driver is a drop-in replacement.

**Loopback feedback gating.** Windows loopback captures *all* system output on the default device. If the app speaks the inbound translation into the user's headphones, that audio would be re-captured and re-translated forever. The controller drops inbound frames while the monitor player is active. (Outbound TTS goes to the CABLE device, which is not the default output, so it is not re-captured.)

## Adding a language

Add an entry to `src/shared/languages.ts`. That's it for the app; verify your STT model accepts the ISO code and your TTS voice sounds acceptable in that language.

## Adding a provider

1. Create `src/main/providers/<name>.ts` implementing the relevant interfaces from `providers/types.ts`. Throw `ProviderError` with a human-readable message for expected failures.
2. Register it in `providers/registry.ts`.
3. Add the option in `SettingsScreen.tsx` (and onboarding if it should be offered there).
4. If it needs a key, extend `secrets.ts`'s `SecretName`, `KeyStatus` and the Settings key form.

## Future platforms

The renderer/core layers are platform-neutral. Windows-specific pieces are isolated: loopback capture (Electron display-media handler) and the VB-CABLE recommendation. macOS will need a Core Audio loopback strategy (e.g. an audio-capture system extension) and a different virtual-device story; the provider and pipeline layers are unaffected.
