// Subjunctive practice: one verb, one requested form, type it.
// Regular verbs come from the grammar engine (legacy.js) and your lesson vocab; the irregular verbs
// (sum, possum, eo, fero, volo, nolo, malo, fio, do, edo and their compounds) are written out here.
import { G, G_RULE, SETS, verbOf, pick, gCheck } from './model.js';

export const SUBJ_TENSES = [['all', 'All'], ['spres', 'Present'], ['simpf', 'Imperfect'], ['sperf', 'Perfect'], ['splup', 'Pluperfect']];
export const SUBJ_VOICES = [['both', 'Both'], ['a', 'Active'], ['p', 'Passive']];
export const SUBJ_VERBS = [['all', 'All verbs'], ['core', 'Common verbs'], ['irr', 'Irregulars only']];
export const SUBJ_DEFAULT = { tense: 'all', voice: 'both', verbs: 'all' };
const T4 = ['spres', 'simpf', 'sperf', 'splup'];

/* ---------- irregular verbs ---------- */
const SIM = ['sim', 'sis', 'sit', 'simus', 'sitis', 'sint'];
const ESSEM = ['essem', 'esses', 'esset', 'essemus', 'essetis', 'essent'];
const ERIM = ['erim', 'eris', 'erit', 'erimus', 'eritis', 'erint'];
const ISSEM = ['issem', 'isses', 'isset', 'issemus', 'issetis', 'issent'];
const S = (stem, ends) => ends.map((e) => stem + e);
const six = (gold, alts = []) => gold.map((g, i) => ({ gold: g, ok: [g].concat(alts.map((a) => a[i])) }));
const comp = (sup, aux) => aux.map((a, i) => { const g = i < 3 ? ['us', 'a', 'um'] : ['i', 'ae', 'a']; return { gold: sup + g[0] + ' ' + a, ok: g.map((x) => sup + x + ' ' + a) }; });

export const IRREG = [];
function irr(id, p, m, t, rule, extra) {
  const v = { id, p, m, irr: true, t, rule, pass: !!t['spres-p'], base: false, ...extra };
  IRREG.push(v);
  return v;
}

const RULE_SUM = 'sum: present sim, sis, sit, simus, sitis, sint. Imperfect = esse + endings (essem, esses, esset…). Perfect = fu- + erim, eris… (fuerim). Pluperfect = fu- + issem, isses… (fuissem). A compound keeps the pattern with its prefix: absim, abessem, afuerim, afuissem.';
irr('sum', ['sum', 'esse', 'fui', 'futurum'], 'be', {
  'spres-a': six(SIM), 'simpf-a': six(ESSEM), 'sperf-a': six(S('fu', ERIM)), 'splup-a': six(S('fu', ISSEM)),
}, RULE_SUM, { base: true });
[['absum', 'ab', 'afu', ['absum', 'abesse', 'afui', 'afuturus'], 'be away'],
  ['adsum', 'ad', 'adfu', ['adsum', 'adesse', 'adfui', 'adfuturus'], 'be present'],
  ['desum', 'de', 'defu', ['desum', 'deesse', 'defui', 'defuturus'], 'be lacking'],
  ['praesum', 'prae', 'praefu', ['praesum', 'praeesse', 'praefui', 'praefuturus'], 'be in command of']].forEach(([id, pre, ps, p, m]) => {
  irr(id, p, m, { 'spres-a': six(S(pre, SIM)), 'simpf-a': six(S(pre, ESSEM)), 'sperf-a': six(S(ps, ERIM)), 'splup-a': six(S(ps, ISSEM)) }, RULE_SUM);
});

irr('possum', ['possum', 'posse', 'potui'], 'be able', {
  'spres-a': six(G.IRR.possum.t['spres-a']), 'simpf-a': six(G.IRR.possum.t['simpf-a']), 'sperf-a': six(S('potu', ERIM)), 'splup-a': six(S('potu', ISSEM)),
}, 'possum = pot- + sum, and pot- becomes pos- before s: possim, possem. Perfect potuerim, pluperfect potuissem.', { base: true });

