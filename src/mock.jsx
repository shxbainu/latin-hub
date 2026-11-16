import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Timer, ArrowRight, Target, RotateCcw } from 'lucide-react';
import { Btn, Chip, Panel, CountUp, Diff, cx, EASE } from './ui.jsx';
import { Session } from './study.jsx';
import {
  SETS, SET, isLearned, rule3, verbOf, nounOf, CLOZE, grammarQ, TOPICS, TNAME, shuffle, entryText, PATTERNS, hasExtraForms, LESSON_NUMS, CLAUSE_NAME,
} from './model.js';
import { ASSESS, upcoming, nextAssessment, daysUntil } from './course.js';

function buildMock(store, cfg) {
  const pool = { le: [], el: [], gd: [], use: [], cloze: [] };
  const lessons = new Set(cfg.lessons);
  SETS.forEach((set) => {
    if (!lessons.has(set.n)) return;
    const doc = store.get(set.doc);
    set.cards.forEach((card) => {
      if ((doc.removed || {})[card.id]) return;
      const base = { setId: set.id, card, docName: set.doc };
      pool.le.push({ ...base, kind: 'le', key: card.id + '|le' });
      if (hasExtraForms(card)) pool.el.push({ ...base, kind: 'el', key: card.id + '|el' });
      if (rule3(card)) pool.gd.push({ ...base, kind: 'gd', key: card.id + '|gd' });
      if (isLearned(doc, card.id) && (verbOf(card) || nounOf(card))) pool.use.push({ ...base, kind: 'use', key: 'use|' + set.doc + ':' + card.id, docName: 'hub' });
    });
  });
  if (lessons.has(45)) CLOZE.forEach((cz) => pool.cloze.push({ kind: 'cloze', key: 'cz|' + cz.id, cz, setId: 'L45', card: SET.L45.cards.find((c) => c.id === cz.word), docName: 'hub' }));
  const n = cfg.n;
  const topics = cfg.grammar ? (cfg.topics && cfg.topics.length ? cfg.topics : TOPICS.map((t) => t[0])) : [];
  const nGram = topics.length ? (cfg.lessons.length ? Math.round(n * 0.3) : n) : 0;
  const share = { le: 0.36, el: 0.26, use: 0.14, gd: 0.1, cloze: 0.14 };
  let out = [];
  Object.keys(share).forEach((k) => { out = out.concat(shuffle(pool[k]).slice(0, Math.round((n - nGram) * share[k]))); });
  const extra = shuffle(Object.values(pool).flat().filter((x) => !out.includes(x)));
  while (out.length < n - nGram && extra.length) out.push(extra.shift());
  while (topics.length && out.length < n) {
    const t = topics[out.length % topics.length];
    out.push({ kind: 'gram', q: grammarQ(t, 'one'), topic: t, key: 'g' + Math.random() });
  }
  return shuffle(out).slice(0, n);
}

function describe(r) {
  const { item, q } = r;
  const typed = item.kind === 'gd' ? (r.picked || '—') : (r.values || []).filter(Boolean).join(', ') || '—';
  if (item.kind === 'le') return { prompt: item.card.forms[0], ask: 'meaning', typed, gold: item.card.meaning };
  if (item.kind === 'el') return { prompt: item.card.meaning, ask: 'whole entry', typed, gold: entryText(item.card) };
  if (item.kind === 'gd') return { prompt: item.card.forms[0] + ', ' + item.card.forms[1], ask: 'gender', typed, gold: item.card.gender };
  if (item.kind === 'cloze') return { prompt: item.cz.la, ask: item.cz.en, typed, gold: item.cz.ans[0] };
  if (q && q.choice) return { prompt: q.sentence.replace(/[\[\]]/g, ''), ask: q.ask, typed: r.pickedLabel || '—', gold: r.goldLabel || '' };
  if (q) return { prompt: q.head, ask: q.ask, typed, gold: (r.golds || []).join(', ') };
  return { prompt: '', ask: '', typed, gold: '' };
}

export function lessonText(ls) {
  const out = []; let a = null, b = null;
  [...ls].sort((x, y) => x - y).forEach((n) => { if (b != null && (n === b + 1 || (b === 18 && n === 20))) b = n; else { if (a != null) out.push(a === b ? a : a + '–' + b); a = b = n; } });
  if (a != null) out.push(a === b ? a : a + '–' + b);
  return out.join(', ');
}

