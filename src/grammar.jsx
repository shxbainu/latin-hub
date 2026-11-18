import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Btn, Panel, Tabs, cx, EASE } from './ui.jsx';
import { Subjunctive } from './subjpage.jsx';
import { Session } from './study.jsx';
import { G, PERS, PERS1, TOPICS, TNAME, grammarQ, topicPct, weakTopics } from './model.js';

// The topic list reads like a book's table of contents, grouped the way the chapters are.
export const GROUPS = [
  ['I', 'Nouns & pronouns', ['decl', 'p-hic', 'p-ille', 'p-is', 'p-ipse', 'p-idem', 'p-qui']],
  ['II', 'Personal pronouns', ['p-ego', 'p-tu', 'p-nos', 'p-vos', 'p-sui']],
  ['III', 'Verbs', ['pres', 'perf', 'perfp', 'inf', 'part', 'imp', 'sum']],
  ['IV', 'Subjunctive', ['subj', 'clause', 'seq']],
];

const SUBJ_ID = 'subj';
const NAME_HERE = { subj: 'Subjunctive forms' };
const LABEL = (id) => NAME_HERE[id] || TNAME[id];

// A tick-box tile: tap to add a topic to the drill. The bar is the score over the last 20 answers.
function Tile({ name, pct, on, onToggle }) {
  const tone = pct == null ? 'bg-line' : pct >= 80 ? 'bg-good' : pct >= 50 ? 'bg-muted/60' : 'bg-warm';
  return (
    <motion.button type="button" role="checkbox" aria-checked={on} whileTap={{ scale: 0.985 }} onClick={onToggle}
      className={cx('flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors', on ? 'border-accent bg-accent-soft/50' : 'border-line bg-surface hover:border-accent/50')}>
      <span aria-hidden="true" className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors', on ? 'border-accent bg-accent text-white' : 'border-line bg-surface')}>
        {on && <Check size={14} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1 font-serif text-[18px] leading-tight">{name}</span>
      <span aria-hidden="true" className="h-2 w-8 shrink-0 overflow-hidden rounded-full bg-line">
        <span className={cx('block h-full rounded-full', tone)} style={{ width: (pct == null ? 0 : Math.max(pct, 6)) + '%' }} />
      </span>
      <span className={cx('w-10 shrink-0 text-right text-[15px] font-semibold tabular', pct == null ? 'text-muted/60' : pct >= 80 ? 'text-good' : pct >= 50 ? 'text-muted' : 'text-warm')}>{pct == null ? 'new' : pct + '%'}</span>
    </motion.button>
  );
}

const MODES = [['one', 'One form', 'A single form at a time'], ['table', 'Whole chart', 'Fill an entire table at once']];

export function Grammar({ store, initialTopic, initialTab }) {
  const gram = store.get('grammar');
  const allIds = TOPICS.map((t) => t[0]);
  const startTab = initialTab === 'subj' ? 'subj' : initialTab === 'ref' ? 'ref' : 'drill';
  const [tab, setTab] = useState(startTab);
  const [seen, setSeen] = useState({ [startTab]: true });
  const saved = (gram.topics || []).filter((t) => allIds.includes(t));
  const [sel, setSel] = useState(() => (initialTopic && allIds.includes(initialTopic) ? [initialTopic] : saved.length ? saved : allIds));
  const [mode, setMode] = useState(gram.mode || 'one');
  const [run, setRun] = useState(null); // { topics, mode, items, id }: stays mounted while you look at other tabs
  const [guide, setGuide] = useState('decl');
  const [cur, setCur] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const gen = (list, m, n) => Array.from({ length: n }, () => { const t = list[Math.floor(Math.random() * list.length)]; return { kind: 'gram', q: grammarQ(t, m), topic: t, key: 'g' + Math.random() }; });
  const start = (list) => {
    if (!list.length) return;
    store.update('grammar', (g) => { g.topics = list; g.mode = mode; });
    setCur(null); setRun({ topics: list, mode, items: gen(list, mode, 4), id: Math.random() });
  };
  const toggle = (id) => setSel((l) => (l.includes(id) ? l.filter((x) => x !== id) : l.concat(id)));
  const weakest = weakTopics(gram, 3);
  const goTab = (t) => { setTab(t); setSeen((x) => ({ ...x, [t]: true })); };
  const drillFrom = (id) => { setSel([id]); goTab('drill'); start([id]); };
  const show = (t) => (tab === t ? '' : 'hidden');
  const guideTopic = cur && GUIDES[cur.topic] ? cur.topic : run && GUIDES[run.topics[0]] ? run.topics[0] : 'decl';

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Forms & paradigms · every answer shows its rule</p>
          <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Grammar</h1>
        </div>
        <Tabs id="gram" value={tab} onChange={goTab} tabs={[['drill', run ? 'Drill ●' : 'Drill'], ['subj', 'Subjunctive'], ['ref', 'Guides']]} />
      </header>

      <div className={show('drill')}>
        {run ? (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
            <div className="flex min-w-0 flex-col gap-3">
              <Btn variant="ghost" size="sm" className="self-start xl:hidden" onClick={() => setShowGuide((x) => !x)}>{showGuide ? 'Hide guide' : 'Show guide'}</Btn>
              <div className={cx('xl:hidden', showGuide ? '' : 'hidden')}><Panel className="p-4"><GuideBody topic={guideTopic} compact /></Panel></div>
              <Session key={run.id} store={store} items={run.items} more={() => gen(run.topics, run.mode, 3)} onCurrent={setCur}
                title={run.topics.length === 1 ? LABEL(run.topics[0]) : run.topics.length + ' topics'} onExit={() => { setRun(null); setCur(null); }} />
            </div>
            <aside className="hidden xl:sticky xl:top-4 xl:block xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
              <Panel className="p-4"><GuideBody topic={guideTopic} compact /></Panel>
            </aside>
          </div>
        ) : (
          <Panel className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-serif text-[28px] font-medium leading-none tracking-tight">What do you want to drill?</h2>
                <p className="text-base text-muted">Tick as many topics as you like. They are mixed together.</p>
              </div>
              <div role="radiogroup" aria-label="Answer as" className="grid grid-cols-2 gap-3">
                {MODES.map(([k, name, sub]) => (
                  <button key={k} type="button" role="radio" aria-checked={mode === k} onClick={() => setMode(k)}
                    className={cx('flex flex-col rounded-xl border-2 px-4 py-2.5 text-left transition-colors', mode === k ? 'border-accent bg-accent-soft/50' : 'border-line bg-surface hover:border-accent/50')}>
                    <span className="text-[17px] font-semibold">{name}</span>
                    <span className="text-[15px] text-muted">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Btn onClick={() => setSel(allIds)}>Select all</Btn>
              <Btn onClick={() => setSel(weakest)} title={weakest.map(LABEL).join(', ')}>Weakest three</Btn>
              <Btn variant="ghost" onClick={() => setSel([])}>Clear</Btn>
            </div>

            <div className="grid gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
              {GROUPS.map(([num, name, ids]) => {
                const all = ids.every((id) => sel.includes(id));
                return (
                  <div key={name} className="flex min-w-0 flex-col gap-2">
                    <p className="flex items-baseline gap-2 border-b border-line pb-2">
                      <span className="font-serif text-[18px] text-accent">{num}</span>
                      <span className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">{name}</span>
                      <button type="button" onClick={() => setSel((l) => (all ? l.filter((x) => !ids.includes(x)) : Array.from(new Set(l.concat(ids)))))} className="ml-auto text-[15px] font-semibold text-accent hover:underline">{all ? 'Clear' : 'All'}</button>
                    </p>
                    {ids.map((id) => <Tile key={id} name={LABEL(id)} pct={topicPct(gram, id)} on={sel.includes(id)} onToggle={() => toggle(id)} />)}
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-3 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface/95 p-3 shadow-lg backdrop-blur">
              <Btn variant="primary" size="lg" disabled={!sel.length} onClick={() => start(sel)}>Start drilling <ArrowRight size={18} /></Btn>
              <span className="text-[17px] font-semibold">{sel.length ? sel.length + (sel.length === 1 ? ' topic' : ' topics') : 'Pick at least one topic'}</span>
              <span className="text-[17px] text-muted">{mode === 'table' ? 'Whole chart' : 'One form'}</span>
            </div>
          </Panel>
        )}
      </div>
      {seen.subj && <div className={show('subj')}><Subjunctive store={store} embedded /></div>}
      {seen.ref && <div className={show('ref')}><Guides topic={guide} setTopic={setGuide} onDrill={drillFrom} /></div>}
    </div>
  );
}

/* ---------- Rules & tables ---------- */
function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead><tr>{head.map((h, i) => <th key={i} className="whitespace-nowrap border-b border-line px-2 py-1.5 text-[13px] font-semibold uppercase tracking-wider text-muted">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => j === 0
            ? <th key={j} className="whitespace-nowrap border-b border-line px-2 py-1 text-sm font-semibold text-muted">{c}</th>
            : <td key={j} lang="la" className="whitespace-nowrap border-b border-line px-2 py-1 font-serif text-[18px]">{c}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}
function Picker({ id, options, value, onChange, label }) {
  return (
    <label htmlFor={id} className="flex flex-wrap items-center gap-2 text-base text-muted">{label}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-base font-semibold text-ink">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
const short = (k) => G.TENSES[k].label.replace(' subjunctive', '').replace(' active', ' act.').replace(' passive', ' pass.');
function TenseTable({ v, keys }) {
  const cols = keys.map((k) => G.TENSES[k].build(v));
  return <Table head={[''].concat(keys.map(short))} rows={G.PERSONS.map((p, i) => [p].concat(cols.map((c) => c[i].gold)))} />;
}
function VerbRef({ id, keysFor, needPass }) {
  const pool = G.VERBS.filter((v) => !needPass || !v.np);
  const [vid, setVid] = useState(pool[0].id);
  const v = pool.find((x) => x.id === vid);
  return <><Picker id={'rv-' + id} label="Show it for" value={vid} onChange={setVid} options={pool.map((x) => [x.id, x.p[0] + ' (' + G.CONJ_NAME[x.k] + ')'])} />{keysFor(v)}</>;
}

/* ---------- Guides ---------- */
// One line per rule: a bold label, then the rule in plain words.
function Rows({ rows }) {
  return (
    <dl className="flex flex-col divide-y divide-line rounded-xl border border-line">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-x-4 gap-y-0 px-3.5 py-2 sm:grid-cols-[130px_1fr]">
          <dt className="text-[16px] font-semibold">{k}</dt>
          <dd lang="la" className="text-[16px] leading-snug text-ink/90"><span lang="en">{v}</span></dd>
        </div>
      ))}
    </dl>
  );
}
function NounTables() {
  const [noun, setNoun] = useState('genus');
  const n = G.NOUNS.find((x) => x.id === noun);
  const order = ['1', '2', '2n', '3', '3n', '3i', '4', '5'];
  const lab = []; ['sg.', 'pl.'].forEach((nb) => G.CASES.forEach((c) => lab.push(c.slice(0, 3) + '. ' + nb)));
  const nomRow = ['-a', '-us', '-um', 'varies', 'varies', '-is / -s', '-us', '-es'];
  const endRows = lab.map((l, i) => [l].concat(order.map((k, j) => { const e = G.DECL_END[k][i]; return i === 0 ? nomRow[j] : e === '=' ? '= nom.' : '-' + e; })));
  return (
    <>
      <Table head={['', '1st', '2nd m.', '2nd n.', '3rd', '3rd n.', '3rd i', '4th', '5th']} rows={endRows} />
      <Picker id="rn" label="Example" value={noun} onChange={setNoun} options={G.NOUNS.map((x) => [x.id, x.nom + ' (' + G.DECL_NAME[x.d] + ')'])} />
      <Table head={['', 'singular', 'plural']} rows={G.CASES.map((c, i) => [c, n.cells[i].gold, n.cells[i + 5].gold])} />
    </>
  );
}
const T = (id, keys, needPass) => () => <VerbRef id={id} needPass={needPass} keysFor={(v) => keys.map((k, i) => (i === 1 && v.np ? null : <TenseTable key={i} v={v} keys={k} />))} />;
const LIST = (id, fn, head) => () => <VerbRef id={id} keysFor={(v) => <Table head={head} rows={fn(v)} />} />;

const GUIDES = {
  decl: { title: 'Noun declensions', rows: [
    ['Which declension', 'Look at the genitive singular: -ae 1st · -i 2nd · -is 3rd · -us 4th · -ei 5th.'],
    ['Neuters', 'Nominative = accusative, and the plural ends in -a.'],
    ['3rd gender', 'SOX feminine (-s -o -x) · ERROR masculine (-er -or) · LANCET neuter (-l -a -n -c -e -t).'],
    ['i-stems', 'Genitive plural -ium. Neuters in -e, -al, -ar: ablative -i, plural -ia.'],
    ['4th and 5th', '4th mostly masculine (exercitus). 5th feminine, except dies.'],
  ], Body: NounTables },
  pres: { title: 'Present, imperfect, future', rows: [
    ['Present', 'stem + -o -s -t -mus -tis -nt. 3rd: regimus, regunt. 3rd -io and 4th: capiunt, audiunt.'],
    ['Imperfect', 'stem vowel + -ba- + endings: laudabam, monebam, regebam, capiebam, audiebam.'],
    ['Future', '1st and 2nd -bo -bis -bit (laudabo). 3rd and 4th -am -es -et (regam, audiam).'],
    ['Passive', 'Endings -r -ris -tur -mur -mini -ntur. 1st singular -or, imperfect -bar, future -bor or -ar.'],
  ], Body: T('pres', [['pres-a', 'impf-a', 'fut-a'], ['pres-p', 'impf-p', 'fut-p']]) },
  perf: { title: 'Perfect system active', rows: [
    ['Perfect stem', '3rd principal part minus -i: laudavi → laudav-.'],
    ['Perfect', 'stem + -i -isti -it -imus -istis -erunt.'],
    ['Pluperfect', 'stem + -eram -eras -erat -eramus -eratis -erant (“had”).'],
    ['Future perfect', 'stem + -ero -eris -erit -erimus -eritis -erint (“will have”).'],
  ], Body: T('perf', [['perf-a', 'plup-a', 'fperf-a']]) },
  perfp: { title: 'Perfect passives', rows: [
    ['Perfect', '4th principal part + sum es est sumus estis sunt.'],
    ['Pluperfect', '4th part + eram eras erat …'],
    ['Future perfect', '4th part + ero eris erit …'],
    ['Agreement', 'The participle agrees with the subject: puella laudata est, milites laudati sunt.'],
  ], Body: T('perfp', [['perf-p', 'plup-p', 'fperf-p']], true) },
  inf: { title: 'Infinitives', rows: [
    ['Present', 'active = 2nd principal part. Passive -ari -eri -i -iri.'],
    ['Perfect', 'active: perfect stem + -isse. Passive: 4th part + esse.'],
    ['Future', 'active only: 4th part stem + -urus esse.'],
    ['Time', 'present = same time · perfect = before · future = after.'],
  ], Body: LIST('inf', (v) => G.infinitives(v).map((x) => [x.label, x.cell.gold]), ['infinitive', 'form']) },
  part: { title: 'Participles', rows: [
    ['Present active', '-ns, -ntis: laudans, monens, regens, capiens, audiens.'],
    ['Perfect passive', '4th part as -us -a -um.'],
    ['Future active', '4th part stem + -urus -a -um.'],
    ['Time', 'present = same time · perfect = before, passive · future = about to.'],
  ], Body: LIST('part', (v) => G.participles(v).map((x) => [x.label, x.full]), ['participle', 'form']) },
  subj: { title: 'Subjunctive forms', rows: [
    ['Present', 'wE fEAr A lIAr: -e- -ea- -a- -ia- + m s t mus tis nt.'],
    ['Imperfect', 'infinitive + m s t mus tis nt: laudarem, regerem.'],
    ['Perfect', 'perfect stem + -erim -eris -erit …'],
    ['Pluperfect', 'perfect stem + -issem -isses -isset …'],
    ['Passive', 'Present and imperfect take -r -ris -tur. Perfect = 4th part + sim. Pluperfect = 4th part + essem.'],
  ], Body: T('subj', [['spres-a', 'simpf-a', 'sperf-a', 'splup-a'], ['spres-p', 'simpf-p', 'sperf-p', 'splup-p']]) },
  imp: { title: 'Imperatives', rows: [
    ['Singular', 'the present stem: lauda, mone, rege, cape, audi.'],
    ['Plural', 'add -te: laudate. 3rd conjugation e → i: regite, capite.'],
    ['Short forms', 'dic, duc, fac, fer.'],
    ['Negative', 'noli (sg.) / nolite (pl.) + infinitive: noli timere = don’t be afraid.'],
  ], Body: LIST('imp', (v) => G.imperatives(v).map((x) => [x.label, x.cell.gold]), ['imperative', 'form']) },
  sum: { title: 'sum & possum', rows: [
    ['possum', 'pot- + sum, written pos- before s: possum, possumus, possunt.'],
    ['Perfect', 'sum → fui · possum → potui.'],
    ['Subjunctive', 'sim, possim · imperfect essem, possem.'],
  ], Body: () => <>{['sum', 'possum'].map((w) => <Table key={w} head={[w + ', ' + G.IRR[w].inf].concat(G.IRR_TENSES.map((k) => G.TENSES[k].label.replace(' active', '').replace(' subjunctive', ' subj.')))} rows={G.PERSONS.map((p, i) => [p].concat(G.IRR_TENSES.map((k) => G.IRR[w].t[k][i])))} />)}</> },
  clause: { title: 'Subjunctive clauses', rows: [
    ['Purpose', 'ut + subjunctive (negative ne) = “in order to”: venit ut videret.'],
    ['Indirect command', 'order / ask verb + ut / ne + subjunctive: imperat eis ut veniant.'],
    ['Who gets it', 'impero, mando, persuadeo + dative · rogo, oro + accusative · postulo, quaero + ab / ex + ablative.'],
    ['Result', 'a “so” word (tam, ita, tantus, tot, talis, sic) + ut + subjunctive. Negative ut non.'],
    ['Indirect question', 'asking / knowing / telling verb + question word (cur, ubi, quid, quot, num) + subjunctive.'],
    ['cum', 'cum + subjunctive = when, since, although. tamen in the main clause means “although”.'],
    ['No subjunctive', 'Indirect statement: accusative + infinitive (dixit hostes venire).'],
  ] },
  seq: { title: 'Sequence of tenses', rows: [
    ['Main verb present or future', 'same time or after → present subjunctive · before → perfect subjunctive.'],
    ['Main verb past', 'same time or after → imperfect subjunctive · before → pluperfect subjunctive.'],
    ['Purpose and indirect command', 'Only present (after a present main verb) or imperfect (after a past one).'],
  ], Body: () => (
    <Table head={['main verb', 'same time / after', 'before']} rows={[['present, future', 'present subj.', 'perfect subj.'], ['past', 'imperfect subj.', 'pluperfect subj.']]} />
  ) },
};

// One guide per pronoun: its meaning, the points that trip people up, and its table.
const PRON_ROWS = {
  'p-hic': [['Meaning', 'this (near me).'], ['Genitive, dative', 'huius, huic in every gender.'], ['Neuter', 'nominative = accusative: hoc. Plural haec.'], ['Watch', 'hunc, hanc, hoc · hi, hae, haec.']],
  'p-ille': [['Meaning', 'that (over there).'], ['Genitive, dative', 'illius, illi in every gender.'], ['Neuter', 'illud (nominative = accusative). Plural illa.'], ['Pattern', 'like a 1st / 2nd adjective, but -ius, -i in the singular.']],
  'p-is': [['Meaning', 'he, she, it · this, that.'], ['Genitive, dative', 'eius, ei in every gender.'], ['Plural', 'ei or ii, eae, ea · eis or iis.'], ['Use', 'stands for a noun already named: eum = him.']],
  'p-ipse': [['Meaning', '-self, the very: ipse consul = the consul himself.'], ['Pattern', 'like ille, but the neuter is ipsum.'], ['Genitive, dative', 'ipsius, ipsi in every gender.']],
  'p-idem': [['Meaning', 'the same.'], ['Built from', 'is + -dem: idem, eadem, idem.'], ['Watch', 'm becomes n before -dem: eundem, eandem, eorundem.']],
  'p-qui': [['Meaning', 'who, which, that.'], ['Agreement', 'gender and number from the antecedent, case from its own clause.'], ['Genitive, dative', 'cuius, cui in every gender.'], ['Plural', 'qui, quae, quae · quorum, quarum · quibus.']],
  'p-ego': [['Meaning', 'I, me.'], ['Forms', 'mei · mihi · me · me.'], ['With cum', 'mecum.']],
  'p-tu': [['Meaning', 'you (one person).'], ['Forms', 'tui · tibi · te · te.'], ['With cum', 'tecum.']],
  'p-nos': [['Meaning', 'we, us.'], ['“Of us”', 'nostrum (a part of us) · nostri (love of us).'], ['Dative, ablative', 'nobis. With cum: nobiscum.']],
  'p-vos': [['Meaning', 'you (all).'], ['“Of you”', 'vestrum (a part of you) · vestri (love of you).'], ['Dative, ablative', 'vobis. With cum: vobiscum.']],
  'p-sui': [['Meaning', 'himself, herself, itself, themselves.'], ['Forms', 'sui · sibi · se (sese) · se (sese).'], ['Use', 'no nominative; same in singular and plural; points back to the subject.'], ['With cum', 'secum.']],
};
Object.keys(PRON_ROWS).forEach((id) => {
  const k = id.slice(2), pr = G.PRON[k], ps = PERS1[k];
  GUIDES[id] = {
    title: TNAME[id], rows: PRON_ROWS[id],
    Body: pr
      ? () => <div className="grid gap-3 lg:grid-cols-2">{['sg', 'pl'].map((nb) => <Table key={nb} head={[nb === 'sg' ? 'singular' : 'plural', 'masc.', 'fem.', 'neut.']} rows={G.CASES.map((c, i) => [c.slice(0, 3) + '.'].concat(pr[nb][i].map((x) => x.split('|').join(' / '))))} />)}</div>
      : () => <Table head={['', ps.title.split(' · ')[0]]} rows={G.CASES.map((c, i) => [c, ps.cases[i] ? ps.cases[i].split('|').join(' / ') : '—'])} />,
  };
});

function GuideBody({ topic, compact, onDrill }) {
  const g = GUIDES[topic] || GUIDES.decl;
  return (
    <div className={cx('flex flex-col', compact ? 'gap-3' : 'gap-4')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={cx('font-serif font-medium leading-none tracking-tight', compact ? 'text-[24px]' : 'text-[30px]')}>{g.title}</h2>
        {onDrill && <Btn variant="primary" onClick={() => onDrill(topic)}>Drill this <ArrowRight size={16} /></Btn>}
      </div>
      <Rows rows={g.rows} />
      {g.Body && <g.Body />}
    </div>
  );
}

function Guides({ topic, setTopic, onDrill }) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
      <nav aria-label="Guides" className="flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        {GROUPS.map(([num, name, ids]) => (
          <div key={name} className="flex flex-col gap-1">
            <p className="flex items-baseline gap-2"><span className="font-serif text-[16px] text-accent">{num}</span><span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">{name}</span></p>
            <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-0">
              {ids.map((id) => (
                <button key={id} type="button" onClick={() => setTopic(id)} aria-current={topic === id ? 'page' : undefined}
                  className={cx('rounded-lg px-3 py-1.5 text-left text-[16px] transition-colors', topic === id ? 'bg-accent font-semibold text-white' : 'bg-sunken hover:bg-line lg:bg-transparent')}>
                  {LABEL(id)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <Panel className="p-5 sm:p-6"><GuideBody topic={topic} onDrill={onDrill} /></Panel>
    </div>
  );
}