const EO_RULE = 'eo: present eam, eas, eat, eamus, eatis, eant. Imperfect = ire + endings (irem, ires, iret…). Perfect = ierim, ieris… (iverim also exists). Pluperfect = issem, isses… (iissem, ivissem also exist). A compound keeps the pattern: adeam, adirem, adierim, adissem.';
const eoLike = (id, pre, p, m, base) => irr(id, p, m, {
  'spres-a': six(S(pre, ['eam', 'eas', 'eat', 'eamus', 'eatis', 'eant'])),
  'simpf-a': six(S(pre, ['irem', 'ires', 'iret', 'iremus', 'iretis', 'irent'])),
  'sperf-a': six(S(pre, ['ierim', 'ieris', 'ierit', 'ierimus', 'ieritis', 'ierint']), [S(pre, ['iverim', 'iveris', 'iverit', 'iverimus', 'iveritis', 'iverint'])]),
  'splup-a': six(S(pre, ISSEM), [S(pre, ['iissem', 'iisses', 'iisset', 'iissemus', 'iissetis', 'iissent']), S(pre, ['ivissem', 'ivisses', 'ivisset', 'ivissemus', 'ivissetis', 'ivissent'])]),
}, EO_RULE, { base });
eoLike('eo', '', ['eo', 'ire', 'ii', 'itum'], 'go', true);
[['adeo', 'ad', ['adeo', 'adire', 'adii', 'aditum'], 'approach'], ['exeo', 'ex', ['exeo', 'exire', 'exii', 'exitum'], 'go out'],
  ['redeo', 'red', ['redeo', 'redire', 'redii', 'reditum'], 'return'], ['transeo', 'trans', ['transeo', 'transire', 'transii', 'transitum'], 'cross'],
  ['ineo', 'in', ['ineo', 'inire', 'inii', 'initum'], 'enter']].forEach(([id, pre, p, m]) => eoLike(id, pre, p, m, false));

const FERO_RULE = 'fero: present feram, feras, ferat… (fer- + am). Imperfect = ferre + endings (ferrem, ferres…). Perfect = tul- + erim (tulerim); pluperfect = tul- + issem (tulissem). Passive: ferar, ferrer; latus sim; latus essem. Compounds keep the pattern: adferam, adferrem, attulerim.';
const feroLike = (id, st, ps, sup, p, m, base) => irr(id, p, m, {
  'spres-a': six(S(st, ['am', 'as', 'at', 'amus', 'atis', 'ant'])),
  'spres-p': six(S(st, ['ar', 'aris', 'atur', 'amur', 'amini', 'antur'])),
  'simpf-a': six(S(st, ['rem', 'res', 'ret', 'remus', 'retis', 'rent'])),
  'simpf-p': six(S(st, ['rer', 'reris', 'retur', 'remur', 'remini', 'rentur'])),
  'sperf-a': six(S(ps, ERIM)), 'splup-a': six(S(ps, ISSEM)),
  'sperf-p': comp(sup, SIM), 'splup-p': comp(sup, ESSEM),
}, FERO_RULE, { base });
feroLike('fero', 'fer', 'tul', 'lat', ['fero', 'ferre', 'tuli', 'latum'], 'carry, bring', true);
feroLike('adfero', 'adfer', 'attul', 'allat', ['adfero', 'adferre', 'attuli', 'allatum'], 'bring to', false);
feroLike('confero', 'confer', 'contul', 'collat', ['confero', 'conferre', 'contuli', 'collatum'], 'bring together', false);
feroLike('infero', 'infer', 'intul', 'illat', ['infero', 'inferre', 'intuli', 'illatum'], 'inflict', false);
feroLike('refero', 'refer', 'rettul', 'relat', ['refero', 'referre', 'rettuli', 'relatum'], 'bring back', false);
feroLike('defero', 'defer', 'detul', 'delat', ['defero', 'deferre', 'detuli', 'delatum'], 'report', false);

