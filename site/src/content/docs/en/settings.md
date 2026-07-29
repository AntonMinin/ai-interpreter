---
title: Settings reference
description: What every setting does, which ones matter, and which you should leave alone.
section: use
order: 4
---

Most people only ever touch the top of this screen: languages, devices, keys. The technical controls are deliberately folded away under **Advanced settings**.

## Translation directions

Two independent switches. You can run either, or both.

**My voice → meeting** takes your microphone, translates, and speaks the result into the virtual microphone. This is the direction that needs VB-CABLE.

**Meeting → me** captures the meeting's audio and gives you the translation. Two sub-options:

- *Show subtitles* — text on your screen. Cheap, no echo risk.
- *Speak translation into my headphones* — a voice reading it to you. Headphones are essential here. Note that while this voice is playing, incoming capture pauses to avoid a feedback loop, so you lose whatever is said during that window. Subtitles alone avoid that trade-off.

For each direction you pick the source language ("I speak") and the target ("They hear").

## Audio devices

| Setting | Should be |
|---|---|
| Microphone | Your real microphone or headset |
| Virtual microphone output | `CABLE Input (VB-Audio Virtual Cable)` |
| Your speakers / headphones | Your headphones |

If a device you selected earlier disappears — a USB headset unplugged, for example — the app warns you on the main screen. Device identifiers change between sessions, so re-pick them rather than assuming the old choice survived.

## Speech capture

**Capture mode** is *Automatic* by default: the app detects when you start and stop speaking. *Push-to-talk* only captures while you hold a key — but it only works while the app window is focused, which makes it awkward during an actual call.

**Global mute hotkey** is the answer to that. `Control+Shift+Space` by default, it works from any application, so you can silence the microphone without leaving your meeting window. If another app has claimed the combination, the main screen tells you and you can pick a different one. Use the Electron accelerator format — for example `Alt+M`, `Control+Shift+M`. Leave it empty to disable.

**Noise suppression** applies browser-grade cleanup to your microphone. Leave it on unless your voice sounds thin.

## Advanced settings

You do not need these for normal use. They are safe to experiment with — values are clamped to sane ranges, so you cannot break the app by typing a wrong number.

**Voice sensitivity** is a threshold, so it works backwards from what you might expect: *lower* means *more* sensitive. If the app misses your quiet speech, lower it. If it triggers on keyboard clicks and breathing, raise it.

**Min phrase length** discards anything shorter. This is what stops a cough from becoming a translated sentence.

**Pause before sending** is how long a silence must last before the app decides your phrase is finished. This is the single biggest latency lever you control: 600 ms by default, 400–500 ms feels snappier but cuts sentences mid-thought more often.

**Max phrase length** force-splits very long monologues so you are not waiting forever for one huge chunk.

## AI providers

Speech recognition and voice synthesis run through OpenAI. Translation can be either OpenAI or Anthropic (Claude), or Mock for offline testing.

The **Claude model** field is free text so you are not stuck waiting for an app update when a new model ships. `claude-opus-5` is the default; `claude-sonnet-5` and `claude-haiku-4-5` are meaningfully faster and cheaper, which is a real advantage for short conversational phrases. Translation is not a task that needs the largest model.

**TTS voice** picks the synthesized voice. Try a few — they differ noticeably in how natural they sound in non-English languages.

## Debugging

**Verbose logging** records extra detail. Useful in a bug report, otherwise noise. Logs contain timestamps, lifecycle events and error messages — never audio, transcripts or keys — and rotate at 2 MB.

**Show log file location** and **Clear logs** do what they say.

## Resetting everything

Close the app and delete `%APPDATA%\ai-interpreter`. Settings, keys and logs go away and the setup wizard runs again next time.
