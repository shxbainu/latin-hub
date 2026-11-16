import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, BookOpen, Timer, MapPin, ChevronDown, Info, Check, Lock } from 'lucide-react';
import { Btn, Chip, Panel, Ring, cx, EASE, SPRING } from './ui.jsx';
import { Session } from './study.jsx';
import { readiness, prepItems, TNAME, setOfLesson } from './model.js';
import { Learn } from './setview.jsx';
import { ASSESS, KIND_NAME, daysUntil, dateOf, deadlineMs, nextAssessment } from './course.js';
import { lessonText } from './mock.jsx';

const fmt = (a) => dateOf(a).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
export const whenText = (d) => (d === 0 ? 'today' : d === 1 ? 'tomorrow' : d < 0 ? (d === -1 ? 'yesterday' : -d + ' days ago') : 'in ' + d + ' days');

export function readyOf(store, a) {
  if (!a.lessons.length) return null;
  return readiness(store, a.lessons, Math.max(Date.now(), deadlineMs(a) + 6 * 3600000));
}

// One assessment: what it covers, how ready you are, and what to do about it.
export function AssessmentCard({ store, a, go, onPrep, big }) {
  const d = daysUntil(a), r = readyOf(store, a);
  const past = d < 0;
  return (
    <Panel className={cx('flex flex-col gap-3', big ? 'p-6' : 'p-5', past && 'opacity-70')}>
      <div className="flex flex-wrap items-start gap-4">
        {r && r.pct != null && !past && (
          <div className="relative shrink-0">
            <Ring value={r.pct} max={100} size={big ? 64 : 52} stroke={6} label={r.pct + '% ready'} />
            <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold tabular">{r.pct}%</span>
          </div>
        )}
        <div className="min-w-0 flex-1 basis-[200px]">
          <p className={cx('text-[13px] font-semibold', d <= 2 && !past ? 'text-warm' : 'text-muted')}>{fmt(a)} · {whenText(d)}</p>
          <h3 className={cx('font-bold tracking-tight', big ? 'text-xl' : 'text-[17px]')}>{a.title}</h3>
          {a.covers && <p className="text-sm text-muted">{a.covers}</p>}
          {(a.lessons.length > 0 || (a.topics || []).length > 0) && (
            <dl className="mt-2.5 flex flex-col gap-1 border-l-2 border-accent/25 pl-3">
              {a.lessons.length > 0 && <div className="flex gap-3"><dt className="w-[62px] shrink-0 pt-[5px] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">Vocab</dt><dd className="min-w-0 font-serif text-[16px] leading-snug">Lessons {lessonText(a.lessons)}</dd></div>}
              {(a.topics || []).length > 0 && <div className="flex gap-3"><dt className="w-[62px] shrink-0 pt-[5px] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">Grammar</dt>
                <dd className="min-w-0 font-serif text-[16px] leading-snug">{a.topics.map((t, i) => <span key={t} className="inline-block">{TNAME[t]}{i < a.topics.length - 1 && <span className="px-1.5 text-accent/60">·</span>}</span>)}</dd></div>}
            </dl>
          )}
          {a.guess && !past && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted"><Info size={13} />{a.guess}</p>}
        </div>
      </div>
      {!past && a.kind !== 'map' && (
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant={big ? 'primary' : 'soft'} size="sm" onClick={() => onPrep(a)}>Prep plan <ArrowRight size={15} /></Btn>
          {a.lessons.length > 0 && <Btn size="sm" variant="ghost" onClick={() => go({ page: 'set', unit: 'a:' + a.id })}><BookOpen size={15} />Words</Btn>}
          <Btn size="sm" variant="ghost" onClick={() => go({ page: 'mock', scope: a.id })}><Timer size={15} />Mock</Btn>
          {r && r.unl > 0 && <span className="text-[13px] font-semibold text-warm">{r.unl} not learned yet</span>}
        </div>
      )}
      {a.kind === 'map' && !past && <p className="flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} />Not in the hub: use the map handout.</p>}
    </Panel>
  );
}

// The prep plan: what to do, in order, to be ready for one assessment.
export function PrepSession({ store, a, onExit, go }) {
  const [view, setView] = useState('plan');
  const [items, setItems] = useState(null);
  const unit = { key: 'a:' + a.id, title: a.title, sub: a.lessons.length ? 'Lessons ' + lessonText(a.lessons) : '', sets: a.lessons.map(setOfLesson).filter(Boolean) };
  const back = () => { setView('plan'); setItems(null); };
  if (view === 'session') return <Session store={store} items={items} title={'Prep · ' + a.title} onExit={back} emptyText="Nothing to drill yet." />;
  if (view === 'learn') {
    return (
      <div className="flex flex-col gap-5">
        <button type="button" onClick={back} className="flex items-center gap-1 self-start text-[13px] font-semibold text-accent hover:underline"><ArrowLeft size={15} />Back to the plan</button>
        <h1 className="font-serif text-[34px] font-medium leading-none tracking-tight">Step 1 · Learn the new words</h1>
        <Learn store={store} unit={unit} onPractice={back} />
      </div>
    );
  }
  const d = daysUntil(a), r = readyOf(store, a);
  const topics = a.topics || [];
  const hasVocab = a.lessons.length > 0;
  const steps = [];
  if (hasVocab) {
    steps.push({
      title: 'Learn the new words',
      body: r.unl ? r.unl + ' of ' + r.n + ' words are new to you. You meet them 5 at a time: read each one, match them up, then type them from memory.' : 'All ' + r.n + ' words are learned.',
      done: r.unl === 0, meter: r.n ? r.learned / r.n : 0, meterText: r.learned + ' / ' + r.n + ' learned',
      action: r.unl ? ['Learn the next 5', () => setView('learn')] : null,
    });
    steps.push({
      title: 'Drill the ones you’d forget',
      body: r.learned ? 'Type the meaning, forms and gender for the 20 learned words you’re most likely to forget by ' + fmt(a) + '. Misses come back until they stick.' : 'Unlocks once you’ve learned a few words in step 1.',
      done: r.pct != null && r.pct >= 90 && r.unl === 0, locked: !r.learned, meter: r.pct != null ? r.pct / 100 : 0, meterText: (r.pct || 0) + '% likely remembered on the day',
      action: r.learned ? ['Drill 20 words', () => { setItems(prepItems(store, { ...a, topics: [] })); setView('session'); }] : null,
    });
  }
  if (topics.length) {
    steps.push({
      title: 'Practice the grammar',
      body: 'Mixed questions on ' + topics.map((t) => TNAME[t].toLowerCase()).join(', ') + '. Every answer shows its rule.',
      action: ['Start 10 questions', () => { setItems(prepItems(store, { ...a, lessons: [] }, 10)); setView('session'); }],
    });
  }
  steps.push({
    title: 'Take a mock ' + (a.kind === 'vq' ? 'quiz' : 'test'),
    body: 'Timed, no hints, scored at the end, like the real thing. Best done the day before.',
    action: ['Start mock', () => go({ page: 'mock', scope: a.id })],
  });
  const current = steps.findIndex((s) => !s.done && !s.locked);
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <button type="button" onClick={onExit} className="mb-2 flex items-center gap-1 text-[13px] font-semibold text-accent hover:underline"><ArrowLeft size={15} />Back</button>
          <p className={cx('text-[13px] font-semibold uppercase tracking-wider', d <= 2 ? 'text-warm' : 'text-muted')}>{fmt(a)} · {whenText(d)}</p>
          <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">{a.title}</h1>
          {a.covers && <p className="mt-2 max-w-prose text-[15px] text-muted">{a.covers}</p>}
        </div>
        {r && r.pct != null && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Ring value={r.pct} max={100} size={72} stroke={7} label={r.pct + '% ready'} />
              <span className="absolute inset-0 flex items-center justify-center text-base font-bold tabular">{r.pct}%</span>
            </div>
            <p className="max-w-[150px] text-[13px] leading-snug text-muted">of the vocab you’d likely remember on the day</p>
          </div>
        )}
      </header>
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => {
          const on = i === current;
          return (
            <motion.li key={s.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
              className={cx('flex gap-4 rounded-2xl border bg-surface p-5', on ? 'border-accent/50 shadow-[0_1px_0_rgb(var(--accent)/0.15)]' : 'border-line', s.locked && 'opacity-60')}>
              <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-lg',
                s.done ? 'bg-good text-white' : on ? 'bg-accent text-accent-ink' : 'border border-line text-muted')}>
                {s.done ? <Check size={18} /> : s.locked ? <Lock size={15} /> : i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <div>
                  <h2 className="text-[17px] font-bold tracking-tight">{s.title}</h2>
                  <p className="text-[15px] text-muted">{s.body}</p>
                </div>
                {s.meter != null && (
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 max-w-[260px] flex-1 overflow-hidden rounded-full bg-sunken">
                      <motion.span className={cx('block h-full rounded-full', s.done ? 'bg-good' : 'bg-accent')} initial={{ width: 0 }} animate={{ width: s.meter * 100 + '%' }} transition={{ duration: 0.6, ease: EASE }} />
                    </span>
                    <span className="text-[13px] text-muted tabular">{s.meterText}</span>
                  </div>
                )}
                {s.action && <div><Btn variant={on ? 'primary' : 'soft'} size="sm" onClick={s.action[1]}>{s.action[0]} <ArrowRight size={15} /></Btn></div>}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

export function Course({ store, go }) {
  const [prep, setPrep] = useState(null);
  const [showMp1, setShowMp1] = useState(false);
  if (prep) return <PrepSession store={store} a={prep} go={go} onExit={() => setPrep(null)} />;
  const next = nextAssessment();
  const mp2 = ASSESS.filter((a) => a.mp === 2), mp1 = ASSESS.filter((a) => a.mp === 1);
  const row = (a) => (
    <motion.li key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
      <AssessmentCard store={store} a={a} go={go} onPrep={setPrep} big={next && a.id === next.id} />
    </motion.li>
  );
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Latin 2-3 · Mr. Reid · A Block</p>
        <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Course</h1>
        <p className="mt-2 max-w-prose text-[15px] text-muted">Every quiz and test from the syllabus. Words on an upcoming assessment are scheduled so each comes up by 6 pm the night before. The ring is how much of its vocab you’re likely to remember on the day.</p>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold">2nd marking period</h2>
        <ul className="flex flex-col gap-3">{mp2.filter((a) => daysUntil(a) >= 0).map(row)}</ul>
        {mp2.some((a) => daysUntil(a) < 0) && <ul className="grid gap-3 sm:grid-cols-2">{mp2.filter((a) => daysUntil(a) < 0).reverse().map(row)}</ul>}
      </section>
      <section className="flex flex-col gap-3">
        <button type="button" onClick={() => setShowMp1((x) => !x)} aria-expanded={showMp1} className="flex items-center gap-1.5 text-sm font-bold">
          1st marking period <span className="font-medium text-muted">· {mp1.length} assessments</span>
          <motion.span animate={{ rotate: showMp1 ? 180 : 0 }} transition={SPRING}><ChevronDown size={15} /></motion.span>
        </button>
        {showMp1 && <ul className="grid gap-3 sm:grid-cols-2">{mp1.slice().reverse().map(row)}</ul>}
      </section>
    </div>
  );
}
