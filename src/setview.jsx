import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Search, Lightbulb, Check, Undo2, ArrowRight, Sparkles } from 'lucide-react';
import { Btn, Chip, Panel, Tabs, GenderDot, Field, cx, EASE, SPRING, SHAKE, DrawCheck } from './ui.jsx';
import { Session } from './study.jsx';
import {
  SET, POS, hasExtraForms, entryText, entryRest, genderClass, isLearned, wordStatus, dueItems, endOfToday, buildQueue, allItems, cardOf,
  retrievability, hookFor, rule3, GNAME, shuffle, normLatin, glosses, normEn,
} from './model.js';
import { review } from './fsrs.js';

// A unit is one lesson or a few lessons studied together (an assessment's scope).
export function SetView({ store, unit, tab, onTab, go }) {
  const cards = unit.sets.flatMap((s) => s.cards);
  const learned = unit.sets.reduce((a, s) => a + s.cards.filter((c) => isLearned(store.get(s.doc), c.id)).length, 0);
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <button type="button" onClick={() => go({ page: 'lessons' })} className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-accent hover:underline">All lessons</button>
          <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">{unit.title}</h1>
          <p className="mt-2 text-sm text-muted">{unit.sub ? unit.sub + ' · ' : ''}{learned} of {cards.length} learned</p>
        </div>
        <Tabs id={'set-' + unit.key} value={tab} onChange={onTab} tabs={[['learn', 'Learn new'], ['practice', 'Practice'], ['words', 'Word list']]} />
      </header>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: EASE }}>
          {tab === 'learn' && <Learn store={store} unit={unit} onPractice={() => onTab('practice')} />}
          {tab === 'practice' && <Practice store={store} unit={unit} go={go} />}
          {tab === 'words' && <Words store={store} unit={unit} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- Practice ---------- */
function Practice({ store, unit, go }) {
  const [session, setSession] = useState(null);
  const ids = unit.sets.map((s) => s.id);
  const due = dueItems(store, endOfToday(), ids);
  const all = allItems(store, ids);
  if (session) return <Session store={store} items={session} title={unit.title + ' practice'} onExit={() => setSession(null)} />;
  const ahead = () => {
    const now = Date.now();
    return all.map((it) => ({ it, r: retrievability(cardOf(store, it), now) })).sort((a, b) => a.r - b.r).slice(0, 15).map((x) => x.it);
  };
  return (
    <Panel className="flex flex-wrap items-center gap-4 p-6">
      <div className="min-w-0 flex-1 basis-[240px]">
        <h2 className="text-xl font-bold tracking-tight">{due.length ? due.length + ' due here' : 'Nothing due here'}</h2>
        <p className="text-[15px] text-muted">{all.length ? 'Typed answers. Misses come back a few cards later and sooner tomorrow.' : 'Learn some words first.'}</p>
      </div>
      {due.length > 0 && <Btn variant="primary" size="lg" onClick={() => setSession(buildQueue(due))}>Practice <ArrowRight size={18} /></Btn>}
      {!due.length && all.length > 0 && <Btn size="lg" onClick={() => setSession(buildQueue(ahead()))}>Study ahead · 15 weakest</Btn>}
      <Btn size="lg" onClick={() => go({ page: 'free', lessons: unit.sets.map((s) => s.n) })}>Free practice</Btn>
    </Panel>
  );
}

/* ---------- Learn new: meet, match, recall in groups of 5 ---------- */
const GROUP = 5;
function Steps({ phase }) {
  const steps = [['meet', 'Meet'], ['match', 'Match'], ['recall', 'Recall']];
  const idx = steps.findIndex((s) => s[0] === phase);
  return (
    <ol className="flex gap-1 rounded-xl bg-sunken p-1 text-[13px] font-semibold" aria-label="Steps">
      {steps.map(([k, l], i) => (
        <li key={k} className={cx('relative rounded-lg px-3 py-1', i === idx ? 'text-accent-ink' : i < idx ? 'text-good' : 'text-muted')}>
          {i === idx && <motion.span layoutId="learn-step" className="absolute inset-0 rounded-lg bg-accent" transition={SPRING} />}
          <span className="relative flex items-center gap-1">{i < idx && <Check size={13} strokeWidth={3} />}{l}</span>
        </li>
      ))}
    </ol>
  );
}

export function Learn({ store, unit, onPractice }) {
  const hub = store.get('hub');
  const st = (hub.learn || {})[unit.key] || null;
  const save = (v) => store.update('hub', (h) => { h.learn = { ...(h.learn || {}), [unit.key]: v }; });
  const setOf = {}; unit.sets.forEach((s) => s.cards.forEach((c) => { setOf[c.id] = s; }));
  const docOf = (c) => store.get(setOf[c.id].doc);
  const pool = unit.sets.flatMap((s) => s.cards);
  const fresh = (c) => !isLearned(docOf(c), c.id) && !(docOf(c).removed || {})[c.id];
  const unlearned = pool.filter(fresh);
  const chunk = st && st.ids ? st.ids.map((id) => pool.find((c) => c.id === id)).filter(Boolean) : null;

  function startGroup() { const ids = unlearned.slice(0, GROUP).map((c) => c.id); if (ids.length) save({ ids, phase: 'meet', i: 0, miss: {} }); }
  function markLearned(c, g, now) {
    store.update(setOf[c.id].doc, (d) => {
      d.learned = { ...(d.learned || {}), [c.id]: now };
      if (!d.v2.cards[c.id + '|le']) d.v2.cards[c.id + '|le'] = review(null, g, now);
    });
  }
  function knowIt(card) {
    const now = Date.now();
    markLearned(card, 3, now);
    const ids = st.ids.filter((x) => x !== card.id);
    const fill = pool.find((c) => c.id !== card.id && fresh(c) && !ids.includes(c.id));
    if (fill) ids.push(fill.id);
    save(ids.length ? { ...st, ids, i: Math.min(st.i, ids.length - 1) } : null);
  }
  function finish(log) {
    const now = Date.now();
    const missed = { ...(st.miss || {}) };
    log.forEach((r) => { if (!r.ok) missed[r.item.card.id] = true; });
    chunk.forEach((c) => markLearned(c, missed[c.id] ? 1 : 3, now));
    save({ ...st, phase: 'done', miss: missed });
  }

  if (!chunk || st.phase === 'done') {
    const justDone = st && st.phase === 'done' && chunk;
    return (
      <Panel className="flex flex-col items-start gap-4 p-7">
        {justDone ? (
          <>
            <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.45, visualDuration: 0.45 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-good-soft text-good"><DrawCheck size={26} /></motion.span>
            <h2 className="text-2xl font-bold tracking-tight">Group learned</h2>
            <div className="flex flex-wrap gap-2">{chunk.map((c) => <Chip key={c.id} tone={st.miss[c.id] ? 'warm' : 'good'}><span lang="la" className="font-serif text-sm">{c.forms[0]}</span>{st.miss[c.id] ? ' · comes back sooner' : ''}</Chip>)}</div>
            <p className="text-[15px] text-muted">They’re in Today and Practice now. The first review is in about 10 minutes, which is the gap that makes words stick.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold tracking-tight">{unlearned.length ? unlearned.length + ' new words' : 'Every word learned'}</h2>
            <p className="max-w-prose text-[15px] text-muted">{unlearned.length ? 'Groups of 5: meet each word with its hook, match them up, then recall the whole entry with the gender.' : 'Keep them fresh in Practice and Today.'}</p>
          </>
        )}
        <div className="flex flex-wrap gap-2.5">
          {unlearned.length > 0 && <Btn variant="primary" onClick={startGroup}>{justDone ? 'Learn the next ' + Math.min(GROUP, unlearned.length) : 'Start learning'} <ArrowRight size={16} /></Btn>}
          {justDone && <Btn onClick={onPractice}>Practice</Btn>}
        </div>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Steps phase={st.phase} />
        <span className="text-sm text-muted tabular">{unlearned.length} new left here</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={st.phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.26, ease: EASE }}>
          {st.phase === 'meet' && <Meet store={store} setOf={setOf} chunk={chunk} i={st.i} onI={(i) => save({ ...st, i })} onKnow={knowIt}
            onNext={() => save({ ...st, phase: chunk.length > 1 ? 'match' : 'recall' })} />}
          {st.phase === 'match' && <Match chunk={chunk} onMiss={(id) => save({ ...st, miss: { ...st.miss, [id]: true } })} onDone={() => save({ ...st, phase: 'recall' })} onBack={() => save({ ...st, phase: 'meet', i: 0 })} />}
          {st.phase === 'recall' && <Session store={store} title="Recall the whole entry" noSummary
            items={shuffle(chunk).map((c) => ({ kind: hasExtraForms(c) ? 'el' : 'le', key: c.id + (hasExtraForms(c) ? '|el' : '|le'), setId: setOf[c.id].id, card: c, docName: setOf[c.id].doc }))} onFinish={finish} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Meet({ store, setOf, chunk, i, onI, onNext, onKnow }) {
  const card = chunk[i];
  const set = setOf[card.id];
  const [la, setLa] = useState('');
  const [en, setEn] = useState('');
  const hook = hookFor(store, set, card);
  const r3 = rule3(card);
  const g = genderClass(card.gender);
  const squash = (s) => normLatin(s).replace(/\s+/g, '');
  const laOk = squash(la) === squash(entryText(card));
  const enOk = glosses(card.meaning).every((x) => String(en).split(/[;,\/]/).map(normEn).includes(x));
  const next = () => { setLa(''); setEn(''); if (i < chunk.length - 1) onI(i + 1); else onNext(); };
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div key={card.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3, ease: EASE }}>
        <Panel className="flex flex-col gap-5 p-6 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <Chip tone="accent">New word {i + 1} of {chunk.length}</Chip>
            <Chip>{set.title}</Chip>
            <Chip>{POS[card.pos] || 'word'}</Chip>
            {card.note && <Chip>{card.note}</Chip>}
          </div>
          <div className="flex flex-col gap-2">
            <span lang="la" className="font-serif text-[clamp(48px,10vw,72px)] font-medium leading-none">{card.forms[0]}</span>
            {entryRest(card) && <span lang="la" className="flex items-center gap-2 font-serif text-2xl text-muted"><GenderDot g={g} className="h-2.5 w-2.5" />{entryRest(card)}</span>}
            <span className="mt-2 text-[28px] font-semibold tracking-tight">{card.meaning}</span>
          </div>
          {r3 && (
            <p className="text-[15px] text-muted"><span className="font-serif text-base text-ink" lang="la">{r3.rule.end}</span> → usually {GNAME[r3.rule.g]}{!r3.ok && <strong className="text-bad"> · {r3.note || 'exception'}</strong>}</p>
          )}
          {hook && <div className="flex items-start gap-3 rounded-xl bg-hl/40 px-4 py-3"><Lightbulb size={18} className="mt-0.5 shrink-0" /><p className="text-[15px] leading-relaxed">{hook}</p></div>}
          <form noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); next(); }} className="flex flex-col gap-3">
            <p className="text-sm text-muted">Copy it out once, saying it aloud (optional, but it helps). Press Enter for the next word.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="meet-la" label="Latin, with the gender" placeholder={entryText(card)} value={la} onChange={(e) => setLa(e.target.value)} state={laOk ? 'ok' : null} />
              <Field id="meet-en" lang="en" label="Every meaning" placeholder={card.meaning} value={en} onChange={(e) => setEn(e.target.value)} state={enOk ? 'ok' : null} />
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Btn variant="primary" type="submit">{i < chunk.length - 1 ? 'Next word' : 'Match them up'} <ArrowRight size={16} /></Btn>
              {i > 0 && <Btn onClick={() => onI(i - 1)}>Back</Btn>}
              <Btn variant="ghost" onClick={() => onKnow(card)}>I already know this</Btn>
            </div>
          </form>
        </Panel>
      </motion.div>
    </AnimatePresence>
  );
}

