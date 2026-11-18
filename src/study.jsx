import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, Sparkles, Trophy, RotateCcw, ArrowRight, Target } from 'lucide-react';
import { Btn, Chip, Field, Diff, DrawCheck, GenderDot, Kbd, cx, EASE, SPRING, SHAKE, CountUp } from './ui.jsx';
import {
  SET, POS, useQ, G_RULE, gCheck, rule3, GNAME, entryText, entryRest, genderClass, fieldSpecs, checkVocab, checkCloze,
  diagnose, grade, hookFor, PATTERNS, TNAME, firstGloss,
} from './model.js';

const KIND_LABEL = { le: 'Latin → English', el: 'Whole entry', fm: 'Forms & gender', gd: 'Gender', use: 'Vocab × grammar', cloze: 'In context', gram: 'Grammar' };

function RuleLine({ card }) {
  const r = rule3(card);
  if (!r) return null;
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-muted">
      <span className="rounded border border-line px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider">3rd decl.</span>
      <span className="font-serif text-base text-ink" lang="la">{r.rule.end} → usually {GNAME[r.rule.g]}</span>
      {!r.ok && <strong className="font-semibold text-bad">· {r.note || 'exception'}</strong>}
    </p>
  );
}

function gridClass(q, n) {
  if (!q || !q.grid) return n > 1 ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-3';
  if (q.grid === 'pron') return 'grid grid-cols-3 gap-2.5';
  if (q.grid === 'tenses') return q.cols > 3 ? 'grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid gap-3 grid-cols-1 sm:grid-cols-3';
  return 'grid grid-cols-2 gap-3';
}
// Show 6-person and declension tables as sg. column | pl. column.
function cellOrder(q, n) {
  if (q && q.grid === 'six') return [0, 3, 1, 4, 2, 5];
  if (q && q.grid === 'decl') return [0, 5, 1, 6, 2, 7, 3, 8, 4, 9];
  return Array.from({ length: n }, (_, i) => i);
}

