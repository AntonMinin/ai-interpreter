# AI Interpreter

Free and open-source real-time AI interpreter for online meetings (Zoom, Google Meet, Microsoft Teams and any other app that lets you pick a microphone).

You speak your language — the meeting hears your voice translated into theirs. They answer in their language — you get live subtitles (and optionally a voice) in yours.

**Install → open → press Start → it works.** That is the guiding principle of this project.

> Status: **v0.1 (Windows MVP)**. The core pipeline works; see [What works / what doesn't](#what-works--what-doesnt) for honest limits.

## The problem

Online meetings across a language barrier are painful. Human interpreters are expensive, built-in meeting captions don't speak for you, and existing tooling requires wiring virtual audio cables by hand. AI Interpreter packages speech recognition → translation → speech synthesis into a desktop app that a non-technical person can use.

## How it works

```
Your voice (mic) ──► speech-to-text ──► translation ──► text-to-speech ──► virtual microphone ──► meeting
Meeting audio ─────► speech-to-text ──► translation ──► subtitles on your screen (+ optional voice in your headphones)
```

The first language pair shipped is **Russian ↔ English**, but nothing is hardcoded — source and target languages are configurable, and 16 languages are already selectable in the UI.

## What works / what doesn't

**Works today (v0.1):**

- Windows desktop app (Electron + TypeScript), runs from source and builds an NSIS installer
- Microphone capture with voice activity detection and phrase segmentation
- Speech → text → translation → speech pipeline (OpenAI; Anthropic Claude available for the translation step)
- Spoken translation routed into a virtual microphone (VB-CABLE) that Zoom/Meet/Teams see as a normal mic
- Incoming meeting audio captured via Windows loopback → live subtitles, optional spoken translation into your headphones
- First-run onboarding wizard, audio diagnostics screen, push-to-talk, offline mock provider for trying the app without any API key
- API keys stored encrypted with Windows DPAPI, never logged

**Not yet:**

- Streaming (word-by-word) translation — the pipeline is phrase-based, so expect roughly 2–5 seconds of delay per phrase
- A bundled virtual audio driver — you install the free VB-CABLE once; the app detects it, guides you and verifies the result
- macOS / Linux / mobile (architecture allows it; see [ROADMAP.md](ROADMAP.md))
- Local/offline AI models

## Install (users)

1. Download the latest installer from [Releases](../../releases) and run it.
2. Install the free [VB-CABLE](https://vb-audio.com/Cable/) virtual audio driver (run its installer as administrator, reboot once). The app's onboarding explains this and verifies it.
3. Launch **AI Interpreter** and follow the setup wizard: pick your mic, paste an API key (or try the Mock provider first), test translation, test the virtual microphone.
4. In your meeting app choose **`CABLE Output (VB-Audio Virtual Cable)`** as the microphone.
5. Press **Start** and speak.

You will need an [OpenAI API key](https://platform.openai.com/api-keys) (used for speech recognition, translation and voice) and optionally an [Anthropic API key](https://console.anthropic.com/) if you prefer Claude for translation. Typical cost is a few cents per meeting-minute of speech.

## Use with Zoom / Google Meet / Teams

| App | Where | What to select |
|---|---|---|
| Zoom | Settings → Audio → Microphone | `CABLE Output (VB-Audio Virtual Cable)` |
| Google Meet | In-call gear icon → Audio → Microphone | `CABLE Output (VB-Audio Virtual Cable)` |
| Microsoft Teams | Settings → Devices → Microphone | `CABLE Output (VB-Audio Virtual Cable)` |

Keep your **speaker** set to your normal headphones. If the meeting app has its own noise suppression, set it to "low" or off for the CABLE microphone — aggressive suppression can eat synthesized speech. Details and troubleshooting: [docs/user-guide.md](docs/user-guide.md).

## Run locally (developers)

```bash
git clone https://github.com/<you>/ai-interpreter.git
cd ai-interpreter
npm install
npm run dev        # dev mode with hot reload
```

Other commands:

```bash
npm run typecheck  # TypeScript check
npm test           # unit tests (pipeline state machine, segmenter, audio codecs)
npm run build      # production bundles into out/
npm run dist       # Windows installer into release/
```

API keys can be entered in the app (recommended) or via environment variables for development — see [.env.example](.env.example).

## Documentation

- [User guide](docs/user-guide.md) — setup, meeting apps, modes
- [Troubleshooting](docs/troubleshooting.md) — "the meeting can't hear me" and friends
- [Architecture](docs/architecture.md) — modules, data flow, how to add a provider or a language
- [Developer guide](docs/developer-guide.md) — project layout, testing, building the installer
- [Privacy & security](docs/privacy.md) — exactly what leaves your computer and when
- [Manual test checklist](docs/manual-test-checklist.md)
- [Roadmap](ROADMAP.md)

## Contributing

Contributions are very welcome — this project is young and there is a lot of well-scoped work (see the roadmap). Start with [CONTRIBUTING.md](CONTRIBUTING.md). Security reports: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