const VNM = 'volo, nolo, malo: present velim / nolim / malim, then -is, -it, -imus, -itis, -int. Imperfect = the infinitive + endings (vellem, nollem, mallem). Perfect voluerim, noluerim, maluerim. Pluperfect voluissem, noluissem, maluissem.';
[['volo', ['volo', 'velle', 'volui'], 'want', 'vel', 'vell', 'volu'], ['nolo', ['nolo', 'nolle', 'nolui'], 'not want', 'nol', 'noll', 'nolu'], ['malo', ['malo', 'malle', 'malui'], 'prefer', 'mal', 'mall', 'malu']].forEach(([id, p, m, a, b, c]) =>
  irr(id, p, m, {
    'spres-a': six(S(a, ['im', 'is', 'it', 'imus', 'itis', 'int'])),
    'simpf-a': six(S(b, ['em', 'es', 'et', 'emus', 'etis', 'ent'])),
    'sperf-a': six(S(c, ERIM)), 'splup-a': six(S(c, ISSEM)),
  }, VNM, { base: true }));

irr('fio', ['fio', 'fieri', 'factus sum'], 'become', {
  'spres-a': six(S('fi', ['am', 'as', 'at', 'amus', 'atis', 'ant'])),
  'simpf-a': six(S('fier', ['em', 'es', 'et', 'emus', 'etis', 'ent'])),
  'sperf-a': comp('fact', SIM), 'splup-a': comp('fact', ESSEM),
}, 'fio: present fiam, fias, fiat… Imperfect fierem, fieres… (fieri + endings). Perfect factus sim; pluperfect factus essem (fio is the passive of facio).', { base: true });

irr('do', ['do', 'dare', 'dedi', 'datum'], 'give', {
  'spres-a': six(S('d', ['em', 'es', 'et', 'emus', 'etis', 'ent'])),
  'spres-p': six(S('d', ['er', 'eris', 'etur', 'emur', 'emini', 'entur'])),
  'simpf-a': six(S('dar', ['em', 'es', 'et', 'emus', 'etis', 'ent'])), 'simpf-p': six(S('dar', ['er', 'eris', 'etur', 'emur', 'emini', 'entur'])),
  'sperf-a': six(S('deder', ['im', 'is', 'it', 'imus', 'itis', 'int'])), 'splup-a': six(S('dediss', ['em', 'es', 'et', 'emus', 'etis', 'ent'])),
  'sperf-p': comp('dat', SIM), 'splup-p': comp('dat', ESSEM),
}, 'do: the a is short, so the present subjunctive is dem, des, det… (not deam). Imperfect darem; perfect dederim; pluperfect dedissem. Passive: der, darer; datus sim; datus essem.', { base: true });

irr('edo', ['edo', 'edere', 'edi', 'esum'], 'eat', {
  'spres-a': six(S('ed', ['am', 'as', 'at', 'amus', 'atis', 'ant']), [S('ed', ['im', 'is', 'it', 'imus', 'itis', 'int'])]),
  'simpf-a': six(S('eder', ['em', 'es', 'et', 'emus', 'etis', 'ent']), [ESSEM]),
  'sperf-a': six(S('ed', ERIM)), 'splup-a': six(S('ed', ISSEM)),
}, 'edo: present edam (or edim); imperfect ederem (or essem, from esse); perfect ederim; pluperfect edissem.', { base: true });

/* ---------- regular verbs ---------- */
const EXTRA_NP = new Set(['consuesco', 'cresco', 'occido']); // no personal passive
let LESSON_POOL = null;
export function lessonVerbs() {
  if (LESSON_POOL) return LESSON_POOL;
  const seen = new Set(), out = [];
  SETS.forEach((s) => s.cards.forEach((c) => {
    const v = verbOf(c);
    if (!v || seen.has(v.id)) return;
    const [f0, inf, pf] = v.p;
    if (/eo$/.test(f0) && /ire$/.test(inf)) return; // eo compounds are written out above
    if (/(ferre|esse|posse|velle|nolle|malle|fieri)$/.test(inf)) return;
    if (!/i$/.test(pf)) return;
    seen.add(v.id); out.push(EXTRA_NP.has(v.id) ? { ...v, np: true } : v);
  }));
  return (LESSON_POOL = out);
}

