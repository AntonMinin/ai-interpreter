# Troubleshooting

Run **Diagnostics** (top navigation) first — it checks the microphone, permissions, virtual cable, API keys and internet, and tells you what to fix. Below are the common cases in detail.

## The meeting can't hear my translated voice

1. **Is VB-CABLE installed?** Diagnostics must show "Virtual audio cable: Detected". If not: install from <https://vb-audio.com/Cable/> as administrator, reboot, retry.
2. **Is the app playing into the cable?** Settings → "Virtual microphone output" must be `CABLE Input (VB-Audio Virtual Cable)`. Use "Test audio" on the main screen — the meeting app's mic level meter should move during the tone.
3. **Is the meeting app listening to the cable?** Its microphone must be `CABLE Output` (not "CABLE Input", not your real mic).
4. **Did you press Start?** The status badge should say Ready/Listening, and the "My voice → meeting" direction must be enabled in Settings.

## The app doesn't hear me

- Diagnostics → "Microphone access". If blocked: Windows Settings → Privacy & security → Microphone → allow desktop apps.
- Pick the correct microphone in Settings and watch the input meter on the main screen while speaking.
- If the meter barely moves, lower the **Voice sensitivity** value (it is a threshold — lower = more sensitive).
- In push-to-talk mode, the meter only moves while the key is held.

## It hears me but nothing is translated

- Diagnostics → API key checks. `401` means the key is wrong; re-paste it in Settings.
- No internet → the app reports it; cloud providers need connectivity.
- Very short utterances (under ~0.4 s) are dropped by design; adjust "Min phrase length" if needed.

## Subtitles for the meeting don't appear

- Enable "Meeting → me" in Settings **before** pressing Start.
- Windows will show a screen-share style permission when loopback capture starts — accept it.
- Loopback captures your **default output device**. The meeting audio must be playing on that default device (the one Windows shows in the volume tray).

## I hear echoes / the app translates itself

- Use headphones. Laptop speakers feed translated audio back into your microphone.
- The app already pauses inbound capture while it speaks the inbound translation; if you still get loops, disable "Speak translation into my headphones" and use subtitles.

## Translation is too slow

- Phrase-based pipeline: latency = your pause + STT + translation + TTS, usually 2–5 s. Shorter phrases = faster turnaround.
- Reduce "Pause before sending" (e.g. 500 ms) for snappier cuts, at the risk of splitting sentences.
- Streaming mode is on the roadmap (v0.2).

## Robotic / clipped audio in the meeting

- Disable the meeting app's noise suppression / auto gain for the CABLE microphone (Zoom and Teams both apply it by default).

## Where are the logs?

Settings → "Show log file location". Attach relevant lines to bug reports; logs contain no API keys and no audio.

## Reset everything

Close the app and delete `%APPDATA%\ai-interpreter\` — settings, keys and logs are removed; onboarding runs again on next start.
