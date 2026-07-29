---
title: Zoom, Meet and Teams
description: Exact audio settings for each meeting app, and the noise-suppression trap that eats synthetic speech.
section: use
order: 3
---

The pattern is the same everywhere: **microphone = `CABLE Output`, speaker = your headphones.**

Use headphones, not laptop speakers. Speakers feed the translated audio back into your microphone and the app starts translating itself.

## Zoom

Settings → **Audio**:

- Microphone: `CABLE Output (VB-Audio Virtual Cable)`
- Speaker: your headphones
- Uncheck **Automatically adjust microphone volume**
- Set **Background noise suppression** to **Low**

That last setting matters more than it looks. Zoom's aggressive suppression is tuned for human voices in a room and treats clean synthesized speech as noise — it will clip words or drop whole phrases.

## Google Meet

In a call → gear icon → **Audio**:

- Microphone: `CABLE Output (VB-Audio Virtual Cable)`
- Speaker: your headphones

Meet has fewer knobs and generally works with the defaults.

## Microsoft Teams

Settings → **Devices**:

- Microphone: `CABLE Output (VB-Audio Virtual Cable)`
- Speaker: your headphones
- Turn off noise suppression for this device if speech sounds clipped

## Anything else

Discord, Slack huddles, Webex, Jitsi, OBS, browser-based recorders — anything that lets you choose a microphone works the same way. If an app offers no microphone choice, it will use the Windows default, so you can set `CABLE Output` as the default recording device in Windows sound settings instead. That affects every app, so change it back afterwards.

## Verifying it works before the call

1. Press **Test audio** on the main screen. Your meeting app's own microphone level indicator should move.
2. Join a test meeting alone and record a few seconds, or use Zoom's built-in mic test.

Do this once, before a call that matters. Finding out mid-meeting that the wrong device is selected is exactly the failure this step prevents.
