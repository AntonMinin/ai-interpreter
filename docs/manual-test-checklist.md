# Manual Test Checklist

Run before every release on a clean-ish Windows machine. Items marked (mock) need no API key.

## Startup & onboarding

- [ ] (mock) Fresh install/first run opens the onboarding wizard
- [ ] (mock) Wizard: microphone selection lists devices; "Allow microphone access" prompts and succeeds
- [ ] (mock) Wizard step 2: level meter moves while speaking; confirmation text appears
- [ ] (mock) Wizard: selecting Mock provider allows finishing without any key
- [ ] (mock) "Skip setup" lands on the main screen; wizard does not reappear on restart
- [ ] App starts, main window renders, status = Stopped

## Audio devices

- [ ] (mock) All input/output devices appear in Settings; "Refresh device list" picks up a newly plugged headset
- [ ] (mock) Diagnostics detects VB-CABLE when installed, and shows the install instruction when not
- [ ] (mock) "Test audio" plays a tone in the chosen speakers; with a cable selected, the meeting app's mic meter moves

## RU → EN (outbound)

- [ ] Start with OpenAI provider and valid key; status goes Ready
- [ ] Speak Russian; status cycles Listening → Transcribing → Translating → Speaking
- [ ] Transcript shows the Russian source and English translation
- [ ] English speech is audible on the virtual cable (verify via meeting app mic meter or by monitoring CABLE Output)
- [ ] Push-to-talk mode: nothing is captured until the key is held; phrase is sent on release

## EN → RU (inbound)

- [ ] Enable "Meeting → me"; Start triggers the Windows capture permission and succeeds
- [ ] Play English speech (e.g. a YouTube video) on the default output; Russian subtitles appear
- [ ] With "Speak translation" on, Russian audio plays in the chosen monitor device
- [ ] No feedback loop: inbound translation is not re-translated while the app speaks

## Meeting apps

- [ ] Zoom: `CABLE Output` selectable as mic; counterpart hears the translated voice
- [ ] Google Meet: same
- [ ] (optional) Teams: same

## Error handling (all mock-free cases show human-readable messages)

- [ ] No API key set → warning on main screen before Start; clear error from pipeline if started anyway
- [ ] Wrong API key → "key is invalid" error, app keeps running after Dismiss
- [ ] Internet disconnected mid-session → connectivity error appears; recovery after reconnect without restart
- [ ] VB-CABLE not installed → warning on main screen + Diagnostics instruction; outbound still translates (subtitles/transcript) without crashing
- [ ] Microphone unplugged mid-session → error surfaced, Stop/Start recovers

## Lifecycle

- [ ] Stop → Start works repeatedly without restart
- [ ] Settings changes (languages, devices, sensitivity) apply to the next Start
- [ ] Logs are written; "Clear logs" empties the file; no key material anywhere in the log
- [ ] App quits cleanly, no orphan processes
