import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion';

// Motion vocabulary, from Remotion's timing guidance and the Motion docs:
// expo-out easing for entrances, critically damped springs for pushes, short durations.
export const EASE = [0.16, 1, 0.3, 1];
export const SPRING = { type: 'spring', stiffness: 520, damping: 40, mass: 0.9 };
export const SOFT = { type: 'spring', bounce: 0.18, visualDuration: 0.35 };
export const FADE_UP = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.24, ease: EASE } };
export const SHAKE = { x: [0, -9, 9, -6, 6, -3, 0], transition: { duration: 0.42, ease: 'easeOut' } };

export function cx(...a) { return a.filter(Boolean).join(' '); }

export const Btn = forwardRef(function Btn({ variant = 'secondary', size = 'md', className, children, ...rest }, ref) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold select-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors';
  const sizes = { sm: 'text-[13px] px-3 py-2', md: 'text-[15px] px-4 py-2.5', lg: 'text-base px-5 py-3' };
  const variants = {
    primary: 'bg-accent text-accent-ink hover:bg-accent/90',
    secondary: 'bg-surface text-ink border border-line hover:border-accent/50',
    ghost: 'text-muted hover:text-ink hover:bg-sunken',
    soft: 'bg-accent-soft text-accent hover:bg-accent-soft/70',
    warm: 'bg-warm-soft text-warm hover:bg-warm-soft/70',
    good: 'bg-good text-white hover:bg-good/90',
  };
  return (
    <motion.button ref={ref} type="button" whileTap={{ scale: 0.97 }} whileHover={{ y: -1 }} transition={SPRING}
      className={cx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </motion.button>
  );
});

export function Chip({ tone = 'plain', className, children, ...rest }) {
  // A small-caps rubric label with a hairline rule, like a marginal note, rather than a filled pill.
  const tones = { plain: 'border-line text-muted', accent: 'border-accent/35 text-accent', warm: 'border-warm/40 text-warm', bad: 'border-bad/40 text-bad', good: 'border-good/40 text-good' };
  return <span className={cx('inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-[3px] text-[10.5px] font-semibold uppercase leading-none tracking-[0.09em]', tones[tone], className)} {...rest}>{children}</span>;
}

export function GenderDot({ g, className }) {
  if (!g) return null;
  const c = { f: 'bg-gf', m: 'bg-gm', n: 'bg-gn' }[g];
  return <span aria-hidden="true" className={cx('inline-block h-2 w-2 shrink-0 rounded-full', c, className)} />;
}

export function Panel({ className, children, ...rest }) {
  return <section className={cx('rounded-2xl border border-line bg-surface', className)} {...rest}>{children}</section>;
}

// A progress ring that draws itself.
export function Ring({ value, max, size = 44, stroke = 5, label }) {
  const r = (size - stroke) / 2, frac = max ? Math.min(1, value / max) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--accent))" strokeWidth={stroke} strokeLinecap="round"
        style={{ rotate: -90, transformOrigin: '50% 50%' }} initial={{ pathLength: 0 }} animate={{ pathLength: frac }} transition={{ duration: 0.8, ease: EASE }} />
    </svg>
  );
}

// Numbers that roll when they change.
export function Roll({ value, className }) {
  return (
    <span className={cx('relative inline-flex overflow-hidden tabular', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>{value}</motion.span>
      </AnimatePresence>
    </span>
  );
}

// Counts up from 0 to a value.
export function CountUp({ to, className, suffix = '' }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v) + suffix);
  useEffect(() => { const c = animate(mv, to, { duration: 0.9, ease: EASE }); return () => c.stop(); }, [to]);
  return <motion.span className={cx('tabular', className)}>{text}</motion.span>;
}

// A check mark that draws itself.
export function DrawCheck({ size = 22, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <motion.path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: EASE }} />
    </svg>
  );
}

// The correct answer types itself in; letters that differ from what you wrote are highlighted.
export function Diff({ gold, typed, className }) {
  const g = String(gold), t = String(typed || '').trim().toLowerCase();
  const gl = g.toLowerCase();
  let p = 0; while (p < gl.length && p < t.length && gl[p] === t[p]) p++;
  let s = 0; while (s < gl.length - p && s < t.length - p && gl[gl.length - 1 - s] === t[t.length - 1 - s]) s++;
  const lo = t ? p : -1, hi = t ? gl.length - s : -1;
  return (
    <motion.span className={cx('inline-flex flex-wrap', className)} initial="h" animate="v" variants={{ v: { transition: { staggerChildren: 0.028 } } }} aria-label={g}>
      {g.split('').map((ch, i) => {
        const diff = i >= lo && i < hi;
        return (
          <motion.span key={i} aria-hidden="true" variants={{ h: { opacity: 0, y: 6 }, v: { opacity: 1, y: 0 } }} transition={{ duration: 0.22, ease: EASE }}
            className={cx(ch === ' ' ? 'w-[0.3em]' : '', diff && 'rounded-[4px] bg-hl px-[1px]')}>{ch}</motion.span>
        );
      })}
    </motion.span>
  );
}

export const Field = forwardRef(function Field({ id, label, state, gold, typed, lang = 'la', big, className, ...rest }, ref) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-muted">{label}</label>
      <motion.input ref={ref} id={id} lang={lang} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck="false"
        animate={state === 'bad' ? SHAKE : state === 'ok' ? { scale: [1, 1.025, 1], transition: { duration: 0.3, ease: EASE } } : {}}
        className={cx('w-full min-w-0 rounded-xl border-2 bg-surface px-3.5 outline-none transition-colors',
          big ? 'py-2.5 font-serif text-[26px]' : 'py-2 font-serif text-xl',
          state === 'ok' ? 'border-good bg-good-soft' : state === 'bad' ? 'border-bad bg-bad-soft' : 'border-line focus:border-accent')}
        {...rest} />
      <AnimatePresence>
        {state === 'bad' && gold != null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE }}
            className="font-serif text-xl font-semibold text-good">
            <Diff gold={gold} typed={typed} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export function Tabs({ tabs, value, onChange, id }) {
  return (
    <div role="tablist" className="flex gap-5 border-b border-line">
      {tabs.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} type="button" onClick={() => onChange(k)}
          className={cx('relative -mb-px pb-2 pt-1 text-[15px] transition-colors', value === k ? 'font-semibold text-ink' : 'font-medium text-muted hover:text-ink')}>
          {label}
          {value === k && <motion.span layoutId={'tab-' + id} className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-accent" transition={SPRING} />}
        </button>
      ))}
    </div>
  );
}

export function Kbd({ children }) {
  return <kbd className="rounded-md border border-line bg-sunken px-1.5 py-0.5 font-sans text-[11px] font-semibold text-muted">{children}</kbd>;
}

export function useLatest(v) { const r = useRef(v); r.current = v; return r; }
export function useForceUpdate() { const [, s] = useState(0); return () => s((x) => x + 1); }
