import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Btn, Chip, Panel, Tabs, cx, EASE, SPRING } from './ui.jsx';
import { Session } from './study.jsx';
import { G, G_RULE, TOPICS, TNAME, grammarQ, topicPct } from './model.js';

// The topic list reads like a book's table of contents, grouped the way the chapters are.
export const GROUPS = [
  ['I', 'Nouns', ['decl', 'pron']],
  ['II', 'Verbs', ['pres', 'perf', 'perfp', 'inf', 'part', 'imp', 'sum']],
  ['III', 'Subjunctive', ['subj', 'clause', 'seq']],
];

export function Grammar({ store, initialTopic }) {
  const gram = store.get('grammar');
  const [tab, setTab] = useState('drill');
  const [topics, setTopics] = useState(() => (initialTopic ? [initialTopic] : gram.topics && gram.topics.length ? gram.topics : TOPICS.map((t) => t[0])));
  const [mode, setMode] = useState(gram.mode || 'one');
  const [running, setRunning] = useState(false);
  const saveSel = (t, m) => store.update('grammar', (g) => { g.topics = t; g.mode = m; });
  const gen = (n) => Array.from({ length: n }, () => { const t = topics[Math.floor(Math.random() * topics.length)]; return { kind: 'gram', q: grammarQ(t, mode), topic: t, key: 'g' + Math.random() }; });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Forms & paradigms · every answer shows its rule</p>
          <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Grammar</h1>
        </div>
        <Tabs id="gram" value={tab} onChange={(t) => { setTab(t); setRunning(false); }} tabs={[['drill', 'Drill'], ['ref', 'Rules & tables']]} />
      </header>
      <AnimatePresence mode="wait">
        <motion.div key={tab + running} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: EASE }}>
          {tab === 'ref' ? <Reference /> : running ? (
            <Session store={store} items={gen(4)} more={() => gen(3)} title={topics.length === 1 ? TNAME[topics[0]] : 'Mixed grammar'} onExit={() => setRunning(false)} />
          ) : (
            <Panel className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-serif text-[26px] font-medium leading-none tracking-tight">Contents</h2>
                  <button type="button" className="text-sm font-semibold text-accent" onClick={() => { const t = topics.length === TOPICS.length ? [] : TOPICS.map((x) => x[0]); setTopics(t); saveSel(t, mode); }}>
                    {topics.length === TOPICS.length ? 'Clear all' : 'Select all'}
                  </button>
                </div>
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
                  {GROUPS.map(([num, name, ids]) => (
                    <div key={name} className="flex min-w-0 flex-col">
                      <p className="mb-1.5 flex items-baseline gap-2 border-b border-line pb-1.5">
                        <span className="font-serif text-[15px] text-accent">{num}</span>
                        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{name}</span>
                      </p>
                      {ids.map((id) => {
                        const on = topics.includes(id), p = topicPct(gram, id);
                        return (
                          <motion.button key={id} type="button" whileTap={{ scale: 0.985 }} aria-pressed={on}
                            onClick={() => { const t = on ? topics.filter((x) => x !== id) : topics.concat(id); setTopics(t); saveSel(t, mode); }}
                            className="group -mx-1.5 flex items-baseline gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-sunken">
                            <span aria-hidden="true" className={cx('relative top-[2px] flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border transition-colors', on ? 'border-accent bg-accent text-accent-ink' : 'border-muted/50')}>
                              {on && <motion.svg viewBox="0 0 12 12" className="h-[11px] w-[11px]" initial={false}><motion.path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.22, ease: EASE }} /></motion.svg>}
                            </span>
                            <span className={cx('whitespace-nowrap font-serif text-[16.5px] transition-colors', on ? 'text-ink' : 'text-muted group-hover:text-ink')}>{TNAME[id]}</span>
                            <span aria-hidden="true" className="min-w-[12px] flex-1 translate-y-[-3px] border-b border-dotted border-muted/40" />
                            <span className={cx('text-[13px] font-semibold tabular', p == null ? 'text-muted/60' : p >= 80 ? 'text-good' : p >= 50 ? 'text-muted' : 'text-warm')}>{p == null ? '—' : p + '%'}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted">Tick what to mix together. The figure is your score over your last 20 answers on that topic.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div role="radiogroup" aria-label="Answer as" className="flex items-baseline gap-4 text-[15px]">
                  {[['one', 'One form'], ['table', 'Whole table']].map(([k, l]) => (
                    <button key={k} type="button" role="radio" aria-checked={mode === k} onClick={() => { setMode(k); saveSel(topics, k); }}
                      className={cx('relative pb-1', mode === k ? 'font-semibold text-ink' : 'font-medium text-muted hover:text-ink')}>
                      {l}
                      {mode === k && <motion.span layoutId="gram-mode" className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-accent" transition={SPRING} />}
                    </button>
                  ))}
                </div>
                <Btn variant="primary" size="lg" disabled={!topics.length} onClick={() => setRunning(true)}>Start drilling <ArrowRight size={18} /></Btn>
              </div>
            </Panel>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- Rules & tables ---------- */
function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead><tr>{head.map((h, i) => <th key={i} className="whitespace-nowrap border-b border-line px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => j === 0
            ? <th key={j} className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-xs font-semibold text-muted">{c}</th>
            : <td key={j} lang="la" className="whitespace-nowrap border-b border-line px-2.5 py-1.5 font-serif text-[17px]">{c}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}
function Rules({ lines }) { return <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed">{lines.map((l, i) => <li key={i}>{l}</li>)}</ul>; }
function RefCard({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <Panel className="overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold">
        {title}<motion.span animate={{ rotate: open ? 180 : 0 }} transition={SPRING}><ChevronDown size={18} /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
            <div className="flex flex-col gap-4 border-t border-line px-5 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}
function Picker({ id, options, value, onChange, label }) {
  return (
    <label htmlFor={id} className="flex flex-wrap items-center gap-2 text-sm text-muted">{label}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm font-semibold text-ink">
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

function Reference() {
  const [noun, setNoun] = useState('genus');
  const [pron, setPron] = useState('is');
  const n = G.NOUNS.find((x) => x.id === noun);
  const order = ['1', '2', '2n', '3', '3n', '3i', '4', '5'];
  const lab = []; ['sg.', 'pl.'].forEach((nb) => G.CASES.forEach((c) => lab.push(c.slice(0, 3) + '. ' + nb)));
  const nomRow = ['-a', '-us', '-um', 'varies', 'varies', '-is / -s', '-us', '-es'];
  const endRows = lab.map((l, i) => [l].concat(order.map((k, j) => { const e = G.DECL_END[k][i]; return i === 0 ? nomRow[j] : e === '=' ? '= nom.' : '-' + e; })));
  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-prose text-[15px] text-muted">Open a topic to see the rules and a whole table. Then close it and drill from memory: pulling a form out of your head works better than rereading it.</p>
      <RefCard title="Noun declensions">
        <Rules lines={[G_RULE.decl, G_RULE.i3, 'Genders in the 3rd declension: SOX feminine (-s, -o, -x), ERROR masculine (-er, -or), LANCET neuter (-l, -a, -n, -c, -e, -t).', '4th declension is mostly masculine (exercitus, impetus). 5th is feminine except dies.']} />
        <Table head={['', '1st', '2nd m.', '2nd n.', '3rd', '3rd n.', '3rd i-stem', '4th', '5th']} rows={endRows} />
        <Picker id="rn" label="Show it for" value={noun} onChange={setNoun} options={G.NOUNS.map((x) => [x.id, x.nom + ' (' + G.DECL_NAME[x.d] + ')'])} />
        <Table head={['', 'singular', 'plural']} rows={G.CASES.map((c, i) => [c, n.cells[i].gold, n.cells[i + 5].gold])} />
      </RefCard>
      <RefCard title="Pronouns">
        <Rules lines={[G_RULE.pron, 'qui, quae, quod agrees with its antecedent in gender and number; its case comes from its own clause.']} />
        <Picker id="rp" label="Show" value={pron} onChange={setPron} options={Object.keys(G.PRON).map((k) => [k, G.PRON[k].title])} />
        {['sg', 'pl'].map((nb) => <Table key={nb} head={[nb === 'sg' ? 'singular' : 'plural', 'masc.', 'fem.', 'neut.']} rows={G.CASES.map((c, i) => [c].concat(G.PRON[pron][nb][i].map((x) => x.split('|').join(' / '))))} />)}
      </RefCard>
      <RefCard title="Present, imperfect, future">
        <Rules lines={[G_RULE['pres-a'], G_RULE['impf-a'], G_RULE['fut-a'], 'Passive endings: -r, -ris, -tur, -mur, -mini, -ntur (1st sg. -or).']} />
        <VerbRef id="pres" keysFor={(v) => <><TenseTable v={v} keys={['pres-a', 'impf-a', 'fut-a']} />{!v.np && <TenseTable v={v} keys={['pres-p', 'impf-p', 'fut-p']} />}</>} />
      </RefCard>
      <RefCard title="Perfect system active">
        <Rules lines={[G_RULE['perf-a'], G_RULE['plup-a'], G_RULE['fperf-a']]} />
        <VerbRef id="perf" keysFor={(v) => <TenseTable v={v} keys={['perf-a', 'plup-a', 'fperf-a']} />} />
      </RefCard>
      <RefCard title="Perfect passives">
        <Rules lines={[G_RULE['perf-p'], G_RULE['plup-p'], G_RULE['fperf-p'], 'The participle agrees with the subject: puella laudata est, milites laudati sunt.']} />
        <VerbRef id="perfp" needPass keysFor={(v) => <TenseTable v={v} keys={['perf-p', 'plup-p', 'fperf-p']} />} />
      </RefCard>
      <RefCard title="Infinitives">
        <Rules lines={[G_RULE.inf, 'Present = same time as the main verb, perfect = before, future = after.']} />
        <VerbRef id="inf" keysFor={(v) => <Table head={['infinitive', 'form']} rows={G.infinitives(v).map((x) => [x.label, x.cell.gold])} />} />
      </RefCard>
      <RefCard title="Participles">
        <Rules lines={[G_RULE.part, 'Present participle = same time as the main verb; perfect = before (and passive); future = about to.']} />
        <VerbRef id="part" keysFor={(v) => <Table head={['participle', 'form']} rows={G.participles(v).map((x) => [x.label, x.full])} />} />
      </RefCard>
      <RefCard title="Subjunctive">
        <Rules lines={[G_RULE['spres-a'], G_RULE['simpf-a'], G_RULE['sperf-a'], G_RULE['splup-a'], 'Passives: present and imperfect take -r, -ris, -tur...; perfect = 4th part + sim; pluperfect = 4th part + essem.']} />
        <VerbRef id="subj" keysFor={(v) => <><TenseTable v={v} keys={['spres-a', 'simpf-a', 'sperf-a', 'splup-a']} />{!v.np && <TenseTable v={v} keys={['spres-p', 'simpf-p', 'sperf-p', 'splup-p']} />}</>} />
      </RefCard>
      <RefCard title="Imperatives">
        <Rules lines={[G_RULE.imp, 'Negative command: noli (sg.) / nolite (pl.) + infinitive: noli timere = don’t be afraid.']} />
        <VerbRef id="imp" keysFor={(v) => <Table head={['imperative', 'form']} rows={G.imperatives(v).map((x) => [x.label, x.cell.gold])} />} />
      </RefCard>
      <RefCard title="sum & possum">
        <Rules lines={[G_RULE.sum]} />
        {['sum', 'possum'].map((w) => <Table key={w} head={[w + ', ' + G.IRR[w].inf].concat(G.IRR_TENSES.map((k) => G.TENSES[k].label.replace(' active', '').replace(' subjunctive', ' subj.')))} rows={G.PERSONS.map((p, i) => [p].concat(G.IRR_TENSES.map((k) => G.IRR[w].t[k][i])))} />)}
      </RefCard>
      <RefCard title="When to use the subjunctive">
        <Rules lines={[
          'Purpose clause: ut + subjunctive (negative ne) = "in order to". Venit ut videret = he came to see.',
          'Indirect command: a verb of ordering or asking + ut / ne + subjunctive. Imperat eis ut veniant = he orders them to come.',
          'Who gets the order: impero, mando, persuadeo + dative. rogo, oro + accusative. postulo + ab + ablative. quaero + ex / ab + ablative.',
          'Result clause: a “so” word (tantus, tam, ita, tot, talis, sic) + ut + subjunctive. Negative is ut non, never ne.',
          'Indirect question: verb of asking / knowing / telling + question word (cur, ubi, quid, quot, num, utrum … an) + subjunctive.',
          'Cum clause: cum + subjunctive = when / since / although. tamen in the main clause signals “although”.',
          'Indirect statement uses no subjunctive: accusative subject + infinitive (dixit hostes venire).',
          'Sequence of tenses. Primary (present / future main verb): same time → present subj., time before → perfect subj. Secondary (past main verb): same time → imperfect subj., time before → pluperfect subj.',
          'Purpose clauses and indirect commands only use present (primary) or imperfect (secondary).',
          'Ablative absolute: noun + participle in the ablative, set apart from the sentence: urbe capta = the city having been captured.',
        ]} />
      </RefCard>
    </div>
  );
}
