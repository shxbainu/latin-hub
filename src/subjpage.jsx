import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Target, X } from 'lucide-react';
import { Btn, Chip, Kbd, Panel, Field, DrawCheck, cx, EASE, SPRING } from './ui.jsx';
import { Choice, Legend } from './free.jsx';
import { gCheck, diagnose, grade, PATTERNS } from './model.js';
import { SUBJ_TENSES, SUBJ_VOICES, SUBJ_VERBS, SUBJ_DEFAULT, subjQ, diagnoseIrr, IRR_GUIDE_ORDER, irregGuide } from './subj.js';

const Lat = ({ children, className }) => <span lang="la" className={cx('font-serif', className)}>{children}</span>;

/* ---------- the guide, from the notebook pages ---------- */
function Row({ left, right, sub }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-line/70 py-1.5 last:border-b-0">
      <p className="min-w-0 flex-1 text-[14px] leading-snug">{left}</p>
      <p className="shrink-0 text-right text-[14px] font-semibold leading-snug text-accent">{right}{sub && <span className="block text-[12px] font-normal text-muted">{sub}</span>}</p>
    </div>
  );
}

function Mnemonic({ words }) {
  // "We beat a liar": the vowel you add after the stem, one word per conjugation.
  return (
    <div className="grid grid-cols-4 gap-1.5 text-center">
      {words.map(([pre, vow, post, tag]) => (
        <div key={tag} className="rounded-lg bg-sunken px-1 py-2">
          <p className="font-serif text-[16px] leading-none">{pre}<span className="font-semibold text-accent underline decoration-accent/40 underline-offset-[3px]">{vow}</span>{post}</p>
          <p className="mt-1.5 text-[11px] leading-tight text-muted">{tag}</p>
        </div>
      ))}
    </div>
  );
}

function Ends({ title, ends }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</p>
      <div className="grid grid-cols-2 gap-x-3 font-serif text-[16px] tabular">
        {ends.map((e, i) => <span key={i}>-{e}</span>)}
      </div>
    </div>
  );
}

function Build({ title, rule, ex }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</p>
      <p className="mt-1.5 text-[13.5px] leading-snug">{rule}</p>
      <Lat className="mt-1.5 block text-[17px] font-semibold text-accent">{ex}</Lat>
    </div>
  );
}

const SPOT = [
  ['doceretur', 'imperfect subjunctive passive, 3rd sg., doceo'],
  ['afficiantur', 'present subjunctive passive, 3rd pl., afficio'],
  ['impedias', 'present subjunctive active, 2nd sg., impedio'],
  ['caperemini', 'imperfect subjunctive passive, 2nd pl., capio'],
  ['custodiantur', 'present subjunctive passive, 3rd pl., custodio'],
  ['caveret', 'imperfect subjunctive active, 3rd sg., caveo'],
];