function Clock({ start, limit }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = Math.floor((now - start) / 1000), over = limit && s > limit * 60;
  return <span className={cx('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular', over ? 'bg-warm-soft text-warm' : 'bg-sunken text-muted')}><Timer size={13} />{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}{limit ? ' / ' + limit + ':00' : ''}</span>;
}

export function Mock({ store, go, scope }) {
  const cfgFor = (a) => ({ scope: a ? a.id : 'custom', lessons: a ? a.lessons : [], topics: a ? a.topics || [] : [], grammar: !!(a && a.topics && a.topics.length), n: 15, timer: true });
  const [cfg, setCfg] = useState(() => cfgFor((scope && ASSESS.find((x) => x.id === scope)) || nextAssessment()));
  const [phase, setPhase] = useState('setup');
  const [items, setItems] = useState(null);
  const [result, setResult] = useState(null);
  const start = useRef(0);
  const canStart = cfg.lessons.length > 0 || cfg.grammar;

  function begin() { setItems(buildMock(store, cfg)); start.current = Date.now(); setPhase('run'); }
  function finish(log, ms) {
    const right = log.filter((r) => r.ok).length;
    store.update('hub', (h) => { h.mocks = (h.mocks || []).concat({ t: Date.now(), right, total: log.length, ms }).slice(-30); });
    setResult({ log, ms }); setPhase('results');
  }
  function practiceMisses() {
    const now = Date.now();
    result.log.filter((r) => !r.ok && r.item.docName).forEach((r) => {
      store.update(r.item.docName, (d) => { const bag = r.item.docName === 'hub' ? d.cards : d.v2.cards; if (bag[r.item.key]) bag[r.item.key] = { ...bag[r.item.key], due: now }; });
    });
    go({ page: 'today' });
  }

  if (phase === 'run') return (
    <Session store={store} items={items} title="Mock quiz · no hints until the end" mode="mock" onFinish={finish} onExit={(log, ms) => finish(log, ms)}
      header={<Clock start={start.current} limit={cfg.timer ? 10 : 0} />} />
  );

  if (phase === 'results') {
    const { log, ms } = result;
    const right = log.filter((r) => r.ok).length, pct = log.length ? Math.round((right / log.length) * 100) : 0;
    const cats = {}; log.forEach((r) => { if (r.diag) cats[r.diag.cat] = (cats[r.diag.cat] || 0) + 1; });
    return (
      <div className="flex flex-col gap-5">
        <Panel className="flex flex-wrap items-center gap-6 p-7">
          <div>
            <div className="text-[56px] font-bold leading-none tracking-tight"><CountUp to={right} /><span className="text-muted">/{log.length}</span></div>
            <div className="mt-1 text-sm text-muted">{pct}% · {Math.floor(ms / 60000)} min {Math.round((ms % 60000) / 1000)} s</div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-tight">{pct >= 90 ? 'Quiz-ready' : pct >= 70 ? 'Close. Fix the misses below.' : 'Worth another round today'}</h2>
            <div className="mt-2 flex flex-wrap gap-2">{Object.entries(cats).map(([c, n]) => <Chip key={c} tone="warm"><Target size={12} />{PATTERNS[c].label} · {n}</Chip>)}</div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {right < log.length && <Btn variant="primary" onClick={practiceMisses}>Practice my misses <ArrowRight size={16} /></Btn>}
            <Btn onClick={() => setPhase('setup')}><RotateCcw size={16} />New quiz</Btn>
          </div>
        </Panel>
        <motion.ul initial="h" animate="v" variants={{ v: { transition: { staggerChildren: 0.04 } } }} className="flex flex-col gap-2">
          {log.map((r, i) => {
            const d = describe(r);
            return (
              <motion.li key={i} variants={{ h: { opacity: 0, y: 8 }, v: { opacity: 1, y: 0 } }} transition={{ duration: 0.25, ease: EASE }}
                className={cx('grid gap-x-4 gap-y-1 rounded-xl border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]', r.ok ? 'border-line' : 'border-bad/40')}>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted">{i + 1}. {d.ask}</div>
                  <div lang="la" className="font-serif text-lg">{d.prompt}</div>
                </div>
                <div className="min-w-0">
                  {r.ok ? <div lang="la" className="font-serif text-lg text-good">{d.typed}</div> : (
                    <>
                      <div lang="la" className="font-serif text-lg text-bad line-through decoration-1">{d.typed}</div>
                      <div lang="la" className="font-serif text-lg font-semibold text-good"><Diff gold={d.gold} typed={d.typed === '—' ? '' : d.typed} /></div>
                      {r.diag && <div className="text-sm text-muted">{PATTERNS[r.diag.cat].label}: {r.diag.msg}</div>}
                    </>
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    );
  }

  const past = (store.get('hub').mocks || []).slice(-5);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Like the real thing · graded at the end</p>
        <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Mock quiz</h1>
      </header>
      <Panel className="flex flex-col gap-5 p-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-semibold">Practice for</legend>
          <div className="flex flex-wrap gap-2">
            {upcoming().filter((a) => a.kind !== 'map').slice(0, 5).map((a) => (
              <button key={a.id} type="button" aria-pressed={cfg.scope === a.id} onClick={() => setCfg({ ...cfgFor(a), n: cfg.n, timer: cfg.timer })}
                className={cx('rounded-full border px-3.5 py-2 text-sm font-semibold', cfg.scope === a.id ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted hover:text-ink')}>
                {a.title} · {daysUntil(a) === 0 ? 'today' : daysUntil(a) === 1 ? 'tomorrow' : 'in ' + daysUntil(a) + ' d'}
              </button>
            ))}
            <button type="button" aria-pressed={cfg.scope === 'custom'} onClick={() => setCfg({ ...cfg, scope: 'custom' })}
              className={cx('rounded-full border px-3.5 py-2 text-sm font-semibold', cfg.scope === 'custom' ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted hover:text-ink')}>Pick lessons</button>
          </div>
        </fieldset>
        {cfg.scope === 'custom' && (
          <div className="flex flex-wrap gap-1.5">
            {LESSON_NUMS.map((n) => {
              const on = cfg.lessons.includes(n);
              return <button key={n} type="button" aria-pressed={on} onClick={() => setCfg({ ...cfg, lessons: on ? cfg.lessons.filter((x) => x !== n) : cfg.lessons.concat(n).sort((a, b) => a - b) })}
                className={cx('h-9 w-10 rounded-lg text-sm font-semibold tabular', on ? 'bg-accent text-accent-ink' : 'bg-sunken text-muted hover:text-ink')}>{n}</button>;
            })}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">{cfg.lessons.length ? 'Vocab: Lessons ' + lessonText(cfg.lessons) : 'No vocab'}</span>
          <button type="button" aria-pressed={cfg.grammar} onClick={() => setCfg({ ...cfg, grammar: !cfg.grammar })}
            className={cx('rounded-full border px-3 py-1.5 text-[13px] font-semibold', cfg.grammar ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted')}>
            Grammar{cfg.grammar && cfg.topics.length ? ': ' + cfg.topics.map((t) => TNAME[t]).join(', ') : ''}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2 text-sm font-semibold">Questions
            {[10, 15, 20].map((n) => <button key={n} type="button" onClick={() => setCfg({ ...cfg, n })} className={cx('rounded-lg px-3 py-1.5 tabular', cfg.n === n ? 'bg-accent text-accent-ink' : 'bg-sunken text-muted')}>{n}</button>)}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={cfg.timer} onChange={(e) => setCfg({ ...cfg, timer: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--accent))]" />10-minute target</label>
        </div>
        <div><Btn variant="primary" size="lg" disabled={!canStart} onClick={begin}>Start the quiz <ArrowRight size={18} /></Btn></div>
        <p className="text-sm text-muted">Every word in those lessons, learned or not, mixed like the real thing: meanings, whole entries, genders{cfg.grammar ? ', forms and clauses' : ''}. No hints or answers until you finish. Misses go straight into your reviews.</p>
      </Panel>
      {past.length > 0 && (
        <Panel className="flex flex-wrap items-center gap-3 p-5">
          <span className="text-sm font-semibold">Recent scores</span>
          {past.map((m, i) => <Chip key={i} tone={m.right / m.total >= 0.9 ? 'good' : 'plain'}>{m.right}/{m.total}</Chip>)}
        </Panel>
      )}
    </div>
  );
}
