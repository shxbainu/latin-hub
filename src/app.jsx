import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Sun, BookOpen, Table2, Target, Timer, ChevronDown, Cloud, CloudOff, Check, CalendarDays, Shuffle } from 'lucide-react';
import { cx, EASE, SPRING } from './ui.jsx';
import { createStore } from './store.js';
import { SETS, SET, REVIEWS, ASSESS, dueCount, troubleWords, isLearned, TOPICS, topicPct } from './model.js';
import { Lessons, lessonCounts } from './lessonspage.jsx';
import { Course } from './coursepage.jsx';
import { lessonText } from './mock.jsx';
import { Today, QuizDate } from './today.jsx';
import { SetView } from './setview.jsx';
import { Grammar } from './grammar.jsx';
import { Trouble } from './trouble.jsx';
import { Mock } from './mock.jsx';
import { Free } from './free.jsx';
import { Backup } from './backup.jsx';

const store = createStore();
// A unit is what a word page studies: one lesson (L7), a review unit (R3), or an assessment's lessons (a:vq-4546).
export function unitOf(key) {
  if (!key) return null;
  if (key[0] === 'L') { const s = SET[key]; return s && { key, title: s.title, sub: s.sub, sets: [s] }; }
  if (key[0] === 'R') { const r = REVIEWS[+key.slice(1) - 1]; return r && { key, title: 'Review ' + r.k, sub: 'Lessons ' + lessonText(r.lessons), sets: r.lessons.map((n) => SET['L' + n]).filter(Boolean) }; }
  if (key.startsWith('a:')) { const a = ASSESS.find((x) => x.id === key.slice(2)); return a && a.lessons.length && { key, title: a.title, sub: 'Lessons ' + lessonText(a.lessons), sets: a.lessons.map((n) => SET['L' + n]).filter(Boolean) }; }
  return null;
}
const PAGES = ['today', 'course', 'lessons', 'free', 'grammar', 'trouble', 'mock', 'backup'];
const OLD_HASH = { 'l45-46': 'a:vq-4546', earlier: 'a:vq-4244' };
function hashOf(r) {
  if (r.page !== 'set') return r.page;
  const k = r.unit;
  return k[0] === 'L' ? 'lesson-' + k.slice(1) : k[0] === 'R' ? 'review-' + k.slice(1) : 'prep-' + k.slice(2);
}
function parseHash(h) {
  if (!h) return null;
  if (h === 'subj') return { page: 'grammar', tab: 'subj' };
  if (PAGES.includes(h)) return { page: h };
  if (OLD_HASH[h]) return { page: 'set', unit: OLD_HASH[h] };
  let m;
  if ((m = h.match(/^lesson-(\d+)$/))) return unitOf('L' + m[1]) ? { page: 'set', unit: 'L' + m[1] } : null;
  if ((m = h.match(/^review-(\d+)$/))) return unitOf('R' + m[1]) ? { page: 'set', unit: 'R' + m[1] } : null;
  if ((m = h.match(/^prep-(.+)$/))) return unitOf('a:' + m[1]) ? { page: 'set', unit: 'a:' + m[1] } : null;
  return null;
}
function routeFromHash() {
  const h = location.hash.slice(1);
  let saved = null; try { saved = localStorage.getItem('jl-section'); } catch (e) { /* none */ }
  return { tab: null, ...(parseHash(h) || parseHash(saved) || { page: 'today' }) };
}

function Sox() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-surface">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2 px-4 py-3 text-[13px] font-bold tracking-wide">
        <span className="text-gf">SOX</span><span className="text-gm">ERROR</span><span className="text-gn">LANCET</span>
        <motion.span className="ml-auto text-muted" animate={{ rotate: open ? 180 : 0 }} transition={SPRING}><ChevronDown size={15} /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden">
            <div className="flex flex-col gap-2 px-4 pb-4 text-[13px] leading-snug">
              <p><b className="text-gf">SOX</b> feminine: -s, -o, -x <span lang="la" className="block font-serif text-sm text-muted">mens, potestas, oratio</span></p>
              <p><b className="text-gm">ERROR</b> masculine: -er, -or (and -os) <span lang="la" className="block font-serif text-sm text-muted">dolor, mercator, flos</span></p>
              <p><b className="text-gn">LANCET</b> neuter: -l, -a, -n, -c, -e, -t (and -us, -eris/-oris) <span lang="la" className="block font-serif text-sm text-muted">mare, genus, opus</span></p>
              <p className="text-muted">Exceptions: centurio m. (a man), orbis m.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SaveLine() {
  const s = store.status();
  const map = { saved: [Check, 'Saved to your account'], saving: [Cloud, 'Saving…'], error: [CloudOff, 'Couldn’t reach your account. Saved here.'], local: [CloudOff, 'Saved in this browser'] };
  const [Icon, text] = map[s] || map.local;
  return <p className="flex items-center gap-1.5 px-1 text-xs text-muted"><Icon size={13} className={s === 'saved' ? 'text-good' : ''} />{text}</p>;
}

function BackupLink({ go }) {
  return <button type="button" onClick={() => go({ page: 'backup' })} className="px-1 text-left text-xs font-semibold text-accent hover:underline">Back up &amp; restore</button>;
}

