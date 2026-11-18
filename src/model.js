// Study model: word sets, which questions exist for each word, today's queue, grading and mistake diagnosis.
import {
  parseRaw, normLatin, normEn, glosses, matchEnglish, evalEntry, fieldLabels, entryRest, hasExtraForms,
  genderInfo, lev, RAW1, SYN1, HOOK1, RAW45, SYN45, HOOK45, G, G_RULE, gCheck, gSquash, rule3, GNAME,
} from './legacy.js';
import { review, retrievability, DAY, MIN } from './fsrs.js';
import { LESSON_RAW, LESSON_SYN, LESSON_HOOK } from './lessons.js';
import { CLAUSES, CLAUSE_TYPES, CLAUSE_NAME, CLUE, SEQ_FRAMES, SEQ_KEY, SEQ_LABEL } from './clauses.js';
import { ASSESS, assessmentFor, assessmentForTopic, deadlineMs, daysUntil, REVIEWS } from './course.js';

export { G, G_RULE, gCheck, rule3, GNAME, entryRest, fieldLabels, normLatin, glosses, hasExtraForms };

// One set per lesson. Lessons 42-44 keep the 'progress' document and 45-46 the 'progress-l45'
// document with their original card ids, so saved progress carries over. Every other lesson
// lives in 'progress-lessons' with ids like "L7:appello".
function splitAt(cards, ...firstIds) {
  const idx = firstIds.map((id) => cards.findIndex((c) => c.id === id));
  return idx.map((start, i) => cards.slice(start, i + 1 < idx.length ? idx[i + 1] : cards.length));
}
const [C44, C43, C42] = splitAt(parseRaw(RAW1), 'altitudo', 'calamitas', 'aurum');
const [C46, C45] = splitAt(parseRaw(RAW45), 'aedificium', 'ergo');
const OLD = { 42: ['earlier', C42, SYN1, HOOK1], 43: ['earlier', C43, SYN1, HOOK1], 44: ['earlier', C44, SYN1, HOOK1], 45: ['l45', C45, SYN45, HOOK45], 46: ['l45', C46, SYN45, HOOK45] };
const EXTRA_SYN = { '-ne': ['question', 'asks a question', 'question marker', 'yes or no question'], num: ['expects no', 'question expecting no', 'expects a no answer'] };
function lessonSet(n) {
  if (OLD[n]) { const [doc, cards, syn, hook] = OLD[n]; return { id: 'L' + n, n, doc, cards, syn, hook }; }
  const cards = parseRaw(LESSON_RAW[n]).map((c) => ({ ...c, word: c.id, id: 'L' + n + ':' + c.id }));
  const syn = {}, hook = {};
  cards.forEach((c) => {
    const s = (LESSON_SYN[c.word] || []).concat(EXTRA_SYN[c.word] || []);
    if (s.length) syn[c.id] = s;
    if (n >= 47 && LESSON_HOOK[c.word]) hook[c.id] = LESSON_HOOK[c.word];
  });
  return { id: 'L' + n, n, doc: 'lessons', cards, syn, hook };
}
export const LESSON_NUMS = Array.from({ length: 60 }, (_, i) => i + 1).filter((n) => n !== 19);
export const SETS = LESSON_NUMS.map((n) => {
  const s = lessonSet(n);
  return { ...s, title: 'Lesson ' + n, short: 'L' + n, sub: s.cards[0].forms[0] + ' to ' + s.cards[s.cards.length - 1].forms[0] };
});
export const SET = Object.fromEntries(SETS.map((s) => [s.id, s]));
export const SET_DOCS = [...new Set(SETS.map((s) => s.doc))];
export const setOfLesson = (n) => SET['L' + n];
export const POS = { n: 'noun', v: 'verb', a: 'adjective', av: 'adverb', cj: 'conjunction', pr: 'pronoun', pp: 'preposition', nm: 'number', ph: 'phrase' };
export { ASSESS, REVIEWS, CLAUSE_TYPES, CLAUSE_NAME };
export const PART = { ...POS };
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const firstGloss = (m) => glosses(m)[0] || m;

export function entryText(c) { const r = entryRest(c); return c.forms[0] + (r ? ', ' + r : ''); }
export function genderClass(g) {
  const s = genderInfo(g).set;
  return s.size === 1 ? [...s][0] : null;
}

