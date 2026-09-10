# T-Cubed — Know the Word. Live the Word.

An adaptive Scripture challenge game for **1 Timothy, 2 Timothy, and Titus**. No backend, no account — progress lives in your browser.

## Play

Pick a pace (5, 10, or 15 questions), focus on one book, or take the daily challenge. Questions adapt: correct answers raise the difficulty, misses reveal chapters to revisit. Every correction quotes its exact KJV verse.

- 86 verified prompts (43 factual + 43 verse-completion) across all 13 chapters
- Bayesian mastery estimate picks your next question
- Study reports by book, chapter, and subject — exportable as text
- Scripture library with the full KJV text of all three letters
- Saved verses, streaks, and weekly rhythm — all on-device

## Develop

```bash
npm install
npm run verify    # every answer checked against its cited verse
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Notes

- Scripture text: KJV via the open [Bible-kjv](https://github.com/aruljohn/Bible-kjv) collection.
- Fully static; deploys anywhere Next.js runs (`vercel --prod` is enough).
- PWA-ready: manifest, icons, and an offline service worker included.