function Nav({ route, go }) {
  const due = dueCount(store);
  const trouble = troubleWords(store).length;
  const gram = store.get('grammar');
  const pcts = TOPICS.map(([t]) => topicPct(gram, t)).filter((x) => x != null);
  const items = [
    { r: { page: 'today' }, icon: Sun, label: 'Today', badge: due || null, strong: true },
    { r: { page: 'course' }, icon: CalendarDays, label: 'Course' },
    { r: { page: 'lessons' }, icon: BookOpen, label: 'Lessons', meta: Math.round((SETS.reduce((a, s) => a + lessonCounts(store, s).learned, 0) / SETS.reduce((a, s) => a + lessonCounts(store, s).total, 0)) * 100) + '%' },
    { r: { page: 'free' }, icon: Shuffle, label: 'Free practice' },
    { r: { page: 'grammar' }, icon: Table2, label: 'Grammar', meta: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) + '%' : null },
    { r: { page: 'trouble' }, icon: Target, label: 'Trouble words', badge: trouble || null, warm: true },
    { r: { page: 'mock' }, icon: Timer, label: 'Mock quiz' },
  ];
  const active = (r) => r.page === route.page || (r.page === 'lessons' && route.page === 'set');
  return (
    <nav aria-label="Sections" className="no-scrollbar flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {items.map((it) => {
        const on = active(it.r), Icon = it.icon;
        return (
          <button key={hashOf(it.r)} type="button" onClick={() => go(it.r)} aria-current={on ? 'page' : undefined}
            className={cx('relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium transition-colors', on ? 'text-accent' : 'text-muted hover:text-ink')}>
            {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-accent-soft" transition={SPRING} />}
            <Icon size={17} className="relative shrink-0" />
            <span className="relative whitespace-nowrap">{it.label}</span>
            {it.badge != null && <span className={cx('relative ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold tabular', it.warm ? 'bg-warm-soft text-warm' : 'bg-accent text-accent-ink')}>{it.badge}</span>}
            {it.meta && <span className="relative ml-auto pl-2 text-xs text-muted tabular">{it.meta}</span>}
          </button>
        );
      })}
    </nav>
  );
}

function App() {
  useSyncExternalStore(store.subscribe, store.version);
  const [route, setRoute] = useState(routeFromHash);
  useEffect(() => { store.connect(); const f = () => setRoute(routeFromHash()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  function go(r) {
    const h = hashOf(r);
    try { localStorage.setItem('jl-section', h); history.replaceState(null, '', '#' + h); } catch (e) { /* none */ }
    setRoute({ tab: null, ...r });
    window.scrollTo({ top: 0 });
  }
  const setTab = (r) => {
    if (r.page !== 'set') return null;
    if (r.tab) return r.tab;
    const u = unitOf(r.unit);
    return u.sets.some((s) => { const doc = store.get(s.doc); return s.cards.some((c) => !isLearned(doc, c.id) && !(doc.removed || {})[c.id]); }) ? 'learn' : 'practice';
  };
  const key = hashOf(route);
  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex min-h-screen max-w-[1240px] flex-col md:flex-row">
        <aside className="gutter flex flex-col gap-4 border-b border-line py-4 md:sticky md:top-0 md:h-screen md:w-[248px] md:shrink-0 md:border-b-0 md:border-r md:py-7">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent font-serif text-xl font-semibold text-accent-ink">J</span>
            <span className="text-[15px] font-bold leading-tight">Jenney’s<br className="hidden md:block" /> Latin Hub</span>
          </div>
          <Nav route={route} go={go} />
          <div className="mt-auto hidden flex-col gap-3 md:flex">
            <QuizDate store={store} go={go} />
            <Sox />
            <SaveLine />
            <BackupLink go={go} />
          </div>
        </aside>
        <main className="gutter min-w-0 flex-1 py-6 md:py-8 md:pl-10">
          <AnimatePresence mode="wait">
            <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: EASE }}>
              {route.page === 'today' && <Today store={store} go={go} />}
              {route.page === 'set' && <SetView store={store} unit={unitOf(route.unit)} tab={setTab(route)} onTab={(t) => setRoute({ ...route, tab: t })} go={go} />}
              {route.page === 'course' && <Course store={store} go={go} />}
              {route.page === 'lessons' && <Lessons store={store} go={go} />}
              {route.page === 'backup' && <Backup store={store} />}
              {route.page === 'free' && <Free key={(route.lessons || []).join(',')} store={store} go={go} initial={route.lessons} />}
              {route.page === 'grammar' && <Grammar store={store} initialTopic={route.topic} initialTab={route.tab} />}
              {route.page === 'trouble' && <Trouble store={store} go={go} />}
              {route.page === 'mock' && <Mock key={route.scope || 'm'} store={store} go={go} scope={route.scope} />}
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex flex-col gap-3 md:hidden"><Sox /><SaveLine /><BackupLink go={go} /></div>
        </main>
      </div>
    </MotionConfig>
  );
}

createRoot(document.getElementById('root')).render(<App />);
