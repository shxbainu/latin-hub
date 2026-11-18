import React, { useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Btn, Panel, Choice, Legend, cx } from './ui.jsx';
import { Session, Summary } from './study.jsx';
import { LESSON_NUMS, TNAME, FREE_DEFAULT, freePool, freeCounts, freeBatch } from './model.js';
import { upcoming, nextAssessment, dateOf } from './course.js';
import { lessonText } from './mock.jsx';
import { GROUPS } from './grammar.jsx';

const DIRS = [['mixed', 'Mixed'], ['le', 'Latin → English'], ['el', 'English → Latin'], ['fm', 'Forms & gender']];
const DIR_TEXT = {
  mixed: 'Meanings, whole entries, forms and genders, shuffled together like a real quiz.',
  le: 'See the Latin word, type the English.',
  el: 'See the English, type the whole Latin entry: every form and the gender.',
  fm: 'See the first form, type the rest of the entry and the gender.',
};
const COUNTS = [[10, '10'], [20, '20'], [50, '50'], ['all', 'All'], ['endless', 'Endless']];

export function Free({ store, go, initial }) {
  const saved = store.get('hub').free || {};
  const start0 = () => {
    const base = { ...FREE_DEFAULT, ...saved };
    if (initial && initial.length) return { ...base, lessons: initial };
    if (!base.lessons.length) { const a = nextAssessment(); if (a && a.lessons.length) return { ...base, lessons: a.lessons }; }
    return base;
  };
  const [cfg, setCfg] = useState(start0);
  const [phase, setPhase] = useState('setup');
  const [items, setItems] = useState(null);
  const [summary, setSummary] = useState(null);
  const set = (p) => setCfg((c) => ({ ...c, ...p }));

  const pool = freePool(store, cfg);
  const counts = freeCounts(cfg, pool.length);
  const total = counts.v + counts.g;
  const canStart = cfg.n === 'endless' ? pool.length > 0 || cfg.topics.length > 0 : total > 0;
  const hasGrammar = cfg.topics.length > 0;

  function begin() {
    store.update('hub', (h) => { h.free = { ...cfg }; });
    setItems(freeBatch(store, cfg, counts.v, counts.g));
    setPhase('run');
  }
  const more = cfg.n === 'endless' ? () => freeBatch(store, cfg, counts.v, counts.g) : undefined;

  if (phase === 'run') {
    return (
      <Session store={store} items={items} more={more} title={'Free practice' + (cfg.track ? '' : ' · schedule untouched')}
        onExit={(log, ms) => { if (Array.isArray(log) && log.length) { setSummary({ log, ms }); setPhase('summary'); } else setPhase('setup'); }} />
    );
  }
  if (phase === 'summary') {
    return (
      <Summary log={summary.log} ms={summary.ms} onExit={() => setPhase('setup')}
        extra={<Btn onClick={begin}><RotateCcw size={16} />Go again, same settings</Btn>} />
    );
  }

  const upc = upcoming().filter((a) => a.lessons.length).slice(0, 3);
  const toggleLesson = (n) => set({ lessons: cfg.lessons.includes(n) ? cfg.lessons.filter((x) => x !== n) : cfg.lessons.concat(n).sort((a, b) => a - b) });
  const toggleTopic = (t) => set({ topics: cfg.topics.includes(t) ? cfg.topics.filter((x) => x !== t) : cfg.topics.concat(t) });
  const quick = 'rounded-full border border-line px-3 py-1 text-[13px] font-semibold text-muted hover:border-accent/50 hover:text-ink';

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Any words, any direction · not limited to what’s due</p>
        <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Free practice</h1>
      </header>
      <Panel className="flex flex-col gap-7 p-6">
        <section>
          <Legend num="1" aside={<span className="text-[13px] text-muted tabular">{cfg.lessons.length ? 'Lessons ' + lessonText(cfg.lessons) : 'None picked'}</span>}>Lessons</Legend>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {upc.map((a) => <button key={a.id} type="button" className={quick} onClick={() => set({ lessons: a.lessons })}>{a.title} · {dateOf(a).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</button>)}
            <button type="button" className={quick} onClick={() => set({ lessons: LESSON_NUMS.slice() })}>All lessons</button>
            <button type="button" className={quick} onClick={() => set({ lessons: [] })}>Clear</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LESSON_NUMS.map((n) => {
              const on = cfg.lessons.includes(n);
              return <button key={n} type="button" aria-pressed={on} onClick={() => toggleLesson(n)}
                className={cx('h-9 w-10 rounded-lg text-sm font-semibold tabular', on ? 'bg-accent text-accent-ink' : 'bg-sunken text-muted hover:text-ink')}>{n}</button>;
            })}
          </div>
        </section>

        <section>
          <Legend num="2" aside={<button type="button" className="text-[13px] font-semibold text-accent" onClick={() => set({ topics: hasGrammar ? [] : GROUPS.flatMap((g) => g[2]) })}>{hasGrammar ? 'Clear' : 'Select all'}</button>}>Grammar topics, optional</Legend>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {GROUPS.map(([num, name, ids]) => (
              <div key={name} className="min-w-0">
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted"><span className="mr-1.5 font-serif text-[13px] normal-case tracking-normal text-accent">{num}</span>{name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ids.map((id) => {
                    const on = cfg.topics.includes(id);
                    return <button key={id} type="button" aria-pressed={on} onClick={() => toggleTopic(id)}
                      className={cx('rounded-full border px-3 py-1 font-serif text-[15px]', on ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted hover:text-ink')}>{TNAME[id]}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-7 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section>
            <Legend num="3">Ask me</Legend>
            <Choice id="free-dir" label="Direction" value={cfg.dir} onChange={(dir) => set({ dir })} options={DIRS} />
            <p className="mt-2.5 max-w-prose text-sm text-muted">{DIR_TEXT[cfg.dir]}{hasGrammar ? ' Grammar questions are mixed in.' : ''}</p>
          </section>
          <section>
            <Legend num="4">How many</Legend>
            <Choice id="free-n" label="Questions" value={cfg.n} onChange={(n) => set({ n })} options={COUNTS.map(([k, l]) => [k, l])} />
            <p className="mt-2.5 text-sm text-muted">{cfg.n === 'endless' ? 'Keeps going until you press End.' : cfg.n === 'all' ? 'Every word once.' : 'Words repeat only if you miss them.'}</p>
          </section>
        </div>

        <section className="flex flex-col gap-2.5 text-[15px]">
          <label className="flex items-start gap-2.5"><input type="checkbox" checked={cfg.unlearned} onChange={(e) => set({ unlearned: e.target.checked })} className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]" />
            <span><span className="font-semibold">Include words I haven’t learned yet.</span> <span className="text-muted">Off = only words you’ve already learned.</span></span></label>
          <label className="flex items-start gap-2.5"><input type="checkbox" checked={cfg.track} onChange={(e) => set({ track: e.target.checked })} className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]" />
            <span><span className="font-semibold">Count my answers toward my review schedule.</span> <span className="text-muted">Off (default) = pure practice: nothing in your schedule or progress changes. Mistakes still show up in Trouble words.</span></span></label>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <Btn variant="primary" size="lg" disabled={!canStart} onClick={begin}>
            {cfg.n === 'endless' ? 'Start · endless' : 'Start · ' + total + ' question' + (total === 1 ? '' : 's')} <ArrowRight size={18} />
          </Btn>
          <span className="text-sm text-muted">{pool.length} word{pool.length === 1 ? '' : 's'}{hasGrammar ? ' + ' + cfg.topics.length + ' grammar topic' + (cfg.topics.length === 1 ? '' : 's') : ''}{pool.length === 0 && cfg.lessons.length > 0 && !cfg.unlearned ? ' · none learned yet in those lessons' : ''}</span>
        </div>
      </Panel>
    </div>
  );
}