/* ---------- quiz date ---------- */
export function deadlineOf(hub) {
  if (!hub.quizDate) return null;
  const d = new Date(hub.quizDate + 'T00:00:00');
  const dl = d.getTime() - 6 * 3600000; // 6pm the evening before
  return dl > Date.now() ? dl : null;
}
export function daysToQuiz(hub) {
  if (!hub.quizDate) return null;
  const d = new Date(hub.quizDate + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / DAY);
}
// The soonest assessment that covers this item sets its deadline (6 pm the evening before)
// and, within 3 days, a higher retention target.
export function itemAssessment(item) {
  if (!item) return null;
  if (item.kind === 'gram') return assessmentForTopic(item.topic || (item.q && item.q.topic));
  const set = SET[item.setId];
  return set ? assessmentFor(set.n) : null;
}
function schedOpts(hub, item) {
  const a = itemAssessment(item);
  if (!a) return { retention: 0.9 };
  const dl = deadlineMs(a);
  return { deadline: dl > Date.now() ? dl : null, retention: daysUntil(a) <= 3 ? 0.95 : 0.9 };
}
export const todayKey = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
export function endOfToday() { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); }
export function streak(hub) {
  let n = 0;
  const d = new Date();
  if (!(hub.days || {})[todayKey(d)]) d.setDate(d.getDate() - 1);
  while ((hub.days || {})[todayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------- verbs and nouns built from vocab cards ---------- */
// Irregular verbs the generator can't conjugate, and verbs with no personal passive (intransitive or + dative).
const IRREG_V = new Set(['eo', 'adeo', 'exeo', 'redeo', 'transeo', 'ineo', 'fero', 'adfero', 'confero', 'infero', 'refero', 'defero', 'absum', 'adsum', 'desum', 'praesum', 'possum', 'volo', 'nolo', 'malo', 'fio', 'inquam', 'coepi', 'convenit', 'licet', 'oportet', 'edo', 'do']);
const NP_EXTRA = ['sto', 'ambulo', 'navigo', 'pugno', 'laboro', 'habito', 'volo', 'maneo', 'sedeo', 'curro', 'venio', 'pervenio', 'convenio', 'dormio', 'discedo', 'excedo', 'cedo', 'surgo', 'accedo', 'contendo', 'cresco', 'desisto', 'pertineo', 'valeo', 'accido', 'credo', 'noceo', 'parco', 'pareo', 'placeo', 'resisto', 'studeo', 'mando', 'appropinquo', 'hiemo', 'cado', 'ascendo', 'descendo', 'taceo', 'iaceo', 'vivo', 'doleo', 'consido', 'rideo', 'fugio', 'clamo', 'respondeo', 'erro', 'consisto', 'impero', 'persuadeo'];
const NP = new Set(G.VERBS.filter((v) => v.np).map((v) => v.id).concat(NP_EXTRA));
const NF = new Set(G.VERBS.filter((v) => v.nf).map((v) => v.id));
export function verbOf(card) {
  if (card.pos !== 'v' || card.forms.length < 4 || IRREG_V.has(card.forms[0]) || /\s/.test(card.forms[2])) return null;
  const known = G.VERBS.find((v) => v.id === card.forms[0]);
  if (known) return known;
  const p = card.forms.slice(0, 4), f0 = p[0], inf = p[1];
  const k = inf.endsWith('are') ? '1' : inf.endsWith('ire') ? '4' : f0.endsWith('eo') ? '2' : f0.endsWith('io') ? '3io' : '3';
  return { id: f0, p, m: firstGloss(card.meaning), k, root: inf.slice(0, -3), perf: p[2].slice(0, -1), sup: p[3].slice(0, -2), np: NP.has(f0), nf: NF.has(f0) };
}
const ENDS = [['ae', '1'], ['ei', '5'], ['us', '4'], ['is', '3'], ['i', '2']];
export function nounOf(card) {
  if (card.pos !== 'n' || card.forms.length < 2 || card.lab || /dat|acc\.|plural only|loca/.test(card.note) || /^(deus|domus|locus)$/.test(card.forms[0])) return null;
  if (/pl/.test(card.gender)) return null;
  const known = G.NOUNS.find((n) => n.nom === card.forms[0]);
  if (known) return known;
  const nom = card.forms[0], gen = card.forms[1];
  const hit = ENDS.find(([e]) => gen.endsWith(e));
  if (!hit) return null;
  let d = hit[1];
  const g = genderClass(card.gender);
  if (d === '2' && g === 'n') d = '2n';
  if (d === '3' && g === 'n') d = /(e|al|ar)$/.test(nom) ? '3in' : '3n';
  if (d === '4' && g === 'n') return null;
  if (!g) return null;
  const st = gen.slice(0, -hit[0].length);
  if (d === '1' && !nom.endsWith('a')) return null;
  const n = { nom, st, d, g: card.gender, m: firstGloss(card.meaning), id: nom, fuzzy3: d === '3' || d === '3n' };
  n.cells = G.DECL_END[d].map((e, i) => { const f = i === 0 || e === '=' ? nom : st + e; return { gold: f, ok: [f] }; });
  if (n.fuzzy3) { // i-stem or not is not recorded for these: accept both genitive plurals
    n.cells[6].ok.push(st + 'ium');
    if (d === '3') n.cells[4].ok.push(st + 'i');
  }
  return n;
}

/* ---------- grammar questions ---------- */
const PRES_KEYS = ['pres-a', 'pres-p', 'impf-a', 'impf-p', 'fut-a', 'fut-p'];
const PERF_KEYS = ['perf-a', 'plup-a', 'fperf-a'];
const PERFP_KEYS = ['perf-p', 'plup-p', 'fperf-p'];
const SUBJ_KEYS = ['spres-a', 'spres-p', 'simpf-a', 'simpf-p', 'sperf-a', 'sperf-p', 'splup-a', 'splup-p'];
export const TOPICS = [
  ['decl', 'Noun declensions'], ['dem', 'hic, ille, is'], ['pers', 'Personal pronouns'], ['pron', 'ipse, idem, qui'], ['pres', 'Present, imperfect, future'], ['perf', 'Perfect system active'],
  ['perfp', 'Perfect passives'], ['inf', 'Infinitives'], ['part', 'Participles'], ['subj', 'Subjunctive'], ['imp', 'Imperatives'], ['sum', 'sum & possum'],
  ['clause', 'Subjunctive clauses'], ['seq', 'Sequence of tenses'],
];
export const PERS = {
  ego: { title: 'ego, nos', m: 'I, we', sg: ['ego', 'mei', 'mihi', 'me', 'me'], pl: ['nos', 'nostrum|nostri', 'nobis', 'nos', 'nobis'] },
  tu: { title: 'tu, vos', m: 'you', sg: ['tu', 'tui', 'tibi', 'te', 'te'], pl: ['vos', 'vestrum|vestri', 'vobis', 'vos', 'vobis'] },
  sui: { title: 'sui (reflexive)', m: 'himself, herself, itself, themselves', sg: [null, 'sui', 'sibi', 'se|sese', 'se|sese'] },
};
export const TNAME = Object.fromEntries(TOPICS);
const CASE_LAB = []; ['sg.', 'pl.'].forEach((nb) => G.CASES.forEach((c) => CASE_LAB.push(c + ' ' + nb)));

const SETS_OF = {
  pres: [['pres-a', 'impf-a', 'fut-a'], ['pres-p', 'impf-p', 'fut-p']],
  perf: [['perf-a', 'plup-a', 'fperf-a']],
  perfp: [['perf-p', 'plup-p', 'fperf-p']],
  subj: [['spres-a', 'simpf-a', 'sperf-a', 'splup-a'], ['spres-p', 'simpf-p', 'sperf-p', 'splup-p']],
};
const tshort = (k) => G.TENSES[k].label.replace(' subjunctive', ' subj.').replace(' active', '').replace(' passive', ' pass.');
// A whole conjugation chart: one verb, every person, all the related tenses at once.
function chartQ(topic, vs) {
  let v, keys;
  do { v = pick(vs); keys = pick(SETS_OF[topic]); } while (v.np && G.TENSES[keys[0]].pass);
  const cols = keys.map((k) => G.TENSES[k].build(v)), cells = [], labels = [];
  G.PERSONS.forEach((p, i) => keys.forEach((k, j) => { cells.push(cols[j][i]); labels.push(p + ' ' + tshort(k)); }));
  const rule = 'chart-' + keys.join('+');
  G_RULE[rule] = keys.map((k) => G_RULE[k]).join(' ');
  return { verb: v, head: v.p[0], sub: v.p.join(', ') + ' · ' + v.m, tag: G.CONJ_NAME[v.k], topic, rule, cells, labels, grid: 'tenses', cols: keys.length, ask: 'the whole chart: ' + keys.map(tshort).join(', ') };
}
function verbQ(v, keys, mode, extra) {
  const pool = keys.filter((k) => !(G.TENSES[k].pass && v.np));
  const tk = pick(pool);
  const tense = G.TENSES[tk];
  const cells = tense.build(v);
  const q = { verb: v, tk, head: v.p[0], sub: v.p.join(', ') + ' · ' + v.m, tag: G.CONJ_NAME[v.k], rule: tk, full: cells, ...extra };
  if (mode === 'one') { const i = Math.floor(Math.random() * 6); return { ...q, person: i, cells: [cells[i]], labels: [G.PERSONS[i]], ask: G.PERSONS[i] + ' ' + tense.label }; }
  return { ...q, cells, labels: G.PERSONS, grid: 'six', ask: tense.label };
}
function nounQ(n, mode, extra) {
  const q = { noun: n, head: n.nom, sub: n.cells[1].gold + ', ' + n.g + (n.g.endsWith('.') ? '' : '.') + ' · ' + n.m, tag: G.DECL_NAME[n.d], rule: n.d.indexOf('3i') === 0 ? 'i3' : 'decl', ...extra };
  if (mode === 'one') { const i = 1 + Math.floor(Math.random() * 9); return { ...q, slot: i, cells: [n.cells[i]], labels: [CASE_LAB[i]], ask: CASE_LAB[i] }; }
  return { ...q, cells: n.cells, labels: CASE_LAB, grid: 'decl', ask: 'the full declension' };
}

// Which kind of clause is in [brackets]?
function clauseQ() {
  const s = pick(CLAUSES);
  const choices = CLAUSE_TYPES.map(([k, l, d]) => ({ id: k, label: l, sub: d }));
  return {
    topic: 'clause', choice: true, head: null, sentence: s.la, en: s.en, choices, answer: s.type,
    ask: 'kind of clause in brackets', why: CLUE[s.type] + (s.sense ? ' Here: “' + s.sense + '”.' : ''), rule: 'clause', id: s.id,
  };
}
// Which subjunctive tense fills the blank?
function seqQ() {
  const f = pick(SEQ_FRAMES);
  const side = f.secondaryOnly ? 1 : Math.random() < 0.5 ? 0 : 1;
  const rel = pick(f.rels);
  const key = SEQ_KEY[(side ? 'secondary' : 'primary') + '-' + rel];
  const v = pick(G.VERBS);
  const opts = ['spres-a', 'simpf-a', 'sperf-a', 'splup-a'].map((k) => ({ id: k, label: G.TENSES[k].build(v)[f.p].gold, sub: SEQ_LABEL[k] }));
  const seqName = side ? 'secondary (past main verb)' : 'primary (present / future main verb)';
  const relName = rel === 'same' ? 'the same time or after' : 'before';
  return {
    topic: 'seq', choice: true, head: null, sentence: f.main[side] + ' [___]' + (f.tail || '') , en: f.en[side] + ' … (' + v.p[0] + ', ' + v.m + ')',
    ask: 'subjunctive of ' + v.p[0] + ' for: action ' + relName + ' the main verb', choices: opts, answer: key,
    why: f.what[0].toUpperCase() + f.what.slice(1) + ', ' + seqName + ' + action ' + relName + ' → ' + SEQ_LABEL[key] + ' subjunctive.', rule: 'seq', verb: v,
  };
}

export function grammarQ(topic, mode) {
  if (topic === 'clause') return clauseQ();
  if (topic === 'seq') return seqQ();
  const verbs = (needPass) => G.VERBS.filter((v) => !needPass || !v.np);
  if (mode === 'table' && SETS_OF[topic]) return chartQ(topic, topic === 'perfp' ? verbs(true) : G.VERBS);
  if (topic === 'pres') return verbQ(pick(G.VERBS), PRES_KEYS, mode, { topic });
  if (topic === 'perf') return verbQ(pick(G.VERBS), PERF_KEYS, mode, { topic });
  if (topic === 'perfp') return verbQ(pick(verbs(true)), PERFP_KEYS, mode, { topic });
  if (topic === 'subj') return verbQ(pick(G.VERBS), SUBJ_KEYS, mode, { topic });
  if (topic === 'decl') return nounQ(pick(G.NOUNS), mode, { topic });
  if (topic === 'inf' || topic === 'part' || topic === 'imp') {
    const v = pick(G.VERBS);
    const list = topic === 'inf' ? G.infinitives(v) : topic === 'part' ? G.participles(v) : G.imperatives(v);
    const q = { topic, verb: v, head: v.p[0], sub: v.p.join(', ') + ' · ' + v.m, tag: G.CONJ_NAME[v.k], rule: topic };
    q.extra = topic === 'part' ? list.map((x) => x.label + ': ' + x.full).join(' · ') : null;
    if (mode === 'one') {
      const one = pick(list);
      return { ...q, cells: [one.cell], labels: [one.label], ask: topic === 'inf' ? one.label + ' infinitive' : topic === 'part' ? one.label + ' participle (nom. sg.)' : one.label + ' imperative' };
    }
    return { ...q, cells: list.map((x) => x.cell), labels: list.map((x) => x.label), grid: 'list', ask: topic === 'inf' ? 'all the infinitives' : topic === 'part' ? 'all the participles (nom. sg.)' : 'both imperatives' };
  }
  if (topic === 'sum') {
    const w = pick(['sum', 'possum']), irr = G.IRR[w], tk = pick(G.IRR_TENSES);
    const cells = irr.t[tk].map(G.simple);
    const what = G.TENSES[tk].label.replace(' active', '');
    const q = { topic, head: w, sub: w + ', ' + irr.inf + ' · ' + irr.m, tag: 'irregular', rule: 'sum' };
    if (mode === 'one') { const i = Math.floor(Math.random() * 6); return { ...q, cells: [cells[i]], labels: [G.PERSONS[i]], ask: G.PERSONS[i] + ' ' + what }; }
    return { ...q, cells, labels: G.PERSONS, grid: 'six', ask: what };
  }
  if (topic === 'pron' || topic === 'dem') {
    const pk = pick(topic === 'dem' ? ['hic', 'ille', 'is'] : ['ipse', 'idem', 'qui']), pr = G.PRON[pk], nb = pick(['sg', 'pl']), GN = ['masc.', 'fem.', 'neut.'];
    const q = { topic, head: pr.title, sub: pr.m, tag: null, rule: topic };
    if (mode === 'one') {
      let r = Math.floor(Math.random() * 5); const c = Math.floor(Math.random() * 3);
      if (r === 0 && nb === 'sg') r = 1 + Math.floor(Math.random() * 4);
      const lab = G.CASES[r] + ' ' + (nb === 'sg' ? 'sg.' : 'pl.') + ' ' + GN[c];
      return { ...q, cells: [G.pronCell(pr[nb][r][c])], labels: [lab], ask: lab };
    }
    const cells = [], labels = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) { cells.push(G.pronCell(pr[nb][r][c])); labels.push(G.CASES[r].slice(0, 3) + '. ' + GN[c]); }
    return { ...q, cells, labels, grid: 'pron', ask: (nb === 'sg' ? 'singular' : 'plural') + ', all genders' };
  }
  if (topic === 'pers') {
    const pk = pick(['ego', 'tu', 'sui']), pr = PERS[pk], q = { topic, head: pr.title, sub: pr.m, tag: null, rule: 'pers' };
    const lab = (r, nb) => G.CASES[r] + (pk === 'sui' ? '' : ' ' + (nb === 'sg' ? 'sg.' : 'pl.'));
    if (mode === 'one') {
      const nb = pk === 'sui' ? 'sg' : pick(['sg', 'pl']), r = pk === 'sui' ? 1 + Math.floor(Math.random() * 4) : Math.floor(Math.random() * 5);
      return { ...q, cells: [G.pronCell(pr[nb][r])], labels: [lab(r, nb)], ask: lab(r, nb) };
    }
    if (pk === 'sui') return { ...q, cells: pr.sg.slice(1).map(G.pronCell), labels: [1, 2, 3, 4].map((r) => lab(r, 'sg')), grid: 'list', ask: 'the whole reflexive' };
    const cells = [], labels = [];
    ['sg', 'pl'].forEach((nb) => { for (let r = 0; r < 5; r++) { cells.push(G.pronCell(pr[nb][r])); labels.push(G.CASES[r].slice(0, 3) + '. ' + nb + '.'); } });
    return { ...q, cells, labels, grid: 'decl', ask: 'the whole declension' };
  }
  return null;
}

// A grammar question built from one of your own vocab words.
export function useQ(card) {
  const v = verbOf(card);
  if (v) {
    const opts = [['pres', PRES_KEYS], ['subj', SUBJ_KEYS], ['perf', PERF_KEYS]].concat(v.np ? [] : [['perfp', PERFP_KEYS]]);
    const [topic, keys] = pick(opts);
    return verbQ(v, keys, 'one', { topic });
  }
  const n = nounOf(card);
  if (n) {
    const q = nounQ(n, 'one', { topic: 'decl' });
    if (n.fuzzy3 && q.slot === 6) return nounQ(n, 'one', { topic: 'decl' });
    return q;
  }
  return null;
}

/* ---------- indirect commands in context (Lessons 45–46) ---------- */
export const CLOZE = [
  { id: 'cz1', word: 'impero', la: 'Dux militibus ___ ut fortiter pugnarent.', en: 'The general ordered the soldiers to fight bravely.', ans: ['imperavit'], why: 'impero takes the dative (militibus) + ut.' },
  { id: 'cz2', word: 'persuadeo', la: 'Legatus Gallis ___ ne bellum gererent.', en: 'The envoy persuaded the Gauls not to wage war.', ans: ['persuasit'], why: 'persuadeo takes the dative (Gallis) + ne.' },
  { id: 'cz3', word: 'oro', la: 'Puer patrem ___ ut sibi ignosceret.', en: 'The boy begged his father to forgive him.', ans: ['oravit'], why: 'oro takes the accusative (patrem) + ut.' },
  { id: 'cz4', word: 'postulo', la: 'Caesar ab Helvetiis obsides ___.', en: 'Caesar demanded hostages from the Helvetii.', ans: ['postulavit'], why: 'postulo: ab + ablative for the person asked.' },
  { id: 'cz5', word: 'rogo', la: 'Magister discipulos ___ cur abessent.', en: 'The teacher asked the students why they were absent.', ans: ['rogavit'], why: 'rogo takes the accusative (discipulos).' },
  { id: 'cz6', word: 'quaero', la: 'Ex captivis ___ ubi hostes essent.', en: 'He asked the prisoners where the enemy was.', ans: ['quaesivit'], why: 'quaero: ex / ab + ablative for the person asked.' },
  { id: 'cz7', word: 'mando', la: 'Rex legatis ___ ut pacem peterent.', en: 'The king instructed the envoys to seek peace.', ans: ['mandavit'], why: 'mando takes the dative (legatis) + ut.' },
  { id: 'cz8', word: 'persuadeo', la: 'Legatus ___ persuasit ut discederent.', en: 'The envoy persuaded the Gauls (Galli) to leave.', ans: ['Gallis'], why: 'persuadeo takes the dative: Gallis.' },
  { id: 'cz9', word: 'rogo', la: 'Caesar ___ rogavit ut venirent.', en: 'Caesar asked the chiefs (principes) to come.', ans: ['principes'], why: 'rogo takes the accusative: principes.' },
  { id: 'cz10', word: 'postulo', la: 'Legati a ___ auxilium postulaverunt.', en: 'The envoys demanded help from Caesar.', ans: ['Caesare'], why: 'postulo: a / ab + ablative: a Caesare.' },
];

/* ---------- which questions a word has ---------- */
export const isLearned = (doc, id) => !!((doc.learned || {})[id] || ((doc.v2 || {}).cards || {})[id + '|le']);
const okOnce = (c) => c && c.reps - (c.lapses || 0) >= 1 && c.lastGrade !== 1;

export function wordItems(set, doc, card) {
  if ((doc.removed || {})[card.id] || !isLearned(doc, card.id)) return [];
  const cards = doc.v2.cards;
  const le = cards[card.id + '|le'];
  const base = { setId: set.id, card, docName: set.doc };
  const out = [{ ...base, kind: 'le', key: card.id + '|le' }];
  if (okOnce(le) || cards[card.id + '|el']) out.push({ ...base, kind: 'el', key: card.id + '|el' });
  if ((okOnce(le) || cards[card.id + '|fm']) && hasExtraForms(card)) out.push({ ...base, kind: 'fm', key: card.id + '|fm' });
  if ((okOnce(le) || cards[card.id + '|gd']) && rule3(card)) out.push({ ...base, kind: 'gd', key: card.id + '|gd' });
  return out;
}
export function hubItems(store) {
  const hub = store.get('hub');
  const out = [];
  SETS.forEach((set) => {
    const doc = store.get(set.doc);
    set.cards.forEach((card) => {
      if ((doc.removed || {})[card.id] || !isLearned(doc, card.id)) return;
      if ((verbOf(card) || nounOf(card)) && okOnce(doc.v2.cards[card.id + '|le'])) out.push({ kind: 'use', key: 'use|' + set.doc + ':' + card.id, setId: set.id, card, docName: 'hub' });
    });
  });
  const l45 = store.get('l45');
  CLOZE.forEach((cz) => { if (isLearned(l45, cz.word)) out.push({ kind: 'cloze', key: 'cz|' + cz.id, cz, setId: 'L45', card: SET.L45.cards.find((c) => c.id === cz.word), docName: 'hub' }); });
  return out;
}
export function cardOf(store, item) {
  const doc = store.get(item.docName);
  return item.docName === 'hub' ? doc.cards[item.key] : doc.v2.cards[item.key];
}

// setFilter: a set id, a list of set ids, or nothing for everything.
export function allItems(store, setFilter) {
  const only = setFilter == null ? null : new Set([].concat(setFilter));
  let out = [];
  SETS.forEach((set) => { if (only && !only.has(set.id)) return; const doc = store.get(set.doc); set.cards.forEach((c) => { out = out.concat(wordItems(set, doc, c)); }); });
  const hub = hubItems(store);
  return out.concat(only ? hub.filter((i) => only.has(i.setId)) : hub);
}
// New question types (a word's first whole-entry, gender or grammar card) are let in 15 a day,
// so the queue grows gradually instead of all at once.
export const NEW_PER_DAY = 15;
function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
export function introducedToday(store) {
  const sod = startOfToday();
  let n = 0;
  const count = (bag) => Object.values(bag || {}).forEach((c) => { if (c.first && c.first >= sod && !c.migrated && !c.placed) n++; });
  SET_DOCS.forEach((d) => count(store.get(d).v2.cards));
  count(store.get('hub').cards);
  return n;
}
export function dueItems(store, until, setFilter) {
  const all = allItems(store, setFilter);
  const scheduled = [], fresh = [];
  all.forEach((it) => { const c = cardOf(store, it); if (!c) fresh.push(it); else if ((c.due || 0) <= until) scheduled.push(it); });
  fresh.sort((a, b) => (a.kind === 'le' ? -1 : 0) - (b.kind === 'le' ? -1 : 0));
  // Words on an upcoming quiz get their new question types first.
  const soon = (it) => { const a = itemAssessment(it); return a ? daysUntil(a) : 99; };
  const rest = fresh.filter((it) => it.kind !== 'le').sort((a, b) => soon(a) - soon(b));
  const room = Math.max(0, NEW_PER_DAY - introducedToday(store));
  return scheduled.concat(fresh.filter((it) => it.kind === 'le').concat(rest.slice(0, room)));
}
export function dueCount(store, setFilter) { return dueItems(store, endOfToday(), setFilter).length; }

// Interleave by kind so the same type doesn't come up back to back.
export function buildQueue(items) {
  const by = {};
  shuffle(items).forEach((it) => { (by[it.kind] = by[it.kind] || []).push(it); });
  const kinds = Object.keys(by), out = [];
  while (kinds.some((k) => by[k].length)) shuffle(kinds).forEach((k) => { if (by[k].length) out.push(by[k].shift()); });
  return out;
}

/* ---------- free practice: any lessons, any direction, not limited to what is due ---------- */
export const FREE_DEFAULT = { lessons: [], topics: [], dir: 'mixed', n: 20, unlearned: true, track: false };
export function freePool(store, cfg) {
  const out = [];
  (cfg.lessons || []).forEach((n) => {
    const set = setOfLesson(n);
    if (!set) return;
    const doc = store.get(set.doc);
    set.cards.forEach((card) => {
      if ((doc.removed || {})[card.id]) return;
      if (!cfg.unlearned && !isLearned(doc, card.id)) return;
      out.push({ set, card, n });
    });
  });
  return out;
}
function freeKind(dir, card) {
  if (dir === 'le' || dir === 'el') return dir;
  if (dir === 'fm') return hasExtraForms(card) || card.gender ? 'fm' : 'el';
  const kinds = ['le', 'el'];
  if (hasExtraForms(card) || card.gender) kinds.push('fm');
  if (rule3(card)) kinds.push('gd');
  return kinds[Math.floor(Math.random() * kinds.length)];
}
// Cards that are already in the schedule can count toward it (when asked); a word you haven't learned never gets scheduled by free practice.
function freeItem(store, p, cfg) {
  const kind = freeKind(cfg.dir, p.card);
  const it = { setId: p.set.id, card: p.card, docName: p.set.doc, kind, key: p.card.id + '|' + kind, lesson: p.n, free: true };
  it.noSrs = !cfg.track || !cardOf(store, it);
  return it;
}
export function freeCounts(cfg, poolLen) {
  const gram = (cfg.topics || []).length > 0, vocab = poolLen > 0;
  if (cfg.n === 'endless') return { batch: true, v: vocab ? (gram ? 4 : 6) : 0, g: gram ? (vocab ? 2 : 6) : 0 };
  if (cfg.n === 'all') return { v: poolLen, g: gram ? (vocab ? Math.round(poolLen * 0.4) : 30) : 0 };
  const n = +cfg.n;
  if (!gram) return { v: Math.min(n, poolLen), g: 0 };
  if (!vocab) return { v: 0, g: n };
  const g = Math.round(n * 0.3);
  return { v: Math.min(n - g, poolLen), g };
}
export function freeBatch(store, cfg, nV, nG) {
  const pool = shuffle(freePool(store, cfg));
  const items = [];
  for (let i = 0; i < nV && pool.length; i++) items.push(freeItem(store, pool[i % pool.length], cfg));
  const tp = cfg.topics || [];
  for (let i = 0; i < nG && tp.length; i++) { const t = tp[Math.floor(Math.random() * tp.length)]; items.push({ kind: 'gram', q: grammarQ(t, 'one'), topic: t, key: 'g' + Math.random(), free: true }); }
  return buildQueue(items);
}

/* ---------- word status and trouble words ---------- */
export function wordCards(doc, id) {
  const c = doc.v2.cards;
  return ['le', 'el', 'fm', 'gd'].map((m) => c[id + '|' + m]).filter(Boolean);
}
export function wordStatus(doc, card) {
  if ((doc.removed || {})[card.id]) return 'removed';
  if (!isLearned(doc, card.id)) return 'new';
  const cs = wordCards(doc, card.id);
  const lapses = cs.reduce((a, c) => a + (c.lapses || 0), 0);
  const recent = cs.flatMap((c) => (c.h || []).slice(-3));
  if (lapses >= 3 || recent.filter((g) => g === 1).length >= 2) return 'trouble';
  const le = doc.v2.cards[card.id + '|le'];
  if (le && le.state === 'review' && le.S >= 4) return 'known';
  return 'learning';
}
export function troubleWords(store) {
  const out = [];
  SETS.forEach((set) => {
    const doc = store.get(set.doc);
    set.cards.forEach((card) => {
      if (wordStatus(doc, card) !== 'trouble') return;
      const cs = wordCards(doc, card.id);
      const misses = cs.reduce((a, c) => a + (c.lapses || 0) + (c.h || []).filter((g) => g === 1).length, 0);
      out.push({ set, card, misses: Math.max(misses, 2) });
    });
  });
  return out.sort((a, b) => b.misses - a.misses);
}
// Words that look or mean alike: similar spelling or a shared English meaning.
export function lookAlikes(card) {
  const mine = new Set(glosses(card.meaning));
  const pool = SETS.flatMap((s) => s.cards.map((c) => ({ c, s })));
  return pool.filter(({ c }) => c !== card && c.id !== card.id && (
    (lev(c.forms[0], card.forms[0]) <= 2 && Math.min(c.forms[0].length, card.forms[0].length) >= 3) ||
    glosses(c.meaning).some((g) => mine.has(g)) ||
    (c.forms[0].slice(0, 3) === card.forms[0].slice(0, 3) && c.pos === card.pos)
  )).slice(0, 3);
}

/* ---------- mistake diagnosis ---------- */
export const PATTERNS = {
  mood: { label: 'Mood mix-ups', topic: 'subj' }, tense: { label: 'Tense mix-ups', topic: 'pres' }, voice: { label: 'Active vs passive', topic: 'perfp' },
  person: { label: 'Person endings', topic: 'pres' }, conj: { label: 'Wrong conjugation', topic: 'pres' }, case: { label: 'Case endings', topic: 'decl' },
  number: { label: 'Singular vs plural', topic: 'decl' }, gender: { label: 'Genders', topic: null }, confusion: { label: 'Look-alike words', topic: null },
  forms: { label: 'Principal parts & genitives', topic: null },
  clause: { label: 'Clause types', topic: 'clause' }, seq: { label: 'Sequence of tenses', topic: 'seq' },
};
const TENSE_ALL = Object.keys(G.TENSES);
const isSubj = (k) => k[0] === 's' && k !== 'sum';
function verbFormMap(v) {
  const m = [];
  TENSE_ALL.forEach((k) => { if (G.TENSES[k].pass && v.np) return; G.TENSES[k].build(v).forEach((c, i) => c.ok.forEach((f) => m.push({ f: gSquash(f), k, i, gold: c.gold }))); });
  return m;
}
export function diagnose(item, q, typed) {
  const t = gSquash(typed || '');
  if (!t) return null;
  if (q && q.verb && q.tk != null && q.person != null) {
    const hit = verbFormMap(q.verb).find((x) => x.f === t);
    if (hit) {
      const a = q.tk, b = hit.k;
      const label = (hit.i != null ? G.PERSONS[hit.i] + ' ' : '') + G.TENSES[b].label;
      let cat = 'tense';
      if (a === b) cat = 'person';
      else if (isSubj(a) !== isSubj(b)) cat = 'mood';
      else if (G.TENSES[a].pass !== G.TENSES[b].pass) cat = 'voice';
      return { cat, msg: 'You wrote the ' + label + ' (' + hit.gold + ').' };
    }
    for (const k of ['1', '2', '3', '3io', '4']) {
      if (k === q.verb.k) continue;
      const alt = { ...q.verb, k };
      const cell = G.TENSES[q.tk].build(alt)[q.person];
      if (cell.ok.some((f) => gSquash(f) === t)) return { cat: 'conj', msg: 'You conjugated it like a ' + G.CONJ_NAME[k] + ' verb. ' + q.verb.p[0] + ' is ' + G.CONJ_NAME[q.verb.k] + '.' };
    }
  }
  if (q && q.noun && q.slot != null) {
    const i = q.noun.cells.findIndex((c, j) => j !== q.slot && c.ok.some((f) => gSquash(f) === t));
    if (i >= 0) {
      const sameNum = (i < 5) === (q.slot < 5);
      return { cat: sameNum ? 'case' : 'number', msg: 'That is the ' + CASE_LAB[i] + '.' };
    }
  }
  if (item && item.kind === 'le') {
    const other = SETS.flatMap((s) => s.cards).find((c) => c !== item.card && matchEnglish(typed, c.meaning, false, []).ok);
    if (other) return { cat: 'confusion', msg: 'That is the meaning of ' + other.forms[0] + '.', other: other.id };
  }
  return null;
}

/* ---------- grading ---------- */
export function grade(store, item, g, diag) {
  const now = Date.now();
  const hub = store.get('hub');
  const opts = schedOpts(hub, item);
  if (item.docName && item.kind !== 'gram' && !item.noSrs) {
    store.update(item.docName, (doc) => {
      const bag = item.docName === 'hub' ? doc.cards : doc.v2.cards;
      bag[item.key] = review(bag[item.key], g, now, opts);
    });
  }
  store.update('hub', (h) => {
    const k = todayKey(now);
    h.days[k] = (h.days[k] || 0) + 1;
    if (g === 1 && diag) h.mistakes = h.mistakes.concat({ t: now, cat: diag.cat, word: item.card ? item.card.id : item.q && item.q.head }).slice(-300);
    else if (g === 1 && item.kind === 'gd') h.mistakes = h.mistakes.concat({ t: now, cat: 'gender', word: item.card.id }).slice(-300);
    else if (g === 1 && (item.kind === 'el' || item.kind === 'fm')) h.mistakes = h.mistakes.concat({ t: now, cat: 'forms', word: item.card.id }).slice(-300);
  });
  if (item.topic || (item.q && item.q.topic && (item.kind === 'gram' || item.kind === 'use'))) {
    const topic = item.topic || item.q.topic;
    store.update('grammar', (gr) => {
      const s = gr.stats[topic] || (gr.stats[topic] = { r: 0, w: 0, last: [] });
      if (g > 1) s.r++; else s.w++;
      s.last = (s.last || []).concat(g > 1 ? 1 : 0).slice(-20);
    });
  }
}
export function patternsThisWeek(hub) {
  const since = Date.now() - 7 * DAY, counts = {};
  (hub.mistakes || []).forEach((m) => { if (m.t >= since) counts[m.cat] = (counts[m.cat] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}
export function topicPct(gram, topic) {
  const s = (gram.stats || {})[topic];
  if (!s || !s.last || !s.last.length) return null;
  return Math.round((s.last.reduce((a, b) => a + b, 0) / s.last.length) * 100);
}
export function weakTopics(gram, n, only) {
  return TOPICS.filter(([id]) => !only || !only.length || only.includes(id)).map(([id]) => [id, topicPct(gram, id)]).sort((a, b) => (a[1] == null ? -1 : a[1]) - (b[1] == null ? -1 : b[1])).slice(0, n).map((x) => x[0]);
}

/* ---------- answer checking for vocab items ---------- */
export function fieldSpecs(card, mode) {
  const labels = fieldLabels(card);
  const specs = [];
  card.forms.forEach((f, i) => { if (!(mode === 'fm' && i === 0)) specs.push({ label: labels[i], kind: 'form', idx: i }); });
  if (card.gender) specs.push({ label: 'gender', kind: 'gender' });
  return specs;
}
export function checkVocab(item, values, set) {
  const card = item.card;
  if (item.kind === 'le') {
    const r = matchEnglish(values[0] || '', card.meaning, true, set.syn[card.id]);
    return { ok: r.ok, cells: [r.ok] };
  }
  const specs = fieldSpecs(card, item.kind);
  const vals = []; let gv = '';
  specs.forEach((s, i) => { if (s.kind === 'form') vals[s.idx] = values[i]; else gv = values[i]; });
  if (item.kind === 'fm') vals[0] = card.forms[0];
  const res = evalEntry(card, vals, gv, set.cards);
  return { ok: res.ok, cells: specs.map((s) => (s.kind === 'form' ? res.fields[s.idx].ok : res.gender.ok)), golds: specs.map((s) => (s.kind === 'form' ? card.forms[s.idx] : card.gender)) };
}
export function checkCloze(cz, value) {
  return cz.ans.some((a) => normLatin(a) === normLatin(value || ''));
}
export function hookFor(store, set, card) {
  const doc = store.get(set.doc);
  return (doc.v2.hooks || {})[card.id] || set.hook[card.id] || null;
}
export { retrievability, DAY, MIN, matchEnglish, normEn };

/* ---------- readiness and targeted prep for an assessment ---------- */
export function readiness(store, lessons, at) {
  let n = 0, sum = 0, learned = 0;
  lessons.forEach((l) => {
    const s = setOfLesson(l); if (!s) return;
    const doc = store.get(s.doc);
    s.cards.forEach((c) => {
      if ((doc.removed || {})[c.id]) return;
      n++;
      if (!isLearned(doc, c.id)) return;
      learned++;
      const k = doc.v2.cards[c.id + '|le'];
      sum += k ? retrievability(k, at) : 0.5;
    });
  });
  return { n, learned, unl: n - learned, pct: n ? Math.round((sum / n) * 100) : null };
}
export function prepItems(store, a, n = 20) {
  const ids = a.lessons.map((l) => 'L' + l).filter((id) => SET[id]);
  const at = Math.max(Date.now(), deadlineMs(a));
  const words = allItems(store, ids).map((it) => ({ it, r: retrievability(cardOf(store, it), at) }))
    .sort((x, y) => x.r - y.r).slice(0, n).map((x) => x.it);
  const out = buildQueue(words);
  const topics = a.topics || [];
  const g = topics.length ? (ids.length ? Math.max(4, Math.round(n * 0.3)) : n) : 0;
  for (let i = 0; i < g; i++) {
    const t = topics[i % topics.length];
    out.splice(Math.min(out.length, 2 + i * 3), 0, { kind: 'gram', q: grammarQ(t, 'one'), topic: t, key: 'g' + Math.random() });
  }
  return out;
}

/* ---------- placement check: seed lessons you already know ---------- */
export function placementItems(store, lessons, per) {
  const out = [];
  lessons.forEach((l) => {
    const s = setOfLesson(l); const doc = store.get(s.doc);
    const pool = s.cards.filter((c) => !isLearned(doc, c.id) && !(doc.removed || {})[c.id] && !c.self && glosses(c.meaning).length);
    shuffle(pool).slice(0, per).forEach((card) => out.push({ kind: 'le', key: card.id + '|le', setId: s.id, card, docName: s.doc, lesson: l }));
  });
  return out;
}
// results: { lesson: [{id, ok}] } → 'known' | 'shaky' | 'new' per lesson, and cards seeded to match.
export function verdictOf(rs) {
  const r = rs.filter((x) => x.ok).length;
  if (r === rs.length) return 'known';
  return r / rs.length >= 0.5 ? 'shaky' : 'new';
}
export function applyPlacement(store, results) {
  const now = Date.now();
  const seed = (S, g, spreadDays, minDays, n) => {
    const a = assessmentFor(n);
    let due = now + (minDays + Math.random() * spreadDays) * DAY;
    if (a && deadlineMs(a) > now) due = Math.min(due, deadlineMs(a) - Math.random() * 6 * 3600000);
    return { S, D: g === 1 ? 6.5 : 5, reps: 1, lapses: g === 1 ? 1 : 0, state: g === 1 ? 'relearning' : 'review', due: Math.round(g === 1 ? now + 10 * MIN : due), last: now, first: now, h: [g], lastGrade: g, placed: true };
  };
  const verdicts = {};
  Object.entries(results).forEach(([l, rs]) => {
    const n = +l, s = setOfLesson(n), v = verdictOf(rs);
    verdicts[n] = v;
    const asked = Object.fromEntries(rs.map((x) => [x.id, x.ok]));
    store.update(s.doc, (d) => {
      d.learned = { ...(d.learned || {}) };
      s.cards.forEach((c) => {
        if (isLearned(d, c.id) || (d.removed || {})[c.id]) return;
        const was = asked[c.id];
        if (v === 'new' && was !== true) return;
        let card;
        if (was === false) card = seed(0.4, 1, 0, 0, n);
        else if (v === 'known') card = seed(8, 3, 13, 1, n);
        else if (v === 'shaky') card = seed(2, 3, 3.5, 0.3, n);
        else card = seed(3, 3, 3, 1, n);
        d.learned[c.id] = now;
        d.v2.cards[c.id + '|le'] = card;
      });
    });
  });
  store.update('hub', (h) => { h.placement = { ...(h.placement || {}), ...Object.fromEntries(Object.entries(verdicts).map(([k, v]) => [k, { v, t: now }])) }; });
  return verdicts;
}
