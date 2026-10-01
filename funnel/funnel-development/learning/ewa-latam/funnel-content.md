---
niche: ewa-latam
display_name: EWA LATAM (English for Spanish and Portuguese speakers)
archetype: learning-plan
subject: person
input: native language (ES or PT), goals, self-rated level, struggles (false friends, sounds, listening), a 2-grid word check, one false-friend subtitle question, minutes per day, optional deadline
output: estimated English vocabulary size + level, and a paced plan with a false-friends pack and sound drills for ES/PT speakers
screens: 22
monetization: web subscription paywall (1-week intro / 4-week pre-selected / 12-week anchor) priced in local currency tokens (MXN / BRL), intro and renewal price shown together, paid intro offer (no free period) as the dismiss fallback
creative_screens:
  hook-a: 1
  hook-b: 9
  word-check: 10
  false-friend: 12
  reveal: 18
motion: >
  a movie still with an English subtitle - one word glows, a flashcard flips
  to show the false friend "actually" is not "actualmente", then a vocabulary
  scale fills up to the user's word count
---

# Funnel Content — EWA LATAM

EWA (Lithium Lab Pte Ltd, Singapore) teaches English through adapted books with audio, movie and TV clips, flashcards, word games and an AI tutor. This is the **Spanish (ES-MX) and Portuguese (PT-BR) web-to-app funnel** of 22 screens for people who want English. The user says who they are as a learner, takes a 30-second word check, answers one real subtitle question about a **false friend**, and gets an **estimated vocabulary size + level** and a **paced plan** before a subscription paywall. After buying they install the app and log in with the same email. Archetype: **learning-plan** (a registered variant of it).

**Reference funnel:** Praktika's multilingual web funnel (Meta Ad Library, 1,234 ads; asks the native language at step 2) and EWA's own `quiz.appewa.com/sweetboarding` funnel (captured Sept 2026 via AdSpyLab), per `ewa-ayahpath.md` §4. Master English and Learna AI were scanned as secondary references. This funnel keeps the shared spine (language, goals, level, struggles, word check, loader, email, result, plan, paywall) and shortens it to 22.

**Deliberate differences from the competitors and from `learning/ewa`:**
- Content is built around **errors typical of ES/PT speakers**, not just a translated UI: false friends (actually/actualmente, library/librería, embarrassed/embarazada), the "th" sound, short "i" (ship/sheep), b/v. The answers pick which of these the plan trains first.
- One false-friend question replaces the generic tap-to-translate scene, so the user meets the product's main promise before the email gate.
- No fake persona, no timer, no promo code, no "faster than 93%" claims. The renewal price sits next to every intro price.
- All on-screen copy is ES-MX; PT-BR variants are in the Notes. The lint runs on this ES text.

---

## A. Hook