function Irregulars() {
  const [id, setId] = useState('sum');
  const g = irregGuide(id);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {IRR_GUIDE_ORDER.map((x) => (
          <button key={x} type="button" aria-pressed={x === id} onClick={() => setId(x)} lang="la"
            className={cx('rounded-full border px-2.5 py-0.5 font-serif text-[15px]', x === id ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted hover:text-ink')}>{x}</button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: EASE }} className="flex flex-col gap-2">
          <p className="text-[14px]"><Lat className="text-[17px] font-semibold">{g.parts}</Lat> <span className="text-muted">· {g.meaning}</span></p>
          <dl className="flex flex-col">
            {g.rows.map(([label, forms]) => (
              <div key={label} className="grid grid-cols-[82px_minmax(0,1fr)] gap-x-2 border-b border-line/70 py-1.5 last:border-b-0">
                <dt className="text-[12px] font-semibold leading-snug text-muted">{label}</dt>
                <dd lang="la" className="font-serif text-[15.5px] leading-snug">{forms.join(', ')}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[13px] leading-snug text-muted">{g.rule}</p>
        </motion.div>
      </AnimatePresence>
      <p className="text-[12.5px] leading-snug text-muted">Compounds follow their base verb: <Lat>absum, adsum, desum, praesum</Lat> (sum) · <Lat>adeo, exeo, redeo, transeo, ineo</Lat> (eo) · <Lat>adfero, confero, infero, refero, defero</Lat> (fero).</p>
    </div>
  );
}

function SpotList() {
  const [open, setOpen] = useState({});
  return (
    <ul className="flex flex-col">
      {SPOT.map(([w, p]) => (
        <li key={w} className="border-b border-line/70 last:border-b-0">
          <button type="button" onClick={() => setOpen((o) => ({ ...o, [w]: !o[w] }))} aria-expanded={!!open[w]} className="flex w-full flex-col items-start py-1.5 text-left">
            <Lat className="text-[17px]">{w}</Lat>
            <AnimatePresence initial={false}>
              {open[w] && <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: EASE }} className="overflow-hidden text-[13px] text-muted">{p}</motion.span>}
            </AnimatePresence>
          </button>
        </li>
      ))}
    </ul>
  );
}

function GuideBody() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <Legend num="I">Which tense</Legend>
        <Row left="Present or future main verb" right="present subjunctive" />
        <Row left="Imperfect, perfect or pluperfect main verb" right="imperfect subjunctive" />
      </section>

      <section>
        <Legend num="II">What sets it off</Legend>
        <Row left="Verb of motion" right="ut / ne" sub="purpose" />
        <Row left="Verb of commanding, persuading, encouraging" right="ut / ne" />
        <Row left={<>Fear words, <span className="text-muted">“I’m afraid …”</span></>} right="ne" />
        <Row left={<>Fear words, <span className="text-muted">“I’m afraid he won’t”</span></>} right="ut / ne non" />
        <Row left="Result" right="ut / ut non" />
      </section>

      <section>
        <Legend num="III">Present &amp; imperfect</Legend>
        <p className="mb-2 text-[13.5px] leading-snug text-muted">Present: stem vowel + endings. Imperfect: 2nd principal part + endings. Shown in the 1st pl.</p>
        <div className="mb-3 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-[15px]">
            <thead><tr className="bg-sunken text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted"><th className="px-3 py-1.5">Verb</th><th className="px-3 py-1.5">Present</th><th className="px-3 py-1.5">Imperfect</th></tr></thead>
            <tbody lang="la" className="font-serif text-[16px]">
              {[['amo', 'amemus', 'amaremus'], ['video', 'videamus', 'videremus'], ['peto', 'petamus', 'peteremus'], ['facio', 'faciamus', 'faceremus'], ['audio', 'audiamus', 'audiremus']].map(([a, b, c]) => (
                <tr key={a} className="border-t border-line/70"><td className="px-3 py-1">{a}</td><td className="px-3 py-1">{b}</td><td className="px-3 py-1">{c}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">The vowel in the present</p>
        <div className="flex flex-col gap-1.5">
          <Mnemonic words={[['W', 'e', '', '1st'], ['b', 'ea', 't', '2nd'], ['', 'a', '', '3rd'], ['l', 'ia', 'r', '3rd -io, 4th']]} />
          <Mnemonic words={[['Th', 'e', '', '1st'], ['b', 'ea', 'r', '2nd'], ['gr', 'a', 'bs', '3rd'], ['Br', 'ia', 'n', '3rd -io, 4th']]} />
        </div>
        <p className="mt-1.5 text-[12.5px] text-muted">“We beat a liar” / “The bear grabs Brian”</p>
        <div className="mt-4 flex gap-5">
          <Ends title="Active" ends={['m', 'mus', 's', 'tis', 't', 'nt']} />
          <Ends title="Passive" ends={['r', 'mur', 'ris', 'mini', 'tur', 'ntur']} />
        </div>
      </section>

      <section>
        <Legend num="IV">Perfect &amp; pluperfect</Legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <Build title="Perfect active" rule={<>3rd principal part stem + <span className="whitespace-nowrap">-erim,</span> <span className="whitespace-nowrap">-eris,</span> <span className="whitespace-nowrap">-erit…</span> (same as the future perfect)</>} ex="rexerit" />
          <Build title="Pluperfect active" rule={<>3rd principal part stem + <span className="whitespace-nowrap">-isse</span> + endings (perfect infinitive + <span className="whitespace-nowrap">-m, -s, -t…</span>)</>} ex="rexisset" />
          <Build title="Perfect passive" rule="4th principal part + present subjunctive of sum" ex="captus sit" />
          <Build title="Pluperfect passive" rule="4th principal part + imperfect subjunctive of sum" ex="captus esset" />
        </div>
      </section>

      <section>
        <Legend num="V">Irregular verbs</Legend>
        <Irregulars />
      </section>

      <section>
        <Legend num="VI" aside={<span className="text-[12px] text-muted">tap to parse</span>}>Spot the form</Legend>
        <SpotList />
      </section>
    </div>
  );
}

function Guide() {
  const [open, setOpen] = useState(false);
  return (
    <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-left text-[15px] font-semibold lg:hidden">
        Guide from your notes
        <motion.span className="ml-auto text-muted" animate={{ rotate: open ? 180 : 0 }} transition={SPRING}><ChevronDown size={16} /></motion.span>
      </button>
      <div className={cx(open ? 'mt-3 block' : 'hidden', 'lg:mt-0 lg:block')}>
        <Panel className="p-5 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <div className="mb-4 hidden items-baseline justify-between lg:flex">
            <h2 className="font-serif text-[24px] font-medium leading-none tracking-tight">Guide</h2>
            <span className="text-[12px] text-muted">from your notes</span>
          </div>
          <GuideBody />
        </Panel>
      </div>
    </aside>
  );
}

/* ---------- practice ---------- */
const SETTINGS = [['Tense', 'tense', SUBJ_TENSES], ['Voice', 'voice', SUBJ_VOICES], ['Verbs', 'verbs', SUBJ_VERBS]];

export function Subjunctive({ store }) {
  const [cfg, setCfg] = useState(() => ({ ...SUBJ_DEFAULT, ...(store.get('hub').subjCfg || {}) }));
  const [n, setN] = useState(0);
  const [q, setQ] = useState(() => subjQ(cfg, null));
  const [val, setVal] = useState('');
  const [res, setRes] = useState(null);
  const [tally, setTally] = useState({ ok: 0, n: 0 });
  const inp = useRef(null);
  useEffect(() => { if (inp.current) inp.current.focus(); }, [n]);

  function set(p) {
    const c = { ...cfg, ...p };
    setCfg(c);
    store.update('hub', (h) => { h.subjCfg = c; });
    setQ(subjQ(c, null)); setVal(''); setRes(null); setN((x) => x + 1);
  }
  function finish(ok, diag, typed) {
    grade(store, { kind: 'gram', topic: 'subj', q: { head: q.head, topic: 'subj' } }, ok ? 3 : 1, diag);
    setRes({ ok, diag, typed });
    setTally((t) => ({ ok: t.ok + (ok ? 1 : 0), n: t.n + 1 }));
  }
  function check() {
    if (res || !val.trim()) return;
    const ok = gCheck(q.cell, val);
    finish(ok, ok ? null : q.irr ? diagnoseIrr(q, val) : diagnose(null, q, val), val);
  }
  function next() { setQ(subjQ(cfg, q.head)); setVal(''); setRes(null); setN((x) => x + 1); }
  const also = q.cell.ok.filter((x) => x !== q.cell.gold);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">One verb, one form · type it · no macrons needed</p>
        <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Subjunctive</h1>
      </header>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            {SETTINGS.map(([label, k, opts]) => (
              <div key={k} className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <span className="w-12 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
                <Choice id={'subj-' + k} label={label} value={cfg[k]} onChange={(v) => set({ [k]: v })} options={opts} />
              </div>
            ))}
          </div>

          <Panel className="p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="accent">Grammar</Chip>
                  <Chip>Subjunctive</Chip>
                  <Chip>{q.conj}</Chip>
                  <span className="ml-auto text-xs text-muted tabular" aria-live="polite">{tally.n ? tally.ok + ' of ' + tally.n + ' right this visit' : ''}</span>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={n} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: EASE }} className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span lang="la" className="font-serif text-[clamp(40px,8vw,62px)] font-medium leading-none">{q.head}</span>
                      <span lang="la" className="font-serif text-lg text-muted">{q.parts.split(', ').slice(1).join(', ')} · {q.meaning}</span>
                    </div>
                    <p className="text-lg font-medium">Give the <span className="text-accent">{q.ask}</span>.</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <form autoComplete="off" noValidate onSubmit={(e) => { e.preventDefault(); if (res) next(); else check(); }} className="flex flex-col gap-4">
                <Field ref={inp} id="subj-answer" label="Your answer" big value={val} onChange={(e) => setVal(e.target.value)}
                  readOnly={!!res} state={res ? (res.ok ? 'ok' : 'bad') : null} gold={q.cell.gold} typed={val} />
                {!res && (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Btn variant="primary" type="submit" disabled={!val.trim()}>Check</Btn>
                    <Btn variant="ghost" onClick={() => finish(false, null, '')}>I don’t know</Btn>
                  </div>
                )}
              </form>

              <AnimatePresence>
                {res && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex flex-col gap-3">
                    <div className={cx('flex items-center gap-2 text-sm font-bold uppercase tracking-wide', res.ok ? 'text-good' : 'text-bad')}>
                      {res.ok ? <DrawCheck size={20} /> : <X size={18} strokeWidth={2.6} />}
                      {res.ok ? 'Correct' : 'Not quite'}
                    </div>
                    {also.length > 0 && <p lang="la" className="text-sm text-muted">Also accepted: <span className="font-serif text-lg text-ink">{also.join(', ')}</span></p>}
                    {res.diag && (
                      <div className="flex items-start gap-3 rounded-xl bg-sunken px-4 py-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warm-soft text-warm"><Target size={16} /></span>
                        <p className="text-[15px] leading-relaxed"><strong className="font-semibold">{PATTERNS[res.diag.cat].label}.</strong> {res.diag.msg}</p>
                      </div>
                    )}
                    {!res.ok && <p className="rounded-xl bg-accent-soft/60 px-4 py-3 text-[15px] leading-relaxed"><strong className="font-semibold">Rule.</strong> {q.rule}</p>}
                    {!res.ok && <p lang="la" className="text-sm text-muted">Whole tense: {q.full.map((c) => c.gold).join(', ')}</p>}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Btn variant="primary" onClick={next}>Next <ArrowRight size={16} /></Btn>
                      <span className="ml-auto hidden text-xs text-muted sm:inline"><Kbd>Enter</Kbd> next</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Panel>
        </div>
        <Guide />
      </div>
    </div>
  );
}
