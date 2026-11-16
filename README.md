# Jenney's Latin Hub

Vocabulary and grammar practice for Jenney's *First Year Latin* (Lessons 1–60), built around the quizzes and tests on the syllabus.

- **Today**: one ordered to-do list: learn the new words for the next quiz, review what's due, 10 grammar questions, a mock if the quiz is close.
- **Course**: every assessment with its date, scope and a prep plan.
- **Lessons**: all 59 word lists, learn in groups of 5, placement check for lessons you already know.
- **Free practice**: any lessons and grammar topics, Latin → English, English → Latin, forms & gender or mixed, from 10 questions to endless. Doesn't touch your review schedule unless you ask it to.
- **Grammar**: drills with the rule shown after every answer, plus rules and tables.
- **Trouble words** and **Mock quiz**.

Scheduling is FSRS-4.5 (`src/fsrs.js`). Answers are typed; macrons are optional.

## Your progress

Everything you learn is saved in the browser (localStorage); nothing is in this repo and nothing is sent anywhere. Because it lives in one browser, use **Back up & restore** (bottom of the sidebar) to download a backup, and to move progress to another browser or device: copy the backup text on one, paste it on the other. A restore never discards newer progress unless you tick the box, and the last restore can be undone straight away.

## Develop

```
npm ci
npm test        # the model tests (scheduling, placement, free practice, answer checking)
npm run build   # writes dist/index.html, the whole site in one file
```

`ARTIFACT_OUT=path npm run build` also writes the same app as a page fragment for Claude's artifact viewer.

Where things live:

| What | File |
| --- | --- |
| Word lists (Lessons 1–41, 47–60), synonyms, memory hooks | `src/lessons.js` |
| Lessons 42–46 (hand-checked) | `src/legacy.js` |
| Assessment dates, scopes, review units | `src/course.js` |
| Subjunctive clause sentences, sequence of tenses | `src/clauses.js` |
| Scheduling, sessions, placement, free practice | `src/model.js`, `src/fsrs.js` |

## Deploy

Pushing to `main` runs `.github/workflows/pages.yml`: install, test, build, publish `dist/index.html` to GitHub Pages. Turn it on once under **Settings → Pages → Source: GitHub Actions**.
