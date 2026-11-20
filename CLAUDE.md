# Jenney's Latin Hub

Vocab and grammar practice for Jenney's First Year Latin. React 18 + Tailwind + framer-motion, bundled by esbuild into one `dist/index.html`. Deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

## Commands
- `npm ci` once, then `npm run build` (writes `dist/index.html`) and `npm test` (plain node scripts, no browser).
- Browser checks use Playwright; open `dist/index.html` directly.

## Where things are (`src/`)
- `model.js`: data and logic. Topics, `grammarQ` (question builder), grading, free-practice pool. `legacy.js` holds the older grammar engine (`G.TENSES`, `G.PRON`, rules).
- `grammar.jsx` (drill picker, guides), `subjpage.jsx` + `subj.js` (subjunctive practice), `free.jsx`, `study.jsx` (question cards and `Session`), `ui.jsx` (shared pieces).
- `lessons.js`, `course.js`, `clauses.js`: vocab lessons and the course schedule.
- `store.js`: progress saved in the browser's localStorage (`jlv2:*`). Back up & restore moves it between browsers.

## Conventions
- Match the existing look: Newsreader serif for Latin, Inter for UI, tokens from `ui.jsx`. Never use Alegreya in italics.
- Text stays readable: no tiny helper text.
- Every grammar form needs a test case; `test/subj.js` and `test/model.test.js` loop over all topics and check each generated answer.
- Commit messages end with the usual Claude co-author lines if Claude wrote them.
