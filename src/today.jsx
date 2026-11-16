import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, ArrowRight, ArrowLeft, BookOpen, Sparkles, CalendarDays, ChevronRight } from 'lucide-react';
import { Btn, Chip, Panel, Ring, Roll, GenderDot, cx, EASE } from './ui.jsx';
import { Session } from './study.jsx';
import {
  SETS, SET, dueItems, endOfToday, buildQueue, grammarQ, weakTopics, troubleWords, patternsThisWeek, PATTERNS, streak, todayKey,
  isLearned, allItems, genderClass, cardOf, itemAssessment, prepItems, setOfLesson, TNAME, readiness,
} from './model.js';
import { lessonText } from './mock.jsx';
import { upcoming, nextAssessment, daysUntil, dateOf } from './course.js';
import { AssessmentCard, PrepSession, whenText, readyOf } from './coursepage.jsx';
import { Learn } from './setview.jsx';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function weekDays(hub) {
  const now = new Date();
  const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return DAYS.map((l, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return { l, n: (hub.days || {})[todayKey(d)] || 0, today: todayKey(d) === todayKey(now), future: d > now && todayKey(d) !== todayKey(now) }; });
}

// Sidebar: the next quiz or test from the syllabus.
export function QuizDate({ store, go }) {
  const a = nextAssessment();
  if (!a) return null;
  const d = daysUntil(a), r = readyOf(store, a);
  return (
    <button type="button" onClick={() => go({ page: 'course' })} className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-3.5 text-left hover:border-accent/50">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted"><CalendarDays size={14} />Next up · {whenText(d)}</span>
      <span className="text-[15px] font-bold leading-snug">{a.title}</span>
      <span className="text-[13px] text-muted">{dateOf(a).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}{r && r.pct != null ? ' · ' + r.pct + '% ready' : ''}</span>
    </button>
  );
}

const dayName = (a) => { const d = daysUntil(a); return d === 0 ? 'today' : d === 1 ? 'tomorrow' : dateOf(a).toLocaleDateString(undefined, { weekday: 'long' }); };
const mins = (n) => (n < 1.5 ? '1 min' : Math.round(n) + ' min');

