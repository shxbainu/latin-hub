import { SETS, verbOf, nounOf, useQ, grammarQ, TOPICS, diagnose, CLOZE, gCheck, checkVocab, lookAlikes } from '../src/model.js';
import { review, fromOld } from '../src/fsrs.js';
import { G } from '../src/legacy.js';
let bad = 0; const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) { bad++; console.log('FAIL', m, a, b); } };
// verbs built from vocab
const card = (set, id) => SETS.flatMap(s => s.cards).find(c => c.id === id);
const rogo = verbOf(card('l45', 'rogo'));
eq(G.TENSES['simpf-a'].build(rogo)[5].gold, 'rogarent', 'rogo simpf');
eq(G.TENSES['fut-p'].build(verbOf(card('l45', 'quaero')))[0].gold, 'quaerar', 'quaero fut-p');
eq(verbOf(card('l45', 'persuadeo')).np, true, 'persuadeo np');
eq(G.TENSES['perf-a'].build(verbOf(card('earlier', 'consisto')))[0].gold, 'constiti', 'consisto perf');
// nouns built from vocab
const nn = (s, id) => nounOf(card(s, id));
eq(nn('l45', 'oculus').cells.map(c => c.gold).join(' '), 'oculus oculi oculo oculum oculo oculi oculorum oculis oculos oculis', 'oculus');
eq(nn('l45', 'fides').cells[1].gold, 'fidei', 'fides');
eq(nn('l45', 'vigilia').cells[6].gold, 'vigiliarum', 'vigilia');
eq(nn('earlier', 'potestas').cells[3].gold, 'potestatem', 'potestas');
eq(nn('l45', 'nemo'), null, 'nemo skipped'); eq(nn('earlier', 'hiberna'), null, 'plural only skipped');
eq(nn('earlier', 'iudicium').cells[1].gold, 'iudici', 'iudicium gen');
eq(gCheck(nn('earlier', 'iudicium').cells[1], 'iudicii'), true, 'iudicii accepted');
eq(nn('l45', 'vis').cells[3].gold, 'vim', 'vis');
// every vocab card: use questions generate without throwing
let made = 0; SETS.forEach(s => s.cards.forEach(c => { for (let i = 0; i < 20; i++) { const q = useQ(c); if (q) { made++; if (!q.cells[0].gold) { bad++; console.log('empty', c.id); } } } }));
console.log('use questions generated', made);
TOPICS.forEach(([t]) => ['one', 'table'].forEach(m => { for (let i = 0; i < 30; i++) { const q = grammarQ(t, m); if (!q || (q.choice ? !q.choices.some((c) => c.id === q.answer) : !q.cells.length)) { bad++; console.log('bad grammar', t, m); } } }));
// diagnosis
const q = { verb: rogo, tk: 'simpf-a', person: 5 };
eq(diagnose(null, q, 'rogabant').cat, 'mood', 'mood diag');
eq(diagnose(null, { verb: rogo, tk: 'fut-a', person: 2 }, 'rogabat').cat, 'tense', 'tense diag');
eq(diagnose(null, { verb: verbOf(card('l45', 'quaero')), tk: 'fut-a', person: 2 }, 'quaerebit').cat, 'conj', 'conj diag');
eq(diagnose(null, { verb: rogo, tk: 'pres-a', person: 2 }, 'rogatur').cat, 'voice', 'voice diag');
eq(diagnose(null, { verb: rogo, tk: 'pres-a', person: 2 }, 'rogant').cat, 'person', 'person diag');
const oc = nn('l45', 'oculus');
eq(diagnose(null, { noun: oc, slot: 2 }, 'oculum').cat, 'case', 'case diag');
eq(diagnose(null, { noun: oc, slot: 3 }, 'oculos').cat, 'number', 'number diag');
eq(diagnose({ kind: 'le', card: card('l45', 'rogo') }, null, 'demand').other, 'postulo', 'confusion diag');
// vocab checking with gender
const set = SETS.find(s => s.id === 'L45');
eq(checkVocab({ kind: 'el', card: card('l45', 'vestis') }, ['vestis', 'vestis', 'f'], set).ok, true, 'el ok');
eq(checkVocab({ kind: 'el', card: card('l45', 'vestis') }, ['vestis', 'vestis', 'm'], set).cells, [true, true, false], 'el gender wrong');
eq(checkVocab({ kind: 'le', card: card('l45', 'quaero') }, ['inquire'], set).ok, true, 'le syn');
// fsrs
let c = review(null, 3, 0); eq(c.state, 'learning', 'new->learning'); c = review(c, 3, 600000); eq(c.state, 'review', 'graduate');
console.log('first interval days', ((c.due - 600000) / 864e5).toFixed(2));
const c2 = review(c, 3, c.due); console.log('second interval days', ((c2.due - c.due) / 864e5).toFixed(2));
const c3 = review(c2, 1, c2.due); eq(c3.state, 'relearning', 'lapse'); eq(c3.lapses, 1, 'lapses');
const dl = review(c, 3, c.due, { deadline: c.due + 864e5 }); eq(dl.due <= c.due + 864e5, true, 'deadline cap');
console.log('old step 4 ->', JSON.stringify(fromOld({ s: 4, l: 1, n: 6, d: 123, last: 1 })));
console.log('look-alikes for rogo:', lookAlikes(card('l45', 'rogo')).map(x => x.c.id));
console.log('cloze words exist:', CLOZE.every(cz => card('l45', cz.word)));
console.log('FAILS', bad);
// lessons
import { LESSON_NUMS, SET, readiness, placementItems, verdictOf, prepItems, allItems, itemAssessment } from '../src/model.js';
import { ASSESS, nextAssessment } from '../src/course.js';
eq(LESSON_NUMS.length, 59, '59 lessons');
const ids = new Set(); let dup = 0, total = 0;
SETS.forEach(s => s.cards.forEach(c => { total++; if (ids.has(c.id)) { dup++; console.log('dup', c.id); } ids.add(c.id); if (!c.meaning) { bad++; console.log('no meaning', c.id); } if ((c.pos === 'n') && !c.gender) { bad++; console.log('noun without gender', c.id); } }));
eq(dup, 0, 'unique ids'); console.log('total words', total);
eq(SET.L42.cards[0].id, 'aurum', 'L42 starts aurum'); eq(SET.L43.cards[0].id, 'calamitas', 'L43'); eq(SET.L44.cards[0].id, 'altitudo', 'L44');
eq(SET.L45.cards[0].id, 'ergo', 'L45'); eq(SET.L46.cards.length, 10, 'L46 10 nouns'); eq(SET.L45.cards.length + SET.L46.cards.length, 22, '45+46');
eq(SET.L42.doc + SET.L45.doc + SET.L7.doc, 'earlierl45lessons', 'docs');
// generated forms for new vocab
const vf = (id) => verbOf(card(null, id));
eq(G.TENSES['simpf-a'].build(vf('L22:duco'))[5].gold, 'ducerent', 'duco');
eq(G.TENSES['spres-a'].build(vf('L24:capio'))[0].gold, 'capiam', 'capio subj');
eq(vf('L52:eo'), null, 'eo skipped'); eq(vf('L50:conor'), null, 'deponent skipped'); eq(vf('L32:possum'), null, 'possum skipped');
eq(nounOf(card(null, 'L16:mare')).cells[4].gold, 'mari', 'mare i-stem abl');
eq(nounOf(card(null, 'L29:cornu')), null, 'cornu skipped');
eq(nounOf(card(null, 'L31:res')).cells[1].gold, 'rei', 'res 5th');
// every le card has a gloss
SETS.forEach(s => s.cards.forEach(c => { if (!glossesOf(c)) { bad++; console.log('no gloss', c.id); } }));
function glossesOf(c) { return c.meaning.replace(/\([^)]*\)/g, ' ').split(/[;,?]/).some(x => x.trim()) || s0(c); }
function s0(c) { return SETS.some(s => s.syn[c.id]); }
// clause + seq questions
for (let i = 0; i < 200; i++) { const q = grammarQ('seq'); if (new Set(q.choices.map(c => c.label)).size !== 4) { bad++; console.log('seq dup choices', q.choices.map(c => c.label)); break; } }
console.log('seq sample:', JSON.stringify((() => { const q = grammarQ('seq'); return [q.sentence, q.ask, q.answer, q.choices.map(c => c.label)]; })()));
console.log('next assessment:', nextAssessment().title, nextAssessment().date);
