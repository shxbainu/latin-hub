// Progress storage. Every account document keeps all of its existing fields:
// the new app adds a `v2` block (or new fields in the hub document) and never deletes anything.
import { fromOld, DAY } from './fsrs.js';

export const DOCS = {
  earlier: { doc: 'progress', oldPrefix: 'lvd2' },
  l45: { doc: 'progress-l45', oldPrefix: 'jl45' },
  grammar: { doc: 'progress-grammar', oldLocal: 'jlg-state' },
  hub: { doc: 'progress-hub' },
  lessons: { doc: 'progress-lessons' },
};
const SET_DOC = (n) => n === 'earlier' || n === 'l45' || n === 'lessons';
const OLD_KEYS = ['srs', 'cram', 'removed', 'track', 'learned', 'learnstate'];
const MIRROR = (name) => 'jlv2:' + name;
const clone = (x) => JSON.parse(JSON.stringify(x));

function lsGet(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function lsRaw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }

// What this browser has for a document: the new mirror, else the old keys.
function localDoc(name) {
  const m = lsGet(MIRROR(name));
  if (m) return m;
  const info = DOCS[name];
  if (info.oldPrefix) {
    const d = {};
    let any = false;
    OLD_KEYS.forEach((k) => { const v = lsGet(info.oldPrefix + '-' + k); if (v != null) { d[k] = v; any = true; } });
    d.t = Number(lsRaw(info.oldPrefix + '-savedAt')) || 0;
    return any ? d : null;
  }
  if (info.oldLocal) return lsGet(info.oldLocal);
  return null;
}

// Give a set document its v2 block, built from the old schedule the first time.
export function ensureV2(d) {
  if (d.v2) return d;
  const cards = {};
  Object.keys(d.srs || {}).forEach((k) => {
    const mode = k.split('|')[1];
    if (!(['le', 'el', 'fm', 'gd'].includes(mode) && d.srs[k] && d.srs[k].d)) return;
    const c = fromOld(d.srs[k]);
    const now = Date.now();
    if (c.state === 'review' && c.due < now) c.due = Math.round(now + Math.random() * Math.min(c.S, 4) * DAY);
    cards[k] = c;
  });
  d.v2 = { cards, hooks: {}, learn: null };
  return d;
}

/* ---------- backup files: one JSON with every document ---------- */
export const BACKUP_APP = 'jenneys-latin-hub';
export const DOC_LABEL = { earlier: 'Lessons 42–44 words', l45: 'Lessons 45–46 words', lessons: 'Every other lesson', grammar: 'Grammar scores', hub: 'Days, mistakes, mocks' };
export function summarize(name, d) {
  d = d || {};
  if (name === 'hub') return { n: Object.keys(d.days || {}).length, unit: 'days studied', t: d.t || 0 };
  if (name === 'grammar') return { n: Object.keys(d.stats || {}).length, unit: 'topics scored', t: d.t || 0 };
  return { n: Object.keys(d.learned || {}).length, unit: 'words learned', t: d.t || 0 };
}
export function checkBackup(obj) {
  if (!obj || obj.app !== BACKUP_APP || !obj.docs || typeof obj.docs !== 'object') throw new Error('That isn’t a Latin Hub backup.');
  const names = Object.keys(DOCS).filter((n) => obj.docs[n] && typeof obj.docs[n] === 'object' && !Array.isArray(obj.docs[n]));
  if (!names.length) throw new Error('That backup has no progress in it.');
  return names;
}

