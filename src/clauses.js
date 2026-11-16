// Subjunctive clause identification and sequence of tenses (Lessons 44-49).
// In `la`, the clause to identify is wrapped in [ ].
export const CLAUSE_TYPES = [
  ['purpose', 'Purpose', 'ut / ne: in order to'],
  ['result', 'Result', 'so … that'],
  ['command', 'Indirect command', 'order / ask someone to'],
  ['question', 'Indirect question', 'asks or knows who, why, whether'],
  ['cum', 'Cum clause', 'when / since / although'],
  ['statement', 'Indirect statement', 'acc. + infinitive, no subjunctive'],
];
export const CLAUSE_NAME = Object.fromEntries(CLAUSE_TYPES.map(([k, l]) => [k, l]));

const CLUE = {
  purpose: 'Nothing in the main clause asks, orders, or sets up “so”: ut / ne just gives the reason for the action.',
  result: 'A “so” word in the main clause (tantus, tam, ita, tot, talis, sic) sets up the ut. A negative result uses ut non, never ne.',
  command: 'A verb of ordering, persuading, begging or demanding (impero, persuadeo, oro, postulo, mando, moneo) + ut / ne.',
  question: 'A question word (cur, ubi, quid, quot, num, quantus) after a verb of asking, knowing or telling, with the verb in the subjunctive.',
  cum: 'cum + subjunctive. The main clause decides the meaning: tamen points to “although”; a reason points to “since”; otherwise “when”.',
  statement: 'A verb of saying, thinking or knowing + accusative subject + infinitive. No ut, no subjunctive.',
};
export { CLUE };

export const CLAUSES = [
  { id: 'p1', type: 'purpose', la: 'Caesar legatos misit [ut pacem peterent].', en: 'Caesar sent envoys to seek peace.' },
  { id: 'p2', type: 'purpose', la: 'Milites castra muniverunt [ne hostes impetum facerent].', en: 'The soldiers fortified the camp so that the enemy would not attack.' },
  { id: 'p3', type: 'purpose', la: 'Ad urbem venimus [ut amicos videamus].', en: 'We are coming to the city to see our friends.' },
  { id: 'p4', type: 'purpose', la: 'Puer celeriter cucurrit [ut patrem inveniret].', en: 'The boy ran quickly to find his father.' },
  { id: 'p5', type: 'purpose', la: 'Gladios paraverunt [ut se defenderent].', en: 'They got their swords ready to defend themselves.' },
  { id: 'p6', type: 'purpose', la: 'Nautae ad portum navigant [ut frumentum portent].', en: 'The sailors sail to the harbor to carry grain.' },
  { id: 'r1', type: 'result', la: 'Tanta erat tempestas [ut naves navigare non possent].', en: 'The storm was so great that the ships could not sail.' },
  { id: 'r2', type: 'result', la: 'Milites tam fortiter pugnaverunt [ut hostes fugerent].', en: 'The soldiers fought so bravely that the enemy fled.' },
  { id: 'r3', type: 'result', la: 'Tot sagittae iaciebantur [ut caelum non videretur].', en: 'So many arrows were being thrown that the sky could not be seen.' },
  { id: 'r4', type: 'result', la: 'Ita defessi erant [ut statim dormirent].', en: 'They were so tired that they fell asleep at once.' },
  { id: 'r5', type: 'result', la: 'Talis erat dux [ut omnes eum amarent].', en: 'The leader was the kind of man that everyone loved him.' },
  { id: 'r6', type: 'result', la: 'Flumen tam altum est [ut nemo transire possit].', en: 'The river is so deep that no one can cross.' },
  { id: 'c1', type: 'command', la: 'Dux militibus imperavit [ut fortiter pugnarent].', en: 'The general ordered the soldiers to fight bravely.' },
  { id: 'c2', type: 'command', la: 'Legatus Gallis persuasit [ne bellum gererent].', en: 'The envoy persuaded the Gauls not to wage war.' },
  { id: 'c3', type: 'command', la: 'Te oro [ut mihi credas].', en: 'I beg you to trust me.' },
  { id: 'c4', type: 'command', la: 'Caesar ab Helvetiis postulavit [ut obsides darent].', en: 'Caesar demanded that the Helvetians give hostages.' },
  { id: 'c5', type: 'command', la: 'Rex legatis mandavit [ut auxilium peterent].', en: 'The king instructed the envoys to ask for help.' },
  { id: 'c6', type: 'command', la: 'Magister pueros monuit [ne in silva errarent].', en: 'The teacher warned the boys not to wander in the forest.' },
  { id: 'q1', type: 'question', la: 'Rogavit [cur venissemus].', en: 'He asked why we had come.' },
  { id: 'q2', type: 'question', la: 'Nescio [ubi hostes sint].', en: 'I don’t know where the enemy is.' },
  { id: 'q3', type: 'question', la: 'Caesar quaesivit [quot milites hostes haberent].', en: 'Caesar asked how many soldiers the enemy had.' },
  { id: 'q4', type: 'question', la: 'Exploratores rogaverunt [num flumen altum esset].', en: 'The scouts asked whether the river was deep.' },
  { id: 'q5', type: 'question', la: 'Dic mihi [quid feceris].', en: 'Tell me what you have done.' },
  { id: 'q6', type: 'question', la: 'Intellegebat [quanta esset hostium multitudo].', en: 'He understood how large the crowd of the enemy was.' },
  { id: 'm1', type: 'cum', la: '[Cum Caesar in Galliam venisset], legatos ad eum miserunt.', en: 'When Caesar had come into Gaul, they sent envoys to him.', sense: 'when' },
  { id: 'm2', type: 'cum', la: '[Cum hostes appropinquarent], milites castra muniverunt.', en: 'Since the enemy was approaching, the soldiers fortified the camp.', sense: 'since' },
  { id: 'm3', type: 'cum', la: '[Cum fortiter pugnavissent], tamen victi sunt.', en: 'Although they had fought bravely, they were still defeated.', sense: 'although' },
  { id: 'm4', type: 'cum', la: '[Cum nox esset], domum redierunt.', en: 'Since it was night, they went back home.', sense: 'since' },
  { id: 'm5', type: 'cum', la: 'Hostes, [cum essent defessi], fugere non poterant.', en: 'The enemy, since they were tired, could not run away.', sense: 'since' },
  { id: 'm6', type: 'cum', la: '[Cum pauci essent], tamen urbem defenderunt.', en: 'Although they were few, they still defended the city.', sense: 'although' },
  { id: 's1', type: 'statement', la: 'Dixit [hostes appropinquare].', en: 'He said that the enemy was approaching.' },
  { id: 's2', type: 'statement', la: 'Putabant [Caesarem venturum esse].', en: 'They thought that Caesar would come.' },
  { id: 's3', type: 'statement', la: 'Nuntius renuntiavit [castra capta esse].', en: 'The messenger reported that the camp had been captured.' },
  { id: 's4', type: 'statement', la: 'Scimus [te fidelem esse].', en: 'We know that you are loyal.' },
  { id: 's5', type: 'statement', la: 'Credidit [se tutum esse].', en: 'He believed that he was safe.' },
  { id: 's6', type: 'statement', la: 'Audivimus [urbem incensam esse].', en: 'We heard that the city had been set on fire.' },
];

