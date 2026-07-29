---
title: Installation
description: Download AI Interpreter, get past the SmartScreen warning, and install the virtual microphone.
section: start
order: 1
---

AI Interpreter is a Windows desktop app. There is no browser version and no account to create.

## 1. Download and run the installer

Get the latest `AI Interpreter Setup <version>.exe` from the [Releases page](https://github.com/AntonMinin/ai-interpreter/releases).

Windows SmartScreen will warn you that the publisher is unknown. That is expected: the installer does not have a code-signing certificate yet. Choose **More info → Run anyway**. If you would rather not trust an unsigned binary, you can [build it from source](https://github.com/AntonMinin/ai-interpreter#development-start) instead — that is a legitimate concern and the source is public for exactly this reason.

## 2. Install the virtual microphone

This is the one genuinely awkward step, and it exists for a good reason: to make a meeting app hear a synthetic voice, that voice has to arrive on something Windows presents as a microphone.

**You can skip this entirely if you only want subtitles** of what other people say. Come back later if you decide you want the meeting to hear you too.

1. Download the free [VB-CABLE driver](https://vb-audio.com/Cable/) and unpack the archive.
2. Right-click the installer (`VBCABLE_Setup_x64.exe`) → **Run as administrator**.
3. Reboot Windows. The driver is not fully registered until you do.
4. Start AI Interpreter and open **Diagnostics**. It should report *Virtual audio cable: Detected*.

After installing, Windows gains two new devices. The names matter and they are easy to mix up:

| Device | What it is | Who uses it |
|---|---|---|
| `CABLE Input` | The **input end** of the cable — an output device from Windows' point of view | AI Interpreter plays your translated voice here |
| `CABLE Output` | The **output end** — a recording device | Your meeting app listens here as if it were a microphone |

The rule of thumb: **AI Interpreter writes to Input, the meeting reads from Output.**

## 3. Run the setup wizard

On first launch the app walks you through interface language, microphone choice, a live "can it hear me" check, provider and API key, a translation test, a voice test, the virtual microphone, and your meeting app settings. Each step verifies itself, so you find out immediately if something is off rather than during a real call.

You can re-run any of these checks later from the **Diagnostics** screen.

## Uninstalling

Remove AI Interpreter through Windows *Apps & features*. To also delete your settings, keys and logs, delete the folder `%APPDATA%\ai-interpreter`. VB-CABLE has its own uninstaller in the archive you downloaded.