/* ---------- questions ---------- */
export function formsOf(v, tk) { return v.irr ? v.t[tk] || null : G.TENSES[tk].build(v); }
export function subjQ(cfg, last) {
  const c = { ...SUBJ_DEFAULT, ...cfg };
  const tenses = c.tense === 'all' ? T4 : [c.tense];
  const voices = c.voice === 'both' ? ['a', 'p'] : [c.voice];
  let v = null, tk = null;
  for (let tries = 0; tries < 60 && !v; tries++) {
    const vc = pick(voices), k = pick(tenses) + '-' + vc;
    const irrs = IRREG.filter((x) => x.t[k]);
    let cand = null;
    if (c.verbs === 'irr' || Math.random() < 0.15) cand = irrs.length ? pick(irrs) : null;
    if (!cand && c.verbs !== 'irr') {
      const base = (c.verbs === 'core' ? G.VERBS : lessonVerbs()).filter((x) => !(vc === 'p' && x.np));
      cand = base.length ? pick(base) : null;
    }
    if (!cand || (last && cand.id === last && tries < 40)) continue;
    v = cand; tk = k;
  }
  if (!v) { tk = 'spres-a'; v = G.VERBS[0]; }
  const person = Math.floor(Math.random() * 6);
  const cells = formsOf(v, tk);
  const tenseLabel = G.TENSES[tk].label.replace(v.irr && !v.pass ? / (active|passive)$/ : /$^/, '');
  return {
    topic: 'subj', verb: v, tk, person, head: v.p[0], parts: v.p.filter(Boolean).join(', '), meaning: v.m,
    conj: v.irr ? 'irregular' : G.CONJ_NAME[v.k], personLabel: G.PERSONS[person], tenseLabel,
    ask: G.PERSONS[person] + ' ' + tenseLabel, cell: cells[person], full: cells, rule: v.irr ? v.rule : G_RULE[tk], irr: !!v.irr,
  };
}

// What did you type instead? Looks for the answer among this verb's other forms (irregular verbs only; regular ones use diagnose() in model.js).
export function diagnoseIrr(q, typed) {
  const v = q.verb, tables = Object.entries(v.t);
  const base = G.IRR[v.id];
  if (base) Object.entries(base.t).forEach(([k, cells]) => { if (!v.t[k]) tables.push([k, cells.map(G.simple)]); });
  const isSubj = (k) => /^s(pres|impf|perf|plup)-/.test(k);
  for (const [k, cells] of tables) {
    for (let i = 0; i < 6; i++) {
      if ((k === q.tk && i === q.person) || !G.TENSES[k] || !gCheck(cells[i], typed)) continue;
      const cat = k === q.tk ? 'person' : isSubj(k) !== isSubj(q.tk) ? 'mood' : G.TENSES[k].pass !== G.TENSES[q.tk].pass ? 'voice' : 'tense';
      return { cat, msg: 'You wrote the ' + G.PERSONS[i] + ' ' + G.TENSES[k].label + ' (' + cells[i].gold + ').' };
    }
  }
  return null;
}

/* ---------- guide data (from the notes) ---------- */
export const IRR_GUIDE_ORDER = ['sum', 'possum', 'eo', 'fero', 'volo', 'nolo', 'malo', 'fio', 'do', 'edo'];
const TK_NAME = { 'spres-a': 'Present', 'simpf-a': 'Imperfect', 'sperf-a': 'Perfect', 'splup-a': 'Pluperfect', 'spres-p': 'Present passive', 'simpf-p': 'Imperfect passive', 'sperf-p': 'Perfect passive', 'splup-p': 'Pluperfect passive' };
export function irregGuide(id) {
  const v = IRREG.find((x) => x.id === id);
  if (!v) return null;
  const rows = Object.keys(TK_NAME).filter((k) => v.t[k]).map((k) => [TK_NAME[k], v.t[k].map((c) => c.gold)]);
  return { id, parts: v.p.join(', '), meaning: v.m, rows, rule: v.rule };
}
