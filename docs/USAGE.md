# Usage

A short, step-by-step walkthrough from install to your first translated call, plus fixes for the most common problems. For background and options see [user-guide.md](user-guide.md); for anything that breaks see [troubleshooting.md](troubleshooting.md).

AI Interpreter is Windows-only for now and in early alpha.

## 1. Install

1. Download the latest `AI Interpreter Setup <version>.exe` from the [Releases page](../../releases).
2. Run the installer. Windows SmartScreen may warn because the build is unsigned — choose **More info → Run anyway**.
3. Install the virtual audio cable that carries your translated voice into meeting apps:
   - Download **VB-CABLE**: <https://vb-audio.com/Cable/>
   - Unzip, right-click `VBCABLE_Setup_x64.exe` → **Run as administrator**, click *Install Driver*.
   - **Reboot once.** The app detects the cable automatically after the reboot.

## 2. First launch

Start **AI Interpreter**. The setup wizard walks you through each step below. You can re-run any check later from the **Diagnostics** screen.

1. **Interface language** — English or Русский. This is only the app's own language; it is independent of the translation languages.
2. **Microphone** — pick your input device (a headset is strongly recommended).
3. **Voice check** — say the test phrase so you can confirm the mic level moves.

## 3. Set up API keys

The app needs an AI provider to do the actual work.

- **OpenAI key** (required for real translation): create one at <https://platform.openai.com/api-keys>. It powers speech recognition, translation and the voice.
- **Anthropic key** (optional): create one at <https://console.anthropic.com/> if you prefer Claude for translation.

In the wizard (or later in **Settings → API keys**), paste the key and press **Test**. Keys are stored locally, encrypted with your Windows account (DPAPI), and never leave your machine except as requests to that provider.

No key yet? Choose the **Mock provider** to explore the whole app offline — it fakes transcripts and plays beeps instead of real speech.

## 4. Choose languages

In **Settings → Translation directions**:

- **My voice → meeting** (default Russian → English): what you say is translated and spoken to the meeting.
- **Meeting → me** (default English → Russian): what others say appears as subtitles, and optionally as a voice in your headphones.
- Enable one direction, or both for two-way interpretation. Pick any source/target pair from the 16 built-in languages.

## 5. Choose input and output devices

In **Settings → Devices**:

- **Microphone** — the device you speak into (your real mic or headset).
- **Monitor / headphones** — where you hear incoming translation and test tones. Use headphones, not speakers, so your translated audio does not leak back into the mic.
- **Virtual microphone** — set this to **`CABLE Input (VB-Audio Virtual Cable)`**. This is where the app sends your translated voice. The wizard detects VB-CABLE and selects it for you.

## 6. Configure your meeting app

In your meeting app, set the **microphone** to **`CABLE Output (VB-Audio Virtual Cable)`** and keep the **speaker** on your headphones.

- **Zoom**: Settings → **Audio** → Microphone → `CABLE Output (VB-Audio Virtual Cable)`. Also turn off *Automatically adjust microphone volume* and set background-noise suppression to **Low** (aggressive suppression can cut synthesized speech).
- **Google Meet**: in a call → gear icon → **Audio** → Microphone → `CABLE Output (VB-Audio Virtual Cable)`. Speaker: your headphones.
- **Microsoft Teams**: Settings → **Devices** → Microphone → `CABLE Output (VB-Audio Virtual Cable)`. Turn off Teams noise suppression for this device if speech sounds clipped.

> The naming can be confusing: the **app** outputs to **CABLE Input**, and the **meeting app** listens on **CABLE Output**. That is correct — the cable carries audio from one to the other.

## 7. Run and stop a translation

1. Press **Start** on the main screen.
2. Speak at a natural pace, pausing briefly between thoughts — each pause sends a phrase for translation. Expect the meeting to hear the translation about 2–5 seconds after you finish a phrase.
3. Watch the **Live transcript**: your phrases and the meeting's phrases with their translations.
4. Press **Stop** when done. (Optional: use **Push-to-talk** in Settings → Speech capture to only send audio while holding a key.)

## Troubleshooting the common problems

**No sound / the meeting can't hear me**
- In the meeting app, confirm the microphone is `CABLE Output (VB-Audio Virtual Cable)`.
- In AI Interpreter, confirm the virtual microphone is `CABLE Input (VB-Audio Virtual Cable)`.
- Make sure the pipeline is **Started** and the "My voice → meeting" direction is enabled.
- Use the **Test** button on the virtual-microphone step to send a tone.

**No translation appears**
- Check API keys under **Settings → API keys** and press **Test**.
- Run **Diagnostics** — it checks internet access and each key.
- Confirm you are not accidentally in **Mock mode** (Settings → AI providers).
- Speak a bit louder or raise sensitivity if phrases are never detected; see below.

**Subtitles don't show**
- Enable **Meeting → me** with **Subtitles** on in Settings.
- Incoming subtitles use Windows loopback capture — make sure meeting audio is actually playing on your machine.

**Audio loops / echo**
- Use **headphones**, not speakers. Speaker output feeds back into your mic and the loopback capture.
- Do not select the VB-CABLE device as your *monitor/headphones* output.

**Virtual microphone not detected**
- Reinstall VB-CABLE as administrator and **reboot** — the driver only appears after a reboot.
- Re-run the virtual-microphone step in Diagnostics; the app rescans devices.

**The app translates background noise**
- Raise **Voice sensitivity (VAD threshold)** in Settings → Speech capture, or switch to **Push-to-talk**.

Still stuck? See [troubleshooting.md](troubleshooting.md) and the **Diagnostics** screen output when filing an issue.
