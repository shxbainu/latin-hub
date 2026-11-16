// Bundles each model test for node, runs it, and fails on a crash, a "FAIL ..." line or "FAILS n".
import { build } from 'esbuild';
import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';

const files = ['model.test.js', 'place.test.js', 'free.js', 'space.js'];
let failed = 0;
for (const f of files) {
  const out = path.join(os.tmpdir(), 'jlh-' + f + '.mjs');
  await build({ entryPoints: ['test/' + f], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error' });
  let text = '', crashed = false;
  try { text = execFileSync('node', [out], { encoding: 'utf8' }); } catch (e) { text = (e.stdout || '') + (e.stderr || ''); crashed = true; }
  const bad = text.split('\n').filter((l) => /^FAIL\b/.test(l) || /FAILS [1-9]/.test(l));
  const fine = !crashed && !bad.length;
  console.log((fine ? 'ok   ' : 'FAIL ') + f);
  if (!fine) { failed++; console.log((bad.length ? bad.join('\n') : text.slice(-600))); }
}
process.exit(failed ? 1 : 0);
