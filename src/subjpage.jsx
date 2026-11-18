import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Target, X } from 'lucide-react';
import { Btn, Chip, Kbd, Panel, Field, DrawCheck, Choice, cx, EASE, SPRING } from './ui.jsx';
import { gCheck, diagnose, grade, PATTERNS } from './model.js';
import { SUBJ_TENSES, SUBJ_VOICES, SUBJ_VERBS, SUBJ_DEFAULT, subjQ, diagnoseIrr, irregGuide } from './subj.js';

const Lat = ({ children, className }) => <span lang="la" className={cx('font-serif', className)}>{children}</span>;

/* ---------- the guide ---------- */
function Head({ n, children }) {
  return (
    <p className="mb-1.5 flex items-baseline gap-2 border-b border-line pb-1">
      <span className="font-serif text-[15px] text-accent">{n}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{children}</span>
    </p>
  );
}
function Row({ left, right }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/70 py-1 text-[14px] last:border-b-0">
      <span>{left}</span><span className="shrink-0 font-semibold text-accent">{right}</span>
    </div>
  );
}
// Each tense: how it is built, then the active and passive 3rd sg. of laudo.
const BUILD = [
  ['Present', 'stem + vowel + endings', 'laudet', 'laudetur'],
  ['Imperfect', 'infinitive + endings', 'laudaret', 'laudaretur'],
  ['Perfect', 'perfect stem + erim · 4th part + sim', 'laudaverit', 'laudatus sit'],
  ['Pluperfect', 'perfect stem + issem · 4th part + essem', 'laudavisset', 'laudatus esset'],
];
const POSSUM = 'possim, possem · potuerim, potuissem';

function GuideBody() {
  const sum = irregGuide('sum');
  return (
    <div className="flex flex-col gap-3.5">
      <section>
        <Head n="I">When</Head>
        <Row left="Present or future main verb" right="present" />
        <Row left="Past main verb (imperfect, perfect, pluperfect)" right="imperfect" />
        <Row left="Motion, command, persuade, encourage" right="ut / ne" />
        <Row left={<>Fear <Lat className="text-muted">“I’m afraid …”</Lat></>} right="ne" />
        <Row left={<>Fear <Lat className="text-muted">“I’m afraid he won’t”</Lat></>} right="ut / ne non" />
        <Row left="Result" right="ut / ut non" />
      </section>

      <section>
        <Head n="II">How to build it</Head>
        <div className="overflow-hidden rounded-lg border border-line text-[13px] leading-snug">
          <div className="grid grid-cols-[80px_1fr_84px_112px] bg-sunken text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">
            <span className="px-2 py-1" /><span className="px-2 py-1">Build</span><span className="px-2 py-1">Active</span><span className="px-2 py-1">Passive</span>
          </div>
          {BUILD.map(([t, r, ae, pe]) => (
            <div key={t} className="grid grid-cols-[80px_1fr_84px_112px] items-center border-t border-line/70">
              <span className="px-2 py-1.5 font-semibold text-muted">{t}</span>
              <span className="px-2 py-1.5">{r}</span>
              <Lat className="px-2 py-1.5 text-[15.5px] font-semibold text-accent">{ae}</Lat>
              <Lat className="px-2 py-1.5 text-[15.5px] font-semibold text-accent">{pe}</Lat>
            </div>
          ))}
        </div>
        <div className="mt-2 grid gap-0.5 text-[14px]">
          <p><span className="inline-block w-[72px] text-[13px] font-semibold text-muted">Vowel</span><Lat className="text-[16px]"><b className="text-accent">e · ea · a · ia</b></Lat> <span className="text-muted">“We beat a liar”</span></p>
          <p><span className="inline-block w-[72px] text-[13px] font-semibold text-muted">Endings</span><Lat className="text-[15.5px]">-m -s -t -mus -tis -nt</Lat></p>
          <p><span className="inline-block w-[72px]" /><Lat className="text-[15.5px]">-r -ris -tur -mur -mini -ntur</Lat></p>
        </div>
      </section>

      <section>
        <Head n="III">sum &amp; possum</Head>
        <dl className="text-[14px]">
          {sum.rows.map(([label, forms]) => (
            <div key={label} className="grid grid-cols-[72px_1fr] border-b border-line/70 py-1">
              <dt className="text-[13px] font-semibold text-muted">{label}</dt>
              <dd lang="la" className="font-serif text-[15.5px] leading-snug">{forms.join(', ')}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-1.5 text-[14px]"><Lat className="font-semibold">possum</Lat> = pos- / potu- + sum: <Lat className="text-[15.5px]">{POSSUM}</Lat></p>
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
        Guide
        <motion.span className="ml-auto text-muted" animate={{ rotate: open ? 180 : 0 }} transition={SPRING}><ChevronDown size={16} /></motion.span>
      </button>
      <div className={cx(open ? 'mt-3 block' : 'hidden', 'lg:mt-0 lg:block')}>
        <Panel className="p-5 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <GuideBody />
        </Panel>
      </div>
    </aside>
  );
}

/* ---------- practice ---------- */
const SETTINGS = [['Tense', 'tense', SUBJ_TENSES], ['Voice', 'voice', SUBJ_VOICES], ['Verbs', 'verbs', SUBJ_VERBS]];

export function Subjunctive({ store, embedded }) {
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
      {!embedded && (
        <header>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">One verb, one form · type it · no macrons needed</p>
          <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Subjunctive</h1>
        </header>
      )}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px]">
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
