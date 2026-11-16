import React, { useRef, useState } from 'react';
import { Download, Copy, Check, Undo2 } from 'lucide-react';
import { Btn, Panel, cx } from './ui.jsx';
import { DOC_LABEL, summarize } from './store.js';

// Claude's page can't hand out files, so there the copy button is the way; the website gets both.
const inClaude = typeof window !== 'undefined' && !!(window.claude && window.claude.use);
const when = (t) => (t ? new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'never');

export function Backup({ store }) {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(null); // the backup text, when the browser won't copy it for us
  const [raw, setRaw] = useState('');
  const [obj, setObj] = useState(null);
  const [plan, setPlan] = useState(null);
  const [err, setErr] = useState('');
  const [force, setForce] = useState(false);
  const [done, setDone] = useState(null);
  const [undone, setUndone] = useState(false);
  const fileRef = useRef(null);

  const mine = Object.keys(DOC_LABEL).map((n) => ({ n, label: DOC_LABEL[n], ...summarize(n, store.get(n)) }));
  const text = () => JSON.stringify(store.exportAll());

  function download() {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text()], { type: 'application/json' }));
      a.download = 'latin-hub-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    } catch (e) { setShown(text()); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(text()); setCopied(true); setShown(null); setTimeout(() => setCopied(false), 2500); } catch (e) { setShown(text()); }
  }
  function check(t) {
    setDone(null); setUndone(false);
    try {
      const o = JSON.parse(t);
      setPlan(store.plan(o)); setObj(o); setErr('');
    } catch (e) { setPlan(null); setObj(null); setErr(e && e.message && !/JSON/.test(e.message) ? e.message : 'That doesn’t look like a backup. Paste the whole thing, from the first { to the last }.'); }
  }
  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setRaw(String(r.result).slice(0, 200)); check(String(r.result)); };
    r.readAsText(f);
    e.target.value = '';
  }
  function restore() { setDone(store.importAll(obj, force)); setPlan(null); setObj(null); setRaw(''); }
  const restoredAny = done && Object.values(done).includes('restored');

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Move your progress between the Claude page, the website and your devices</p>
        <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight">Back up &amp; restore</h1>
      </header>

      <Panel className="flex flex-col gap-4 p-6">
        <h2 className="font-serif text-[26px] font-medium leading-none tracking-tight">1 · Back up</h2>
        <p className="max-w-prose text-[15px] text-muted">Everything you’ve learned, your review schedule, grammar scores and history, in one file. Nothing is sent anywhere. This is what’s in this browser right now:</p>
        <dl className="grid gap-x-6 gap-y-1 text-[15px] sm:grid-cols-[auto_1fr_auto]">
          {mine.map((m) => (
            <React.Fragment key={m.n}>
              <dt className="font-medium">{m.label}</dt>
              <dd className="tabular text-muted">{m.n} {m.unit}</dd>
              <dd className="tabular text-sm text-muted">{m.t ? 'saved ' + when(m.t) : 'nothing yet'}</dd>
            </React.Fragment>
          ))}
        </dl>
        <div className="flex flex-wrap items-center gap-2.5">
          {!inClaude && <Btn variant="primary" onClick={download}><Download size={16} />Download backup file</Btn>}
          <Btn variant={inClaude ? 'primary' : 'secondary'} onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy backup text'}</Btn>
        </div>
        {shown && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-muted">Your browser wouldn’t copy it automatically. Select everything below and copy it.</p>
            <textarea readOnly value={shown} onFocus={(e) => e.target.select()} rows={4} className="w-full rounded-xl border border-line bg-sunken p-3 font-mono text-xs" />
          </div>
        )}
        <p className="max-w-prose text-sm text-muted">Browsers can clear a site’s saved data (clearing history, low storage). Download a backup now and then, and always before you clear anything.</p>
      </Panel>

      <Panel className="flex flex-col gap-4 p-6">
        <h2 className="font-serif text-[26px] font-medium leading-none tracking-tight">2 · Restore</h2>
        <ol className="flex max-w-prose list-decimal flex-col gap-1 pl-5 text-[15px] text-muted">
          <li>On the page that has your progress, press <b className="text-ink">Copy backup text</b> (or download the file).</li>
          <li>Here, paste it below or choose the file, then press <b className="text-ink">Check</b>.</li>
          <li>Look at what it will do, then press <b className="text-ink">Restore</b>.</li>
        </ol>
        <textarea value={raw} onChange={(e) => { setRaw(e.target.value); setPlan(null); setObj(null); setErr(''); setDone(null); }} rows={4} placeholder="Paste the backup text here"
          className="w-full rounded-xl border border-line bg-surface p-3 font-mono text-xs placeholder:font-sans placeholder:text-sm" />
        <div className="flex flex-wrap items-center gap-2.5">
          <Btn variant="primary" disabled={!raw.trim()} onClick={() => check(raw)}>Check</Btn>
          <Btn onClick={() => fileRef.current && fileRef.current.click()}>Choose a backup file</Btn>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
        </div>
        {err && <p role="alert" className="text-[15px] font-semibold text-bad">{err}</p>}

        {plan && (
          <div className="flex flex-col gap-3 rounded-xl bg-sunken p-4">
            <p className="font-semibold">This backup would:</p>
            <ul className="flex flex-col gap-1.5 text-[15px]">
              {plan.map((p) => {
                const use = force || p.takes;
                return (
                  <li key={p.name} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{p.label}:</span>
                    <span className={cx('font-semibold', use ? 'text-good' : 'text-muted')}>{use ? 'replace this browser’s copy' : 'leave this browser’s copy (newer or the same)'}</span>
                    <span className="tabular text-sm text-muted">backup {p.incoming.n} · here {p.current.n} {p.incoming.unit}</span>
                  </li>
                );
              })}
            </ul>
            <label className="flex items-start gap-2.5 text-sm"><input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]" />
              <span className="text-muted">Use the backup for everything, even where this browser is newer.</span></label>
            <div className="flex flex-wrap items-center gap-2.5">
              <Btn variant="primary" onClick={restore}>Restore</Btn>
              <span className="text-sm text-muted">What gets replaced is kept aside, so you can undo.</span>
            </div>
          </div>
        )}
        {done && (
          <p role="status" className="text-[15px] font-semibold text-good">
            {restoredAny ? 'Restored: ' + Object.entries(done).filter(([, v]) => v === 'restored').map(([n]) => DOC_LABEL[n]).join(', ') + '.' : 'Nothing to restore: this browser already has newer progress.'}
          </p>
        )}
        {restoredAny && !undone && (
          <div><Btn size="sm" onClick={() => { if (store.undoRestore()) setUndone(true); setDone(null); }}><Undo2 size={14} />Undo the last restore</Btn></div>
        )}
        {undone && <p role="status" className="text-[15px] font-semibold text-good">Undone. Your earlier progress is back.</p>}
      </Panel>
    </div>
  );
}
