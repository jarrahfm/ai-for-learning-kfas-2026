# AI for Learning: Prompt, Simulate & Verify

KFAS Science Month 2026 workshop deck (facilitator Mariam Madouh, supervisor Jarrah Almulaifi).

## Present it
- Open **`dist/AI_for_Learning.html`** (or `index.html`) in Chrome, Edge or Firefox. It is one self-contained file and works offline (the 3D tabs too).
- Keys: `←` `→` slides · `O` overview · `N` presenter notes · `F` fullscreen.
- **Hide slides before presenting:** press `O`, then click "Showing: click to hide" under any slide. Arrow keys skip hidden slides; the choice is remembered in that browser. Click again to bring a slide back.
- Hosted copy (for the "Scan for the slides" QR): https://jarrahfm.github.io/ai-for-learning-kfas-2026/

## What's inside
- Each of the four simulation dives (pendulum, take-off, bacteria, planets) has an **Advanced: zoom** tab: one continuous zoom through real scales with a live scale bar, exact terms and definitions with citations (OpenStax, NASA, JPL, Airbus, BioNumbers), clickable sources, and the copy-able prompt that builds it.
- Official KFAS and KFAS 50 Years logos (from kfas.org.kw) on every slide; each section has its own colour theme.
- Every QR code is also clickable and opens its link; buttons glow and lift on hover so they read as clickable.

## Kahoot
- Live quiz, 10 questions: https://create.kahoot.it/details/3b4a04f5-2577-4f83-8b95-5a3df30dc176 (owner: jarrahfm@gmail.com).
- Free account = **Team mode** (up to 5 teams, one phone per team); Classic mode is capped at 10 players.
- Questions + answer key: `kahoot/AI_for_Learning_Kahoot.xlsx` (Kahoot import format).

## Edit it
- Slides: `src/slides/*.html`, one `<section>` per file, built in filename order. A file starting with `_` is skipped (removed slide); rename it to bring it back.
- Styles `src/css/`, scripts `src/js/`, photos/illustrations `assets/img/` (`<img data-img="name">`), animations `assets/lottie/` (`<div data-lottie="name">`).
- Build: `python tools/build.py` writes `dist/AI_for_Learning.html`. Screenshots: `cd tools && npm i && cd .. && node tools/shoot.js shots` (set `CHROME` to a Chrome/Edge exe path).
- Links to the slides and survey QR: constants at the top of `src/js/90-finale.js`.

## Credits
Photos: Wikimedia Commons / NASA (see the credits slide). Animated emoji: Google Noto Emoji Animation, CC BY 4.0; LottieFiles animations under the Lottie Simple License (see `assets/lottie/CREDITS.json`). Illustrations for the title and butterfly: Microsoft Copilot (GPT). On-slide copy partly written with GPT via Microsoft Copilot (`docs/gpt_copy.txt`). Setup guide links verified 18 Nov 2026 (`docs/guide_links.json`).
