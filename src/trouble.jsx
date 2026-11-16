import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Lightbulb, ArrowRight, Check, X, RotateCcw, PenLine } from 'lucide-react';
import { Btn, Chip, Panel, GenderDot, cx, EASE, SPRING } from './ui.jsx';
import { Summary } from './study.jsx';
import { troubleWords, lookAlikes, entryText, genderClass, hookFor, grade, shuffle } from './model.js';

export function Trouble({ store, go }) {
  const list = troubleWords(store);
  const [fix, setFix] = useState(null);

  if (fix) return <FixSession store={store} words={fix} onExit={() => setFix(null)} />;
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-bad">Missed 3 or more times</p>
        <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Trouble words</h1>
      </header>
      {list.length ? (
        <>
          <Panel className="flex flex-wrap items-center gap-4 p-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold tracking-tight">{list.length} word{list.length > 1 ? 's' : ''} keep slipping</h2>
              <p className="text-[15px] text-muted">A fix session puts each one next to the words it gets mixed up with, has you write your own hook, then runs quick flip cards. About {Math.max(2, list.slice(0, 5).length)} min.</p>
            </div>
            <Btn variant="primary" size="lg" onClick={() => setFix(list.slice(0, 5))}>Fix {Math.min(5, list.length)} now <ArrowRight size={18} /></Btn>
          </Panel>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((t, i) => (
              <motion.div key={t.set.id + t.card.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}>
                <Panel className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span lang="la" className="flex items-center gap-2 font-serif text-xl font-semibold"><GenderDot g={genderClass(t.card.gender)} />{t.card.forms[0]}</span>
                    <Chip tone="bad">missed {t.misses}×</Chip>
                  </div>
                  <p className="text-sm text-muted"><span lang="la" className="font-serif text-base text-ink">{entryText(t.card)}</span> · {t.card.meaning}</p>
                  {lookAlikes(t.card).length > 0 && <p className="text-xs text-muted">Gets mixed up with: <span lang="la" className="font-serif text-sm text-ink">{lookAlikes(t.card).map((x) => x.c.forms[0]).join(', ')}</span></p>}
                </Panel>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <Panel className="flex flex-col items-start gap-3 p-7">
          <h2 className="text-xl font-bold tracking-tight">No trouble words yet</h2>
          <p className="max-w-prose text-[15px] text-muted">When you miss a word 3 or more times, or twice in its last few reviews, it lands here. A fix session then compares it with look-alikes and has you write your own hook, which sticks better than a ready-made one.</p>
          <Btn onClick={() => go({ page: 'today' })}>Back to today</Btn>
        </Panel>
      )}
    </div>
  );
}

function FixSession({ store, words, onExit }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState('compare');
  if (phase === 'flip') return <FlipRound store={store} words={words} onExit={onExit} />;
  const t = words[i];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">Fix session · compare and hook · {i + 1} of {words.length}</span>
        <Btn variant="ghost" size="sm" onClick={onExit}><X size={16} />End</Btn>
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={t.card.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3, ease: EASE }}>
          <Compare store={store} t={t} onNext={() => (i < words.length - 1 ? setI(i + 1) : setPhase('flip'))} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Compare({ store, t, onNext }) {
  const doc = store.get(t.set.doc);
  const [hook, setHook] = useState((doc.v2.hooks || {})[t.card.id] || '');
  const alike = lookAlikes(t.card);
  const fallback = t.set.hook[t.card.id];
  function save() {
    const v = hook.trim();
    store.update(t.set.doc, (d) => { d.v2.hooks = { ...(d.v2.hooks || {}) }; if (v) d.v2.hooks[t.card.id] = v; else delete d.v2.hooks[t.card.id]; });
    onNext();
  }
  const WordBox = ({ c, main }) => (
    <div className={cx('flex min-w-0 flex-col gap-1.5 rounded-xl border p-4', main ? 'border-accent bg-accent-soft/50' : 'border-line bg-surface')}>
      <span lang="la" className={cx('flex items-center gap-2 font-serif font-semibold', main ? 'text-3xl' : 'text-2xl')}><GenderDot g={genderClass(c.gender)} />{c.forms[0]}</span>
      <span lang="la" className="font-serif text-base text-muted">{entryText(c)}</span>
      <span className="text-[15px] font-semibold">{c.meaning}</span>
    </div>
  );
  return (
    <Panel className="flex flex-col gap-5 p-6">
      <div className={cx('grid gap-3', alike.length ? 'sm:grid-cols-2' : '')}>
        <WordBox c={t.card} main />
        {alike.length > 0 && (
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Easy to mix up with</span>
            {alike.map(({ c }) => <WordBox key={c.id} c={c} />)}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="own-hook" className="flex items-center gap-2 text-sm font-semibold"><PenLine size={16} />Your own hook for <span lang="la" className="font-serif text-base">{t.card.forms[0]}</span></label>
        <textarea id="own-hook" rows={2} value={hook} onChange={(e) => setHook(e.target.value)} placeholder={fallback ? 'For example: ' + fallback : 'A picture, a sound-alike, an English word it came from…'}
          className="w-full resize-y rounded-xl border-2 border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent" />
        <p className="text-xs text-muted">It replaces the built-in hook everywhere this word shows up.</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Btn variant="primary" onClick={save}>Save and next <ArrowRight size={16} /></Btn>
        <Btn variant="ghost" onClick={onNext}>Skip</Btn>
      </div>
    </Panel>
  );
}

// Flip cards: tap to flip, then swipe right if you knew it, left if you didn't.
function FlipRound({ store, words, onExit }) {
  const [deck, setDeck] = useState(() => shuffle(words.concat(words)).map((t, k) => ({ ...t, k })));
  const [log, setLog] = useState([]);
  const top = deck[0];
  function result(knew) {
    grade(store, { kind: 'le', key: top.card.id + '|le', setId: top.set.id, card: top.card, docName: top.set.doc }, knew ? 3 : 1);
    setLog((l) => l.concat({ ok: knew }));
    setDeck((d) => { const rest = d.slice(1); if (!knew) rest.splice(Math.min(2, rest.length), 0, { ...top, k: top.k + 100 }); return rest; });
  }
  if (!top) return <Summary log={log} ms={0} onExit={onExit} />;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-sm font-semibold">Flip cards · {deck.length} left</span>
        <Btn variant="ghost" size="sm" onClick={onExit}><X size={16} />End</Btn>
      </div>
      <div className="relative h-[340px] w-full max-w-[460px]">
        {deck.slice(1, 3).reverse().map((t, i, arr) => (
          <div key={t.k} aria-hidden="true" className="absolute inset-0 rounded-2xl border border-line bg-surface"
            style={{ transform: `translateY(${(arr.length - i) * 10}px) scale(${1 - (arr.length - i) * 0.04})` }} />
        ))}
        <AnimatePresence>
          <FlipCard key={top.k} t={top} store={store} onResult={result} />
        </AnimatePresence>
      </div>
      <p className="text-sm text-muted">Tap the card to flip it. Swipe right if you knew it, left if you didn’t.</p>
    </div>
  );
}

function FlipCard({ t, store, onResult }) {
  const [flipped, setFlipped] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const goodTint = useTransform(x, [0, 160], [0, 1]);
  const badTint = useTransform(x, [-160, 0], [1, 0]);
  const hook = hookFor(store, t.set, t.card);
  function fling(knew) {
    animate(x, knew ? 520 : -520, { duration: 0.32, ease: EASE }).then(() => onResult(knew));
  }
  return (
    <motion.div className="absolute inset-0 cursor-grab active:cursor-grabbing" style={{ x, rotate }} drag={flipped ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.8}
      onDragEnd={(e, info) => { if (info.offset.x > 120 || info.velocity.x > 600) fling(true); else if (info.offset.x < -120 || info.velocity.x < -600) fling(false); }}
      initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
      <motion.div className="card-3d relative h-full w-full" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }} style={{ perspective: 1200 }}>
        <button type="button" onClick={() => setFlipped(true)} aria-label={'Flip ' + t.card.forms[0]}
          className="backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface p-6 shadow-[0_12px_32px_rgb(var(--accent)/0.10)]">
          <span lang="la" className="font-serif text-5xl font-medium">{t.card.forms[0]}</span>
          <span lang="la" className="font-serif text-lg text-muted">{entryText(t.card)}</span>
          <span className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-accent"><RotateCcw size={14} />Tap to flip</span>
        </button>
        <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface p-6 text-center shadow-[0_12px_32px_rgb(var(--accent)/0.10)]" style={{ transform: 'rotateY(180deg)' }}>
          <motion.div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-good-soft" style={{ opacity: goodTint }} />
          <motion.div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-bad-soft" style={{ opacity: badTint }} />
          <span className="relative text-3xl font-bold tracking-tight">{t.card.meaning}</span>
          {hook && <span className="relative flex items-start gap-2 text-[15px] text-muted"><Lightbulb size={16} className="mt-0.5 shrink-0" />{hook}</span>}
          <div className="relative mt-2 flex gap-2.5">
            <Btn onClick={() => fling(false)}><X size={16} />Missed</Btn>
            <Btn variant="good" onClick={() => fling(true)}><Check size={16} />Knew it</Btn>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
