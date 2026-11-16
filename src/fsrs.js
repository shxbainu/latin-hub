// FSRS-4.5 memory model: each card tracks stability S (days until recall drops to 90%)
// and difficulty D (1-10). Grades: 1 again, 2 hard, 3 good, 4 easy.
const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5;
const FACTOR = 19 / 81;
export const DAY = 86400000;
export const MIN = 60000;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

const initS = (g) => W[g - 1];
const initD = (g) => clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10);
const nextD = (D, g) => clamp(W[7] * initD(4) + (1 - W[7]) * (D - W[6] * (g - 3)), 1, 10);
const sRecall = (D, S, R, g) => S * (1 + Math.exp(W[8]) * (11 - D) * Math.pow(S, -W[9]) * (Math.exp(W[10] * (1 - R)) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1));
const sForget = (D, S, R) => Math.min(S, W[11] * Math.pow(D, -W[12]) * (Math.pow(S + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R)));

export function retrievability(c, now) {
  if (!c || !c.S || !c.last) return 0;
  const t = Math.max(0, (now - c.last) / DAY);
  return Math.pow(1 + (FACTOR * t) / c.S, DECAY);
}
export function intervalDays(S, r) {
  return (S / FACTOR) * (Math.pow(r, 1 / DECAY) - 1);
}

// opts: { deadline (ms, review everything before it), retention }
export function review(prev, g, now, opts = {}) {
  const r = opts.retention || 0.9;
  const c = prev ? { ...prev } : { reps: 0, lapses: 0, state: 'new', h: [] };
  c.h = (c.h || []).concat(g).slice(-8);
  c.reps = (c.reps || 0) + 1;
  let due;
  if (c.state === 'new' || !c.S) {
    c.S = initS(g);
    c.D = initD(g);
    c.state = 'learning';
    due = now + (g === 1 ? MIN : 10 * MIN);
  } else if (c.state === 'learning' || c.state === 'relearning') {
    c.D = nextD(c.D, g);
    if (g === 1) due = now + MIN;
    else {
      c.state = 'review';
      due = now + Math.max(0.5, intervalDays(c.S, r)) * DAY;
    }
  } else {
    const R = retrievability(c, now);
    c.D = nextD(c.D, g);
    if (g === 1) {
      c.lapses = (c.lapses || 0) + 1;
      c.S = Math.max(0.1, sForget(c.D, c.S, R));
      c.state = 'relearning';
      due = now + 5 * MIN;
    } else {
      c.S = Math.min(365, sRecall(c.D, c.S, R, g));
      due = now + Math.max(1, intervalDays(c.S, r)) * DAY * (0.95 + Math.random() * 0.1);
    }
  }
  if (opts.deadline && now < opts.deadline && due > opts.deadline) {
    due = Math.max(now + 10 * MIN, opts.deadline - Math.random() * 2 * 3600000);
  }
  c.first = c.first || now;
  c.last = now;
  c.due = Math.round(due);
  c.lastGrade = g;
  return c;
}

// Seed a card from the previous step-based schedule ({s step, l lapses, n reviews, d due}).
const STEP_S = [0.02, 0.05, 0.6, 1.2, 2.5, 5, 10, 20];
export function fromOld(st) {
  const s = Math.max(0, Math.min(7, st.s | 0));
  const S = STEP_S[s];
  const n = st.n || 0, l = st.l || 0;
  return {
    S, D: clamp(4.5 + 1.2 * l - 0.15 * Math.max(0, n - l), 1, 9.5), reps: n, lapses: l,
    state: s >= 2 ? 'review' : 'learning', due: st.d || Date.now(),
    last: (st.d || Date.now()) - (s >= 2 ? S * DAY : 10 * MIN), h: [], lastGrade: st.last ? 3 : 1, migrated: true,
  };
}
