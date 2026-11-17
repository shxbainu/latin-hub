import { G, gCheck } from '../src/model.js';
import { IRREG, lessonVerbs, subjQ, formsOf, irregGuide, IRR_GUIDE_ORDER } from '../src/subj.js';
let bad = 0; const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) { bad++; console.log('FAIL', m, JSON.stringify(a), JSON.stringify(b)); } };
const find = (id, tk, i) => IRREG.find((v) => v.id === id).t[tk][i];
const gold = (id, tk) => IRREG.find((v) => v.id === id).t[tk].map((c) => c.gold).join(' ');

// irregular verbs, written out
eq(gold('sum', 'spres-a'), 'sim sis sit simus sitis sint', 'sum pres');
eq(gold('sum', 'simpf-a'), 'essem esses esset essemus essetis essent', 'sum impf');
eq(gold('sum', 'sperf-a'), 'fuerim fueris fuerit fuerimus fueritis fuerint', 'sum perf');
eq(gold('sum', 'splup-a'), 'fuissem fuisses fuisset fuissemus fuissetis fuissent', 'sum plup');
eq(gold('absum', 'spres-a'), 'absim abssis abssit absimus abssitis abssint'.replace(/abss/g, 'abs'), 'absum pres');
eq(gold('absum', 'simpf-a').split(' ')[0], 'abessem', 'absum impf');
eq(gold('absum', 'sperf-a').split(' ')[0], 'afuerim', 'absum perf');
eq(gold('desum', 'simpf-a').split(' ')[0], 'deessem', 'desum impf');
eq(gold('praesum', 'splup-a').split(' ')[5], 'praefuissent', 'praesum plup');
eq(gold('possum', 'spres-a'), 'possim possis possit possimus possitis possint', 'possum pres');
eq(gold('possum', 'simpf-a'), 'possem posses posset possemus possetis possent', 'possum impf');
eq(gold('possum', 'sperf-a'), 'potuerim potueris potuerit potuerimus potueritis potuerint', 'possum perf');
eq(gold('possum', 'splup-a'), 'potuissem potuisses potuisset potuissemus potuissetis potuissent', 'possum plup');
eq(gold('eo', 'spres-a'), 'eam eas eat eamus eatis eant', 'eo pres');
eq(gold('eo', 'simpf-a'), 'irem ires iret iremus iretis irent', 'eo impf');
eq(gold('eo', 'sperf-a').split(' ')[0], 'ierim', 'eo perf');
eq(gold('eo', 'splup-a').split(' ')[0], 'issem', 'eo plup');
eq(gold('redeo', 'spres-a').split(' ')[2], 'redeat', 'redeo pres');
eq(gold('redeo', 'simpf-a').split(' ')[0], 'redirem', 'redeo impf');
eq(gold('transeo', 'splup-a').split(' ')[3], 'transissemus', 'transeo plup');
eq(gold('fero', 'spres-a'), 'feram feras ferat feramus feratis ferant', 'fero pres');
eq(gold('fero', 'spres-p'), 'ferar feraris feratur feramur feramini ferantur', 'fero pres pass');
eq(gold('fero', 'simpf-a'), 'ferrem ferres ferret ferremus ferretis ferrent', 'fero impf');
eq(gold('fero', 'simpf-p'), 'ferrer ferreris ferretur ferremur ferremini ferrentur', 'fero impf pass');
eq(gold('fero', 'sperf-a').split(' ')[0], 'tulerim', 'fero perf');
eq(gold('fero', 'splup-a').split(' ')[0], 'tulissem', 'fero plup');
eq(find('fero', 'sperf-p', 0).gold, 'latus sim', 'fero perf pass');
eq(find('fero', 'splup-p', 3).gold, 'lati essemus', 'fero plup pass');
eq(gold('adfero', 'simpf-a').split(' ')[2], 'adferret', 'adfero impf');
eq(gold('adfero', 'sperf-a').split(' ')[0], 'attulerim', 'adfero perf');
eq(find('refero', 'sperf-p', 0).gold, 'relatus sim', 'refero perf pass');
eq(gold('volo', 'spres-a'), 'velim velis velit velimus velitis velint', 'volo pres');
eq(gold('volo', 'simpf-a'), 'vellem velles vellet vellemus velletis vellent', 'volo impf');
eq(gold('nolo', 'spres-a'), 'nolim nolis nolit nolimus nolitis nolint', 'nolo pres');
eq(gold('nolo', 'simpf-a').split(' ')[0], 'nollem', 'nolo impf');
eq(gold('malo', 'spres-a').split(' ')[3], 'malimus', 'malo pres');
eq(gold('malo', 'splup-a').split(' ')[0], 'maluissem', 'malo plup');
eq(gold('fio', 'spres-a'), 'fiam fias fiat fiamus fiatis fiant', 'fio pres');
eq(gold('fio', 'simpf-a'), 'fierem fieres fieret fieremus fieretis fierent', 'fio impf');
eq(find('fio', 'sperf-a', 0).gold, 'factus sim', 'fio perf');
eq(gold('do', 'spres-a'), 'dem des det demus detis dent', 'do pres');
eq(gold('do', 'spres-p'), 'der deris detur demur demini dentur', 'do pres pass');
eq(gold('do', 'simpf-a'), 'darem dares daret daremus daretis darent', 'do impf');
eq(gold('do', 'sperf-a').split(' ')[0], 'dederim', 'do perf');
eq(gold('do', 'splup-a').split(' ')[0], 'dedissem', 'do plup');
eq(gold('edo', 'spres-a').split(' ')[0], 'edam', 'edo pres');
// alternates and gender agreement
eq([gCheck(find('eo', 'sperf-a', 0), 'iverim'), gCheck(find('eo', 'splup-a', 0), 'ivissem'), gCheck(find('eo', 'splup-a', 0), 'iissem')], [true, true, true], 'eo alternates');
eq([gCheck(find('edo', 'simpf-a', 0), 'essem'), gCheck(find('edo', 'spres-a', 2), 'edit')], [true, true], 'edo alternates');
eq([gCheck(find('fero', 'sperf-p', 0), 'lata sim'), gCheck(find('fero', 'sperf-p', 3), 'lata sumus'), gCheck(find('fero', 'sperf-p', 3), 'lati sint')], [true, false, false], 'fero compound agreement');
eq(gCheck(find('sum', 'spres-a', 2), '  SIT '), true, 'case and spaces');

