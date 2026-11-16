// Mr. Reid, Latin 2-3, A Block: assessments from the 1st and 2nd marking period syllabi.
// Review units in Jenney's: Review k covers Lessons 4k-3 to 4k (Review 9 = 33-36, Review 10 = 37-40).
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i).filter((n) => n !== 19);
export const reviewLessons = (k) => range(4 * k - 3, 4 * k);
export const REVIEWS = Array.from({ length: 15 }, (_, i) => ({ k: i + 1, lessons: reviewLessons(i + 1) }));

export const ASSESS = [
  { id: 'vq-r1', mp: 1, date: '2026-08-27', kind: 'vq', title: 'Vocab quiz · Review 1', lessons: reviewLessons(1), covers: '1st & 2nd declension nouns, 1st conjugation verbs' },
  { id: 'gq-r12', mp: 1, date: '2026-09-01', kind: 'gq', title: 'Grammar quiz · Review 1–2', lessons: [], topics: ['decl', 'pres'], covers: 'Declining, present tense, subject, possession, direct object, prepositional phrases, neuter nouns' },
  { id: 'vq-r23', mp: 1, date: '2026-09-03', kind: 'vq', title: 'Vocab quiz · Review 2–3', lessons: range(5, 12), covers: 'Adjectives, prepositions, adverbs, military vocabulary' },
  { id: 'gq-r34', mp: 1, date: '2026-09-09', kind: 'gq', title: 'Grammar quiz · Review 3–4', lessons: [], topics: ['pres', 'perf', 'decl', 'imp'], covers: 'All tenses, case uses, 3rd declension, vocative, imperative, means / manner' },
  { id: 't-r14', mp: 1, date: '2026-09-15', kind: 'test', title: 'Test · Review 1–4', lessons: range(1, 16), topics: ['pres', 'perf', 'decl'], covers: 'Dictionary entries, verb synopses, modifying 1st–3rd declension words, sentences' },
  { id: 'vq-r45', mp: 1, date: '2026-09-17', kind: 'vq', title: 'Vocab quiz · Review 4–5', lessons: range(13, 20), covers: '3rd declension by gender, 2nd conjugation' },
  { id: 'gq-r56', mp: 1, date: '2026-09-21', kind: 'gq', title: 'Grammar quiz · Review 5–6', lessons: [], topics: ['pres', 'perfp'], covers: 'Passive voice, ablative of agent, 3rd conjugation, ablative of separation' },
  { id: 'vq-r67', mp: 1, date: '2026-09-23', kind: 'vq', title: 'Vocab quiz · Review 6–7', lessons: range(21, 28), covers: 'capio, ago, cedo, facio, tendo, lego, duco, iacio, mitto, pono and compounds' },
  { id: 'gq-r78', mp: 1, date: '2026-09-28', kind: 'gq', title: 'Grammar quiz · Review 7–8', lessons: [], topics: ['decl', 'pron'], covers: '3rd declension patterns, pronouns, 4th & 5th declension, partitives, time' },
  { id: 't-r19', mp: 1, date: '2026-10-01', kind: 'test', title: 'Test · Review 1–9', lessons: range(1, 36), topics: ['decl', 'pron', 'pres', 'perf', 'perfp'], covers: 'Degrees of adjectives, noun and adjective forms, phrases, sentences, a story' },
  { id: 'vq-37', mp: 1, date: '2026-10-05', kind: 'vq', title: 'Vocab quiz · 37', lessons: [37], covers: 'p. 212, top and bottom: UNUS NAUTA adjectives + vocabulary' },
  { id: 'vq-38', mp: 1, date: '2026-10-13', kind: 'vq', title: 'Vocab quiz · 38', lessons: [38] },
  { id: 'q-3738', mp: 1, date: '2026-10-15', kind: 'quiz', title: 'Quiz · 37–38', lessons: [37, 38], topics: ['inf', 'pron'], covers: 'Demonstratives, irregular adjectives, infinitive forms and uses' },
  { id: 'vq-39', mp: 2, date: '2026-10-22', kind: 'vq', title: 'Vocab quiz · 39', lessons: [39] },
  { id: 'vq-4041', mp: 2, date: '2026-10-29', kind: 'vq', title: 'Vocab quiz · 40–41', lessons: [40, 41] },
  { id: 't-1109', mp: 2, date: '2026-11-09', kind: 'test', title: 'Test · participles', lessons: range(37, 41), topics: ['part'], covers: 'Lexical meanings, participle agreement, sentences, 2nd Punic War' },
  { id: 'vq-4748', mp: 2, date: '2026-11-10', kind: 'vq', title: 'Vocab quiz · 47–48', lessons: [47, 48] },
  { id: 'vq-4244', mp: 2, date: '2026-11-11', kind: 'vq', title: 'Vocab quiz · 42–44', lessons: [42, 43, 44] },
  { id: 'vq-4546', mp: 2, date: '2026-11-16', kind: 'vq', title: 'Vocab quiz · 45–46', lessons: [45, 46] },
  { id: 't-1118', mp: 2, date: '2026-11-18', kind: 'test', title: 'Test', lessons: range(42, 48), topics: ['decl', 'pres', 'perf', 'perfp', 'subj', 'clause'], covers: 'Vocabulary, noun and verb forms, identifying subjunctive clauses, review sentences 38–41', guess: 'Vocab assumed to be 42–48, the quizzes since the last test.' },
  { id: 'map-1123', mp: 2, date: '2026-11-23', kind: 'map', title: 'Map quiz', lessons: [], covers: 'The Hellenistic world (study the map handout)' },
  { id: 'q-1201', mp: 2, date: '2026-12-01', kind: 'quiz', title: 'Subjunctive quiz', lessons: [45, 46, 47, 48], topics: ['subj', 'clause', 'seq'], covers: 'Subjunctive forms, ut clauses, sequence of tenses' },
  { id: 'vq-49', mp: 2, date: '2026-12-03', kind: 'vq', title: 'Vocab quiz · 49', lessons: [49] },
  { id: 't-1207', mp: 2, date: '2026-12-07', kind: 'test', title: 'Test', lessons: range(42, 49), topics: ['subj', 'clause', 'seq', 'part'], covers: 'Ut clauses, sequence of tenses, cum clauses, indirect questions', guess: 'Scope assumed from the unit: Lessons 42–49 and the clause work.' },
];
export const KIND_NAME = { vq: 'Vocab quiz', gq: 'Grammar quiz', test: 'Test', quiz: 'Quiz', map: 'Map quiz' };

export const dateOf = (a) => new Date(a.date + 'T00:00:00');
function today0() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
export const daysUntil = (a) => Math.round((dateOf(a) - today0()) / 86400000);
export const upcoming = () => ASSESS.filter((a) => daysUntil(a) >= 0);
export const nextAssessment = () => upcoming().find((a) => a.kind !== 'map') || null;
// 6 pm the evening before.
export const deadlineMs = (a) => dateOf(a).getTime() - 6 * 3600000;

// The soonest assessment (in the next 3 weeks) that covers a lesson.
export function assessmentFor(n) {
  return upcoming().find((a) => daysUntil(a) <= 21 && a.lessons.includes(n)) || null;
}
export function assessmentForTopic(t) {
  return upcoming().find((a) => daysUntil(a) <= 21 && (a.topics || []).includes(t)) || null;
}