export function createStore() {
  const docs = {};
  const listeners = new Set();
  let status = 'local';
  let cloud = null;
  const timers = {};
  let version = 0;

  Object.keys(DOCS).forEach((name) => {
    docs[name] = localDoc(name) || {};
    if (SET_DOC(name)) ensureV2(docs[name]);
    if (name === 'hub') Object.assign(docs.hub, { days: docs.hub.days || {}, mistakes: docs.hub.mistakes || [], cards: docs.hub.cards || {}, mocks: docs.hub.mocks || [], quizDate: docs.hub.quizDate || null });
    if (name === 'grammar') Object.assign(docs.grammar, { stats: docs.grammar.stats || {}, topics: docs.grammar.topics || null, mode: docs.grammar.mode || 'one' });
  });

  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* not available */ }

  const notify = () => { version++; listeners.forEach((fn) => fn(version)); };

  function persist(name) {
    lsSet(MIRROR(name), docs[name]);
    if (!cloud) return;
    status = 'saving';
    clearTimeout(timers[name]);
    timers[name] = setTimeout(() => {
      cloud.doc(name).set(clone(docs[name])).then(() => { status = 'saved'; notify(); }, () => { status = 'error'; notify(); });
    }, 600);
  }

  const api = {
    get: (name) => docs[name],
    status: () => status,
    version: () => version,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    update(name, fn) {
      fn(docs[name]);
      docs[name].t = Date.now();
      persist(name);
      notify();
    },
    exportAll() { return { app: BACKUP_APP, format: 1, exportedAt: Date.now(), docs: clone(docs) }; },
    // What restoring this backup would do, document by document. Nothing changes yet.
    plan(obj) {
      return checkBackup(obj).map((n) => {
        const inc = summarize(n, obj.docs[n]), cur = summarize(n, docs[n]);
        return { name: n, label: DOC_LABEL[n], incoming: inc, current: cur, takes: (obj.docs[n].t || 0) > (docs[n].t || 0) };
      });
    },
    // The newer copy of each document wins (or all of them with force). Fields only this browser has are kept,
    // and the copy being replaced is stashed first so a restore can be undone.
    importAll(obj, force) {
      const out = {};
      checkBackup(obj).forEach((n) => {
        const inc = clone(obj.docs[n]);
        if (!force && (inc.t || 0) <= (docs[n].t || 0)) { out[n] = 'kept'; return; }
        lsSet('jlv2-undo:' + n, docs[n]);
        docs[n] = Object.assign(clone(docs[n]), inc);
        if (SET_DOC(n)) ensureV2(docs[n]);
        persist(n);
        out[n] = 'restored';
      });
      notify();
      return out;
    },
    undoRestore() {
      let any = false;
      Object.keys(DOCS).forEach((n) => { const u = lsGet('jlv2-undo:' + n); if (u) { docs[n] = u; persist(n); any = true; try { localStorage.removeItem('jlv2-undo:' + n); } catch (e) { /* none */ } } });
      if (any) notify();
      return any;
    },
    hasUndo() { return Object.keys(DOCS).some((n) => lsRaw('jlv2-undo:' + n)); },
    flush() { Object.keys(timers).forEach((n) => { if (timers[n]) { clearTimeout(timers[n]); if (cloud) cloud.doc(n).set(clone(docs[n])); } }); },
    async connect() {
      try {
        if (!window.claude || !window.claude.use) return;
        const db = await window.claude.use('db');
        const user = await window.claude.use('user');
        if (!db || !user) return;
        const uid = await user.id();
        if (!uid) return;
        const refs = {};
        Object.keys(DOCS).forEach((n) => { refs[n] = db.doc('data/users/' + uid + '/' + DOCS[n].doc); });
        const snaps = await Promise.all(Object.keys(DOCS).map((n) => refs[n].get().then((s) => [n, s.exists ? s.data() : null])));
        cloud = { doc: (n) => refs[n] };
        snaps.forEach(([n, remote]) => {
          const local = docs[n];
          if (remote && (remote.t || 0) >= (local.t || 0)) {
            docs[n] = clone(remote);
            if (SET_DOC(n)) ensureV2(docs[n]);
            if (n === 'hub') Object.assign(docs.hub, { days: docs.hub.days || {}, mistakes: docs.hub.mistakes || [], cards: docs.hub.cards || {}, mocks: docs.hub.mocks || [], quizDate: docs.hub.quizDate || null });
            if (n === 'grammar') Object.assign(docs.grammar, { stats: docs.grammar.stats || {}, mode: docs.grammar.mode || 'one' });
            lsSet(MIRROR(n), docs[n]);
          } else if (local.t) {
            // This browser is newer: keep any account-only fields, then save.
            if (remote) docs[n] = Object.assign(clone(remote), local);
            persist(n);
          }
        });
        status = 'saved';
        notify();
      } catch (e) { status = 'local'; notify(); }
    },
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') api.flush(); });
  return api;
}
