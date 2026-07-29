---
title: Troubleshooting
description: The meeting cannot hear me, the app cannot hear me, echoes, slowness — with the actual fix for each.
section: use
order: 5
---

Open **Diagnostics** in the app first. It checks microphone permission, devices, the virtual cable, your API keys and your connection, and tells you which one is broken. Most problems below are things it will name for you.

## The meeting cannot hear my translated voice

Work down this list in order — it is sorted by how often each one is the culprit.

1. **Is the meeting app listening to the cable?** Its microphone must be `CABLE Output` — not `CABLE Input`, not your real microphone. This is the single most common mistake, because the two names differ by one word.
2. **Is the app playing into the cable?** Settings → *Virtual microphone output* must be `CABLE Input`. Press **Test audio**: the meeting app's own level meter should move.
3. **Is VB-CABLE installed?** Diagnostics must show *Virtual audio cable: Detected*. If not, install it as administrator and reboot — the driver is not registered until you do.
4. **Did you press Start, and is the direction on?** The status badge should read Ready or Listening, and *My voice → meeting* must be enabled.
5. **Is the meeting app's noise suppression eating it?** Zoom and Teams apply aggressive suppression by default and treat synthetic speech as noise. Turn it down to Low or off for this device.

## The app cannot hear me

- Diagnostics → *Microphone access*. If blocked: Windows Settings → Privacy & security → Microphone → allow desktop apps.
- Check that the right microphone is selected, then watch the input meter on the main screen while you talk.
- If the meter barely moves, **lower** the Voice sensitivity value in Advanced settings. It is a threshold: lower means more sensitive.
- In push-to-talk mode the meter only moves while you hold the key — and only while the app window is focused.
- Check that the microphone is not muted. If you pressed the mute hotkey, the meter is labelled *Microphone muted*.

## It hears me but nothing gets translated

- Diagnostics → API key checks. An invalid-key error means exactly that: re-paste the key.
- A brand-new key with no balance will fail. Add a payment method and some credit on the provider's site.
- No internet, or a provider outage: the app says so rather than hanging.
- Very short sounds are dropped on purpose. If your genuinely short answers are being ignored, lower *Min phrase length*.
- After three consecutive failures the app stops itself instead of retrying forever, and leaves the reason on screen. Fix the cause and press Start again.

## Subtitles for the meeting do not appear

- Enable *Meeting → me* **before** pressing Start.
- Windows asks for a screen-share style permission when loopback capture starts. Accept it — that dialog is how Windows grants system-audio access.
- Loopback captures your **default output device**. The meeting audio has to be playing on the device Windows shows in the volume tray.
- Check that *Show subtitles* is actually ticked. With both subtitles and voice off, the direction does nothing and the app warns you.

## I hear echoes, or the app translates itself

**Use headphones.** With speakers, translated audio goes back into your microphone and the app translates its own output in a loop.

If you use *Speak translation into my headphones* and still get loops, switch that off and rely on subtitles.

## Translation is too slow

Latency is your pause, plus recognition, plus translation, plus synthesis — normally 2–5 seconds. Things that genuinely help:

- Lower **Pause before sending** to 400–500 ms. Snappier, at the cost of more sentences cut mid-thought.
- Switch the translation model to a smaller one (`claude-sonnet-5`, `claude-haiku-4-5`). Noticeably faster on short phrases.
- Speak in shorter phrases with clear pauses. The pipeline starts when you stop.

Streaming recognition, which would remove most of this delay, is the main goal of the next release.

## The voice in the meeting sounds robotic or clipped

Turn off noise suppression and automatic gain control for the CABLE microphone in your meeting app. Both are tuned for a human in a room and damage clean synthesized audio.

## The app is in the wrong language

Settings → **Interface language**. This is independent of the translation languages, which live under *Translation directions*.

## Where are the logs?

Settings → Advanced → Debugging → *Show log file location*, or `%APPDATA%\ai-interpreter\logs\`. They contain no audio, no transcripts and no keys, so they are safe to attach to a bug report.

## Start over completely

Close the app and delete `%APPDATA%\ai-interpreter`. Everything resets and the setup wizard runs again.

## Still stuck

[Open an issue](https://github.com/AntonMinin/ai-interpreter/issues) with your Windows version, what you expected, what happened, and the relevant log lines. This is an early alpha — a clear report is genuinely useful.
