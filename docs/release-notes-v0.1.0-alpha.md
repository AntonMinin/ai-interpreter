# AI Interpreter v0.1.0-alpha — Windows MVP

First alpha release of AI Interpreter.

This is an early Windows MVP for real-time AI interpretation in online meetings.
The app currently supports assisted setup with VB-CABLE, microphone input, speech-to-text, translation, text-to-speech, subtitles, diagnostics, and mock mode.

Status: early alpha. Not ready for daily production use yet.

## Highlights

- Speak your language → the meeting hears your voice translated (via a virtual microphone)
- Meeting audio → live subtitles in your language, optional voice in your headphones
- Default pair RU ↔ EN; source/target languages configurable (16 languages in the list)
- Interface in English and Russian
- Providers: OpenAI (STT + translation + TTS), Anthropic Claude (translation), offline Mock mode
- First-run setup wizard, audio diagnostics, push-to-talk, encrypted local key storage

## Requirements

- Windows 10/11
- Free [VB-CABLE](https://vb-audio.com/Cable/) virtual audio driver (or compatible) — one-time install, the app guides and verifies it
- An OpenAI API key for real translation (Mock mode works without any key)

## Known limitations

- Phrase-based pipeline: ~2–5 s delay per phrase (streaming planned for v0.2)
- Cloud providers only; no local/offline mode yet
- Installer is unsigned (SmartScreen warning expected)
- Windows only

## Checksums / verification

Build the installer yourself from this tag with `npm install && npm run dist` to verify the artifact.