function Match({ chunk, onMiss, onDone, onBack }) {
  const [left] = useState(() => shuffle(chunk));
  const [right] = useState(() => shuffle(chunk));
  const [doneIds, setDone] = useState([]);
  const [sel, setSel] = useState(null);
  const [wrong, setWrong] = useState(null);
  function tap(c, side) {
    if (!sel || sel.side === side) { setSel({ c, side }); return; }
    if (sel.c.id === c.id) {
      const d = doneIds.concat(c.id); setDone(d); setSel(null);
      if (d.length === chunk.length) setTimeout(onDone, 450);
    } else {
      onMiss(c.id); onMiss(sel.c.id);
      setWrong([sel.c.id + sel.side, c.id + side]); setSel(null); setTimeout(() => setWrong(null), 450);
    }
  }
  const col = (list, side) => (
    <div className="flex min-w-0 flex-col gap-2.5">
      <AnimatePresence mode="popLayout">
        {list.filter((c) => !doneIds.includes(c.id)).map((c) => {
          const isSel = sel && sel.c.id === c.id && sel.side === side, isWrong = wrong && wrong.includes(c.id + side);
          return (
            <motion.button layout key={c.id} type="button" onClick={() => tap(c, side)} lang={side === 'l' ? 'la' : 'en'}
              initial={{ opacity: 0, scale: 0.96 }} animate={isWrong ? { ...SHAKE, opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, backgroundColor: 'rgb(var(--good-soft))', transition: { duration: 0.3, ease: EASE } }}
              transition={SPRING} whileTap={{ scale: 0.97 }}
              className={cx('rounded-xl border-2 px-4 py-3 text-left transition-colors', side === 'l' ? 'font-serif text-xl font-semibold' : 'text-[15px]',
                isWrong ? 'border-bad bg-bad-soft' : isSel ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-accent/50')}>
              {side === 'l' ? c.forms[0] : c.meaning}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
  return (
    <Panel className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Tap a Latin word, then its meaning</h2>
        <span className="text-sm text-muted tabular">{doneIds.length} / {chunk.length}</span>
      </div>
      <LayoutGroup><div className="grid grid-cols-2 gap-3">{col(left, 'l')}{col(right, 'r')}</div></LayoutGroup>
      <div><Btn variant="ghost" size="sm" onClick={onBack}>See the words again</Btn></div>
    </Panel>
  );
}

/* ---------- Word list ---------- */
const FILTERS = [['all', 'All'], ['new', 'New'], ['learning', 'Learning'], ['known', 'Known'], ['trouble', 'Trouble'], ['removed', 'Removed']];
const STATUS_TONE = { new: 'plain', learning: 'accent', known: 'good', trouble: 'bad', removed: 'plain' };
function Words({ store, unit }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const many = unit.sets.length > 1;
  const all = unit.sets.flatMap((set) => set.cards.map((c) => ({ c, set, s: wordStatus(store.get(set.doc), c) })));
  const rows = all
    .filter(({ c, s }) => (f === 'all' ? s !== 'removed' : s === f))
    .filter(({ c }) => !q || normLatin(c.forms.join(' ')).includes(normLatin(q)) || c.meaning.toLowerCase().includes(q.toLowerCase()));
  const counts = {}; all.forEach(({ s }) => { counts[s] = (counts[s] || 0) + 1; });
  const toggle = (c, set) => store.update(set.doc, (d) => { const r = { ...(d.removed || {}) }; if (r[c.id]) delete r[c.id]; else r[c.id] = true; d.removed = r; });
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-line px-3 py-2">
          <Search size={16} className="text-muted" /><span className="sr-only">Search</span>
          <input id="word-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Latin or English" className="min-w-0 flex-1 bg-transparent outline-none" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(([k, l]) => (
            <button key={k} type="button" onClick={() => setF(k)} className={cx('relative rounded-full px-3 py-1.5 text-[13px] font-semibold', f === k ? 'text-accent-ink' : 'text-muted hover:text-ink')}>
              {f === k && <motion.span layoutId={'wf-' + unit.key} className="absolute inset-0 rounded-full bg-accent" transition={SPRING} />}
              <span className="relative">{l}{k !== 'all' && counts[k] ? ' ' + counts[k] : ''}</span>
            </button>
          ))}
        </div>
      </div>
      <ul className="flex flex-col">
        <AnimatePresence initial={false}>
          {rows.map(({ c, s, set }) => (
            <motion.li layout key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}
              className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-2.5 first:border-t-0">
              <span lang="la" className="flex min-w-0 items-center gap-2 font-serif text-lg"><GenderDot g={genderClass(c.gender)} /><span className="truncate"><strong className="font-semibold">{c.forms[0]}</strong>{entryRest(c) ? ', ' + entryRest(c) : ''}</span></span>
              <span className="min-w-0 truncate text-[15px] text-muted">{many && <span className="mr-2 text-xs font-semibold tabular">{set.n}</span>}{c.meaning}</span>
              <span className="flex items-center gap-1.5">
                <Chip tone={STATUS_TONE[s]}>{s === 'new' ? 'new' : s}</Chip>
                <button type="button" onClick={() => toggle(c, set)} className="rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-sunken hover:text-ink">{s === 'removed' ? 'Restore' : 'Remove'}</button>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {!rows.length && <p className="py-6 text-center text-sm text-muted">No words here.</p>}
    </Panel>
  );
}
