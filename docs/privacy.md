# Privacy & Security Notes

AI Interpreter handles your live voice. This page states exactly what leaves your computer, when, and how to control it. The app is open source — you can verify every claim in the code (start at `src/main/providers/` and `src/renderer/src/pipeline/controller.ts`).

## What is sent to cloud AI providers, and when

Audio and text leave your machine **only while the pipeline is running** (after you press Start, or when you explicitly run a test):

| Data | Sent to | When |
|---|---|---|
| Short audio segments of **your** voice (WAV) | Your selected STT provider (OpenAI) | Only for phrases the voice-activity detector considers speech, in the "My voice → meeting" direction |
| Short audio segments of **meeting** audio | Same STT provider | Only if you enabled "Meeting → me" |
| Recognized text | Your selected translation provider (OpenAI or Anthropic) | After each transcription |
| Translated text | Your selected TTS provider (OpenAI) | Only for directions with voice output |

All transport is HTTPS. Nothing is sent to the project's authors — there is no telemetry, no analytics, no crash reporting.

With the **Mock provider** selected, nothing leaves your computer at all.

Provider retention policies are theirs, not ours — review [OpenAI's API data usage](https://platform.openai.com/docs/guides/your-data) and [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy) before using the app for confidential meetings.

## Disabling cloud mode

v0.1 has no local AI models; the Mock provider is the only fully-offline mode (it does not really translate). A local/offline mode is on the [roadmap](../ROADMAP.md). Until then: if a meeting must not touch the cloud, don't press Start.

## API keys

- Stored in `%APPDATA%\ai-interpreter\secrets.json`, encrypted with Windows DPAPI (tied to your Windows account). If DPAPI is unavailable, the app stores them in plain text and writes a warning to the log.
- Used only in the Electron main process; the UI never sees them.
- Sent only to the matching provider as an `Authorization` header.
- Never logged — the logger additionally redacts anything that looks like a key.

## What is logged

`%APPDATA%\ai-interpreter\logs\ai-interpreter.log` contains timestamps, lifecycle events and error messages (HTTP status codes, device errors). It contains **no audio, no transcripts, no translations, no keys**. Delete it any time via Settings → "Clear logs" or by removing the file.

## Transcripts

The live transcript exists only in the app's memory and disappears when you close the app. Nothing is written to disk.
