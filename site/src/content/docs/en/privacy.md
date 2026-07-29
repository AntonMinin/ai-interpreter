---
title: Privacy and security
description: Exactly what leaves your computer, when, where your keys live, and what the logs contain.
section: about
order: 6
---

This app handles your live voice, so vague reassurance is worthless. Here is the specific behaviour, and it is all verifiable in the source — start at `src/main/providers/` and `src/renderer/src/pipeline/controller.ts`.

## What is sent, and when

Audio and text leave your machine **only while the pipeline is running** — after you press Start, or when you explicitly press a test button.

| Data | Goes to | When |
|---|---|---|
| Short audio segments of **your** voice | Your speech-recognition provider (OpenAI) | Only for sounds the voice detector considers speech, in the *My voice → meeting* direction |
| Short audio segments of **meeting** audio | The same provider | Only if you enabled *Meeting → me* |
| The recognized text | Your translation provider (OpenAI or Anthropic) | After each recognition |
| The translated text | Your voice-synthesis provider (OpenAI) | Only for directions with voice output |

Everything travels over HTTPS.

**Nothing is sent to this project's authors.** No telemetry, no analytics, no crash reporting, no accounts, no update pings. With the **Mock provider** selected, nothing leaves your computer at all.

## What the providers do with it

That is their policy, not ours, and it is worth reading before you use this for confidential meetings: [OpenAI's API data usage](https://platform.openai.com/docs/guides/your-data) and [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy).

Two things worth knowing regardless of provider: audio segments are short phrases rather than whole recordings, and the app sends nothing while you are only listening.

## If a meeting must not touch the cloud

There are no local models in this version, so the honest answer is: do not press Start. Mock mode is fully offline but does not really translate. Local and offline models are on the roadmap.

## Your API keys

- Stored in `%APPDATA%\ai-interpreter\secrets.json`, encrypted with Windows DPAPI and bound to your Windows account. If DPAPI is unavailable, the app falls back to plain text **and writes a warning to the log** rather than pretending it encrypted them.
- Used only in the Electron main process. The interface never receives them.
- Sent only to the matching provider, as an authorization header.
- Never logged. The logger additionally redacts anything that looks like a key before writing.
- Keys supplied through the `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` environment variables are used but never written to disk.

## What the logs contain

`%APPDATA%\ai-interpreter\logs\ai-interpreter.log` holds timestamps, lifecycle events and error messages — HTTP status codes, device errors, that sort of thing. It contains **no audio, no transcripts, no translations and no keys**. It rotates at 2 MB, and you can clear it any time from Settings.

## Transcripts

The live transcript exists in the app's memory only and disappears when you close the app. Nothing is written to disk. There is no export or save feature.

If you want a record of a meeting, use your meeting platform's own recording — and remember that recording other people may legally require their consent where you are.

## Reporting a vulnerability

Please report security issues privately rather than in a public issue: see [SECURITY.md](https://github.com/AntonMinin/ai-interpreter/blob/main/SECURITY.md).
