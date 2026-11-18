/* eslint-disable */

// Line format: pos|forms (comma separated)|gender|meaning|note|labels|alt
// pos: n noun, v verb, a adjective, pr pronoun, av adverb, cj conjunction, pp preposition, ph phrase, nm numeral
// alt: "idx=form" accepted alternative for form idx; "self" marks a self-graded card

const POS_NAME = { n: 'noun', v: 'verb', a: 'adjective', pr: 'pronoun', av: 'adverb', cj: 'conjunction', pp: 'preposition', ph: 'phrase', nm: 'numeral' };

function parseRaw(RAW) { return RAW.trim().split('\n').map((line) => {
  const [pos, forms, gender = '', meaning = '', note = '', lab = '', alt = ''] = line.split('|');
  const card = {
    id: forms.split(',')[0],
    pos,
    forms: forms.split(','),
    gender,
    meaning,
    note,
    lab: lab ? lab.split(',') : null,
    alt: {},
    self: false,
  };
  alt.split(';').filter(Boolean).forEach((a) => {
    if (a === 'self') card.self = true;
    else {
      const [k, v] = a.split('=');
      (card.alt[k] = card.alt[k] || []).push(v);
    }
  });
  return card;
}); }


// Pronoun declension tables. Cells may list accepted alternates with "|" (first one is shown as the answer).
const CASES = ['nominative', 'genitive', 'dative', 'accusative', 'ablative'];
const DECL = {};

// Pure answer-checking helpers (no DOM).