### 1. Hook A — Inglés sin miedo
**Purpose:** Name the promise (English without fear of the classic mistakes) against the "before" state of textbooks and embarrassing slips, before asking anything.
**Headline A:** Inglés sin miedo
**Headline B:** Habla inglés sin pena
**Body A:** Lecciones diarias con series, libros y un tutor.
**Body B:** Toca una palabra y entiende al instante.
**Visual:** Cream background, a fanned stack of 3 movie-still cards; the centre card has an English subtitle "See you tomorrow, okay?" with "tomorrow" glowing and a translation bubble "mañana" above it; book covers peek behind; orange pill CTA pinned at the bottom.
**Microcopy:** Trust line under the cards: "★ 4.7 · 196K reseñas en App Store" *(EWA's own figures from its web funnel, verify before launch)*
**CTA:** Empezar

---

## B. Investment — who you are as a learner

### 2. Native language
**Purpose:** Every translation, hint and false-friend pair depends on it, so it comes first. It also switches the funnel to ES or PT.
**Headline A:** ¿Cuál es tu idioma?
**Headline B:** ¿Qué idioma hablas?
**Body A:** Te explicamos cada error en tu idioma.
**Body B:** Tus pistas y traducciones saldrán en este idioma.
**Options:**
- 🇲🇽 Español
- 🇧🇷 Português
- ✏️ Otro (opens a one-line input)
**Field:** Single-select, pre-selected from browser locale (`es-*` or `pt-*`). Choosing Português switches the funnel copy and the price token to BRL. "Otro" captures the language name and continues in Spanish with the generic (non-ES/PT) false-friend pack. This is flagged for the growth team.
**Visual:** Three stacked pills with flag icons (SVG, not emoji, so they render on Windows), selected pill fills with the orange accent.
**CTA:** Continuar

### 3. Goals
**Purpose:** The motivation that decides which content comes first, and the `{{goal}}` token the plan and paywall reuse.
**Headline A:** ¿Para qué quieres inglés?
**Headline B:** ¿Qué te abrirá el inglés?
**Body A:** Elige las que apliquen.
**Body B:** Tus metas definen las primeras lecciones.
**Options:**
- 💼 Trabajo
- ✈️ Viajes
- 🎬 Series y películas
- 👨‍👩‍👧 Mis hijos
- ✏️ Otro
**Field:** Multi-select, CTA disabled until at least 1 pick; "Otro" opens a one-line input and stays disabled while the input is empty. The first pick becomes `{{goal}}`.
**Visual:** 2x2 grid of large cards with an icon each, "Otro" as a slim full-width row below; selected cards get an orange border and a check.
**Microcopy:** Disabled-CTA hint: "Elige al menos una para continuar"
**CTA:** Continuar

### 4. Name
**Purpose:** Gets `{{name}}` so the result, the plan and the tutor greeting feel personal.
**Headline A:** ¿Cómo te llamamos?
**Headline B:** ¿Tu nombre de pila?
**Body A:** Tu tutor te saludará por tu nombre.
**Body B:** Lo pondremos en tu plan personal.
**Field:** Text input, placeholder "Tu nombre", max 30 chars, autofocus.
**Visual:** White input on cream, a friendly tutor avatar with a speech bubble that fills with "¡Hola, …!" as the user types.
**Error state:** "Escribe un nombre para continuar"
**CTA:** Continuar

### 5. Self-rated level
**Purpose:** A cheap first guess at level. It routes true beginners past the word check and past the "hard sounds" detail.
**Headline A:** ¿Cómo está tu inglés hoy?
**Headline B:** {{name}}, ¿dónde empiezas?
**Body A:** Un cálculo aproximado basta; lo comprobaremos.
**Body B:** Con honestidad, tu primera lección encaja mejor.
**Options:**
- 🌱 Desde cero
- 🙂 Sé lo básico
- 💬 Converso un poco
- 🚀 Bastante seguro
**Field:** Single-select. "Desde cero" skips the word check and goes straight to the false-friend question.
**Visual:** Four stacked pills with a small 4-step level meter on each, filling further per row.
**Microcopy:** Reaction after "Desde cero": "Todos empezamos en algún lado. Vamos paso a paso."
**CTA:** Continuar

### 6. Struggles
**Purpose:** Makes the pain specific to ES/PT speakers. The picks drive the bridge (#8), the hard-sounds screen (#7) and the plan's first week.
**Headline A:** ¿Qué se te dificulta más?
**Headline B:** ¿Qué te frena?
**Body A:** Elige las que apliquen; atacamos cada punto.
**Body B:** Todos tenemos uno; marca los tuyos.
**Options:**
- 🪞 Falsos amigos
- 🗣️ Pronunciación
- 👂 Entender rápido
- 🧠 Recordar palabras
- ✏️ Otro
**Field:** Multi-select, at least 1 required; "Otro" opens a one-line input (CTA disabled while empty). If "Pronunciación" is not picked, #7 is skipped.
**Visual:** Stacked pills with checkbox circles; selected fills solid.
**CTA:** Continuar

### 7. Hard sounds
**Purpose:** Narrows "pronunciación" to the sounds that actually trip Spanish and Portuguese speakers, so the plan drills those first. Shown only when #6 includes pronunciation.
**Headline A:** ¿Qué sonidos te cuestan?
**Headline B:** Sonidos que te traban
**Body A:** Cada idioma tropieza en sonidos distintos.
**Body B:** Entrenaremos primero los que elijas.
**Options:**
- 🦷 El sonido "th"
- 🔤 ship y sheep
- 🅱️ b y v
- 🌀 La r inglesa
- ✏️ Otro
**Field:** Multi-select, at least 1. ES list shown here; the PT list swaps "b y v" for "terminaciones -ed" and "h aspirada" (see Notes).
**Visual:** Pills with a small mouth-position icon on the left of each; an example word pair under the selected pill ("think / sink").
**CTA:** Continuar

### 8. Bridge — how we fix it
**Purpose:** Answers the struggles just picked with the real feature that fixes each, so the quiz already feels like it works. It also breaks up the questions.
**Headline A:** Eso lo arreglamos, {{name}}
**Headline B:** Tu error típico, corregido
**Body A:** Cada dificultad tiene su propio entrenamiento.
**Body B:** Practicas justo lo que más te traba.
**Visual:** One small card per struggle picked (max 3): a flipping flashcard "embarrassed ≠ embarazada" (false friends) · mouth diagram with a mic (pronunciation) · movie clip with slowed subtitle (listening) · spaced-repetition card (memory).
**Microcopy:** Captions, shown only for picked struggles: "🪞 Pack de falsos amigos para tu idioma" / "🗣️ Practica con tu tutor de IA" / "👂 Habla real de series, a tu ritmo" / "🧠 Tarjetas que vuelven antes de olvidar". Progress hint: "Paso 1 de 3"
**CTA:** Continuar

---

## C. Trust

### 9. Social proof
**Purpose:** Trust beat right after the heaviest profiling stretch and right before the word check, the highest-effort screen.
**Headline A:** 4.7 de 196K reseñas
**Headline B:** Les encanta tocar y traducir
**Body A:** Reseñas reales de App Store.
**Body B:** La función más mencionada, en cada idioma.
**Visual:** Large "4.7" with a star row, App Store and Google Play badges below, two review cards with avatars (original English text of real reviews, labelled "reseña real, en inglés").
**Microcopy:** Quotes: "If anything is unclear while reading, just tap a word — the translation is right there." — Maria / "The coolest function is that you can immediately tap and translate words." — Anutel *(EWA's real reviews, quoted in its own funnel; verify before launch)*. Numbers are EWA-only.
**CTA:** Continuar

---

## B. Investment — level check and first taste

### 10. Word check — easy grid
**Purpose:** The skill test makes the result feel measured, not flattered, and turns the funnel into a small product demo.
**Headline A:** Toca las palabras que conoces
**Headline B:** ¿Cuáles de estas conoces?
**Body A:** Treinta segundos fijan tu nivel inicial.
**Body B:** Sin trampas: solo las que estés seguro.
**Field:** Multi-select chip grid, 16 English words from the A1-A2 band, 2 of them made-up (not flagged) to correct over-claiming. "Ninguna" link below. 8 or more real words known goes to #11; otherwise to #12.
**Visual:** 4x4 grid of rounded word chips on cream; tapped chips fill orange with a check; a thin 2-segment progress bar at the top ("Prueba de nivel 1 de 2").
**Skip link:** "Soy principiante total"
**CTA:** Siguiente

### 11. Word check — harder grid (adaptive)
**Purpose:** Only shown to users who aced the easy grid, so it rewards them instead of punishing beginners, and sharpens the estimate at B1-B2.
**Headline A:** ¡Bien! Ahora palabras más difíciles
**Headline B:** Sabes bastante, {{name}}
**Body A:** Igual: toca solo las que estés seguro.
**Body B:** Así afinamos tu nivel con más precisión.
**Field:** Same chip grid, 16 words from the B1-B2 band, 2 made-up.
**Visual:** Same layout, progress bar on segment 2.
**CTA:** Siguiente

### 12. False-friend subtitle question
**Purpose:** First taste of the product, and proof that the plan is made for ES/PT speakers: one real subtitle line with a word that looks like a Spanish/Portuguese word and is not. It is a one-tap meaning question, not a quiz.
**Headline A:** ¿Qué significa «actually»?
**Headline B:** Un falso amigo en pantalla
**Body A:** Lee la línea y elige el significado.
**Body B:** Lo que parece español suele engañar.
**Options:**
- 🤔 Actualmente
- 💡 En realidad
- ⏱️ Ahora mismo
- 🤷 No lo sé
**Field:** Movie still with the subtitle "Actually, I'm in the library." and the word "actually" highlighted. Single-select. The feedback is truthful to the pick: correct pick gives "¡Exacto! «Actually» es «en realidad». «Actualmente» se dice «currently»."; any other pick gives "Falso amigo: «actually» es «en realidad». «Actualmente» se dice «currently»."; "No lo sé" gives the same explanation. The word pair is saved to the user's false-friends pack either way. CTA enables after one pick.
**Visual:** Movie still on the top 55% with a subtitle bar, the highlighted word glowing; below it the four option pills; after the pick a card flips to show "actually ≠ actualmente" and a "+1 a tu pack de falsos amigos" chip.
**Microcopy:** PT-BR variant: same line, options "Atualmente / Na verdade / Agora mesmo / Não sei". Unverified: the line is a demo line, the real clip must be one the app already licenses for marketing use.
**Skip link:** "Omitir"
**CTA:** Continuar

### 13. Minutes per day
**Purpose:** The pacing input: the plan's timeline in #19 is computed from it. It is also a small commitment.
**Headline A:** ¿Cuánto tiempo al día?
**Headline B:** ¿Tu tiempo diario de práctica?
**Body A:** Un hábito diario supera las sesiones largas.
**Body B:** Sé realista; puedes cambiarlo cuando quieras.
**Options:**
- ☕ 5 min · Casual
- 🚶 10 min · Constante
- 🏃 15 min · En serio
- 🔥 20+ min · Intenso
**Field:** Single-select, "10 min" marked as suggested. Sets `{{minutes}}`.
**Visual:** Four stacked pills, a clock icon on each that fills to match the minutes.
**Microcopy:** Progress hint: "Paso 2 de 3"
**CTA:** Continuar

### 14. Deadline (optional)
**Purpose:** A real event gives the plan a finish line and the chart a flag. Skippable, because most learners have none.
**Headline A:** ¿Algo en tu calendario?
**Headline B:** ¿Tienes una fecha límite?
**Body A:** Ajustamos el plan para llegar a tiempo.
**Body B:** Un viaje o entrevista afina el plan.
**Options:**
- ✈️ Un viaje
- 💼 Entrevista de trabajo
- 🎓 Un examen
- 🏠 Mudarme al extranjero
- ✏️ Otro
**Field:** Single-select; after a pick an optional month chip row ("¿Cuándo?") for the next 12 months. "Otro" opens a one-line input (CTA disabled while empty).
**Visual:** Stacked pills; the month picker appears as a horizontal chip row.
**Skip link:** "Sin fecha, solo aprender"
**CTA:** Continuar

### 15. Practice time
**Purpose:** Anchors the daily habit (the real retention product) to a time of day. On web it stores the time; the app asks for push permission on first open.
**Headline A:** ¿Cuándo practicarás?
**Headline B:** Elige tu hora de lección
**Body A:** Un recordatorio al día, nada más.
**Body B:** A la misma hora, el hábito se forma.
**Options:**
- 🌅 Camino al trabajo
- ☕ Hora de comida
- 🌙 Por la noche
- ⏰ Elegir hora
**Field:** Single-select, default "Por la noche"; "Elegir hora" opens a time input.
**Visual:** Pills on cream, a lock-screen mockup below showing the sample reminder at the chosen time.
**Microcopy:** Sample reminder: "🎬 {{name}}, tu escena de 10 minutos está lista." Progress hint: "Paso 3 de 3: ya casi"
**Skip link:** "Lo decido luego"
**CTA:** Activar recordatorio

---

## D. Anticipation

### 16. Building the plan (loading)
**Purpose:** Makes the plan feel crafted from the answers just given; the highest-attention moment before the gate.
**Headline A:** Armando el plan de {{name}}…
**Headline B:** Eligiendo escenas para {{name}}…
**Steps:** (4 progress rows, each with % counter, checkmark and bar)
- Ajustando lecciones a tu nivel…
- Reuniendo tus falsos amigos típicos…
- Ajustando a {{minutes}} minutos diarios…
- Casi listo: tu plan te espera…
**Visual:** Top half: the false-friend flashcard from #12 with book covers and clip stills orbiting it slowly; four progress rows beneath; one review card rotating under the rows (real EWA reviews from #9 only).
**CTA:** (auto-advances, ~6-8 seconds)

---

## E. Gate

### 17. Email
**Purpose:** Captures identity before the result. On web it is also the login that links the purchase to the app, so it is functional, not just a lead grab.
**Headline A:** Tu plan está listo, {{name}}
**Headline B:** ¿A dónde lo enviamos?
**Body A:** Ingresa tu correo para verlo y entrar.
**Body B:** Con este correo entrarás a la app.
**Field:** Email input; "Continuar con Apple" / "Continuar con Google" above it. Marketing checkbox **unchecked** by default.
**Visual:** White input on cream, a blurred preview of the plan card behind a frosted panel.
**Error states:** "Escribe un correo válido" / "Este correo ya tiene un plan: ¿iniciar sesión?"
**Microcopy:** Under the field: "Sin spam. Solo tu plan y correos de tu cuenta." Legal under CTA: "Al continuar aceptas los Términos y la Política de privacidad."
**CTA:** Ver mi plan

---

## D. Anticipation — reveal

### 18. Level result
**Purpose:** The measured payoff of the word check: a vocabulary estimate and a level name, framed as a starting point, not a grade.
**Headline A:** Conoces unas {{words}} palabras
**Headline B:** Tu nivel: {{level}}
**Body A:** Siguiente: {{next_level}}, conversaciones del día a día.
**Body B:** Tu plan arranca desde este punto.
**Visual:** Horizontal scale 100 · 1,000 · 2,500 · 5,000 · 10,000 words with level bands (Novato to Intermedio alto) and a marker animating to `{{words}}`; the next band softly highlighted.
**Microcopy:** Footnote: "Estimación de tu prueba de palabras. Se actualiza mientras aprendes." (Rubric in Notes.)
**CTA:** Ver mi plan

### 19. Plan and progress projection
**Purpose:** The reveal: a plan visibly built from their answers, with an honest computed timeline to the next level, and the **false-friends pack** that this funnel sells.
**Headline A:** El camino de {{name}} a {{next_level}}
**Headline B:** Tus primeras semanas, planeadas
**Body A:** Con {{minutes}} min al día, tu progreso probable.
**Body B:** Hecho con tu meta y tus errores típicos.
**Visual:** A rising curve from "Hoy" to "Semana N" with milestone chips; a deadline flag if one was set in #14. Below it a **false-friends pack card** ("Pack de falsos amigos") listing 3 pairs for the user's language, and, if sounds were picked in #7, a "Sonidos a entrenar" row of chips. A summary card: level to next level, goal, minutes per day.
**Microcopy:** ES pairs: "actually ≠ actualmente · library ≠ librería · embarrassed ≠ embarazada". PT pairs: "actually ≠ atualmente · library ≠ livraria · pretend ≠ pretender". Milestones: "Día 7 · Presentarte" / "Día 14 · Frases cotidianas" / "Día 28 · Leer un libro adaptado" / "Mes 3 · Conversaciones simples". Footnote: "Estimación si practicas a diario. Los resultados varían." The week count comes from level plus minutes, never a fixed number.
**CTA:** Empezar mi plan

---

## F. Monetization

### 20. Paywall
**Purpose:** The single ask: unlock the plan just built. It is a long-scroll web sales page, not an app sheet. The renewal terms are as visible as the price.
**Headline A:** Empieza tu plan de inglés hoy
**Headline B:** Desbloquea el plan de {{name}}
**Body A:** Biblioteca completa, tutor de IA y todos los niveles.
**Body B:** Cancela cuando quieras, con aviso antes de renovar.
**Plans:**
- **1 semana** — `{{price_mxn_1w}}` today, then `{{renew_mxn_1w}}`/week. Per-day price small. No badge.
- **4 semanas** — **pre-selected**, "MÁS ELEGIDO" badge. `{{price_mxn_4w}}` today, then `{{renew_mxn_4w}}` every 4 weeks. Per-day price small.
- **12 semanas** — "MENOR PRECIO POR DÍA" badge, the anchor. `{{price_mxn_12w}}` today, then `{{renew_mxn_12w}}` every 12 weeks.
- BRL variant uses `{{price_brl_*}}` / `{{renew_brl_*}}` (same structure). On every card the renewal line sits directly under the price at the same size. Savings badges compare against the 1-week price times weeks, never an invented "was" price.
**Visual:** Top to bottom, one scroll: (1) brand bar with the app name and a close ✕ · (2) personalised hero: level to next level card, goal, minutes, and a "Tu pack de falsos amigos" line · (3) plan block with 3 cards and the CTA · (4) what's inside (clips with tap-to-translate, books with audio, flashcards, AI tutor, false-friends pack, sound drills) · (5) how it works in 3 steps (install, log in with the same email, Day 1) · (6) proof: store rating and two real review cards · (7) guarantee card, rendered only when `CONFIG.refundDays` is a real number (hidden while it is the token `{{refund_days}}`) · (8) FAQ accordion, "¿Cómo cancelo?" open by default · (9) the plan block again with the CTA · (10) legal row. A sticky bottom bar (selected plan + today's charge + CTA) appears after the first plan block scrolls out of view.
**Microcopy:** Disclosure above every CTA, updated live for the selected plan: "Pagas {{price_sel}} hoy. Se renueva a {{renew_sel}} cada {{period}} hasta que canceles. Cancela hasta 24 h antes de renovar." Under the CTA: "Te avisaremos por correo antes de tu primera renovación." Trust row: "🔒 Pago seguro · Cancela cuando quieras", plus "· Garantía de {{refund_days}} días" only when refund days are confirmed. The same gate hides the guarantee card and its FAQ line.
**Fallback offer:** On dismiss, the last-chance offer (#21) once per session: a paid intro offer on the 4-week plan (intro price for the first 4 weeks, then its regular renewal). No free period, no timer, no second discount.
**CTA:** Empezar a aprender

### 21. Last-chance offer (on close)
**Purpose:** Second chance for users who close the paywall without paying: a paid intro offer on the 4-week plan: `{{offer_price_mxn}}` for the first 4 weeks, then the regular renewal. No free period, no second discount. Shown once per session, then never again.
**Headline A:** Un precio inicial para ti
**Headline B:** Empieza hoy con precio inicial
**Body A:** Primeras 4 semanas a precio de introducción.
**Body B:** Luego se renueva a su precio normal.
**Plans:** One offer card: **4-week plan, intro price**. `{{offer_price_mxn}}` for the first 4 weeks, nothing struck (`compareAt: null`, because a different-length plan is not a fair comparison), then `{{renew_mxn_4w}}` every 4 weeks until cancelled. Optional `{{offer_badge}}` only if true.
**Visual:** Same web-page look as #20: sticky bar with app name and ✕, eyebrow "Oferta única · se muestra una vez", headline and lead, one orange-bordered card with the level summary, plan name, price row, 3 checks, CTA, payment badges and the renewal line. A plain decline link below.
**Microcopy:** Renewal line: "{{offer_price_mxn}} por las primeras 4 semanas, luego {{renew_mxn_4w}} cada 4 semanas hasta que canceles. Te avisamos antes de renovar. Cancela hasta 24 h antes de renovar." Shown once per session (sessionStorage `ikf_offer_ewa-latam`). No timer: `CONFIG.offer.expiresMin` is `null`. Decline link: "No, gracias, volver a mi plan" returns to #19. Events: `paywall_close`, `offer_view`, `offer_accept`, `checkout_click`, `offer_decline`.
**CTA:** Quiero mi oferta

---

## G. Payoff

### 22. Get the app
**Purpose:** Web buyers who never open the app refund. This screen gets them to install, log in with the same email and finish Day 1.
**Headline A:** ¡Ya estás dentro, {{name}}!
**Headline B:** Tu primera escena te espera
**Body A:** Descarga la app y entra con {{email}}.
**Body B:** Tu plan y tu pack ya están ahí.
**Visual:** Phone mockup opened on Day 1 with the false-friends pack visible; App Store / Google Play button (auto-detect OS); a 3-step list below.
**Microcopy:** Steps: "1 · Instala la app" / "2 · Entra con {{email}}" / "3 · Empieza el Día 1 a tu hora". Receipt line: "Recibo y enlace para cancelar enviados a {{email}}."
**CTA:** Descargar la app

---

## Notes

**Unverified / inferred.** The Praktika multilingual funnel (native language asked at step 2) is taken from the research doc and was not re-walked screen by screen: the order after step 2 is unverified. The EWA Spanish-for-English variant was only seen as a count (134 screens). The money-back guarantee (refund days not confirmed, so the demo hides it behind `{{refund_days}}`), "4.7 · 196K", the two review quotes and the "about 70M learners" figure are carried over from `learning/ewa` and must be confirmed with EWA before launch. The false-friends pack and the sound drills are our own addition, not a live competitor feature.

**ES / PT-BR variants (the demo is ES; PT only swaps data).**

| Screen | ES-MX | PT-BR |
|---|---|---|
| 1 Headline A | Inglés sin miedo | Inglês sem medo |
| 2 Headline A | ¿Cuál es tu idioma? | Qual é o seu idioma? |
| 3 Headline A | ¿Para qué quieres inglés? | Para que você quer inglês? |
| 3 Options | Trabajo · Viajes · Series y películas · Mis hijos | Trabalho · Viagens · Séries e filmes · Meus filhos |
| 6 Options | Falsos amigos · Pronunciación · Entender rápido · Recordar palabras | Falsos cognatos · Pronúncia · Entender rápido · Lembrar palavras |
| 7 Options | "th" · ship y sheep · b y v · La r inglesa | "th" · ship e sheep · terminações -ed · h aspirado |
| 12 Headline A | ¿Qué significa «actually»? | O que significa «actually»? |
| 12 Options | Actualmente · En realidad · Ahora mismo | Atualmente · Na verdade · Agora mesmo |
| 20 Plan labels | 1 semana · 4 semanas · 12 semanas | 1 semana · 4 semanas · 12 semanas |
| 20 CTA | Empezar a aprender | Começar a aprender |
| 22 Headline A | ¡Ya estás dentro, {{name}}! | Você está dentro, {{name}}! |

PT headlines must also hold the 6-word limit (lint them as a second file before launch). Currency: ES uses `{{price_mxn_*}}`, PT uses `{{price_brl_*}}`.

**Word-check rubric (the score comes from the taps).** Each grid is 16 words: 14 real, 2 made-up. Real words known: A1-A2 x70, B1-B2 x200, floor 100; each made-up word tapped subtracts 15%. Bands: under 500 Novato (A0) · 500-1,500 Principiante (A1) · 1,500-3,000 Elemental (A2) · 3,000-5,000 Intermedio (B1) · 5,000+ Intermedio alto (B2+). Content team to calibrate per language pair: Spanish and Portuguese learners recognise many Latin cognates, so a production grid should weight cognates lower (suggested x0.5) and label which words are cognates. The demo does not implement that. The plan length in #19 is computed from level and minutes, never a fixed number.

**Hidden-billing guard.** Competitors in this category (EWA, Praktika, Master English) use intro prices that renew at 2x or more, sometimes without showing the renewal. Here the renewal price is printed next to every intro price, the exact today/renew sentence sits above the CTA, there are no pre-checked add-ons, no timer, and an email goes out before the first renewal and before the trial converts. EWA's 10-minute countdown and promo code are not copied.

**Blocks deliberately skipped:** gamified wheel and scratch card (cheapens the promise), before/after split (the plan chart does it), post-purchase upsell (no discrete add-on yet), gender and age questions (unused by the output), the EWA statement screens (the bridge #8 does that job).

**Drop-off risk:** #10-11 (word check) and #17 (email before result). #12 is the screen most likely to be screenshotted and shared; make the pair card look good.

**Monetization and metrics:** one subscription layer. Measure separately: paywall CVR (#20), offer CVR (#21 `offer_view` to `offer_accept`), trial to paid, first-renewal retention at full price (refund and chargeback rate is the guardrail), and activation (#22 install + login within 24h). Split every metric by ES vs PT and by MXN vs BRL.

**First A/B tests:** (1) false-friend question at position 12 vs. right after #2 as an early hook. (2) Native language asked first (this brief) vs. inferred from the ad's language. (3) 4-week vs. 1-week pre-selected.

**Demo (private Artifact):** https://claude.ai/artifact/LrNbdPAUXNpcAbqCiV4zQR