// Today is a to-do list: the single next thing to do, then the rest in order.
export function Today({ store, go }) {
  const [session, setSession] = useState(null);
  const [learn, setLearn] = useState(null);
  const [prep, setPrep] = useState(null);
  const hub = store.get('hub');
  const gram = store.get('grammar');
  const due = dueItems(store, endOfToday());
  const doneToday = (hub.days || {})[todayKey()] || 0;
  const trouble = troubleWords(store);
  const st = streak(hub);
  const tk = todayKey();
  const stepsDone = (hub.stepsDone && hub.stepsDone.day === tk) ? hub.stepsDone.ids : [];
  const markDone = (id) => store.update('hub', (h) => { const ids = h.stepsDone && h.stepsDone.day === tk ? h.stepsDone.ids : []; h.stepsDone = { day: tk, ids: ids.concat(id) }; });

  if (prep) return <PrepSession store={store} a={prep} go={go} onExit={() => setPrep(null)} />;
  if (session) return <Session store={store} items={session.items} title={session.title} onExit={() => { if (session.step) markDone(session.step); setSession(null); }} emptyText="All caught up" />;
  if (learn) {
    const unit = { key: 'a:' + learn.id, title: learn.title, sub: '', sets: learn.lessons.map(setOfLesson).filter(Boolean) };
    return (
      <div className="flex flex-col gap-5">
        <button type="button" onClick={() => setLearn(null)} className="flex items-center gap-1 self-start text-[13px] font-semibold text-accent hover:underline"><ArrowLeft size={15} />Back to today</button>
        <h1 className="font-serif text-[34px] font-medium leading-none tracking-tight">Learn the words for {learn.title}</h1>
        <Learn store={store} unit={unit} onPractice={() => setLearn(null)} />
      </div>
    );
  }

  // Build today's list, most urgent first.
  const week = upcoming().filter((a) => a.kind !== 'map' && daysUntil(a) <= 7);
  const near = (it) => { const a = itemAssessment(it); return a ? daysUntil(a) : 99; };
  const quizDue = due.filter((it) => near(it) <= 7);
  const otherDue = due.filter((it) => near(it) > 7);
  const steps = [];
  const covered = new Set();
  week.forEach((a) => {
    const lessons = a.lessons.filter((l) => !covered.has(l));
    if (!lessons.length) return;
    const r = readiness(store, lessons, Date.now());
    const part = lessons.length < a.lessons.length;
    lessons.forEach((l) => covered.add(l));
    const sub = { ...a, lessons };
    if (r.unl) steps.push({ id: 'learn-' + a.id, title: 'Learn the ' + r.unl + ' new words for ' + a.title + (part ? ' (Lessons ' + lessonText(lessons) + ')' : ''), why: (part ? 'The rest of its words are covered above. ' : '') + 'It’s ' + dayName(a) + '. You go 5 words at a time: read them, match them, then type them.', min: r.unl * 0.6, cta: 'Learn 5 words', run: () => setLearn(sub) });
  });
  if (quizDue.length) {
    const forWhat = [...new Set(quizDue.map((it) => itemAssessment(it).title))].join(' and ');
    steps.push({ id: 'rev-quiz', title: 'Review ' + quizDue.length + ' cards for ' + forWhat, why: 'Words you’ve learned that are due again. Type each answer; misses come back a few cards later.', min: quizDue.length * 0.4, cta: 'Review', run: () => setSession({ items: buildQueue(quizDue), title: 'Review · this week’s quizzes' }) });
  }
  const gTopics = [...new Set(week.flatMap((a) => a.topics || []))];
  const gFor = week.find((a) => (a.topics || []).length);
  if (gTopics.length && !stepsDone.includes('gram')) {
    steps.push({ id: 'gram', title: '10 grammar questions for ' + gFor.title + ' (' + dayName(gFor) + ')', why: weakTopics(gram, 3, gTopics).map((t) => TNAME[t]).join(', ') + ' and more. Each answer shows its rule.', min: 5, cta: 'Start', run: () => setSession({ items: prepItems(store, { lessons: [], topics: gTopics }, 10), title: 'Grammar · ' + gFor.title, step: 'gram' }) });
  }
  const mockA = week.find((a) => a.lessons.length && daysUntil(a) <= 1);
  if (mockA && !stepsDone.includes('mock-' + mockA.id)) {
    steps.push({ id: 'mock', title: 'Take a mock ' + (mockA.kind === 'vq' ? 'quiz' : 'test') + ' for ' + mockA.title, why: 'Timed and scored like the real one, so you see what’s still shaky.', min: 8, cta: 'Start mock', run: () => { markDone('mock-' + mockA.id); go({ page: 'mock', scope: mockA.id }); } });
  }
  if (otherDue.length) {
    steps.push({ id: 'rev-other', optional: true, title: 'Review ' + otherDue.length + ' cards from earlier lessons', why: 'Not on a quiz this week. Keeps older words from slipping; skip it if you’re short on time.', min: otherDue.length * 0.4, cta: 'Review', run: () => setSession({ items: buildQueue(otherDue), title: 'Review · earlier lessons' }) });
  }
  const [first, ...rest] = steps;
  const now = new Date();
  const total = steps.filter((x) => !x.optional).reduce((a, x) => a + x.min, 0);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          <h1 className="font-serif text-[44px] font-medium leading-none tracking-tight">Hodie</h1>
          <p className="mt-2 text-[15px] text-muted">{steps.length ? (steps.filter((x) => !x.optional).length ? 'Today’s list, most urgent first. About ' + mins(total) + ' for the must-dos.' : 'The must-dos are done. One optional thing left.') : 'Nothing left for today.'}{doneToday ? ' ' + doneToday + ' answers so far.' : ''}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted"><Flame size={15} className="text-warm" /><Roll value={st} /> day streak</span>
          <div className="flex gap-1.5" aria-label={'Studied ' + weekDays(hub).filter((d) => d.n).length + ' days this week'}>
            {weekDays(hub).map((d, i) => (
              <motion.span key={i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
                className={cx('flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold', d.n ? 'bg-warm text-white' : 'bg-sunken text-muted', d.today && 'ring-2 ring-warm/40 ring-offset-2 ring-offset-bg')}>{d.l}</motion.span>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex min-w-0 flex-col gap-6">
          {first ? (
            <Panel className="flex flex-col gap-4 border-accent/40 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Do this first{first.optional ? ' (optional)' : ''}</p>
              <div>
                <h2 className="font-serif text-[28px] font-medium leading-tight tracking-tight">{first.title}</h2>
                <p className="mt-1.5 max-w-prose text-[15px] text-muted">{first.why}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Btn variant="primary" size="lg" onClick={first.run}>{first.cta} <ArrowRight size={18} /></Btn>
                <span className="text-sm text-muted">about {mins(first.min)}</span>
              </div>
            </Panel>
          ) : (
            <Panel className="flex flex-col gap-2 p-6">
              <h2 className="font-serif text-[28px] font-medium">All done for today</h2>
              <p className="text-[15px] text-muted">Come back tomorrow. If you want more, open a lesson or a quiz’s prep plan below.</p>
            </Panel>
          )}

          {rest.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Then</h2>
              <ol className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
                {rest.map((x, i) => (
                  <li key={x.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line font-serif text-[15px] text-muted">{i + 2}</span>
                    <div className="min-w-0 flex-1 basis-[220px]">
                      <p className="font-semibold">{x.title}{x.optional && <span className="ml-2 text-[13px] font-medium text-muted">optional</span>}</p>
                      <p className="text-sm text-muted">{x.why}</p>
                    </div>
                    <span className="text-[13px] text-muted tabular">{mins(x.min)}</span>
                    <Btn size="sm" variant="soft" onClick={x.run}>{x.cta}</Btn>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Coming up</h2>
              <button type="button" onClick={() => go({ page: 'course' })} className="flex items-center gap-0.5 text-[13px] font-semibold text-accent hover:underline">Full syllabus<ChevronRight size={14} /></button>
            </div>
            <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
              {upcoming().slice(0, 4).map((a) => {
                const r = readyOf(store, a), d = daysUntil(a);
                return (
                  <li key={a.id}>
                    <button type="button" disabled={a.kind === 'map'} onClick={() => setPrep(a)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 text-left hover:bg-sunken/60 disabled:hover:bg-transparent">
                      <span className={cx('w-[92px] shrink-0 text-[13px] font-semibold', d <= 2 ? 'text-warm' : 'text-muted')}>{dateOf(a).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="min-w-0 flex-1 font-semibold">{a.title}</span>
                      <span className="text-[13px] text-muted">{a.kind === 'map' ? 'map handout' : r && r.pct != null ? r.pct + '% ready' : 'grammar'}</span>
                      {a.kind !== 'map' && <ChevronRight size={16} className="text-muted" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="flex flex-col gap-3 p-5">
            <span className="text-[13px] font-bold text-bad">Trouble words</span>
            {trouble.length ? trouble.slice(0, 4).map((t) => (
              <div key={t.set.id + t.card.id} className="flex items-center justify-between gap-2">
                <span lang="la" className="flex items-center gap-2 font-serif text-lg"><GenderDot g={genderClass(t.card.gender)} />{t.card.forms[0]}</span>
                <span className="text-xs font-semibold text-muted tabular">missed {t.misses}×</span>
              </div>
            )) : <p className="text-sm text-muted">Words you miss 3 or more times show up here.</p>}
            {trouble.length > 0 && <Btn size="sm" variant="warm" onClick={() => go({ page: 'trouble' })}>Fix these</Btn>}
          </Panel>
          <p className="px-1 text-[13px] leading-relaxed text-muted">Lessons, grammar drills and mock quizzes are in the menu whenever you want extra practice. This page only lists what’s worth doing today.</p>
        </div>
      </div>
    </div>
  );
}
