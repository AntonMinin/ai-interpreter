---
title: API keys and cost
description: Where to get a key, what you will actually pay, and how to try the app without paying anything.
section: start
order: 2
---

AI Interpreter does not include AI. It calls a provider you choose, with a key you own, and that provider bills you directly. There is no subscription, no markup, and no payment flow inside the app.

## Try it first without a key

Pick **Mock provider** during setup (or in Settings → Advanced → AI providers). Every screen works, devices and audio routing work, the meters move — the "translations" are just canned text. Nothing leaves your computer. This is the right way to confirm your virtual microphone and meeting setup before spending a cent.

## Which keys you need

| What runs it | Provider | Required? |
|---|---|---|
| Speech recognition | OpenAI | Yes, for real translation |
| Voice synthesis | OpenAI | Yes, if you want the meeting to hear a voice |
| Translation | OpenAI **or** Anthropic (Claude) | Pick one |

So an OpenAI key is always needed for real use. An Anthropic key is optional, and only worth adding if you prefer Claude for the translation step.

1. **OpenAI:** create a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. **Anthropic (optional):** create one at [console.anthropic.com](https://console.anthropic.com/settings/keys).
3. Paste it into Settings → API keys and press **Save**, then **Check** to confirm it works.

Creating a key is free. Using it is not — you will need to add a payment method and some balance on the provider's site before requests succeed. A brand-new key with a zero balance fails with a billing error, which is easy to mistake for a broken app.

## What it actually costs

You pay per minute of **speech**, not per minute of meeting. Silence and listening are free. A phrase costs three small calls: recognition, translation, synthesis.

In practice a meeting where you speak for a few minutes lands in the range of a few cents. Long, dense, two-way sessions cost more, and cheaper translation models cut the bill noticeably — see [Settings](/docs/settings) for how to switch.

Two things reduce cost immediately:

- **Turn off the direction you do not need.** If you only want subtitles, disable "My voice → meeting" and you stop paying for synthesis entirely.
- **Use the mute hotkey.** `Control+Shift+Space` stops recognition while you are just listening.

The app cannot see your provider balance, so set a spending limit in the provider's dashboard if that matters to you. Both OpenAI and Anthropic support hard monthly caps.

## Key safety

Keys are stored in `%APPDATA%\ai-interpreter\secrets.json`, encrypted with Windows DPAPI and tied to your Windows account. They are used only in the app's main process, the interface never receives them, and the logger redacts anything key-shaped before writing. If DPAPI is unavailable, the app stores them unencrypted and writes a warning to the log rather than failing silently.

You can also supply keys through the `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` environment variables. Keys provided that way are used but never written to disk.