function stripMarks(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Latin: ignore case, macrons, j/i, punctuation, and a trailing -ii / -i difference (offici = officii).
function normLatin(s) {
  return stripMarks(s)
    .toLowerCase()
    .replace(/j/g, 'i')
    .replace(/\.{2,}|\u2026/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/ii$/, 'i');
}

function normEn(s) {
  let x = stripMarks(s)
    .toLowerCase()
    .replace(/\.{2,}|\u2026/g, ' ')
    .replace(/['\u2018\u2019"\u201c\u201d]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  x = x.replace(/^(to|a|an|the)\s+/, '');
  return x;
}

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// Accepted English glosses for a card's meaning string.
function glosses(meaning) {
  const s = String(meaning).replace(/\([^)]*\)/g, ' ');
  return s.split(/[;,?]/).map(normEn).filter(Boolean);
}

// Match what the student typed against the card's glosses and accepted synonyms.
// Returns {ok, close, syn, gloss}. close = small spelling slip; syn = accepted as a synonym.
function matchEnglish(input, meaning, allowClose, extra) {
  const gl = glosses(meaning);
  const syn = (extra || []).map(normEn).filter(Boolean);
  const whole = normEn(input);
  if (!whole) return { ok: false, close: false, syn: false, gloss: null };
  const parts = String(input).split(/[;,\/]|\s+or\s+/i).map(normEn).filter(Boolean);
  const candidates = [whole, ...parts];
  for (const c of candidates) if (gl.includes(c)) return { ok: true, close: false, syn: false, gloss: c };
  for (const c of candidates) if (syn.includes(c)) return { ok: true, close: false, syn: true, gloss: c };
  // Several meanings typed with spaces ("command order", "order and command"):
  // fine when every word is covered by accepted glosses (multi-word glosses like "give orders" still count).
  const words = whole.split(' ').filter((w) => w !== 'and');
  if (words.length > 1) {
    const pool = new Set([...gl, ...syn]);
    const reach = [true];
    for (let i = 1; i <= words.length; i++) {
      reach[i] = false;
      for (let j = 0; j < i && !reach[i]; j++) if (reach[j] && pool.has(words.slice(j, i).join(' '))) reach[i] = true;
    }
    if (reach[words.length]) return { ok: true, close: false, syn: false, gloss: words.join(' ') };
  }
  if (allowClose) {
    for (const c of candidates) {
      if (c.length < 5) continue;
      const tol = c.length >= 9 ? 2 : 1;
      for (const g of gl) if (g.length >= 5 && lev(c, g) <= tol) return { ok: true, close: true, syn: false, gloss: g };
      for (const g of syn) if (g.length >= 5 && lev(c, g) <= tol) return { ok: true, close: true, syn: true, gloss: g };
    }
  }
  return { ok: false, close: false, syn: false, gloss: null };
}

function genderInfo(g) {
  let s = String(g || '').toLowerCase();
  const pl = /pl/.test(s);
  s = s
    .replace(/plural|pl/g, '')
    .replace(/masculine|masc/g, 'm')
    .replace(/feminine|fem/g, 'f')
    .replace(/neuter|neut/g, 'n')
    .replace(/[^mfn]/g, '');
  return { set: new Set(s.split('').filter(Boolean)), pl };
}

// "m./f." accepts m or f; every letter typed must be allowed.
function checkGender(input, gold) {
  const u = genderInfo(input);
  const g = genderInfo(gold);
  if (!u.set.size) return false;
  for (const ch of u.set) if (!g.set.has(ch)) return false;
  return true;
}

// Normalized accepted spellings for form i of a card.
function acceptedForms(card, i) {
  const accepted = [card.forms[i], ...((card.alt && card.alt[i]) || [])].map(normLatin);
  // 4th principal part: -um (supine/neuter) and -us (participle) are interchangeable
  if (card.pos === 'v' && i >= 3 && i === card.forms.length - 1) {
    const sw = (x) => (/um$/.test(x) ? x.replace(/um$/, 'us') : x.replace(/us$/, 'um'));
    accepted.push(...accepted.map(sw));
  }
  return accepted;
}

function sameWordForms(card, i, value) {
  const u = normLatin(value);
  if (!u) return false;
  return acceptedForms(card, i).includes(u);
}

// If the student typed a different headword that carries the same English meaning
// (summus vs supremus), score against that card instead.
function resolveCard(card, firstValue, pool) {
  if (sameWordForms(card, 0, firstValue)) return card;
  const u = normLatin(firstValue);
  if (!u) return card;
  const mine = new Set(glosses(card.meaning));
  for (const c of pool) {
    if (c === card || normLatin(c.forms[0]) !== u) continue;
    if (glosses(c.meaning).some((g) => mine.has(g))) return c;
  }
  return card;
}

// Score a typed dictionary entry. formVals has one value per form of the target card.
function evalEntry(card, formVals, genderVal, pool) {
  const used = resolveCard(card, formVals[0], pool);
  const fields = used.forms.map((gold, i) => ({
    gold,
    user: formVals[i] || '',
    ok: sameWordForms(used, i, formVals[i]),
  }));
  let gender = null;
  if (used.gender) gender = { gold: used.gender, user: genderVal || '', ok: checkGender(genderVal, used.gender) };
  const ok = fields.every((f) => f.ok) && (!gender || gender.ok);
  return { used, fields, gender, ok };
}

function fieldLabels(card) {
  if (card.lab) return card.lab;
  const n = card.forms.length;
  if (card.pos === 'v') return ['present', 'infinitive', 'perfect', 'participle'].slice(0, n);
  if (card.pos === 'n') return n === 2 ? ['nominative', 'genitive'] : ['nominative'];
  if (card.pos === 'a' || card.pos === 'pr') {
    if (n === 3) return ['masculine', 'feminine', 'neuter'];
    if (n === 2) return ['masc. / fem.', 'neuter'];
  }
  if (n === 1) return ['Latin'];
  return card.forms.map((_, i) => 'form ' + (i + 1));
}

// A drill in "forms" mode needs something to fill in besides the headword.
function hasExtraForms(card) {
  return card.forms.length > 1 || !!card.gender;
}

function entryRest(card) {
  let rest = card.forms.slice(1).join(', ');
  if (card.gender) rest += (rest ? ', ' : '') + card.gender;
  return rest;
}

function groupOf(card) {
  return { n: 'n', v: 'v', a: 'a', pr: 'pr', av: 'av', cj: 'cj', pp: 'pp' }[card.pos] || 'x';
}


/* ---------- spaced repetition ---------- */
const DAY = 86400000;
// Interval after each consecutive success. A miss returns the item in ~20 seconds.
const SRS_STEPS = [20000, 10 * 60000, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY, 80 * DAY];
// Cram pacing for a test tomorrow: everything comes back within the evening.
const SRS_STEPS_CRAM = [5 * 60000, 12 * 60000, 30 * 60000, 80 * 60000, 2 * 3600000, 6 * 3600000, 16 * 3600000, 2 * DAY];

// st: {s: step index, d: due ms, n: attempts, l: lapses, last: 1|0} or undefined for a new item.
function srsNext(st, ok, now, steps) {
  steps = steps || SRS_STEPS;
  const n = (st ? st.n : 0) + 1;
  let l = st ? st.l : 0;
  let s = st ? st.s : 0;
  let d;
  if (ok) {
    s = !st ? 2 : Math.min(s + 1, steps.length - 1); // a first-try success skips the short steps
    d = now + steps[s];
  } else {
    l++;
    s = s >= 5 ? 2 : 0;
    d = now + steps[0];
  }
  return { s, d, n, l, last: ok ? 1 : 0 };
}

// items: [{key, ...}] already limited to what may be asked now.
// ctx: {now, lastKey, qCount, hold: {key: questionNumber}, rng}
function pickNext(items, srs, ctx) {
  const rng = ctx.rng || Math.random;
  const blocked = ctx.blocked || (() => false); // same word shown too recently, in any drill
  const ok = (it) => it.key !== ctx.lastKey && !blocked(it);
  const seen = items.filter((it) => srs[it.key]);
  const unseen = items.filter((it) => !srs[it.key]);

  const due = seen
    .filter((it) => ok(it) && srs[it.key].d <= ctx.now && ((ctx.hold && ctx.hold[it.key]) || 0) <= ctx.qCount)
    .sort((a, b) => srs[a.key].d - srs[b.key].d);
  // Block mode (cram): mostly new words. Reviews wait until a pile of them is due, then a short batch runs.
  if (ctx.batch) {
    const st = ctx.batch.state;
    const fresh0 = unseen.some(ok);
    // A review block (a few items), then a run of new words, so new material stays the main thing.
    if (!st.reviewing && due.length >= ctx.batch.start && !(st.newLeft > 0 && fresh0)) { st.reviewing = true; st.revLeft = ctx.batch.reviews; }
    if (st.reviewing && due.length && st.revLeft > 0) {
      st.revLeft--;
      if (st.revLeft === 0) { st.reviewing = false; st.newLeft = ctx.batch.news; }
      return due[0];
    }
    st.reviewing = false;
    const seenCards = new Set(seen.map((it) => it.card.id));
    const fr = unseen.filter(ok);
    const brandNew = fr.filter((it) => !seenCards.has(it.card.id));
    const newDrills = fr.filter((it) => seenCards.has(it.card.id));
    const pool = brandNew.length && (rng() < (ctx.batch.newShare || 0.8) || !newDrills.length) ? brandNew : newDrills.length ? newDrills : brandNew;
    if (pool.length) {
      const pref = ctx.preferMode ? pool.filter((it) => it.mode === ctx.preferMode) : [];
      const from = pref.length ? pref : pool;
      if (st.newLeft > 0) st.newLeft--;
      return from[Math.floor(rng() * from.length)];
    }
    if (due.length) return due[0];
    const soon = seen.filter(ok).sort((a, b) => srs[a.key].d - srs[b.key].d);
    if (soon.length) return soon[0];
    const any0 = items.filter((it) => it.key !== ctx.lastKey);
    return any0[0] || items[0] || null;
  }
  // Keep new words flowing: every few questions introduce one, unless reviews are piling up.
  const freshNow = unseen.filter(ok);
  const sinceNew = ctx.qCount - (ctx.lastNewQ === undefined ? -999 : ctx.lastNewQ);
  if (ctx.newEvery && freshNow.length && sinceNew >= ctx.newEvery && due.length < (ctx.maxDue || 12)) {
    const pref0 = ctx.preferMode ? freshNow.filter((it) => it.mode === ctx.preferMode) : [];
    const from0 = pref0.length && rng() < 0.75 ? pref0 : freshNow;
    return from0[Math.floor(rng() * from0.length)];
  }
  if (due.length) return due[0];

  const learning = seen.filter((it) => srs[it.key].s < 2).length;
  const fresh = unseen.filter(ok);
  if (fresh.length && learning < (ctx.maxLearning || 6)) {
    const pref = ctx.preferMode ? fresh.filter((it) => it.mode === ctx.preferMode) : [];
    const from = pref.length && rng() < 0.75 ? pref : fresh;
    return from[Math.floor(rng() * from.length)];
  }

  // Nothing due: take the item closest to due, never one that was just shown.
  const early = seen.filter(ok).sort((a, b) => srs[a.key].d - srs[b.key].d);
  if (early.length) return early[0];
  if (fresh.length) return fresh[Math.floor(rng() * fresh.length)];
  const any = items.filter((it) => it.key !== ctx.lastKey);
  return any[0] || items[0] || null;
}

function srsSummary(items, srs, now) {
  const out = { due: 0, fresh: 0, learning: 0, known: 0 };
  items.forEach((it) => {
    const st = srs[it.key];
    if (!st) { out.fresh++; return; }
    if (st.d <= now) out.due++;
    if (st.s >= 4) out.known++; else out.learning++;
  });
  return out;
}

// "in 3 days", "in 10 min", "due now"
function dueText(st, now) {
  if (!st) return 'new';
  const ms = st.d - now;
  if (ms <= 0) return 'due now';
  if (ms < 3600000) return 'in ' + Math.max(1, Math.round(ms / 60000)) + ' min';
  if (ms < DAY) return 'in ' + Math.round(ms / 3600000) + ' h';
  return 'in ' + Math.round(ms / DAY) + ' d';
}

/* ---------- verbs: conjugation, participles, reminders ---------- */
const CONJ_NAME = { '1': '1st', '2': '2nd', '3': '3rd', '3io': '3rd -io', '4': '4th', irr: 'irregular' };

function conjOf(c) {
  if (c.pos !== 'v') return null;
  const f0 = c.forms[0], inf = c.forms[1] || '';
  if (['possum', 'absum', 'adsum', 'coepi'].includes(f0)) return 'irr';
  if (inf.endsWith('are')) return '1';
  if (inf.endsWith('ire')) return '4';
  if (inf.endsWith('ere')) return f0.endsWith('eo') ? '2' : f0.endsWith('io') ? '3io' : '3';
  return 'irr';
}

const PART_TYPES = {
  ppp: { label: 'perfect passive participle', ask: 'nominative masculine singular' },
  fap: { label: 'future active participle', ask: 'nominative masculine singular' },
  pap: { label: 'present active participle', ask: 'nominative singular' },
  pai: { label: 'perfect active infinitive', ask: '' },
};

// Returns {gold, rule} or null when the card cannot be drilled for this type.
function derive(c, type) {
  if (c.pos !== 'v' || c.forms[0] === 'coepi') return null;
  const k = conjOf(c);
  const f = c.forms;
  const p4 = f.length === 4 ? f[3] : null;
  const isFutPart = p4 && /turus$/.test(p4);
  if (type === 'ppp') {
    if (!p4 || isFutPart) return null;
    if (/um$/.test(p4)) return { gold: p4.replace(/um$/, 'us'), rule: 'Take the 4th principal part and change -um to -us: ' + p4.replace(/um$/, '') + '- + -us.' };
    if (/us$/.test(p4)) return { gold: p4, rule: 'This verb lists its participle as the 4th principal part, so the 4th part is already the -us form.' };
    return null;
  }
  if (type === 'fap') {
    if (!p4 || isFutPart) return null;
    const st = p4.replace(/(um|us)$/, '');
    return { gold: st + 'urus', rule: 'Take the 4th-part stem and add -urus: ' + st + '- + -urus.' };
  }
  if (type === 'pap') {
    if (k === 'irr' || !k) return null;
    const st = f[1].slice(0, -3);
    const end = { '1': 'ans', '2': 'ens', '3': 'ens', '3io': 'iens', '4': 'iens' }[k];
    const why = { '1': '1st conjugation: stem + -ans', '2': '2nd conjugation: stem + -ens', '3': '3rd conjugation: stem + -ens', '3io': '3rd -io: stem + -iens', '4': '4th conjugation: stem + -iens' }[k];
    return { gold: st + end, rule: 'Drop -re from the infinitive to get the stem, then ' + why + ' (' + st + '- + -' + end + ').' };
  }
  if (type === 'pai') {
    if (f.length < 3 || !/i$/.test(f[2])) return null;
    return { gold: f[2].slice(0, -1) + 'isse', rule: 'Perfect stem (3rd principal part minus -i) + -isse.' };
  }
  return null;
}

function partTypesFor(c) {
  return Object.keys(PART_TYPES).filter((t) => derive(c, t));
}

// Drill the 4th principal part itself.
function hasFourth(c) {
  return c.pos === 'v' && c.forms.length === 4;
}

function checkSimple(card, idx, input) {
  return sameWordForms(card, idx, String(input || '').split(/[,\s]/)[0]);
}

// Normalized accepted answers for a pronoun table cell ("ei|ii").
function cellAnswers(cell) {
  return String(cell).split('|').map(normLatin);
}

// A short reminder aimed at the conjugation of the verb that just came up.
function conjTip(k, cards) {
  // Compact vowel table: [x] marks the connecting vowel that changes from tense to tense.
  const COLS = ['Infinitive', 'Present 2sg · 3pl', 'Imperfect', 'Future 1sg · 2sg'];
  const R = {
    '1': { name: '1st', ex: 'amare', cells: ['am[ā]re', 'am[ā]s · am[a]nt', 'am[ā]bam', 'am[ā]bō · am[ā]bis'] },
    '2': { name: '2nd', ex: 'monere', cells: ['mon[ē]re', 'mon[e]s · mon[e]nt', 'mon[ē]bam', 'mon[ē]bō · mon[ē]bis'] },
    '3': { name: '3rd', ex: 'regere', cells: ['reg[ĕ]re', 'reg[i]s · reg[u]nt', 'reg[ē]bam', 'reg[a]m · reg[ē]s'] },
    '3io': { name: '3rd -io', ex: 'capere', cells: ['cap[ĕ]re', 'cap[i]s · cap[iu]nt', 'cap[iē]bam', 'cap[ia]m · cap[iē]s'] },
    '4': { name: '4th', ex: 'audire', cells: ['aud[ī]re', 'aud[ī]s · aud[iu]nt', 'aud[iē]bam', 'aud[ia]m · aud[iē]s'] },
  };
  const vs = { '1': [], '2': ['3'], '3': ['2'], '3io': ['4'], '4': ['3io'] }[k];
  const P = {
    '1': ['Regular: -āre, -āvi, -ātum.', 'Future -bō, -bis (like the 2nd).'],
    '2': ['Long ē: monēre. 3rd has short ĕ: regĕre.', 'Future -bō, -bis. The 3rd/4th switch to -am, -ēs.', 'Regular perfect -ui, 4th part -itum.'],
    '3': ['Vowel flips: ĕ (inf) → i (present) → ē (imperfect, future).', 'Present 3pl is -unt, never -ent.', 'Future is -am, -ēs, never -bō.', 'Perfect and 4th part: no pattern, memorize.'],
    '3io': ['Present is 4th-like (-io, -is, -iunt), but the infinitive is short -ĕre.', 'Future -iam, -iēs, same as the 4th.', 'Perfect and 4th part: irregular.'],
    '4': ['Long ī: audīre, audīs (3rd -io has short i).', 'Present 3pl -iunt, future -iam, -iēs.', 'Regular perfect -īvi, 4th part -ītum.'],
  }[k];
  if (!P) return null;
  const pat = { '1': [/avi$/, /atum$/], '2': [/ui$/, /itum$/], '4': [/ivi$/, /itum$/] }[k];
  const sample = (arr, n) => arr.slice().sort(() => Math.random() - 0.5).slice(0, n);
  let exc = [];
  if (pat) exc = cards.filter((c) => conjOf(c) === k && c.forms.length >= 3 && !(pat[0].test(c.forms[2]) && (c.forms[3] ? pat[1].test(c.forms[3]) : true))).map((c) => c.forms.join(', '));
  const rows = [k].concat(vs).map((key) => ({ label: R[key].name, mine: key === k, cells: R[key].cells }));
  return { title: R[k].name + ' conjugation', cols: COLS, rows, points: P, exc: sample(exc, 3), lines: P };
}



const RAW1 = `
n|altitudo,altitudinis|f|height, depth
n|centurio,centurionis|m|centurion
n|dolor,doloris|m|pain
n|flos,floris|m|flower
n|fossa,fossae|f|ditch
n|genus,generis|n|kind
n|hiberna,hibernorum|n. pl.|winter quarters|plural only
n|ius,iuris|n|right, law
n|latitudo,latitudinis|f|width
n|magnitudo,magnitudinis|f|size
n|mens,mentis|f|mind
n|mercator,mercatoris|m|merchant
n|onus,oneris|n|burden
n|opus,operis|n|work
n|oratio,orationis|f|speech
n|vallum,valli|n|rampart
n|calamitas,calamitatis|f|disaster
n|condicio,condicionis|f|terms, condition
n|consuetudo,consuetudinis|f|custom
n|difficultas,difficultatis|f|difficulty
n|insidiae,insidiarum|f. pl.|ambush|plural only
n|iudicium,iudici|n|judgment|||1=iudicii
n|orbis,orbis|m|circle
n|potestas,potestatis|f|power
n|regio,regionis|f|region, direction
n|sententia,sententiae|f|opinion
n|vadum,vadi|n|ford
a|calidus,calida,calidum||hot
a|frigidus,frigida,frigidum||cold
av|subito||suddenly
av|umquam||ever
n|aurum,auri|n|gold
n|ferrum,ferri|n|iron
n|pilum,pili|n|javelin
n|scutum,scuti|n|shield
n|tribunus,tribuni|m|tribune
n|valles,vallis|f|valley|||0=vallis
v|armo,armare,armavi,armatum||arm
v|consisto,consistere,constiti,constitum||halt
v|erro,errare,erravi,erratum||wander; make a mistake
v|perficio,perficere,perfeci,perfectum||finish
v|perterreo,perterrere,perterrui,perterritum||terrify
av|ne||not
av|vero||indeed, but
cj|autem||but, however|postpositive
cj|enim||for|postpositive
cj|vel||or
`;
const SYN1 = {"altitudo": ["altitude", "deepness", "height"], "dolor": ["suffering", "sorrow", "ache", "grief"], "flos": ["blossom", "bloom"], "fossa": ["trench", "moat"], "genus": ["class", "race", "type", "kind", "sort"], "hiberna": ["winter camp", "winter quarters"], "ius": ["justice"], "magnitudo": ["magnitude", "largeness", "great size", "greatness"], "mens": ["intellect", "intelligence"], "mercator": ["trader", "merchant"], "onus": ["load", "weight"], "opus": ["task", "labor", "labour", "deed"], "oratio": ["oration", "address"], "vallum": ["wall", "earthwork", "palisade"], "calamitas": ["catastrophe", "calamity", "misfortune"], "condicio": ["condition", "agreement", "situation", "term"], "consuetudo": ["habit", "practice", "custom"], "insidiae": ["treachery", "plots", "traps", "ambushes", "trap", "plot"], "iudicium": ["verdict", "court", "decision", "trial"], "orbis": ["ring", "globe", "world", "wheel"], "potestas": ["authority", "ability"], "regio": ["area", "district"], "sententia": ["thought", "view", "sentence", "judgment"], "vadum": ["shallow", "shoal", "shallows"], "calidus": ["warm"], "frigidus": ["chilly", "cool", "frigid"], "subito": ["all of a sudden", "unexpectedly"], "umquam": ["at any time", "ever"], "pilum": ["spear"], "armo": ["equip", "arm"], "consisto": ["stop", "stand", "take stand", "stand still", "take a stand"], "erro": ["err", "stray", "be mistaken", "make mistake", "be wrong", "roam"], "perficio": ["complete", "perfect", "carry out", "accomplish"], "perterreo": ["frighten", "scare", "thoroughly frighten", "greatly frighten"], "vero": ["in truth", "truly", "in fact", "however"], "autem": ["and", "moreover", "on the other hand"], "tribunus": ["military tribune"], "centurio": ["centurian"]};
const HOOK1 = {
  altitudo: 'altitude: how high something is (or how deep, looking down)',
  centurio: 'century = 100. A centurion commanded about 100 men',
  dolor: 'condolences: you share someone’s pain',
  flos: 'florist, floral, Florida (land of flowers)',
  fossa: 'fossil: something dug up out of a ditch',
  genus: 'genus, gender, generic: a kind or sort',
  hiberna: 'hibernate: where the army spends the winter',
  ius: 'justice, jury, injury (in + ius: not right)',
  latitudo: 'latitude lines run across the width of the map',
  magnitudo: 'magnitude, magnify: size, greatness',
  mens: 'mental, mention: the mind',
  mercator: 'merchant, mercantile, market',
  onus: '“the onus is on you”: the burden. Also onerous',
  opus: 'a composer’s opus is a work. Also operate',
  oratio: 'oration, orator: a speech',
  vallum: 'English “wall” comes from vallum',
  calamitas: 'calamity: a disaster',
  condicio: 'conditions, terms of a deal',
  consuetudo: 'custom comes from this word through French',
  difficultas: 'difficulty',
  insidiae: 'insidious: sneaky, like a trap or an ambush',
  iudicium: 'judicial, judgment',
  orbis: 'orbit: going around in a circle',
  potestas: 'potent, potential: power',
  regio: 'region',
  sententia: 'sentiment, sentence: what you think',
  vadum: 'you wade across at a ford',
  calidus: 'scald comes from calidus: very hot',
  frigidus: 'frigid, refrigerator',
  subito: 'subito in music means “suddenly”',
  umquam: 'n + umquam = numquam, never. So umquam = ever',
  aurum: 'Au is gold on the periodic table',
  ferrum: 'Fe is iron on the periodic table. Also ferrous',
  pilum: 'the Roman legionary’s heavy throwing javelin',
  scutum: 'escutcheon: a shield with a coat of arms',
  tribunus: 'tribune, tribunal',
  valles: 'valley',
  armo: 'armed, army, armor',
  consisto: 'con + sisto (stand): stand still, halt, take a stand',
  erro: 'err, error: wander off course, make a mistake',
  perficio: 'perfect: fully (per) made (facio), so finished',
  perterreo: 'per (thoroughly) + terreo (frighten): terrify',
  ne: 'ne … quidem: not even',
  vero: 'verily, very: in truth. Also “but”',
  autem: 'postpositive: always the 2nd word in its clause',
  enim: 'postpositive “for”: gives a reason, 2nd word',
  vel: 'vel: or (take your pick)',
};
const RAW45 = `
n|aedificium,aedifici|n|building|||1=aedificii
n|auris,auris|f|ear
n|fides,fidei|f|faith, loyalty
n|forum,fori|n|marketplace, forum
n|nemo,nemini|m|no one|2nd form is the dative|nominative,dative
n|oculus,oculi|m|eye
n|species,speciei|f|sight, appearance
n|vestis,vestis|f|clothing
n|vigilia,vigiliae|f|watch, wakefulness
n|vis,vis|f|force, violence|pl. vires, virium = strength
av|ergo||therefore
av|praeterea||besides
av|procul||at some distance
cj|an||or
cj|annon||or not
v|impero,imperare,imperavi,imperatum||order, command|+ dat. · ut / ne
v|mando,mandare,mandavi,mandatum||command, entrust|+ dat. · ut / ne
v|oro,orare,oravi,oratum||beg|+ acc. · ut / ne
v|persuadeo,persuadere,persuasi,persuasum||persuade|+ dat. · ut / ne
v|postulo,postulare,postulavi,postulatum||demand|ab + abl. · ut / ne
v|quaero,quaerere,quaesivi,quaesitum||seek, ask|ex / ab + abl.
v|rogo,rogare,rogavi,rogatum||ask|+ acc. · ut / ne
`;
const SYN45 = {"aedificium": ["edifice", "structure"], "fides": ["confidence", "pledge", "trust", "faithfulness", "good faith"], "forum": ["market place", "market", "market-place", "public square"], "nemo": ["nobody", "no-one"], "species": ["look", "spectacle", "aspect", "show"], "vestis": ["clothes", "garment", "attire", "dress", "robe"], "vigilia": ["watchfulness", "guard", "vigil", "night watch"], "vis": ["strength", "power"], "ergo": ["so", "consequently", "thus", "then"], "praeterea": ["besides that", "moreover", "furthermore", "in addition"], "procul": ["far", "far away", "at a distance", "from afar", "afar", "from a distance"], "impero": ["command", "order"], "mando": ["instruct", "entrust", "order"], "oro": ["pray", "plead", "beseech", "entreat", "ask"], "persuadeo": ["convince"], "postulo": ["require", "request", "claim"], "quaero": ["inquire", "search for", "look for"], "rogo": ["request", "question", "ask for"]};
const HOOK45 = {"aedificium": "edifice: a building", "auris": "aural: heard by ear", "fides": "fidelity, confide. A dog named Fido is faithful", "forum": "the Roman Forum was the city’s market place", "nemo": "Captain Nemo = “no one”. ne + homo: not a person", "oculus": "ocular, binoculars", "species": "species, spectacle, specimen: how something looks", "vestis": "vest, vestments: clothing", "vigilia": "vigil, vigilant: staying awake on watch", "vis": "English “vim” comes from vim, the accusative of vis. Plural vires = strength", "ergo": "“cogito, ergo sum”: I think, therefore I am", "praeterea": "praeter (beyond) + ea (those things): besides", "an": "utrum ... an = whether ... or (from an earlier set)", "annon": "an + non = or not", "impero": "emperor, imperative: the one giving orders", "mando": "mandate, mandatory: an order you must follow", "oro": "oration, orator: begging is pleading with words", "persuadeo": "persuade. It takes the dative: persuadeo tibi", "postulo": "postulate: to claim or demand", "quaero": "query, quest, question: seek and ask", "rogo": "interrogate: ask questions"};


/* ===================== Grammar: forms engine (no DOM) ===================== */

var G = (function () {
  var PERSONS = ['1st sg.', '2nd sg.', '3rd sg.', '1st pl.', '2nd pl.', '3rd pl.'];
  var CONJ_NAME = { '1': '1st conj.', '2': '2nd conj.', '3': '3rd conj.', '3io': '3rd -io', '4': '4th conj.' };

  // np: no personal passive (intransitive or takes the dative). nf: no future participle in use.
  var VERBS = [
    { p: ['laudo', 'laudare', 'laudavi', 'laudatum'], m: 'praise' },
    { p: ['moneo', 'monere', 'monui', 'monitum'], m: 'warn' },
    { p: ['rego', 'regere', 'rexi', 'rectum'], m: 'rule' },
    { p: ['capio', 'capere', 'cepi', 'captum'], m: 'take' },
    { p: ['audio', 'audire', 'audivi', 'auditum'], m: 'hear' },
    { p: ['armo', 'armare', 'armavi', 'armatum'], m: 'arm' },
    { p: ['perficio', 'perficere', 'perfeci', 'perfectum'], m: 'finish' },
    { p: ['perterreo', 'perterrere', 'perterrui', 'perterritum'], m: 'terrify' },
    { p: ['efficio', 'efficere', 'effeci', 'effectum'], m: 'bring about' },
    { p: ['mando', 'mandare', 'mandavi', 'mandatum'], m: 'entrust' },
    { p: ['oro', 'orare', 'oravi', 'oratum'], m: 'beg' },
    { p: ['postulo', 'postulare', 'postulavi', 'postulatum'], m: 'demand' },
    { p: ['quaero', 'quaerere', 'quaesivi', 'quaesitum'], m: 'seek' },
    { p: ['rogo', 'rogare', 'rogavi', 'rogatum'], m: 'ask' },
    { p: ['impero', 'imperare', 'imperavi', 'imperatum'], m: 'order', np: true },
    { p: ['persuadeo', 'persuadere', 'persuasi', 'persuasum'], m: 'persuade', np: true },
    { p: ['erro', 'errare', 'erravi', 'erratum'], m: 'wander', np: true },
    { p: ['consisto', 'consistere', 'constiti', 'constitum'], m: 'halt', np: true, nf: true },
  ];
  VERBS.forEach(function (v) {
    v.id = v.p[0];
    var f0 = v.p[0], inf = v.p[1];
    v.k = inf.slice(-3) === 'are' ? '1' : inf.slice(-3) === 'ire' ? '4' : f0.slice(-2) === 'eo' ? '2' : f0.slice(-2) === 'io' ? '3io' : '3';
    v.root = inf.slice(0, -3);            // laud-, mon-, reg-, cap-, aud-
    v.perf = v.p[2].slice(0, -1);         // laudav-
    v.sup = v.p[3].slice(0, -2);          // laudat-
  });

  var PRES_A = { '1': ['o', 'as', 'at', 'amus', 'atis', 'ant'], '2': ['eo', 'es', 'et', 'emus', 'etis', 'ent'], '3': ['o', 'is', 'it', 'imus', 'itis', 'unt'], '3io': ['io', 'is', 'it', 'imus', 'itis', 'iunt'], '4': ['io', 'is', 'it', 'imus', 'itis', 'iunt'] };
  var PRES_P = { '1': ['or', 'aris', 'atur', 'amur', 'amini', 'antur'], '2': ['eor', 'eris', 'etur', 'emur', 'emini', 'entur'], '3': ['or', 'eris', 'itur', 'imur', 'imini', 'untur'], '3io': ['ior', 'eris', 'itur', 'imur', 'imini', 'iuntur'], '4': ['ior', 'iris', 'itur', 'imur', 'imini', 'iuntur'] };
  var IMPF_V = { '1': 'a', '2': 'e', '3': 'e', '3io': 'ie', '4': 'ie' };
  var SUBJ_V = { '1': 'e', '2': 'ea', '3': 'a', '3io': 'ia', '4': 'ia' };
  var ACT = ['m', 's', 't', 'mus', 'tis', 'nt'];
  var PAS = ['r', 'ris', 'tur', 'mur', 'mini', 'ntur'];
  var BA_A = ['bam', 'bas', 'bat', 'bamus', 'batis', 'bant'], BA_P = ['bar', 'baris', 'batur', 'bamur', 'bamini', 'bantur'];
  var BI_A = ['bo', 'bis', 'bit', 'bimus', 'bitis', 'bunt'], BI_P = ['bor', 'beris', 'bitur', 'bimur', 'bimini', 'buntur'];
  var AE_A = ['am', 'es', 'et', 'emus', 'etis', 'ent'], AE_P = ['ar', 'eris', 'etur', 'emur', 'emini', 'entur'];
  var PERF = ['i', 'isti', 'it', 'imus', 'istis', 'erunt'];
  var PLUP = ['eram', 'eras', 'erat', 'eramus', 'eratis', 'erant'];
  var FPERF = ['ero', 'eris', 'erit', 'erimus', 'eritis', 'erint'];
  var SUM = ['sum', 'es', 'est', 'sumus', 'estis', 'sunt'];
  var ERO = ['ero', 'eris', 'erit', 'erimus', 'eritis', 'erunt'];
  var SIM = ['sim', 'sis', 'sit', 'simus', 'sitis', 'sint'];
  var ESSEM = ['essem', 'esses', 'esset', 'essemus', 'essetis', 'essent'];
  var ERIM = ['erim', 'eris', 'erit', 'erimus', 'eritis', 'erint'];
  var ISSEM = ['issem', 'isses', 'isset', 'issemus', 'issetis', 'issent'];

  // Compound forms: the participle may agree in any gender.
  function compound(sup, ending, aux) {
    var g = ending === 'sg' ? ['us', 'a', 'um'] : ['i', 'ae', 'a'];
    return { gold: sup + g[0] + ' ' + aux, ok: g.map(function (x) { return sup + x + ' ' + aux; }) };
  }
  function simple(s) { return { gold: s, ok: [s] }; }
  function six(fn) { var out = []; for (var i = 0; i < 6; i++) out.push(fn(i)); return out; }

  // Tenses: key -> {label, mood, voice, build(v) -> 6 cells}
  var TENSES = {
    'pres-a': { label: 'present active', build: function (v) { return six(function (i) { return simple(v.root + PRES_A[v.k][i]); }); } },
    'pres-p': { label: 'present passive', pass: true, build: function (v) { return six(function (i) { return simple(v.root + PRES_P[v.k][i]); }); } },
    'impf-a': { label: 'imperfect active', build: function (v) { return six(function (i) { return simple(v.root + IMPF_V[v.k] + BA_A[i]); }); } },
    'impf-p': { label: 'imperfect passive', pass: true, build: function (v) { return six(function (i) { return simple(v.root + IMPF_V[v.k] + BA_P[i]); }); } },
    'fut-a': { label: 'future active', build: function (v) { return six(function (i) { return simple(v.k === '1' ? v.root + 'a' + BI_A[i] : v.k === '2' ? v.root + 'e' + BI_A[i] : v.k === '3' ? v.root + AE_A[i] : v.root + 'i' + AE_A[i]); }); } },
    'fut-p': { label: 'future passive', pass: true, build: function (v) { return six(function (i) { return simple(v.k === '1' ? v.root + 'a' + BI_P[i] : v.k === '2' ? v.root + 'e' + BI_P[i] : v.k === '3' ? v.root + AE_P[i] : v.root + 'i' + AE_P[i]); }); } },
    'perf-a': { label: 'perfect active', build: function (v) { return six(function (i) { return simple(v.perf + PERF[i]); }); } },
    'plup-a': { label: 'pluperfect active', build: function (v) { return six(function (i) { return simple(v.perf + PLUP[i]); }); } },
    'fperf-a': { label: 'future perfect active', build: function (v) { return six(function (i) { return simple(v.perf + FPERF[i]); }); } },
    'perf-p': { label: 'perfect passive', pass: true, build: function (v) { return six(function (i) { return compound(v.sup, i < 3 ? 'sg' : 'pl', SUM[i]); }); } },
    'plup-p': { label: 'pluperfect passive', pass: true, build: function (v) { return six(function (i) { return compound(v.sup, i < 3 ? 'sg' : 'pl', PLUP[i]); }); } },
    'fperf-p': { label: 'future perfect passive', pass: true, build: function (v) { return six(function (i) { return compound(v.sup, i < 3 ? 'sg' : 'pl', ERO[i]); }); } },
    'spres-a': { label: 'present subjunctive active', build: function (v) { return six(function (i) { return simple(v.root + SUBJ_V[v.k] + ACT[i]); }); } },
    'spres-p': { label: 'present subjunctive passive', pass: true, build: function (v) { return six(function (i) { return simple(v.root + SUBJ_V[v.k] + PAS[i]); }); } },
    'simpf-a': { label: 'imperfect subjunctive active', build: function (v) { return six(function (i) { return simple(v.p[1] + ACT[i]); }); } },
    'simpf-p': { label: 'imperfect subjunctive passive', pass: true, build: function (v) { return six(function (i) { return simple(v.p[1] + PAS[i]); }); } },
    'sperf-a': { label: 'perfect subjunctive active', build: function (v) { return six(function (i) { return simple(v.perf + ERIM[i]); }); } },
    'sperf-p': { label: 'perfect subjunctive passive', pass: true, build: function (v) { return six(function (i) { return compound(v.sup, i < 3 ? 'sg' : 'pl', SIM[i]); }); } },
    'splup-a': { label: 'pluperfect subjunctive active', build: function (v) { return six(function (i) { return simple(v.perf + ISSEM[i]); }); } },
    'splup-p': { label: 'pluperfect subjunctive passive', pass: true, build: function (v) { return six(function (i) { return compound(v.sup, i < 3 ? 'sg' : 'pl', ESSEM[i]); }); } },
  };

  function presPassInf(v) { return v.root + { '1': 'ari', '2': 'eri', '3': 'i', '3io': 'i', '4': 'iri' }[v.k]; }
  function infinitives(v) {
    var out = [
      { label: 'present active', key: 'pa', cell: simple(v.p[1]) },
      { label: 'perfect active', key: 'fa', cell: simple(v.perf + 'isse') },
    ];
    if (!v.nf) out.push({ label: 'future active', key: 'ua', cell: compound(v.sup + 'ur', 'sg', 'esse') });
    if (!v.np) {
      out.splice(1, 0, { label: 'present passive', key: 'pp', cell: simple(presPassInf(v)) });
      out.splice(3, 0, { label: 'perfect passive', key: 'fp', cell: compound(v.sup, 'sg', 'esse') });
    }
    return out;
  }
  function papStem(v) { return v.root + { '1': 'a', '2': 'e', '3': 'e', '3io': 'ie', '4': 'ie' }[v.k]; }
  function participles(v) {
    var out = [{ label: 'present active', key: 'pap', cell: { gold: papStem(v) + 'ns', ok: [papStem(v) + 'ns'] }, full: papStem(v) + 'ns, ' + papStem(v) + 'ntis' }];
    if (!v.np) out.push({ label: 'perfect passive', key: 'ppp', cell: simple(v.sup + 'us'), full: v.sup + 'us, -a, -um' });
    if (!v.nf) out.push({ label: 'future active', key: 'fap', cell: simple(v.sup + 'urus'), full: v.sup + 'urus, -a, -um' });
    return out;
  }
  function imperatives(v) {
    var sg = v.root + { '1': 'a', '2': 'e', '3': 'e', '3io': 'e', '4': 'i' }[v.k];
    var pl = v.root + { '1': 'ate', '2': 'ete', '3': 'ite', '3io': 'ite', '4': 'ite' }[v.k];
    return [{ label: 'singular', key: 'sg', cell: simple(sg) }, { label: 'plural', key: 'pl', cell: simple(pl) }];
  }

  // Irregular sum and possum.
  var IRR = {
    sum: {
      m: 'be', inf: 'esse',
      t: { 'pres-a': SUM, 'impf-a': PLUP, 'fut-a': ERO, 'perf-a': ['fui', 'fuisti', 'fuit', 'fuimus', 'fuistis', 'fuerunt'], 'spres-a': SIM, 'simpf-a': ESSEM },
    },
    possum: {
      m: 'be able', inf: 'posse',
      t: {
        'pres-a': ['possum', 'potes', 'potest', 'possumus', 'potestis', 'possunt'],
        'impf-a': ['poteram', 'poteras', 'poterat', 'poteramus', 'poteratis', 'poterant'],
        'fut-a': ['potero', 'poteris', 'poterit', 'poterimus', 'poteritis', 'poterunt'],
        'perf-a': ['potui', 'potuisti', 'potuit', 'potuimus', 'potuistis', 'potuerunt'],
        'spres-a': ['possim', 'possis', 'possit', 'possimus', 'possitis', 'possint'],
        'simpf-a': ['possem', 'posses', 'posset', 'possemus', 'possetis', 'possent'],
      },
    },
  };
  var IRR_TENSES = ['pres-a', 'impf-a', 'fut-a', 'perf-a', 'spres-a', 'simpf-a'];

  /* ---- nouns ---- */
  var CASES = ['nominative', 'genitive', 'dative', 'accusative', 'ablative'];
  var NOUNS = [
    { nom: 'fossa', st: 'foss', d: '1', g: 'f', m: 'ditch' },
    { nom: 'sententia', st: 'sententi', d: '1', g: 'f', m: 'opinion' },
    { nom: 'vigilia', st: 'vigili', d: '1', g: 'f', m: 'watch' },
    { nom: 'tribunus', st: 'tribun', d: '2', g: 'm', m: 'tribune' },
    { nom: 'oculus', st: 'ocul', d: '2', g: 'm', m: 'eye' },
    { nom: 'vallum', st: 'vall', d: '2n', g: 'n', m: 'rampart' },
    { nom: 'aedificium', st: 'aedifici', d: '2n', g: 'n', m: 'building' },
    { nom: 'dolor', st: 'dolor', d: '3', g: 'm', m: 'pain' },
    { nom: 'mercator', st: 'mercator', d: '3', g: 'm', m: 'merchant' },
    { nom: 'potestas', st: 'potestat', d: '3', g: 'f', m: 'power' },
    { nom: 'oratio', st: 'oration', d: '3', g: 'f', m: 'speech' },
    { nom: 'altitudo', st: 'altitudin', d: '3', g: 'f', m: 'height' },
    { nom: 'genus', st: 'gener', d: '3n', g: 'n', m: 'kind' },
    { nom: 'opus', st: 'oper', d: '3n', g: 'n', m: 'work' },
    { nom: 'onus', st: 'oner', d: '3n', g: 'n', m: 'burden' },
    { nom: 'mens', st: 'ment', d: '3i', g: 'f', m: 'mind' },
    { nom: 'vestis', st: 'vest', d: '3i', g: 'f', m: 'clothing' },
    { nom: 'auris', st: 'aur', d: '3i', g: 'f', m: 'ear' },
    { nom: 'orbis', st: 'orb', d: '3i', g: 'm', m: 'circle', alt: { 4: ['orbi'] } },
    { nom: 'mare', st: 'mar', d: '3in', g: 'n', m: 'sea' },
    { nom: 'exercitus', st: 'exercit', d: '4', g: 'm', m: 'army' },
    { nom: 'impetus', st: 'impet', d: '4', g: 'm', m: 'attack' },
    { nom: 'res', st: 'r', d: '5', g: 'f', m: 'thing' },
    { nom: 'dies', st: 'di', d: '5', g: 'm', m: 'day' },
    { nom: 'species', st: 'speci', d: '5', g: 'f', m: 'appearance' },
    { nom: 'vis', d: 'vis', g: 'f', m: 'force; pl. strength' },
  ];
  var DECL_END = {
    '1': [null, 'ae', 'ae', 'am', 'a', 'ae', 'arum', 'is', 'as', 'is'],
    '2': [null, 'i', 'o', 'um', 'o', 'i', 'orum', 'is', 'os', 'is'],
    '2n': [null, 'i', 'o', '=', 'o', 'a', 'orum', 'is', 'a', 'is'],
    '3': [null, 'is', 'i', 'em', 'e', 'es', 'um', 'ibus', 'es', 'ibus'],
    '3n': [null, 'is', 'i', '=', 'e', 'a', 'um', 'ibus', 'a', 'ibus'],
    '3i': [null, 'is', 'i', 'em', 'e', 'es', 'ium', 'ibus', 'es', 'ibus'],
    '3in': [null, 'is', 'i', '=', 'i', 'ia', 'ium', 'ibus', 'ia', 'ibus'],
    '4': [null, 'us', 'ui', 'um', 'u', 'us', 'uum', 'ibus', 'us', 'ibus'],
    '5': [null, 'ei', 'ei', 'em', 'e', 'es', 'erum', 'ebus', 'es', 'ebus'],
  };
  var DECL_NAME = { '1': '1st decl.', '2': '2nd decl. (m.)', '2n': '2nd decl. neuter', '3': '3rd decl.', '3n': '3rd decl. neuter', '3i': '3rd decl. i-stem', '3in': '3rd decl. neuter i-stem', '4': '4th decl.', '5': '5th decl.', vis: 'irregular' };
  var VIS = ['vis', 'vis', 'vi', 'vim', 'vi', 'vires', 'virium', 'viribus', 'vires', 'viribus'];
  NOUNS.forEach(function (n) {
    n.id = n.nom;
    if (n.d === 'vis') { n.cells = VIS.map(simple); return; }
    n.cells = DECL_END[n.d].map(function (e, i) {
      var f = i === 0 || e === '=' ? n.nom : n.st + e;
      var c = simple(f);
      if (n.d === '3i' && i === 8) c.ok.push(n.st + 'is');      // acc. pl. -is also seen
      if (n.alt && n.alt[i]) c.ok = c.ok.concat(n.alt[i]);
      return c;
    });
  });

  /* ---- pronouns ---- */
  var PRON = {
    is: { title: 'is, ea, id', m: 'he, she, it; this, that',
      sg: [['is', 'ea', 'id'], ['eius', 'eius', 'eius'], ['ei', 'ei', 'ei'], ['eum', 'eam', 'id'], ['eo', 'ea', 'eo']],
      pl: [['ei|ii', 'eae', 'ea'], ['eorum', 'earum', 'eorum'], ['eis|iis', 'eis|iis', 'eis|iis'], ['eos', 'eas', 'ea'], ['eis|iis', 'eis|iis', 'eis|iis']] },
    hic: { title: 'hic, haec, hoc', m: 'this',
      sg: [['hic', 'haec', 'hoc'], ['huius', 'huius', 'huius'], ['huic', 'huic', 'huic'], ['hunc', 'hanc', 'hoc'], ['hoc', 'hac', 'hoc']],
      pl: [['hi', 'hae', 'haec'], ['horum', 'harum', 'horum'], ['his', 'his', 'his'], ['hos', 'has', 'haec'], ['his', 'his', 'his']] },
    ille: { title: 'ille, illa, illud', m: 'that',
      sg: [['ille', 'illa', 'illud'], ['illius', 'illius', 'illius'], ['illi', 'illi', 'illi'], ['illum', 'illam', 'illud'], ['illo', 'illa', 'illo']],
      pl: [['illi', 'illae', 'illa'], ['illorum', 'illarum', 'illorum'], ['illis', 'illis', 'illis'], ['illos', 'illas', 'illa'], ['illis', 'illis', 'illis']] },
    ipse: { title: 'ipse, ipsa, ipsum', m: '-self, the very',
      sg: [['ipse', 'ipsa', 'ipsum'], ['ipsius', 'ipsius', 'ipsius'], ['ipsi', 'ipsi', 'ipsi'], ['ipsum', 'ipsam', 'ipsum'], ['ipso', 'ipsa', 'ipso']],
      pl: [['ipsi', 'ipsae', 'ipsa'], ['ipsorum', 'ipsarum', 'ipsorum'], ['ipsis', 'ipsis', 'ipsis'], ['ipsos', 'ipsas', 'ipsa'], ['ipsis', 'ipsis', 'ipsis']] },
    idem: { title: 'idem, eadem, idem', m: 'the same',
      sg: [['idem', 'eadem', 'idem'], ['eiusdem', 'eiusdem', 'eiusdem'], ['eidem', 'eidem', 'eidem'], ['eundem', 'eandem', 'idem'], ['eodem', 'eadem', 'eodem']],
      pl: [['eidem|idem|iidem', 'eaedem', 'eadem'], ['eorundem', 'earundem', 'eorundem'], ['eisdem|isdem|iisdem', 'eisdem|isdem|iisdem', 'eisdem|isdem|iisdem'], ['eosdem', 'easdem', 'eadem'], ['eisdem|isdem|iisdem', 'eisdem|isdem|iisdem', 'eisdem|isdem|iisdem']] },
    qui: { title: 'qui, quae, quod', m: 'who, which, that',
      sg: [['qui', 'quae', 'quod'], ['cuius', 'cuius', 'cuius'], ['cui', 'cui', 'cui'], ['quem', 'quam', 'quod'], ['quo', 'qua', 'quo']],
      pl: [['qui', 'quae', 'quae'], ['quorum', 'quarum', 'quorum'], ['quibus', 'quibus', 'quibus'], ['quos', 'quas', 'quae'], ['quibus', 'quibus', 'quibus']] },
  };
  function pronCell(s) { var a = s.split('|'); return { gold: a[0], ok: a }; }

  return {
    PERSONS: PERSONS, CONJ_NAME: CONJ_NAME, VERBS: VERBS, TENSES: TENSES, IRR: IRR, IRR_TENSES: IRR_TENSES,
    infinitives: infinitives, participles: participles, imperatives: imperatives,
    CASES: CASES, NOUNS: NOUNS, DECL_NAME: DECL_NAME, DECL_END: DECL_END, PRON: PRON, pronCell: pronCell,
    PRES_A: PRES_A, PRES_P: PRES_P, SUBJ_V: SUBJ_V, simple: simple,
  };
})();

// Compare one typed answer with a cell: ignore case, macrons, spaces.
function gSquash(s) { return normLatin(s).replace(/\s+/g, ''); }
function gCheck(cell, typed) {
  var t = gSquash(typed);
  if (!t) return false;
  return cell.ok.some(function (o) { return gSquash(o) === t; });
}

/* ===================== Grammar: rules shown with answers ===================== */
var G_RULE = {
  'pres-a': 'Present active: stem + -o/-s/-t/-mus/-tis/-nt. 3rd conj. uses -i- (regis, regimus) and -unt; 3rd -io and 4th keep the i: capiunt, audiunt.',
  'pres-p': 'Present passive: -r, -ris, -tur, -mur, -mini, -ntur. 3rd conj. 2nd sg. is -eris (regeris), then -itur, -imur, -imini, -untur.',
  'impf-a': 'Imperfect: stem vowel + -ba- + endings: laud-a-bam, mon-e-bam, reg-e-bam, capi-e-bam, audi-e-bam.',
  'impf-p': 'Imperfect passive: -bar, -baris, -batur, -bamur, -bamini, -bantur.',
  'fut-a': 'Future: 1st and 2nd use -bo, -bis, -bit (laudabo). 3rd, 3rd -io and 4th use -am, -es, -et (regam, capiam, audiam).',
  'fut-p': 'Future passive: 1st and 2nd -bor, -beris, -bitur. 3rd, 3rd -io and 4th -ar, -eris, -etur (regar, capiar).',
  'perf-a': 'Perfect: 3rd principal part minus -i, then -i, -isti, -it, -imus, -istis, -erunt.',
  'plup-a': 'Pluperfect: perfect stem + -eram, -eras, -erat (the endings are eram, eras, erat).',
  'fperf-a': 'Future perfect: perfect stem + -ero, -eris, -erit, -erimus, -eritis, -erint (3rd pl. -erint, not -erunt).',
  'perf-p': 'Perfect passive: 4th part as -us/-a/-um (plural -i/-ae/-a) + sum, es, est, sumus, estis, sunt.',
  'plup-p': 'Pluperfect passive: 4th part + eram, eras, erat, eramus, eratis, erant.',
  'fperf-p': 'Future perfect passive: 4th part + ero, eris, erit, erimus, eritis, erunt.',
  'spres-a': 'Present subjunctive, "wE fEAr A lIAr": 1st -e-, 2nd -ea-, 3rd -a-, 3rd -io and 4th -ia-, then -m, -s, -t, -mus, -tis, -nt.',
  'spres-p': 'Present subjunctive passive: same vowel (e / ea / a / ia) + -r, -ris, -tur, -mur, -mini, -ntur.',
  'simpf-a': 'Imperfect subjunctive: present active infinitive + -m, -s, -t, -mus, -tis, -nt (laudare-m, capere-m).',
  'simpf-p': 'Imperfect subjunctive passive: present active infinitive + -r, -ris, -tur, -mur, -mini, -ntur (laudare-r).',
  'sperf-a': 'Perfect subjunctive: perfect stem + -erim, -eris, -erit, -erimus, -eritis, -erint.',
  'sperf-p': 'Perfect subjunctive passive: 4th part + sim, sis, sit, simus, sitis, sint.',
  'splup-a': 'Pluperfect subjunctive: perfect active infinitive + -m, -s, -t... (laudavisse-m).',
  'splup-p': 'Pluperfect subjunctive passive: 4th part + essem, esses, esset, essemus, essetis, essent.',
  inf: 'Infinitives: present active = 2nd part. Present passive: -ari, -eri, -i (3rd and 3rd -io), -iri. Perfect active: perfect stem + -isse. Perfect passive: 4th part + esse. Future active: 4th part stem + -urus esse.',
  part: 'Participles: present active -ns, -ntis (laudans, monens, regens, capiens, audiens). Perfect passive = 4th part as -us, -a, -um. Future active = 4th part stem + -urus, -a, -um.',
  imp: 'Imperative: singular = present stem (lauda, mone, rege, cape, audi). Plural adds -te; 3rd conj. changes e to i: regite, capite. Short forms: dic, duc, fac, fer.',
  sum: 'sum and possum: possum = pot- + sum, written pos- before s (possum, possumus, possunt). Perfect fui, potui. Subjunctive sim, possim; imperfect subjunctive essem, possem.',
  decl: 'Learn the genitive singular: it tells you the declension. -ae 1st, -i 2nd, -is 3rd, -us 4th, -ei 5th. Neuters: nom. = acc., plural ends in -a.',
  i3: 'i-stems (gen. pl. -ium): same syllable count in nom. and gen. (orbis, orbis) or a one-syllable nom. ending in two consonants (mens, mentis). Neuters in -e, -al, -ar: abl. -i, pl. -ia (mare, mari, maria).',
  dem: 'hic = this (near me), ille = that (over there), is = this / that, or he, she, it. Genitive singular -ius in every gender (huius, illius, eius), dative -i (huic, illi, ei). Neuter nom. = acc.: hoc, illud, id; plural haec, illa, ea. Only hic changes its stem: hunc, hanc, hoc.',
  pers: 'ego and tu: mei / tui, mihi / tibi, me / te (acc. = abl.). Plural nos / vos, dative = ablative nobis / vobis. "Of us / of you" is nostrum / vestrum (a part of) or nostri / vestri (love of). Reflexive sui, sibi, se has no nominative, is the same in both numbers and points back to the subject. With cum: mecum, tecum, nobiscum, vobiscum, secum.',
  pron: 'Pronoun genitive singular is -ius, dative singular -i, in every gender (eius, huius, illius, ipsius, cuius; ei, huic, illi, ipsi, cui).',
};


var RULES3 = [
  { end: '-tas, -tatis', g: 'f', nom: /tas$/, gen: /tatis$/ },
  { end: '-tudo, -tudinis', g: 'f', nom: /tudo$/, gen: /tudinis$/ },
  { end: '-io, -ionis', g: 'f', nom: /io$/, gen: /ionis$/ },
  { end: '-or, -oris', g: 'm', nom: /or$/, gen: /oris$/ },
  { end: '-os, -oris', g: 'm', nom: /os$/, gen: /oris$/ },
  { end: '-us, -eris / -oris / -uris', g: 'n', nom: /us$/, gen: /(eris|oris|uris)$/ },
  { end: '-men, -minis', g: 'n', nom: /men$/, gen: /minis$/ },
  { end: '-ns, -ntis', g: 'f', nom: /ns$/, gen: /ntis$/ },
  { end: '-is, -is / -es, -is', g: 'f', nom: /(is|es)$/, gen: /is$/, same: true },
];
var GNAME = { m: 'masculine', f: 'feminine', n: 'neuter' };
var EXC3 = { centurio: 'a centurion is a man, so masculine', orbis: 'orbis is an exception: masculine' };

// {rule, ok} for a 3rd declension noun, or null.
function rule3(c) {
  if (c.pos !== 'n' || c.forms.length < 2) return null;
  var nom = c.forms[0], gen = c.forms[1];
  if (!/is$/.test(gen)) return null;
  for (var i = 0; i < RULES3.length; i++) {
    var r = RULES3[i];
    if (r.nom.test(nom) && r.gen.test(gen) && (!r.same || nom.length === gen.length)) {
      var g = genderInfo(c.gender).set;
      return { rule: r, ok: g.has(r.g), note: EXC3[c.id] || null };
    }
  }
  return null;
}


export { parseRaw, normLatin, normEn, glosses, matchEnglish, checkGender, evalEntry, fieldLabels, entryRest, hasExtraForms,
  genderInfo, acceptedForms, conjOf, lev, CASES, RAW1, SYN1, HOOK1, RAW45, SYN45, HOOK45, G, G_RULE, gCheck, gSquash, rule3, RULES3, GNAME, EXC3 };
