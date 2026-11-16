import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Check, ChevronRight } from 'lucide-react';
import { Btn, Chip, Panel, CountUp, cx, EASE, SPRING } from './ui.jsx';
import { Session } from './study.jsx';
import { SETS, setOfLesson, isLearned, REVIEWS, LESSON_NUMS, placementItems, applyPlacement, verdictOf, dueItems, endOfToday } from './model.js';
import { lessonText } from './mock.jsx';

export function lessonCounts(store, s) {
  const doc = store.get(s.doc);
  const live = s.cards.filter((c) => !(doc.removed || {})[c.id]);
  return { total: live.length, learned: live.filter((c) => isLearned(doc, c.id)).length };
}

function Tile({ store, s, go, verdict }) {
  const { total, learned } = lessonCounts(store, s);
  const pct = total ? learned / total : 0;
  return (
    <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={SPRING} onClick={() => go({ page: 'set', unit: 'L' + s.n })}
      className="flex min-w-0 flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5 text-left hover:border-accent/50">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-serif text-[28px] font-medium leading-none tabular">{s.n}</span>
        {pct === 1 ? <Check size={16} className="text-good" /> : verdict ? <span className="text-[11px] font-semibold text-muted">{verdict === 'shaky' ? 'placed · shaky' : verdict === 'known' ? 'placed' : ''}</span> : null}
      </span>
      <span lang="la" className="truncate font-serif text-[15px] text-muted">{s.sub}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-sunken">
        <motion.span className={cx('block h-full rounded-full', pct === 1 ? 'bg-good' : 'bg-accent')} initial={{ width: 0 }} animate={{ width: pct * 100 + '%' }} transition={{ duration: 0.6, ease: EASE }} />
      </span>
      <span className="text-xs text-muted tabular">{learned}/{total} learned</span>
    </motion.button>
  );
}

