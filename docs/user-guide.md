# User Guide

> AI Interpreter is in **early alpha**. It works, but expect rough edges — please report anything confusing via GitHub Issues.

## Interface language

The app interface is available in **English** and **Русский**. Choose it on the first screen of the setup wizard or any time in **Settings → Interface language**. This is only the language of the app itself — it is completely independent of the speech translation languages (what you speak and what the meeting hears), which are configured separately under "Translation directions". The choice is saved between launches.

## What you need

1. **Windows 10/11** and a microphone (a headset is strongly recommended).
2. **VB-CABLE** — a free virtual audio cable: <https://vb-audio.com/Cable/>. Download, unzip, right-click `VBCABLE_Setup_x64.exe` → *Run as administrator*, reboot once. The app detects it automatically afterwards.
3. **An OpenAI API key** (<https://platform.openai.com/api-keys>). It powers speech recognition, translation and the voice. Optionally an Anthropic key if you prefer Claude for translation. You pay the provider directly, typically a few cents per minute of actual speech.

No key yet? Choose the **Mock provider** during onboarding to explore the app offline — it fakes transcripts and plays beeps instead of speech.

## First run

The setup wizard walks you through: interface language + microphone choice → "say the test phrase" check → provider + API key → translation test → voice test → virtual microphone setup → meeting app instructions → Ready. You can re-run any check later from **Diagnostics**.

## Modes

Open **Settings** to configure directions:

- **My voice → meeting** (default RU → EN): what you say is spoken to the meeting in the target language through the virtual microphone.
- **Meeting → me** (default EN → RU): what others say appears as live subtitles; optionally also spoken into your headphones.
- Enable both for **two-way** interpretation.
- **Subtitles only**: enable only "Meeting → me" with subtitles.
- **Push-to-talk**: in Settings → Speech capture, switch from Automatic to Push-to-talk and pick a key. Hold it while speaking; release to send the phrase.

## In the meeting app

Set the **microphone** to `CABLE Output (VB-Audio Virtual Cable)`:

- **Zoom**: Settings → Audio → Microphone. Also disable "Automatically adjust microphone volume" and set background noise suppression to Low for best results.
- **Google Meet**: gear icon in the call → Audio → Microphone.
- **Microsoft Teams**: Settings → Devices → Microphone. Turn off "Noise suppression" for this device if speech sounds clipped.

Keep the **speaker** on your normal headphones. Use headphones, not laptop speakers — otherwise your own translated audio can leak back into the pipeline.

## During a call

1. Press **Start**.
2. Speak in your language at a natural pace. Pause briefly between thoughts — each pause sends a phrase for translation. Expect the meeting to hear the translation ~2–5 seconds after you finish a phrase.
3. Watch the **Live transcript** panel: your phrases (green) and the meeting's phrases (blue) with translations.
4. Press **Stop** when done.

Tips:

- Short, complete sentences translate best.
- Say "over to you" style handoffs — the delay means turn-taking cues help.
- If the app starts translating background noise, raise **Voice sensitivity** threshold in Settings.

## Where things are stored

- Settings: `%APPDATA%\ai-interpreter\settings.json`
- API keys: `%APPDATA%\ai-interpreter\secrets.json` (encrypted with your Windows account)
- Logs: `%APPDATA%\ai-interpreter\logs\` (no keys, no audio; clear from Settings)

Something not working? See [troubleshooting.md](troubleshooting.md).
