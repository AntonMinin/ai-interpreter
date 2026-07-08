# AI Interpreter

Free, source-available real-time AI interpreter for online meetings.

**Status: Early alpha. Windows MVP is available for testing. Not ready for daily production use yet.**

You speak your language — the meeting hears your voice translated into theirs. They answer in their language — you get live subtitles (and optionally a voice) in yours. Works with Zoom, Google Meet, Microsoft Teams and any other app that lets you pick a microphone.

## Why

Many AI interpreter tools are closed, expensive, or tied to a single meeting platform.
AI Interpreter is a free, source-available alternative focused on one simple goal:

> **Install it, start it, and speak across languages in online meetings.**

```
Your voice (mic) ──► speech-to-text ──► translation ──► text-to-speech ──► virtual microphone ──► meeting
Meeting audio ─────► speech-to-text ──► translation ──► subtitles on your screen (+ optional voice for you)
```

The default pair is **Russian ↔ English**, but languages are configuration, not code — any source/target pair from the built-in list (16 languages) can be selected, and adding more is a one-line change. The app interface itself is available in **English and Русский** (switchable in Settings, independent of the translation languages).

## What works today (alpha)

- Windows desktop app: runs from source, builds an NSIS installer
- Microphone capture with voice activity detection and phrase segmentation
- Speech → text → translation → speech pipeline (OpenAI; Anthropic Claude optional for translation)
- Spoken translation routed into a virtual microphone that meeting apps see as a normal mic
- Incoming meeting audio (Windows loopback) → live subtitles, optional voice in your headphones
- First-run setup wizard, diagnostics screen, push-to-talk, test buttons
- Offline **Mock mode** — try the whole app without any API key
- API keys stored encrypted (Windows DPAPI), never logged; interface in English / Russian

## Known limitations (please read before testing)

- **Early alpha.** Expect rough edges; don't rely on it for important meetings yet.
- **Virtual audio device required.** The Windows alpha needs the free [VB-CABLE](https://vb-audio.com/Cable/) driver (or a compatible virtual audio device) installed once. This is a normal driver installer + one reboot; the app detects it, walks you through it and verifies the result. A built-in branded device is planned for v1.0.
- **Latency.** Translation is phrase-based: the meeting hears you ~2–5 seconds after you finish a phrase. Streaming mode is the main v0.2 goal.
- **Cloud only.** Speech and text are processed by the AI provider you configure (see [Privacy](#privacy--security)). No local/offline models yet.
- **Windows only.** macOS/Linux are on the [roadmap](ROADMAP.md).
- The installer is unsigned for now — Windows SmartScreen will warn you.

## Download

Grab the latest `AI Interpreter Setup <version>.exe` from the [Releases page](../../releases). Current release: **v0.1.0-alpha** ([release notes](docs/release-notes-v0.1.0-alpha.md)).

## Quick start (users)

1. Run the installer.
2. Install [VB-CABLE](https://vb-audio.com/Cable/) (run as administrator, reboot once). The app's setup wizard explains and verifies this.
3. Launch **AI Interpreter** — the wizard walks you through: interface language → microphone → voice check → API key (or Mock mode) → translation test → voice test → virtual microphone → meeting app setup.
4. In your meeting app, select **`CABLE Output (VB-Audio Virtual Cable)`** as the microphone.
5. Press **Start** and speak.

You'll need an [OpenAI API key](https://platform.openai.com/api-keys) (speech recognition + translation + voice; typically a few cents per meeting-minute of speech), and optionally an [Anthropic key](https://console.anthropic.com/) if you prefer Claude for translation. No key? Pick **Mock mode** to explore the app offline.

Full instructions: [docs/user-guide.md](docs/user-guide.md).

## Use with Zoom

Zoom → Settings → **Audio** → Microphone: `CABLE Output (VB-Audio Virtual Cable)`. Keep the speaker on your headphones. Recommended: disable "Automatically adjust microphone volume" and set background-noise suppression to Low — aggressive suppression can eat synthesized speech.

## Use with Google Meet

In a call → gear icon → **Audio** → Microphone: `CABLE Output (VB-Audio Virtual Cable)`. Speaker: your headphones.

## Use with Microsoft Teams

Teams → Settings → **Devices** → Microphone: `CABLE Output (VB-Audio Virtual Cable)`. Turn off Teams noise suppression for this device if speech sounds clipped.

Problems? See [docs/troubleshooting.md](docs/troubleshooting.md) — it covers "the meeting can't hear me" and friends.

## Privacy & security

- Short audio segments of speech and the recognized/translated text are sent **only** to the AI provider you selected, over HTTPS, and **only while the pipeline is running**. In Mock mode nothing leaves your computer.
- No telemetry, no analytics, nothing sent to this project's authors.
- API keys are stored locally, encrypted with Windows DPAPI, used only in the main process and redacted from logs.
- Transcripts live in memory only and disappear when you close the app.

Details: [docs/privacy.md](docs/privacy.md). Vulnerability reports: [SECURITY.md](SECURITY.md).

## Development start

```bash
git clone https://github.com/<you>/ai-interpreter.git
cd ai-interpreter
npm install
npm run dev        # Electron with hot reload
```

Checks:

```bash
npm run typecheck  # TypeScript
npm test           # unit tests (state machine, VAD segmenter, audio codecs)
```

The Mock provider lets you develop without API keys. More in [docs/developer-guide.md](docs/developer-guide.md).

## Build

```bash
npm run build      # production bundles into out/
npm run dist       # Windows NSIS installer into release/
npm run dist:dir   # unpacked build (faster, for smoke tests)
```

## Roadmap

Short version: **v0.2** — streaming STT and lower latency, better VB-CABLE detection, global push-to-talk hotkey; **v0.3** — more providers, local/offline research; **v1.0** — branded virtual microphone, signed installer, macOS. Full plan and suggested first issues: [ROADMAP.md](ROADMAP.md).

## Contributing

Contributions are very welcome — the project is young and there is well-scoped work at every level (docs, providers, latency, UI translations). Start with [CONTRIBUTING.md](CONTRIBUTING.md).

## License

AI Interpreter is **source-available, not open source**. You may download, install and use
the app for free, view and study the source, build it for your own personal use, and send
pull requests. You may **not** reuse the source in other projects, distribute modified
versions as a separate product, or use it in commercial products without written permission.
Contributions become part of the project under the same terms.

See the full terms in [LICENSE](LICENSE) — *AI Interpreter Source Available License*, © 2026 Anton Minin Baranovskii.