// regular verbs: your lesson vocab
const pool = lessonVerbs();
console.log('lesson verbs', pool.length, 'irregular entries', IRREG.length);
const reg = (id) => pool.find((v) => v.id === id);
eq(G.TENSES['spres-a'].build(reg('moneo') || G.VERBS[1])[5].gold, 'moneant', 'moneo pres');
let made = 0;
pool.concat(G.VERBS).forEach((v) => ['spres-a', 'spres-p', 'simpf-a', 'simpf-p', 'sperf-a', 'sperf-p', 'splup-a', 'splup-p'].forEach((tk) => formsOf(v, tk).forEach((c) => {
  made++;
  if (!c.gold || /undefined|NaN|\s{2}/.test(c.gold) || !gCheck(c, c.gold)) { bad++; console.log('FAIL form', v.id, tk, c.gold); }
})));
console.log('regular forms checked', made);

// the question builder
const seen = {};
for (let i = 0; i < 4000; i++) {
  const q = subjQ({ tense: 'all', voice: 'both', verbs: 'all' }, null);
  if (!q.cell || !q.cell.gold || !gCheck(q.cell, q.cell.gold) || !/^(1st|2nd|3rd) (sg|pl)\./.test(q.ask)) { bad++; console.log('FAIL q', q.head, q.tk, q.ask); break; }
  if (q.verb.irr && !q.verb.t[q.tk]) { bad++; console.log('FAIL irr tense', q.head, q.tk); break; }
  if (!q.verb.irr && q.verb.np && q.tk.endsWith('-p')) { bad++; console.log('FAIL np passive', q.head); break; }
  seen[q.irr ? 'irr' : 'reg'] = (seen[q.irr ? 'irr' : 'reg'] || 0) + 1; seen[q.tk] = (seen[q.tk] || 0) + 1;
}
console.log('mix', JSON.stringify(seen));
const only = (cfg, test, m) => { for (let i = 0; i < 400; i++) { const q = subjQ(cfg, null); if (!test(q)) { bad++; console.log('FAIL', m, q.head, q.tk); return; } } };
only({ tense: 'sperf', voice: 'p', verbs: 'all' }, (q) => q.tk === 'sperf-p', 'perfect passive only');
only({ tense: 'all', voice: 'a', verbs: 'core' }, (q) => q.tk.endsWith('-a') && (q.irr || G.VERBS.some((v) => v.id === q.head)), 'core active');
only({ tense: 'all', voice: 'both', verbs: 'irr' }, (q) => q.irr, 'irregulars only');
only({ tense: 'simpf', voice: 'p', verbs: 'irr' }, (q) => q.irr && q.verb.pass && q.tk === 'simpf-p', 'irregular passives are fero and do');
const lastCheck = new Set(); for (let i = 0; i < 100; i++) lastCheck.add(subjQ({ tense: 'spres', voice: 'a', verbs: 'all' }, 'laudo').head === 'laudo');
eq(lastCheck.has(true), false, 'no immediate repeat');
IRR_GUIDE_ORDER.forEach((id) => { const g = irregGuide(id); if (!g || g.rows.length < 4) { bad++; console.log('FAIL guide', id); } });
console.log(pool.map((v) => v.p[0] + ' ' + v.k).join(', '));
if (bad) console.log('FAILS', bad); else console.log('subj ok');