export function StudyCard({ item, store, mode = 'practice', onDone }) {
  const set = SET[item.setId];
  const q = useMemo(() => (item.kind === 'use' ? useQ(item.card) : item.q || null), [item]);
  const card = item.card;
  const specs = useMemo(() => {
    if (item.kind === 'le') return [{ label: 'English meaning', lang: 'en' }];
    if (item.kind === 'el' || item.kind === 'fm') return fieldSpecs(card, item.kind).map((s) => ({ label: s.label, lang: s.kind === 'gender' ? 'en' : 'la', placeholder: s.kind === 'gender' ? 'm / f / n' : '' }));
    if (item.kind === 'cloze') return [{ label: 'Fill the blank', lang: 'la' }];
    if (q && q.choice) return [];
    if (q) return q.labels.map((l) => ({ label: l, lang: 'la' }));
    return [];
  }, [item, q]);
  const [values, setValues] = useState(() => specs.map(() => ''));
  const [res, setRes] = useState(null);
  const [hint, setHint] = useState(false);
  const [override, setOverride] = useState(false);
  const refs = useRef([]);
  const formRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => { setTimeout(() => refs.current[0] && refs.current[0].focus(), 30); return () => clearTimeout(timer.current); }, []);

  function check(gaveUp, gdPick) {
    if (res) return;
    let r;
    if (item.kind === 'gd') {
      const ok = !gaveUp && genderClass(card.gender) === gdPick;
      r = { ok, cells: [ok], golds: [card.gender], pickedGender: gdPick };
    } else if (q && q.choice) {
      const ok = !gaveUp && gdPick === q.answer;
      const gold = q.choices.find((c) => c.id === q.answer), mine = q.choices.find((c) => c.id === gdPick);
      r = { ok, cells: [ok], golds: [gold.label], picked: gdPick, pickedLabel: mine ? mine.label : '—', goldLabel: gold.label };
      if (!ok) r.diag = { cat: q.topic, msg: 'Answer: ' + gold.label + (q.topic === 'seq' ? ' (' + gold.sub + ')' : '') + '. ' + q.why };
    } else if (item.kind === 'cloze') {
      const ok = !gaveUp && checkCloze(item.cz, values[0]);
      r = { ok, cells: [ok], golds: [item.cz.ans[0]] };
    } else if (q) {
      const cells = q.cells.map((c, i) => !gaveUp && gCheck(c, values[i]));
      r = { ok: cells.every(Boolean), cells, golds: q.cells.map((c) => c.gold) };
    } else {
      const v = checkVocab(item, values, set);
      r = { ok: !gaveUp && v.ok, cells: v.cells.map((x) => !gaveUp && x), golds: v.golds || [card.meaning] };
    }
    if (!r.ok && !gaveUp && !r.diag) r.diag = diagnose(item, q, values[0]);
    setRes(r);
    if (mode === 'mock' || mode === 'place') { commit(r.ok ? 3 : 1, r); return; }
    if (r.ok) timer.current = setTimeout(() => commit(hint ? 2 : 3, r), 1100);
  }
  function commit(g, r = res) {
    clearTimeout(timer.current);
    if (mode !== 'place') grade(store, { ...item, q }, g, g === 1 ? r && r.diag : null);
    onDone({ ok: g > 1, item, q, diag: r && r.diag, values, golds: r && r.golds, picked: r && (r.pickedGender || r.picked), pickedLabel: r && r.pickedLabel, goldLabel: r && r.goldLabel });
  }

  // Keyboard: Enter moves on after an answer; m / f / n answer a gender card.
  useEffect(() => {
    function onKey(e) {
      if (item.kind === 'gd' && !res && ['m', 'f', 'n'].includes(e.key.toLowerCase()) && !e.metaKey && !e.ctrlKey) { e.preventDefault(); check(false, e.key.toLowerCase()); return; }
      if (q && q.choice && !res && /^[1-9]$/.test(e.key) && q.choices[+e.key - 1]) { e.preventDefault(); check(false, q.choices[+e.key - 1].id); return; }
      if (res && mode !== 'mock' && mode !== 'place' && e.key === 'Enter' && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); commit(override ? 3 : res.ok ? (hint ? 2 : 3) : 1); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const hookText = card && set ? hookFor(store, set, card) : null;
  const hintText = item.kind === 'le' ? (hookText ? 'Hook: ' + hookText : 'Starts with: ' + firstGloss(card.meaning)[0])
    : item.kind === 'el' || item.kind === 'fm' ? 'Starts with: ' + card.forms.map((f) => f[0] + '…').join(', ')
    : item.kind === 'cloze' ? 'Starts with: ' + item.cz.ans[0][0] + '…'
    : q && q.topic === 'clause' ? 'Check the main clause first: a verb of ordering, of asking / knowing, or of saying? A “so” word? Then is the verb an infinitive or a subjunctive?'
    : q && q.topic === 'seq' ? 'Present or future main verb → present (same time) or perfect (before). Past main verb → imperfect (same time) or pluperfect (before).'
    : q ? G_RULE[q.rule] : '';

  const g = card && genderClass(card.gender);
  const order = cellOrder(q, specs.length);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip tone="accent">{KIND_LABEL[item.kind]}</Chip>
          {item.kind === 'gram' && q && <Chip>{TNAME[q.topic]}</Chip>}
          {q && q.tag && <Chip>{q.tag}</Chip>}
          {set && item.kind !== 'gram' && <Chip>{set.short}</Chip>}
          {card && card.note && item.kind !== 'cloze' && <Chip>{card.note}</Chip>}
          {item.again && <Chip tone="warm"><RotateCcw size={12} />Again</Chip>}
        </div>

        {(item.kind === 'le' || item.kind === 'fm' || item.kind === 'gd') && (
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span lang="la" className="font-serif text-[clamp(44px,9vw,68px)] font-medium leading-none">{card.forms[0]}</span>
            {item.kind === 'le' && entryRest(card) && <span lang="la" className="flex items-center gap-2 font-serif text-xl text-muted"><GenderDot g={g} />{entryRest(card)}</span>}
            {item.kind === 'gd' && <span lang="la" className="font-serif text-2xl text-muted">{card.forms[1]}</span>}
          </div>
        )}
        {item.kind === 'el' && <p className="text-[clamp(26px,5vw,34px)] font-semibold leading-tight tracking-tight">{card.meaning}</p>}
        {q && q.choice && (
          <div className="flex flex-col gap-2">
            <p lang="la" className="font-serif text-[clamp(24px,4.6vw,34px)] leading-snug">
              {q.sentence.split(/(\[[^\]]*\])/).map((part, i) => part[0] === '[' ? (
                <span key={i} className="rounded-md bg-accent-soft px-1.5 py-0.5 text-accent box-decoration-clone">{part.slice(1, -1) === '___' ? <span className="inline-block min-w-[3em] border-b-2 border-accent align-baseline">&nbsp;</span> : part.slice(1, -1)}</span>
              ) : <React.Fragment key={i}>{part}</React.Fragment>)}
            </p>
            {(q.topic === 'seq' || res) && <p className="text-base text-muted">{q.en}</p>}
          </div>
        )}
        {q && !q.choice && (
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span lang="la" className="font-serif text-[clamp(40px,8vw,62px)] font-medium leading-none">{q.head}</span>
            <span lang="la" className="font-serif text-lg text-muted">{q.sub}</span>
          </div>
        )}
        {item.kind === 'cloze' && (
          <div className="flex flex-col gap-2">
            <p lang="la" className="font-serif text-[clamp(24px,4.5vw,32px)] leading-snug">
              {item.cz.la.split('___').map((part, i, arr) => (
                <React.Fragment key={i}>{part}{i < arr.length - 1 && <span className="mx-1 inline-block min-w-[3.2em] border-b-2 border-accent align-baseline" />}</React.Fragment>
              ))}
            </p>
            <p className="text-base text-muted">{item.cz.en}</p>
          </div>
        )}
        <p className="text-lg font-medium">
          {item.kind === 'le' && 'What does it mean?'}
          {item.kind === 'el' && 'Write the whole entry, with the gender.'}
          {item.kind === 'fm' && 'Give the other forms and the gender.'}
          {item.kind === 'gd' && 'Which gender?'}
          {item.kind === 'cloze' && 'Fill in the blank.'}
          {q && q.topic === 'clause' && 'What kind of clause is highlighted?'}
          {q && q.topic === 'seq' && <>Pick the <span className="text-accent">{q.ask}</span>.</>}
          {q && !q.choice && <>Give the <span className="text-accent">{q.ask.replace(/\.$/, "")}</span>.</>}
        </p>
      </div>

      {q && q.choice ? (
        <div className={cx('grid gap-2.5', q.choices.length > 4 ? 'sm:grid-cols-2' : 'grid-cols-2')}>
          {q.choices.map((c, i) => {
            const picked = res && res.picked === c.id, right = res && q.answer === c.id;
            return (
              <motion.button key={c.id} type="button" whileTap={{ scale: 0.98 }} onClick={() => check(false, c.id)} disabled={!!res}
                animate={picked && !res.ok ? SHAKE : {}}
                className={cx('flex items-center gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-colors',
                  right && mode !== 'place' && mode !== 'mock' ? 'border-good bg-good-soft' : picked ? 'border-bad bg-bad-soft' : 'border-line bg-surface hover:border-accent/60')}>
                <Kbd>{i + 1}</Kbd>
                <span className="min-w-0">
                  <span lang={q.topic === 'seq' ? 'la' : 'en'} className={cx('block font-semibold', q.topic === 'seq' && 'font-serif text-lg')}>{c.label}</span>
                  <span className="block text-[13px] text-muted">{c.sub}</span>
                </span>
              </motion.button>
            );
          })}
          {!res && mode !== 'mock' && (
            <div className="col-span-full flex flex-wrap gap-2.5 pt-1">
              <Btn onClick={() => setHint(true)} disabled={hint}><Lightbulb size={16} />Hint</Btn>
              <Btn variant="ghost" onClick={() => check(true)}>I don’t know</Btn>
            </div>
          )}
          {hint && !res && <p className="col-span-full text-[15px] text-muted">{hintText}</p>}
        </div>
      ) : item.kind === 'gd' ? (
        <div className="grid grid-cols-3 gap-2.5">
          {['m', 'f', 'n'].map((k) => {
            const picked = res && res.pickedGender === k, right = res && g === k;
            return (
              <motion.button key={k} type="button" whileTap={{ scale: 0.97 }} onClick={() => check(false, k)} disabled={!!res}
                animate={picked && !res.ok ? SHAKE : {}}
                className={cx('flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3.5 text-[15px] font-semibold transition-colors',
                  right ? 'border-good bg-good-soft text-good' : picked ? 'border-bad bg-bad-soft text-bad' : 'border-line bg-surface hover:border-accent/60')}>
                <GenderDot g={k} />{GNAME[k]} <Kbd>{k}</Kbd>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <form ref={formRef} autoComplete="off" noValidate onSubmit={(e) => { e.preventDefault(); check(false); }} className="flex flex-col gap-4">
          <div className={gridClass(q, specs.length)}>
            {order.map((i) => (
              <Field key={i} id={'f' + i} ref={(el) => (refs.current[i] = el)} label={specs[i].label} lang={specs[i].lang} placeholder={specs[i].placeholder}
                big={specs.length === 1} value={values[i]} readOnly={!!res}
                state={res ? (res.cells[i] || override ? 'ok' : 'bad') : null} gold={res && mode !== 'mock' ? res.golds[i] : null} typed={values[i]}
                onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
                onKeyDown={(e) => { if (e.key === 'Enter' && !res && i !== specs.length - 1 && specs.length > 1) { e.preventDefault(); const next = order[order.indexOf(i) + 1]; if (refs.current[next]) refs.current[next].focus(); else formRef.current.requestSubmit(); } }} />
            ))}
          </div>
          {!res && (
            <div className="flex flex-wrap items-center gap-2.5">
              <Btn variant="primary" type="submit">Check</Btn>
              {mode !== 'mock' && <Btn onClick={() => setHint(true)} disabled={hint}><Lightbulb size={16} />Hint</Btn>}
              <Btn variant="ghost" onClick={() => check(true)}>{mode === 'mock' ? 'Skip' : 'I don’t know'}</Btn>
            </div>
          )}
          <AnimatePresence>
            {hint && !res && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}
                className="text-[15px] text-muted">{hintText}</motion.p>
            )}
          </AnimatePresence>
        </form>
      )}

      <AnimatePresence>
        {res && mode !== 'mock' && mode !== 'place' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex flex-col gap-3">
            <div className={cx('flex items-center gap-2 text-sm font-bold uppercase tracking-wide', res.ok || override ? 'text-good' : 'text-bad')}>
              {res.ok || override ? <DrawCheck size={20} /> : <X size={18} strokeWidth={2.6} />}
              {res.ok || override ? (hint ? 'Right, with a hint' : 'Correct') : res.cells.length > 1 ? res.cells.filter(Boolean).length + ' of ' + res.cells.length + ' right' : 'Not quite'}
            </div>
            {item.kind === 'le' && <p className="font-serif text-2xl font-semibold text-good">{card.meaning}</p>}
            {(item.kind === 'le' || item.kind === 'gd') && <p lang="la" className="font-serif text-lg text-muted">{entryText(card)}{item.kind === 'gd' ? ' · ' + card.meaning : ''}</p>}
            {res.diag && (
              <div className="flex items-start gap-3 rounded-xl bg-sunken px-4 py-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warm-soft text-warm"><Target size={16} /></span>
                <p className="text-[15px] leading-relaxed"><strong className="font-semibold">{PATTERNS[res.diag.cat].label}.</strong> {res.diag.msg}</p>
              </div>
            )}
            {item.kind === 'cloze' && <p className="text-[15px] text-muted"><span lang="la" className="font-serif text-lg text-ink">{item.cz.la.replace('___', item.cz.ans[0])}</span><br />{item.cz.why}</p>}
            {q && q.choice && res.ok && <p className="text-[15px] text-muted">{q.why}</p>}
            {q && !q.choice && !res.ok && <p className="rounded-xl bg-accent-soft/60 px-4 py-3 text-[15px] leading-relaxed"><strong className="font-semibold">Rule.</strong> {G_RULE[q.rule]}</p>}
            {q && q.full && q.grid !== 'six' && !res.ok && <p lang="la" className="text-sm text-muted">Whole tense: {q.full.map((c) => c.gold).join(', ')}</p>}
            {q && q.extra && <p lang="la" className="text-sm text-muted">{q.extra}</p>}
            {card && (item.kind === 'gd' || item.kind === 'el' || item.kind === 'fm') && <RuleLine card={card} />}
            {hookText && !res.ok && item.kind !== 'gram' && (
              <div className="flex items-start gap-3 rounded-xl bg-hl/40 px-4 py-3">
                <Lightbulb size={18} className="mt-0.5 shrink-0" /><p className="text-[15px] leading-relaxed">{hookText}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2.5">
              <Btn variant="primary" onClick={() => commit(override ? 3 : res.ok ? (hint ? 2 : 3) : 1)}>Next <ArrowRight size={16} /></Btn>
              {!res.ok && !override && <Btn onClick={() => { setOverride(true); commit(3); }}>I was correct</Btn>}
              <span className="ml-auto hidden text-xs text-muted sm:inline"><Kbd>Enter</Kbd> next</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- a study session: a deck of cards with misses coming back ---------- */
const cardVariants = {
  enter: { opacity: 0, x: 44, scale: 0.985 },
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.36, ease: EASE } },
  exit: (dir) => (dir === 'ok'
    ? { opacity: 0, x: -70, rotate: -1.5, transition: { duration: 0.24, ease: EASE } }
    : { opacity: 0, y: 34, scale: 0.94, transition: { duration: 0.28, ease: EASE } }),
};

export function Session({ store, items, title, onExit, more, mode = 'practice', onFinish, emptyText, noSummary, header, onCurrent }) {
  const [queue, setQueue] = useState(items);
  const [n, setN] = useState(0);
  const [dir, setDir] = useState('ok');
  const [log, setLog] = useState([]);
  const [total] = useState(items.length);
  const start = useRef(Date.now());
  const cur = queue[0];

  function done(r) {
    setDir(r.ok ? 'ok' : 'miss');
    setLog((l) => l.concat(r));
    setQueue((q) => {
      let rest = q.slice(1);
      if (!r.ok && mode !== 'mock' && mode !== 'place' && r.item.kind !== 'gram') rest.splice(Math.min(3, rest.length), 0, { ...r.item, again: true, uid: Math.random() });
      if (more && rest.length < 3) rest = rest.concat(more());
      return rest;
    });
    setN((x) => x + 1);
  }
  useEffect(() => { if (cur && onCurrent) onCurrent(cur); }, [cur && cur.key]);
  useEffect(() => { if (!cur && onFinish) onFinish(log, Date.now() - start.current); }, [cur]);

  const right = log.filter((r) => r.ok).length;
  const firstPass = Math.min(total, log.length);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold">{title}</span>
            <span className="tabular text-muted">{more ? log.length + ' answered · ' + right + ' right' : Math.min(firstPass + 1, total) + ' of ' + total}</span>
          </div>
          {!more && total <= 40 ? (
            <div className="flex gap-[3px]" aria-hidden="true">
              {Array.from({ length: total }, (_, i) => {
                const r = log[i];
                return <motion.span key={i} className="h-[5px] flex-1 rounded-full" initial={false}
                  animate={{ backgroundColor: r ? (r.ok ? 'rgb(var(--accent))' : 'rgb(var(--warm))') : i === log.length ? 'rgb(var(--accent) / 0.35)' : 'rgb(var(--line))', scaleY: i === log.length ? 1.6 : 1 }}
                  transition={{ duration: 0.3, ease: EASE }} />;
              })}
            </div>
          ) : (
            <div className="h-[5px] rounded-full bg-line"><motion.div className="h-full rounded-full bg-accent" animate={{ width: (more ? Math.min(100, log.length * 5) : (firstPass / Math.max(1, total)) * 100) + '%' }} transition={SPRING} /></div>
          )}
        </div>
        {header}
        {onExit && <Btn variant="ghost" size="sm" onClick={() => onExit(log, Date.now() - start.current)} aria-label="End session"><X size={16} />End</Btn>}
      </div>

      {cur ? (
        <div className="relative pb-5">
          <div aria-hidden="true" className="absolute inset-x-6 bottom-0 h-16 rounded-2xl bg-line/70" />
          <div aria-hidden="true" className="absolute inset-x-3 bottom-2.5 h-16 rounded-2xl bg-line" />
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.div key={n} custom={dir} variants={cardVariants} initial="enter" animate="center" exit="exit"
              className="relative rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_rgb(var(--accent)/0.08)] sm:p-7">
              <StudyCard item={cur} store={store} mode={mode} onDone={done} />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        mode !== 'mock' && mode !== 'place' && !noSummary && <Summary log={log} ms={Date.now() - start.current} onExit={onExit} emptyText={emptyText} />
      )}
    </div>
  );
}

export function Summary({ log, ms, onExit, emptyText, extra }) {
  const right = log.filter((r) => r.ok).length;
  const cats = {};
  log.forEach((r) => { if (r.diag) cats[r.diag.cat] = (cats[r.diag.cat] || 0) + 1; });
  return (
    <motion.div initial="h" animate="v" variants={{ v: { transition: { staggerChildren: 0.07 } } }} className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-7">
      <motion.span variants={{ h: { scale: 0.6, opacity: 0 }, v: { scale: 1, opacity: 1 } }} transition={{ type: 'spring', bounce: 0.45, visualDuration: 0.45 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-soft text-warm"><Trophy size={28} /></motion.span>
      <motion.h2 variants={{ h: { opacity: 0, y: 8 }, v: { opacity: 1, y: 0 } }} className="text-2xl font-bold tracking-tight">{log.length ? 'Session done' : emptyText || 'Nothing due right now'}</motion.h2>
      {log.length > 0 && (
        <motion.div variants={{ h: { opacity: 0, y: 8 }, v: { opacity: 1, y: 0 } }} className="flex flex-wrap gap-6">
          <div><div className="text-3xl font-bold"><CountUp to={log.length} /></div><div className="text-sm text-muted">answered</div></div>
          <div><div className="text-3xl font-bold"><CountUp to={Math.round((right / log.length) * 100)} suffix="%" /></div><div className="text-sm text-muted">right first time</div></div>
          <div><div className="text-3xl font-bold"><CountUp to={Math.max(1, Math.round(ms / 60000))} /></div><div className="text-sm text-muted">minutes</div></div>
        </motion.div>
      )}
      {Object.keys(cats).length > 0 && (
        <motion.div variants={{ h: { opacity: 0, y: 8 }, v: { opacity: 1, y: 0 } }} className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold">Mistakes this session:</span>
          {Object.entries(cats).map(([c, k]) => <Chip key={c} tone="warm">{PATTERNS[c].label} · {k}</Chip>)}
        </motion.div>
      )}
      {extra}
      {onExit && <motion.div variants={{ h: { opacity: 0, y: 8 }, v: { opacity: 1, y: 0 } }}><Btn variant="primary" onClick={onExit}><Sparkles size={16} />Done</Btn></motion.div>}
    </motion.div>
  );
}
