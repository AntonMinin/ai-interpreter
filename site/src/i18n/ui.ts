export const locales = ['en', 'ru'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = { en: 'English', ru: 'Русский' }

export const GITHUB = 'https://github.com/AntonMinin/ai-interpreter'
export const RELEASES = `${GITHUB}/releases`
export const ISSUES = `${GITHUB}/issues`
export const VBCABLE = 'https://vb-audio.com/Cable/'
export const OPENAI_KEYS = 'https://platform.openai.com/api-keys'
export const ANTHROPIC_KEYS = 'https://console.anthropic.com/settings/keys'

export const ui = {
  en: {
    'meta.title': 'AI Interpreter — speak your language in any online meeting',
    'meta.description':
      'Free, source-available real-time AI interpreter for Zoom, Google Meet and Teams. You speak your language; the meeting hears your voice translated into theirs.',
    'meta.docsTitle': 'Documentation — AI Interpreter',
    'meta.docsDescription':
      'Install, set up and troubleshoot AI Interpreter: virtual microphone, API keys, meeting app configuration, privacy.',

    'nav.home': 'Home',
    'nav.docs': 'Docs',
    'nav.github': 'GitHub',
    'nav.download': 'Download',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.skip': 'Skip to content',

    'hero.badge': 'Early alpha · Windows',
    'hero.title': 'Speak your language.',
    'hero.titleAccent': 'The meeting hears theirs.',
    'hero.lead':
      'AI Interpreter listens to your voice, translates it, and speaks the translation into your online meeting through a virtual microphone. Answers come back as live subtitles in your language.',
    'hero.ctaPrimary': 'Download for Windows',
    'hero.ctaSecondary': 'Read the docs',
    'hero.note': 'Works with Zoom, Google Meet, Microsoft Teams — anything that lets you pick a microphone.',

    'flow.title': 'How it works',
    'flow.lead':
      'Two independent directions. Each one is a chain you can follow in the code — nothing is hidden.',
    'flow.outLabel': 'You → meeting',
    'flow.inLabel': 'Meeting → you',
    'flow.mic': 'Your microphone',
    'flow.stt': 'Speech to text',
    'flow.mt': 'Translation',
    'flow.tts': 'Voice synthesis',
    'flow.vmic': 'Virtual microphone',
    'flow.meeting': 'The meeting',
    'flow.sysaudio': 'Meeting audio',
    'flow.subs': 'Subtitles on your screen',
    'flow.optvoice': 'optional voice in your headphones',

    'steps.title': 'Four steps to your first call',
    'steps.1.title': 'Install the app',
    'steps.1.body':
      'Download the installer and run it. Windows SmartScreen will warn you — the installer is not signed yet; choose "More info" → "Run anyway".',
    'steps.2.title': 'Install the virtual microphone',
    'steps.2.body':
      'The free VB-CABLE driver, once, as administrator, then one reboot. This is what lets the meeting hear your translated voice. The setup wizard walks you through it and verifies the result.',
    'steps.3.title': 'Add an API key — or skip it',
    'steps.3.body':
      'Paste an OpenAI key to get real translation. No key yet? Pick Mock mode and explore the whole app offline with fake translations.',
    'steps.4.title': 'Point your meeting app at the cable',
    'steps.4.body':
      'In Zoom, Meet or Teams pick "CABLE Output" as the microphone, keep your headphones as the speaker. Press Start and talk.',

    'features.title': 'What it does',
    'features.1.title': 'Two-way translation',
    'features.1.body':
      'Your speech is spoken into the meeting in their language. Their speech comes back to you as subtitles, and optionally as a voice in your headphones.',
    'features.2.title': '16 languages, any pair',
    'features.2.body':
      'Russian, English, German, French, Spanish, Italian, Portuguese, Polish, Ukrainian, Chinese, Japanese, Korean, Arabic, Hindi, Turkish, Dutch. Pick any source and target.',
    'features.3.title': 'Nothing sent to us',
    'features.3.body':
      'No telemetry, no analytics, no accounts. Audio goes only to the AI provider you chose, only while the pipeline is running.',
    'features.4.title': 'Keys stay on your machine',
    'features.4.body':
      'Stored encrypted with Windows DPAPI, used only in the main process, never written to logs, never visible to the interface.',
    'features.5.title': 'Global mute hotkey',
    'features.5.body':
      'Control+Shift+Space silences the microphone from inside your meeting window — you never have to switch apps mid-sentence.',
    'features.6.title': 'Offline mock mode',
    'features.6.body':
      'Try every screen, the audio routing and the virtual microphone without an API key and without sending anything anywhere.',

    'cost.title': 'What it costs',
    'cost.lead':
      'The app is free. You pay the AI provider directly for what you use, per minute of actual speech — not per minute of meeting. Silence is free. Move the sliders for a rough estimate.',
    'cost.minutes': 'Minutes you speak',
    'cost.direction': 'Also translate what others say',
    'cost.result': 'Rough cost',
    'cost.perMeeting': 'for this meeting',
    'cost.disclaimer':
      'A rough estimate based on published provider prices for speech recognition, translation and voice synthesis at typical speaking rates. Real bills vary with language, phrasing and the models you pick. Always check your provider dashboard — this app cannot see your balance.',
    'cost.noKeyTitle': 'No key, no cost',
    'cost.noKeyBody':
      'Mock mode costs nothing and needs no account. It does not really translate, but everything else — devices, routing, the meeting setup — works so you can verify your setup first.',

    'privacy.title': 'What leaves your computer',
    'privacy.lead': 'Precisely this, and only while the pipeline is running:',
    'privacy.1': 'Short audio segments of your speech → your speech-recognition provider',
    'privacy.2': 'The recognized text → your translation provider',
    'privacy.3': 'The translated text → your voice-synthesis provider',
    'privacy.4': 'Meeting audio segments — only if you turned that direction on',
    'privacy.foot':
      'All over HTTPS. Nothing reaches this project’s authors. Transcripts live in memory and vanish when you close the app. Logs hold timestamps and errors — no audio, no text, no keys.',
    'privacy.link': 'Full privacy notes',

    'limits.title': 'Read this before you rely on it',
    'limits.lead':
      'This is an early alpha, and being straight with you matters more than looking finished.',
    'limits.1.title': 'Latency is 2–5 seconds',
    'limits.1.body':
      'Translation is phrase-based: the meeting hears you after you finish a phrase, not while you speak. Streaming is the main goal of the next release.',
    'limits.2.title': 'A driver install is required',
    'limits.2.body':
      'The virtual microphone is a third-party driver (VB-CABLE) plus one reboot. A built-in device is planned for v1.0.',
    'limits.3.title': 'Cloud only',
    'limits.3.body':
      'There are no local models yet. If a meeting must not touch the cloud, do not press Start.',
    'limits.4.title': 'Windows only, unsigned',
    'limits.4.body':
      'macOS and Linux are on the roadmap. The installer has no code-signing certificate yet, so SmartScreen will warn.',

    'faq.title': 'Questions people actually ask',
    'faq.q1': 'Does the other side need to install anything?',
    'faq.a1':
      'No. To them you are a normal participant with a normal microphone. They never know the app exists unless you tell them.',
    'faq.q2': 'Will they hear my real voice or a synthetic one?',
    'faq.a2':
      'A synthetic voice speaking the translation. Your own voice is not forwarded — the meeting microphone is the virtual cable, not your headset. Voice cloning is not part of this project.',
    'faq.q3': 'Can I use it as a live subtitle tool only?',
    'faq.a3':
      'Yes. Turn off "My voice → meeting" and keep "Meeting → me". You then need no virtual microphone at all — skip the driver step entirely.',
    'faq.q4': 'Is it really free?',
    'faq.a4':
      'The app is free and always will be. The AI provider bills you directly for usage; there is no subscription, markup, or payment flow in this project.',
    'faq.q5': 'Is it open source?',
    'faq.a5':
      'The source is public and you can read, build and modify it for personal use, but the licence is source-available rather than open source: reusing the code in other projects or shipping it commercially needs written permission.',
    'faq.q6': 'Which is better, OpenAI or Claude?',
    'faq.a6':
      'Speech recognition and voice always run through OpenAI. For the translation step you can pick either. Claude tends to handle tone and idiom well; smaller, faster models cut latency and cost noticeably. Both are a dropdown away.',
    'faq.q7': 'Does it work in a browser?',
    'faq.a7':
      'No — it is a Windows desktop app. It has to be, because routing audio into a virtual microphone is something a web page cannot do.',
    'faq.q8': 'Can it record or transcribe a meeting for me?',
    'faq.a8':
      'The live transcript is on screen while the app runs and is deliberately never written to disk. Saving transcripts is not implemented; recording other people may also need their consent where you live.',

    'cta.title': 'Try it on a call that does not matter yet',
    'cta.body':
      'Install it, run Mock mode, watch the meters move, then add a key when you trust the setup. Bug reports and rough edges are genuinely welcome.',
    'cta.download': 'Download for Windows',
    'cta.issues': 'Report a problem',

    'footer.tagline': 'Real-time AI interpreter for online meetings.',
    'footer.project': 'Project',
    'footer.docsTitle': 'Documentation',
    'footer.legal': 'Source-available licence · © 2026 Anton Minin Baranovskii',
    'footer.notAffiliated':
      'Not affiliated with Zoom, Google, Microsoft, OpenAI, Anthropic or VB-Audio.',

    'docs.title': 'Documentation',
    'docs.onThisPage': 'On this page',
    'docs.sectionStart': 'Getting started',
    'docs.sectionUse': 'Using it',
    'docs.sectionAbout': 'About',
    'docs.prev': 'Previous',
    'docs.next': 'Next',
    'docs.editNote': 'Something wrong or missing on this page?',
    'docs.editLink': 'Tell us',

    'a11y.langSwitch': 'Change language',
    'a11y.mainNav': 'Main navigation',
    'a11y.docsNav': 'Documentation navigation',

    'nav.feedback': 'Ask / suggest',
    'fb.title': 'Ask something, or say what to improve',
    'fb.lead':
      'Stuck on a step, or spotted something that should work differently? Write it here. This goes straight to the developer — one person, so a specific message gets a much better answer than "it does not work".',
    'fb.examplesTitle': 'What a useful message looks like',
    'fb.ex1.kind': 'Question',
    'fb.ex1.text':
      'Where do I get the OpenAI key, and how much money should I put on the balance so it lasts a couple of meetings? I have never used an API before.',
    'fb.ex2.kind': 'Suggestion',
    'fb.ex2.text':
      'Make the mute state visible in the tray. From inside the Zoom window I cannot tell whether the microphone is on, and I keep pressing the hotkey twice to be sure.',
    'fb.ex3.kind': 'Bug',
    'fb.ex3.text':
      'Zoom does not list CABLE Output even though Diagnostics says the cable was found. Windows 11 24H2, reinstalled the driver twice. Log lines attached below.',
    'fb.ex4.kind': 'Suggestion',
    'fb.ex4.text':
      'Let me save the transcript to a file after the meeting — I need it for minutes, and right now it disappears when I close the app.',

    'fb.kind': 'What is this about',
    'fb.kindQuestion': 'Question',
    'fb.kindSuggestion': 'Suggestion',
    'fb.kindBug': 'Something is broken',
    'fb.message': 'Your message',
    'fb.messagePlaceholder':
      'Be specific: what you were doing, what you expected, what happened instead.',
    'fb.contact': 'Contact (optional)',
    'fb.contactHint':
      'Email or a messenger handle, if you want an answer. Leave it empty to send anonymously — the message still arrives.',
    'fb.submit': 'Send',
    'fb.sending': 'Sending…',
    'fb.sentTitle': 'Sent — thank you',
    'fb.sentBody':
      'It landed with the developer. If you left a contact you will get an answer; if not, it still gets read.',
    'fb.sendAnother': 'Send another',
    'fb.captchaPending': 'Complete the check above to enable sending.',
    'fb.counter': '{n} / {max}',
    'fb.errRateLimited':
      'Too many messages from this address. Try again in a few minutes — or open a GitHub issue if it is urgent.',
    'fb.errCaptcha': 'The check did not pass. Please try it again.',
    'fb.errTooShort': 'A few more words, please — short messages are impossible to act on.',
    'fb.errTooLong': 'That is too long. Trim it, or open a GitHub issue for the full detail.',
    'fb.errServer':
      'The form is broken on our side, not yours. Please open a GitHub issue instead — sorry about that.',
    'fb.errNetwork': 'Could not reach the server. Check your connection and try again.',
    'fb.privacyNote':
      'Sends only what you typed. No account needed. The bot check is Cloudflare Turnstile, loaded only for this form — the one third party on this site.',
    'fb.altTitle': 'Prefer GitHub?',
    'fb.altBody':
      'Issues are public, searchable and better for anything that needs back-and-forth or a file attached.',
    'fb.altLink': 'Open an issue'
  },

  ru: {
    'meta.title': 'AI Interpreter — говорите на своём языке на любой онлайн-встрече',
    'meta.description':
      'Бесплатный переводчик-синхронист для Zoom, Google Meet и Teams с открытым исходным кодом. Вы говорите на своём языке — встреча слышит ваш голос на своём.',
    'meta.docsTitle': 'Документация — AI Interpreter',
    'meta.docsDescription':
      'Установка, настройка и решение проблем: виртуальный микрофон, API-ключи, настройка приложения встречи, приватность.',

    'nav.home': 'Главная',
    'nav.docs': 'Документация',
    'nav.github': 'GitHub',
    'nav.download': 'Скачать',
    'nav.menu': 'Меню',
    'nav.close': 'Закрыть',
    'nav.skip': 'Перейти к содержимому',

    'hero.badge': 'Ранняя альфа · Windows',
    'hero.title': 'Говорите на своём языке.',
    'hero.titleAccent': 'Встреча слышит свой.',
    'hero.lead':
      'AI Interpreter слушает ваш голос, переводит его и озвучивает перевод в вашу онлайн-встречу через виртуальный микрофон. Ответы собеседников возвращаются живыми субтитрами на вашем языке.',
    'hero.ctaPrimary': 'Скачать для Windows',
    'hero.ctaSecondary': 'Читать документацию',
    'hero.note': 'Работает с Zoom, Google Meet, Microsoft Teams — с любым приложением, где можно выбрать микрофон.',

    'flow.title': 'Как это работает',
    'flow.lead':
      'Два независимых направления. Каждое — цепочка, которую можно проследить в коде: ничего не спрятано.',
    'flow.outLabel': 'Вы → встреча',
    'flow.inLabel': 'Встреча → вы',
    'flow.mic': 'Ваш микрофон',
    'flow.stt': 'Распознавание речи',
    'flow.mt': 'Перевод',
    'flow.tts': 'Синтез голоса',
    'flow.vmic': 'Виртуальный микрофон',
    'flow.meeting': 'Встреча',
    'flow.sysaudio': 'Звук встречи',
    'flow.subs': 'Субтитры у вас на экране',
    'flow.optvoice': 'по желанию — голос в наушники',

    'steps.title': 'Четыре шага до первого звонка',
    'steps.1.title': 'Установите приложение',
    'steps.1.body':
      'Скачайте установщик и запустите. Windows SmartScreen предупредит — установщик пока без подписи; нажмите «Подробнее» → «Выполнить в любом случае».',
    'steps.2.title': 'Установите виртуальный микрофон',
    'steps.2.body':
      'Бесплатный драйвер VB-CABLE, один раз, от имени администратора, затем одна перезагрузка. Именно он позволяет встрече услышать ваш переведённый голос. Мастер настройки проведёт по шагам и проверит результат.',
    'steps.3.title': 'Добавьте API-ключ — или пропустите',
    'steps.3.body':
      'Вставьте ключ OpenAI, чтобы получить настоящий перевод. Ключа пока нет? Выберите мок-режим и изучите всё приложение офлайн с ненастоящими переводами.',
    'steps.4.title': 'Направьте приложение встречи на кабель',
    'steps.4.body':
      'В Zoom, Meet или Teams выберите микрофон «CABLE Output», а динамиком оставьте свои наушники. Нажмите «Старт» и говорите.',

    'features.title': 'Что он умеет',
    'features.1.title': 'Перевод в две стороны',
    'features.1.body':
      'Ваша речь звучит во встрече на языке собеседников. Их речь возвращается к вам субтитрами, а при желании — голосом в наушники.',
    'features.2.title': '16 языков, любая пара',
    'features.2.body':
      'Русский, английский, немецкий, французский, испанский, итальянский, португальский, польский, украинский, китайский, японский, корейский, арабский, хинди, турецкий, нидерландский. Любой язык источника и цели.',
    'features.3.title': 'Нам не уходит ничего',
    'features.3.body':
      'Ни телеметрии, ни аналитики, ни аккаунтов. Звук идёт только выбранному вами AI-провайдеру и только пока перевод запущен.',
    'features.4.title': 'Ключи остаются у вас',
    'features.4.body':
      'Хранятся в зашифрованном виде через Windows DPAPI, используются только в main-процессе, никогда не попадают в логи и не видны интерфейсу.',
    'features.5.title': 'Глобальная горячая клавиша',
    'features.5.body':
      'Control+Shift+Space выключает микрофон прямо из окна встречи — не нужно переключаться между приложениями посреди фразы.',
    'features.6.title': 'Офлайн мок-режим',
    'features.6.body':
      'Проверьте все экраны, маршрутизацию звука и виртуальный микрофон без ключа и без отправки чего-либо куда-либо.',

    'cost.title': 'Сколько это стоит',
    'cost.lead':
      'Приложение бесплатное. Вы платите AI-провайдеру напрямую за использование — за минуты реальной речи, а не за минуты встречи. Тишина бесплатна. Подвигайте ползунки для примерной оценки.',
    'cost.minutes': 'Минут вашей речи',
    'cost.direction': 'Ещё и переводить речь собеседников',
    'cost.result': 'Примерная стоимость',
    'cost.perMeeting': 'за эту встречу',
    'cost.disclaimer':
      'Грубая оценка по опубликованным ценам провайдеров на распознавание, перевод и синтез речи при обычном темпе говорения. Реальный счёт зависит от языка, формулировок и выбранных моделей. Всегда сверяйтесь с панелью провайдера — приложение не видит ваш баланс.',
    'cost.noKeyTitle': 'Без ключа — бесплатно',
    'cost.noKeyBody':
      'Мок-режим не стоит ничего и не требует аккаунта. Он не переводит по-настоящему, но всё остальное — устройства, маршрутизация, настройка встречи — работает, так что сначала можно проверить, что всё сходится.',

    'privacy.title': 'Что уходит с вашего компьютера',
    'privacy.lead': 'Ровно это, и только пока перевод запущен:',
    'privacy.1': 'Короткие отрезки вашей речи → провайдеру распознавания',
    'privacy.2': 'Распознанный текст → провайдеру перевода',
    'privacy.3': 'Переведённый текст → провайдеру синтеза голоса',
    'privacy.4': 'Отрезки звука встречи — только если вы включили это направление',
    'privacy.foot':
      'Всё по HTTPS. До авторов проекта не доходит ничего. Расшифровка живёт в памяти и исчезает при закрытии приложения. В логах — метки времени и ошибки: ни звука, ни текста, ни ключей.',
    'privacy.link': 'Подробно о приватности',

    'limits.title': 'Прочтите, прежде чем полагаться',
    'limits.lead':
      'Это ранняя альфа, и честность здесь важнее, чем вид готового продукта.',
    'limits.1.title': 'Задержка 2–5 секунд',
    'limits.1.body':
      'Перевод идёт по фразам: встреча слышит вас после того, как вы закончили фразу, а не пока говорите. Потоковый режим — главная цель следующего релиза.',
    'limits.2.title': 'Нужна установка драйвера',
    'limits.2.body':
      'Виртуальный микрофон — сторонний драйвер (VB-CABLE) плюс одна перезагрузка. Встроенное устройство запланировано к версии 1.0.',
    'limits.3.title': 'Только облако',
    'limits.3.body':
      'Локальных моделей пока нет. Если встреча не должна попадать в облако — не нажимайте «Старт».',
    'limits.4.title': 'Только Windows, без подписи',
    'limits.4.body':
      'macOS и Linux — в планах. У установщика пока нет сертификата подписи, поэтому SmartScreen предупредит.',

    'faq.title': 'Вопросы, которые задают на самом деле',
    'faq.q1': 'Собеседнику нужно что-то устанавливать?',
    'faq.a1':
      'Нет. Для него вы обычный участник с обычным микрофоном. Он вообще не узнает о приложении, если вы сами не скажете.',
    'faq.q2': 'Он услышит мой настоящий голос или синтетический?',
    'faq.a2':
      'Синтетический голос, читающий перевод. Ваш собственный голос не передаётся: микрофоном встречи выступает виртуальный кабель, а не ваша гарнитура. Клонирование голоса в проект не входит.',
    'faq.q3': 'Можно использовать только как субтитры?',
    'faq.a3':
      'Да. Выключите «Мой голос → встреча» и оставьте «Встреча → я». Тогда виртуальный микрофон вообще не нужен — шаг с драйвером можно пропустить.',
    'faq.q4': 'Это правда бесплатно?',
    'faq.a4':
      'Приложение бесплатно и таким останется. За использование вам выставляет счёт AI-провайдер напрямую; в проекте нет ни подписки, ни наценки, ни приёма платежей.',
    'faq.q5': 'Это open source?',
    'faq.a5':
      'Исходный код открыт, его можно читать, собирать и менять для личного использования, но лицензия — source-available, а не open source: переиспользование кода в других проектах и коммерческое применение требуют письменного разрешения.',
    'faq.q6': 'Что лучше — OpenAI или Claude?',
    'faq.a6':
      'Распознавание речи и голос всегда идут через OpenAI. Для шага перевода можно выбрать любого. Claude обычно лучше держит тон и идиомы; более мелкие быстрые модели заметно снижают задержку и цену. Переключается одним списком.',
    'faq.q7': 'Работает в браузере?',
    'faq.a7':
      'Нет, это десктопное приложение для Windows. Иначе и не получится: направить звук в виртуальный микрофон веб-страница не может.',
    'faq.q8': 'Он может записать или расшифровать встречу?',
    'faq.a8':
      'Живая расшифровка видна на экране, пока приложение работает, и намеренно никогда не пишется на диск. Сохранение расшифровок не реализовано; к тому же запись других людей во многих странах требует их согласия.',

    'cta.title': 'Попробуйте на звонке, который пока не важен',
    'cta.body':
      'Установите, запустите мок-режим, посмотрите, как двигаются индикаторы, а ключ добавьте, когда убедитесь, что всё сходится. Сообщениям о багах и шероховатостях мы искренне рады.',
    'cta.download': 'Скачать для Windows',
    'cta.issues': 'Сообщить о проблеме',

    'footer.tagline': 'Переводчик-синхронист для онлайн-встреч.',
    'footer.project': 'Проект',
    'footer.docsTitle': 'Документация',
    'footer.legal': 'Лицензия source-available · © 2026 Anton Minin Baranovskii',
    'footer.notAffiliated':
      'Не связан с Zoom, Google, Microsoft, OpenAI, Anthropic и VB-Audio.',

    'docs.title': 'Документация',
    'docs.onThisPage': 'На этой странице',
    'docs.sectionStart': 'Начало работы',
    'docs.sectionUse': 'Использование',
    'docs.sectionAbout': 'О проекте',
    'docs.prev': 'Назад',
    'docs.next': 'Далее',
    'docs.editNote': 'Что-то на этой странице неверно или чего-то не хватает?',
    'docs.editLink': 'Напишите нам',

    'a11y.langSwitch': 'Сменить язык',
    'a11y.mainNav': 'Основная навигация',
    'a11y.docsNav': 'Навигация по документации',

    'nav.feedback': 'Спросить',
    'fb.title': 'Спросите или предложите, что улучшить',
    'fb.lead':
      'Застряли на каком-то шаге или заметили, что что-то должно работать иначе? Напишите здесь. Сообщение уходит напрямую разработчику — он один, поэтому на конкретное письмо ответ будет намного полезнее, чем на «не работает».',
    'fb.examplesTitle': 'Как выглядит полезное сообщение',
    'fb.ex1.kind': 'Вопрос',
    'fb.ex1.text':
      'Где взять ключ OpenAI и сколько денег положить на баланс, чтобы хватило на пару встреч? С API никогда раньше не работал.',
    'fb.ex2.kind': 'Предложение',
    'fb.ex2.text':
      'Сделайте, чтобы состояние микрофона было видно в трее. Из окна Zoom не понять, включён он или нет, и я на всякий случай жму горячую клавишу дважды.',
    'fb.ex3.kind': 'Баг',
    'fb.ex3.text':
      'Zoom не показывает CABLE Output, хотя диагностика пишет, что кабель найден. Windows 11 24H2, драйвер переставил дважды. Строки из лога прикладываю ниже.',
    'fb.ex4.kind': 'Предложение',
    'fb.ex4.text':
      'Дайте сохранять расшифровку в файл после встречи — она нужна для протокола, а сейчас исчезает при закрытии приложения.',

    'fb.kind': 'О чём сообщение',
    'fb.kindQuestion': 'Вопрос',
    'fb.kindSuggestion': 'Предложение',
    'fb.kindBug': 'Что-то не работает',
    'fb.message': 'Ваше сообщение',
    'fb.messagePlaceholder':
      'Конкретнее: что делали, чего ожидали и что получилось вместо этого.',
    'fb.contact': 'Связь (необязательно)',
    'fb.contactHint':
      'Почта или ник в мессенджере, если хотите ответ. Можно оставить пустым и отправить анонимно — сообщение всё равно дойдёт.',
    'fb.submit': 'Отправить',
    'fb.sending': 'Отправляю…',
    'fb.sentTitle': 'Отправлено, спасибо',
    'fb.sentBody':
      'Сообщение дошло до разработчика. Если вы оставили контакт — получите ответ; если нет, его всё равно прочитают.',
    'fb.sendAnother': 'Отправить ещё',
    'fb.captchaPending': 'Пройдите проверку выше, чтобы отправить.',
    'fb.counter': '{n} / {max}',
    'fb.errRateLimited':
      'Слишком много сообщений с этого адреса. Попробуйте через несколько минут — или создайте issue на GitHub, если срочно.',
    'fb.errCaptcha': 'Проверка не прошла. Пройдите её ещё раз.',
    'fb.errTooShort': 'Добавьте пару слов — по слишком короткому сообщению ничего не сделать.',
    'fb.errTooLong': 'Слишком длинно. Сократите или создайте issue на GitHub для полной истории.',
    'fb.errServer':
      'Форма сломалась на нашей стороне, не на вашей. Создайте, пожалуйста, issue на GitHub — извините.',
    'fb.errNetwork': 'Не удалось связаться с сервером. Проверьте соединение и попробуйте снова.',
    'fb.privacyNote':
      'Отправляется только то, что вы написали. Аккаунт не нужен. Проверка на робота — Cloudflare Turnstile, он загружается только для этой формы и это единственный сторонний сервис на сайте.',
    'fb.altTitle': 'Привычнее GitHub?',
    'fb.altBody':
      'Issues публичные, их можно искать, и они лучше подходят для долгого обсуждения или когда нужно приложить файл.',
    'fb.altLink': 'Создать issue'
  }
} as const satisfies Record<Locale, Record<string, string>>

export type UiKey = keyof (typeof ui)['en']
