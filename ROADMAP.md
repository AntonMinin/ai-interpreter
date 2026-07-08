# Roadmap

Current status: **v0.1.0-alpha** — early alpha, Windows MVP available for testing.

## v0.1 — Windows MVP (current, alpha)

- [x] Windows desktop app (Electron + TypeScript)
- [x] RU ↔ EN as the default pair; languages configurable, nothing hardcoded
- [x] Microphone capture, voice activity detection, phrase segmentation
- [x] Cloud pipeline: STT → translation → TTS (OpenAI; Claude for translation)
- [x] Spoken translation into a virtual microphone (VB-CABLE, assisted setup)
- [x] Incoming meeting audio → subtitles (+ optional voice) via Windows loopback
- [x] Onboarding wizard, diagnostics screen, push-to-talk, mock provider
- [x] Interface languages: English and Russian (independent of translation languages)
- [x] NSIS installer

## v0.2 — polish and latency

- [ ] Better onboarding (per-meeting-app walkthrough with screenshots)
- [ ] Lower latency: streaming STT (partial transcripts), sentence-level early TTS start
- [ ] Better audio diagnostics: live loopback check, end-to-end "can the meeting hear me" probe
- [ ] Installer improvements: detect VB-CABLE during install, offer to launch its installer
- [ ] Auto-update

## v0.3 — robustness

- [ ] Two-way mode hardening (echo/feedback handling beyond simple gating)
- [ ] Global push-to-talk hotkey (works when the app is not focused)
- [ ] Noise suppression options (RNNoise-class, in-app)
- [ ] Smarter phrase segmentation (semantic boundaries, not just silence)
- [ ] Audio queue improvements: cancellation, "skip backlog" when falling behind
- [ ] More providers (Deepgram/AssemblyAI STT, ElevenLabs TTS, Google/DeepL translation)

## v1.0

- [ ] Branded virtual microphone driver (replaces the VB-CABLE dependency)
- [ ] Stable Windows release, code signing
- [ ] macOS support (Core Audio capture; virtual device via approved system extension)
- [ ] Public website, demo video
- [ ] Contributor community: good-first-issues, provider plugin API

## Future

- [ ] More languages and per-direction voices
- [ ] Local/offline mode (whisper.cpp-class STT, local translation, local TTS)
- [ ] iPhone/Android companion app
- [ ] Meeting transcript export (only if enabled explicitly; privacy-first)
- [ ] Subtitle export (SRT/VTT)
- [ ] Multiple-participant awareness / speaker diarization
- [ ] Voice cloning — only if privacy-safe and clearly documented

## Suggested first issues

Recommended issues to open on GitHub for contributors (labels in brackets):

- [v0.2] Streaming STT support
- [v0.2] Reduce translation latency
- [v0.2] Improve VB-CABLE detection
- [v0.2] Add global push-to-talk hotkey
- [v0.2] Improve onboarding for Zoom / Meet / Teams
- [v0.3] Add more AI providers
- [v0.3] Add local/offline provider research
- [v1.0] Branded virtual microphone research
- [v1.0] Code signing for Windows installer
- [Docs] Add demo video
- [Docs] Add troubleshooting screenshots

Suggested labels: `good first issue`, `help wanted`, `provider`, `latency`, `audio`, `docs`, `windows`.