export function Lessons({ store, go }) {
  const [placing, setPlacing] = useState(false);
  const hub = store.get('hub');
  const untouched = LESSON_NUMS.filter((n) => lessonCounts(store, setOfLesson(n)).learned === 0);
  if (placing) return <Placement store={store} go={go} onExit={() => setPlacing(false)} />;
  const total = SETS.reduce((a, s) => a + lessonCounts(store, s).total, 0);
  const learned = SETS.reduce((a, s) => a + lessonCounts(store, s).learned, 0);
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Jenney’s First Year Latin · {learned} of {total} words learned</p>
          <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Lessons</h1>
        </div>
      </header>
      {untouched.length > 8 && (
        <Panel className="flex flex-wrap items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Compass size={20} /></span>
          <div className="min-w-0 flex-1 basis-[240px]">
            <h2 className="font-semibold">Placement check</h2>
            <p className="text-sm text-muted">You already know plenty from earlier lessons. Answer 2 words per lesson and the hub files each one as known, shaky, or still to learn, so reviews start where you actually are.</p>
          </div>
          <Btn variant="primary" onClick={() => setPlacing(true)}>Start <ArrowRight size={16} /></Btn>
        </Panel>
      )}
      {REVIEWS.map((r) => {
        const sets = r.lessons.map(setOfLesson).filter(Boolean);
        if (!sets.length) return null;
        return (
          <section key={r.k} className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-bold">Review {r.k} <span className="font-medium text-muted">· Lessons {lessonText(r.lessons)}</span></h2>
              <button type="button" onClick={() => go({ page: 'set', unit: 'R' + r.k })} className="flex items-center gap-0.5 text-[13px] font-semibold text-accent hover:underline">Study together<ChevronRight size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {sets.map((s) => <Tile key={s.id} store={store} s={s} go={go} verdict={hub.placement && hub.placement[s.n] && hub.placement[s.n].v} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ---------- placement: 2 words per lesson, a 3rd when it's split ---------- */
function Placement({ store, go, onExit }) {
  const [pick, setPick] = useState(() => LESSON_NUMS.filter((n) => n <= 41 && lessonCounts(store, setOfLesson(n)).learned === 0));
  const [phase, setPhase] = useState('setup');
  const [items, setItems] = useState(null);
  const [res, setRes] = useState({});
  const [verdicts, setVerdicts] = useState(null);
  const collect = (log, base) => {
    const out = { ...base };
    log.forEach((r) => { const l = r.item.lesson; (out[l] = out[l] || []).push({ id: r.item.card.id, ok: r.ok }); });
    return out;
  };
  function finishRound(log) {
    const all = collect(log, res);
    setRes(all);
    const split = Object.entries(all).filter(([, rs]) => rs.length === 2 && rs.filter((x) => x.ok).length === 1).map(([l]) => +l);
    if (phase === 'one' && split.length) {
      const more = placementItems(store, split, 3).filter((it) => !all[it.lesson].some((x) => x.id === it.card.id)).filter((it, i, arr) => arr.findIndex((y) => y.lesson === it.lesson) === i);
      if (more.length) { setItems(more); setPhase('two'); return; }
    }
    setVerdicts(applyPlacement(store, all));
    setPhase('done');
  }
  function stopEarly(log) { const all = collect(log, res); setVerdicts(applyPlacement(store, all)); setPhase('done'); }

  if (phase === 'one' || phase === 'two') {
    return <Session key={phase} store={store} items={items} mode="place" title={phase === 'one' ? 'Placement · type the meaning' : 'Placement · a few tie-breakers'}
      onFinish={finishRound} onExit={(log) => stopEarly(log)} />;
  }
  if (phase === 'done') {
    const by = { known: [], shaky: [], new: [] };
    Object.entries(verdicts).forEach(([l, v]) => by[v].push(+l));
    return (
      <Panel className="flex flex-col items-start gap-5 p-7">
        <h2 className="text-2xl font-bold tracking-tight">Placement done</h2>
        <div className="flex flex-wrap gap-6">
          {[['known', 'known', 'good'], ['shaky', 'shaky', 'warm'], ['new', 'to learn', 'plain']].map(([k, l]) => (
            <div key={k}><div className="text-3xl font-bold"><CountUp to={by[k].length} /></div><div className="text-sm text-muted">lessons {l}</div></div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 text-[15px]">
          {by.known.length > 0 && <p><Chip tone="good">Known</Chip> Lessons {lessonText(by.known)}: reviews spread over the next two weeks.</p>}
          {by.shaky.length > 0 && <p><Chip tone="warm">Shaky</Chip> Lessons {lessonText(by.shaky)}: reviews start in the next few days.</p>}
          {by.new.length > 0 && <p><Chip>To learn</Chip> Lessons {lessonText(by.new)}: open them from Lessons when you have time.</p>}
        </div>
        <p className="text-sm text-muted">Whole entries and genders for these words join your reviews 15 a day, quiz lessons first, so the queue never floods.</p>
        <div className="flex flex-wrap gap-2.5"><Btn variant="primary" onClick={() => go({ page: 'today' })}>Go to Today <ArrowRight size={16} /></Btn><Btn onClick={onExit}>Back to lessons</Btn></div>
      </Panel>
    );
  }
  const toggle = (n) => setPick((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.concat(n).sort((a, b) => a - b)));
  return (
    <div className="flex flex-col gap-6">
      <header>
        <button type="button" onClick={onExit} className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-accent hover:underline">All lessons</button>
        <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Placement check</h1>
      </header>
      <Panel className="flex flex-col gap-5 p-6">
        <p className="max-w-prose text-[15px] text-muted">Type the English for 2 random words from each lesson you pick. Both right: the lesson is filed as known. One right: one more word decides. Neither: the lesson stays to learn. No hints, no answers until the end. Stop any time and what you’ve done still counts.</p>
        <div className="flex flex-wrap gap-1.5">
          {LESSON_NUMS.map((n) => {
            const on = pick.includes(n), done = lessonCounts(store, setOfLesson(n)).learned > 0;
            return <button key={n} type="button" aria-pressed={on} disabled={done} onClick={() => toggle(n)}
              className={cx('h-9 w-10 rounded-lg text-sm font-semibold tabular disabled:opacity-35', on ? 'bg-accent text-accent-ink' : 'bg-sunken text-muted hover:text-ink')}>{n}</button>;
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Btn variant="primary" size="lg" disabled={!pick.length} onClick={() => { setRes({}); setItems(placementItems(store, pick, 2)); setPhase('one'); }}>Start · {pick.length * 2} words <ArrowRight size={18} /></Btn>
          <span className="text-sm text-muted">About {Math.max(1, Math.round((pick.length * 2.3 * 7) / 60))} min. Greyed out = already started in the hub.</span>
        </div>
      </Panel>
    </div>
  );
}