// Sequence of tenses: which subjunctive tense goes in the blank.
// rel: 'same' (same time or later) or 'before' (time before the main verb).
export const SEQ_FRAMES = [
  { main: ['Imperat eis ut', 'Imperavit eis ut'], en: ['He orders them to', 'He ordered them to'], p: 5, rels: ['same'], what: 'indirect command' },
  { main: ['Veniunt ut', 'Venerunt ut'], en: ['They come in order to', 'They came in order to'], p: 5, rels: ['same'], what: 'purpose clause' },
  { main: ['Rogat quid', 'Rogavit quid'], en: ['He asks what they', 'He asked what they'], p: 5, rels: ['same', 'before'], what: 'indirect question' },
  { main: ['Nescio cur', 'Nesciebam cur'], en: ['I don’t know why you', 'I didn’t know why you'], p: 1, rels: ['same', 'before'], what: 'indirect question' },
  { main: ['Tam fortes sunt ut', 'Tam fortes erant ut'], en: ['They are so brave that they', 'They were so brave that they'], p: 5, rels: ['same'], what: 'result clause' },
  { main: [null, 'Cum'], tail: ', discesserunt.', en: [null, 'When / since they'], p: 5, rels: ['same', 'before'], what: 'cum clause', secondaryOnly: true },
];
export const SEQ_KEY = { 'primary-same': 'spres-a', 'primary-before': 'sperf-a', 'secondary-same': 'simpf-a', 'secondary-before': 'splup-a' };
export const SEQ_LABEL = { 'spres-a': 'present', 'sperf-a': 'perfect', 'simpf-a': 'imperfect', 'splup-a': 'pluperfect' };
