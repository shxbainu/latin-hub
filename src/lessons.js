/* eslint-disable */
// Jenney's First Year Latin, vocabulary by lesson (checked against the book's lists).
// Same line format as legacy.js: pos|forms|gender|meaning|note|labels|alt
// Lessons 42-46 live in legacy.js (RAW1 / RAW45) because saved progress already uses those ids.
const NG = 'nominative,genitive';
export const LESSON_RAW = {
1: `
n|agricola,agricolae|m|farmer
n|aqua,aquae|f|water
n|femina,feminae|f|woman
n|fortuna,fortunae|f|fortune, chance
n|Gallia,Galliae|f|Gaul
n|insula,insulae|f|island
n|Italia,Italiae|f|Italy
n|lingua,linguae|f|tongue, language
n|littera,litterae|f|letter (of the alphabet)|pl. = letter (epistle)
n|memoria,memoriae|f|memory
n|natura,naturae|f|nature
n|poeta,poetae|m|poet
n|provincia,provinciae|f|province
n|puella,puellae|f|girl
n|silva,silvae|f|forest
n|vita,vitae|f|life
ph|est||is, there is
ph|sunt||are, there are`,
2: `
n|amicitia,amicitiae|f|friendship
n|patria,patriae|f|country, native land
v|amo,amare,amavi,amatum||love, like
v|do,dare,dedi,datum||give
v|laudo,laudare,laudavi,laudatum||praise
v|navigo,navigare,navigavi,navigatum||sail
v|occupo,occupare,occupavi,occupatum||seize, capture
v|paro,parare,paravi,paratum||prepare, prepare for
v|porto,portare,portavi,portatum||carry
v|pugno,pugnare,pugnavi,pugnatum||fight
v|specto,spectare,spectavi,spectatum||look at
v|voco,vocare,vocavi,vocatum||call
av|non||not
cj|et||and
cj|sed||but
pp|ad||to, toward|+ acc.
pp|cum||with|+ abl.`,
3: `
n|Europa,Europae|f|Europe
n|Germania,Germaniae|f|Germany
n|Hispania,Hispaniae|f|Spain
n|nauta,nautae|m|sailor
n|porta,portae|f|gate
n|Roma,Romae|f|Rome
n|terra,terrae|f|earth, land
n|tuba,tubae|f|trumpet
n|via,viae|f|road, way
n|villa,villae|f|farmhouse
pr|quid||what?
av|ubi||where?
ph|-ne||(asks a question)|enclitic: tacked onto the first word||self
cj|-que||and|enclitic: tacked onto the second word`,
4: `
n|ager,agri|m|field, territory
n|amicus,amici|m|friend
n|annus,anni|m|year
n|campus,campi|m|field, plain
n|dea,deae|f|goddess|dat./abl. pl. deabus
n|deus,dei|m|god
n|equus,equi|m|horse
n|filia,filiae|f|daughter|dat./abl. pl. filiabus
n|filius,fili|m|son
n|gladius,gladi|m|sword
n|legatus,legati|m|envoy, lieutenant
n|ludus,ludi|m|game, school
n|nuntius,nunti|m|messenger, message
n|puer,pueri|m|boy
n|servus,servi|m|slave
n|vir,viri|m|man, husband`,
5: `
n|bellum,belli|n|war
n|caelum,caeli|n|sky
n|donum,doni|n|gift
n|frumentum,frumenti|n|grain
n|oppidum,oppidi|n|town
n|periculum,periculi|n|danger, risk
n|regnum,regni|n|kingdom, kingship
n|verbum,verbi|n|word
pp|ab||from, away from|+ abl. · a before consonants||0=a
pp|de||down from, from, about|+ abl.
pp|ex||out of, from|+ abl. · e before consonants||0=e
pp|in||in, on, into, against|+ abl. = in, on · + acc. = into, against
pp|sub||under|+ abl. = under, at the foot of · + acc. = up to`,
6: `
a|altus,alta,altum||high, deep
a|bonus,bona,bonum||good
a|ferus,fera,ferum||wild, fierce
a|latus,lata,latum||wide, broad
a|longus,longa,longum||long
a|magnus,magna,magnum||large, great
a|malus,mala,malum||bad
a|meus,mea,meum||my, mine
a|multus,multa,multum||much|pl. = many
a|parvus,parva,parvum||small, little
a|tuus,tua,tuum||your, yours|speaking to one person
pp|sine||without|+ abl.`,
7: `
v|appello,appellare,appellavi,appellatum||call, name
v|convoco,convocare,convocavi,convocatum||call together, assemble
v|exspecto,exspectare,exspectavi,exspectatum||await, wait for
v|habito,habitare,habitavi,habitatum||live, dwell
v|laboro,laborare,laboravi,laboratum||work, suffer|also: be hard pressed
v|narro,narrare,narravi,narratum||tell, relate
v|nuntio,nuntiare,nuntiavi,nuntiatum||announce, report
v|supero,superare,superavi,superatum||surpass, defeat
v|volo,volare,volavi,volatum||fly
v|vulnero,vulnerare,vulneravi,vulneratum||wound`,
8: `
a|liber,libera,liberum||free
a|miser,misera,miserum||wretched, unfortunate
a|noster,nostra,nostrum||our, ours
a|pulcher,pulchra,pulchrum||beautiful, noble
a|sacer,sacra,sacrum||sacred, holy
a|vester,vestra,vestrum||your, yours|speaking to more than one
pp|ante||before, in front of|+ acc.
pp|contra||against|+ acc.
pp|inter||between, among|+ acc.
pp|ob||because of, on account of|+ acc.
pp|per||through|+ acc.
pp|post||after, behind|+ acc.
pp|propter||because of, on account of|+ acc.
pp|trans||across, over|+ acc.`,
9: `
av|bene||well
av|cras||tomorrow
av|cur||why?
av|diu||for a long time
av|heri||yesterday
av|hodie||today
av|iam||now, already
av|ibi||there
av|interim||meanwhile
av|male||badly
av|nunc||now
av|postea||afterwards
av|saepe||often
av|semper||always
av|tum||then
av|ubi||where, when|relative`,
10: `
v|ambulo,ambulare,ambulavi,ambulatum||walk
v|clamo,clamare,clamavi,clamatum||shout
v|confirmo,confirmare,confirmavi,confirmatum||strengthen, encourage, declare
v|demonstro,demonstrare,demonstravi,demonstratum||show, point out
v|libero,liberare,liberavi,liberatum||free, set free
v|oppugno,oppugnare,oppugnavi,oppugnatum||attack
v|servo,servare,servavi,servatum||guard, keep, save
v|sto,stare,steti,statum||stand
v|tempto,temptare,temptavi,temptatum||try, attempt
n|Africa,Africae|f|Africa
n|Asia,Asiae|f|Asia Minor
ph|num||(expects “no”)|asks a question expecting the answer no||self`,
11: `
n|animus,animi|m|mind, spirit
n|arma,armorum|n. pl.|arms|plural only
n|auxilium,auxili|n|help, aid|pl. = auxiliary troops
n|captivus,captivi|m|captive
n|castra,castrorum|n. pl.|camp|plural only
n|consilium,consili|n|plan, advice
n|copia,copiae|f|plenty, supply|pl. = forces, troops
n|fama,famae|f|rumor, report, reputation
n|fuga,fugae|f|flight
n|impedimentum,impedimenti|n|hindrance|pl. = baggage
n|numerus,numeri|m|number, group
n|proelium,proeli|n|battle
n|signum,signi|n|sign, signal, standard
n|telum,teli|n|weapon`,
12: `
n|audacia,audaciae|f|daring, boldness
n|carrus,carri|m|wagon, cart
n|cura,curae|f|care, anxiety
n|dominus,domini|m|lord, master
n|inopia,inopiae|f|lack, want
n|ira,irae|f|anger
n|liber,libri|m|book
n|locus,loci|m|place|pl. loca, locorum, n.
n|magister,magistri|m|master, teacher
n|poena,poenae|f|punishment, penalty
n|populus,populi|m|people, nation
n|socius,soci|m|ally, comrade`,
13: `
n|causa,causae|f|reason, cause
n|epistula,epistulae|f|letter
n|fabula,fabulae|f|story
n|hora,horae|f|hour
n|Iulia,Iuliae|f|Julia
n|Iulius,Iuli|m|Julius
n|Lucius,Luci|m|Lucius
n|Marcus,Marci|m|Marcus
n|pecunia,pecuniae|f|money
n|regina,reginae|f|queen
a|albus,alba,album||white
a|amicus,amica,amicum||friendly
a|gratus,grata,gratum||pleasing, welcome, grateful
a|inimicus,inimica,inimicum||unfriendly, hostile|as a noun: enemy
a|niger,nigra,nigrum||black
a|novus,nova,novum||new
a|paratus,parata,paratum||ready, prepared
a|verus,vera,verum||true`,
14: `
n|celeritas,celeritatis|f|speed, swiftness
n|consul,consulis|m|consul
n|dux,ducis|m|leader
n|frater,fratris|m|brother
n|imperator,imperatoris|m|commander, general
n|imperium,imperi|n|command, power, government
n|mater,matris|f|mother
n|miles,militis|m|soldier
n|pater,patris|m|father
n|rex,regis|m|king
n|soror,sororis|f|sister
v|delecto,delectare,delectavi,delectatum||please
av|mox||soon`,
15: `
n|Caesar,Caesaris|m|Caesar
n|caput,capitis|n|head
n|carmen,carminis|n|song, poem
n|corpus,corporis|n|body
n|diligentia,diligentiae|f|diligence, care
n|flumen,fluminis|n|river, stream
n|iter,itineris|n|march, journey, route
n|nomen,nominis|n|name
n|tempus,temporis|n|time
n|vulnus,vulneris|n|wound
a|Germanus,Germana,Germanum||German
a|Graecus,Graeca,Graecum||Greek
a|Hispanus,Hispana,Hispanum||Spanish
a|Romanus,Romana,Romanum||Roman`,
16: `
n|animal,animalis|n|animal
n|civis,civis|m./f.|citizen
n|finis,finis|m|end, boundary|pl. = territory
n|gens,gentis|f|family, clan, nation
n|hostis,hostis|m|enemy
n|ignis,ignis|m|fire
n|mare,maris|n|sea
n|mons,montis|m|mountain, hill
n|mors,mortis|f|death
n|navis,navis|f|ship
n|panis,panis|m|bread
n|pons,pontis|m|bridge
n|urbs,urbis|f|city`,
17: `
a|Helvetius,Helvetia,Helvetium||Helvetian
v|habeo,habere,habui,habitum||have, hold
v|maneo,manere,mansi,mansum||stay, remain
v|moneo,monere,monui,monitum||warn, advise
v|moveo,movere,movi,motum||move|castra movere = break camp
v|sedeo,sedere,sedi,sessum||sit
v|teneo,tenere,tenui,tentum||hold
v|timeo,timere,timui||fear, be afraid
v|video,videre,vidi,visum||see`,
18: `
a|acer,acris,acre||sharp, fierce
a|audax,audacis||bold, daring||${NG}
a|brevis,breve||short
a|Britannus,Britanna,Britannum||British
a|celer,celeris,celere||swift
a|facilis,facile||easy
a|fortis,forte||brave
a|Gallus,Galla,Gallum||Gallic
a|gravis,grave||heavy, serious, severe
a|omnis,omne||all, every
a|potens,potentis||powerful||${NG}
a|similis,simile||similar, like
a|Troianus,Troiana,Troianum||Trojan`,
20: `
n|aestas,aestatis|f|summer
n|hiems,hiemis|f|winter
n|lux,lucis|f|light
n|pax,pacis|f|peace
n|salus,salutis|f|safety, welfare
n|vox,vocis|f|voice
v|debeo,debere,debui,debitum||owe, ought
v|doceo,docere,docui,doctum||teach, show
v|prohibeo,prohibere,prohibui,prohibitum||prevent, keep from
v|respondeo,respondere,respondi,responsum||reply, answer
v|retineo,retinere,retinui,retentum||hold back
v|terreo,terrere,terrui,territum||frighten`,
21: `
n|Britannia,Britanniae|f|Britain
n|cena,cenae|f|dinner
n|fenestra,fenestrae|f|window
n|Graecia,Graeciae|f|Greece
n|Helvetia,Helvetiae|f|Helvetia|modern Switzerland
n|iniuria,iniuriae|f|wrong, injustice
n|mensa,mensae|f|table
n|pugna,pugnae|f|fight
n|sella,sellae|f|chair, seat
n|Sicilia,Siciliae|f|Sicily
n|Troia,Troiae|f|Troy
n|victoria,victoriae|f|victory
cj|atque||and|ac before consonants||0=ac
cj|aut||or|aut … aut = either … or
cj|quod||because
cj|si||if`,
22: `
v|ago,agere,egi,actum||do, drive
v|cogo,cogere,coegi,coactum||collect, compel
v|defendo,defendere,defendi,defensum||defend
v|duco,ducere,duxi,ductum||lead
v|gero,gerere,gessi,gestum||carry on, wear, bear
v|mitto,mittere,misi,missum||send, let go
v|pono,ponere,posui,positum||put, place
v|rego,regere,rexi,rectum||rule
v|relinquo,relinquere,reliqui,relictum||leave, leave behind
v|surgo,surgere,surrexi,surrectum||rise, stand up
v|trado,tradere,tradidi,traditum||hand over, surrender
v|vinco,vincere,vici,victum||conquer, defeat`,
23: `
a|antiquus,antiqua,antiquum||ancient, former
a|clarus,clara,clarum||clear, famous, bright
a|finitimus,finitima,finitimum||neighboring
a|pauci,paucae,pauca||few, a few|plural only
a|reliquus,reliqua,reliquum||remaining, the rest of
v|cedo,cedere,cessi,cessum||yield, move, give way
v|constituo,constituere,constitui,constitutum||decide, set up
v|contendo,contendere,contendi,contentum||hasten, strive, struggle
v|deligo,deligere,delegi,delectum||choose
v|discedo,discedere,discessi,discessum||depart, go away, leave
v|excedo,excedere,excessi,excessum||go out, leave
v|reduco,reducere,reduxi,reductum||lead back`,
24: `
v|accipio,accipere,accepi,acceptum||receive, accept
v|capio,capere,cepi,captum||take, capture
v|conficio,conficere,confeci,confectum||finish, accomplish
v|conicio,conicere,conieci,coniectum||hurl, throw together
v|cupio,cupere,cupivi,cupitum||want, wish, desire
v|facio,facere,feci,factum||make, do
v|fugio,fugere,fugi,fugitum||flee, flee from
v|iacio,iacere,ieci,iactum||throw
v|incipio,incipere,incepi,inceptum||begin
v|interficio,interficere,interfeci,interfectum||kill`,
25: `
n|eques,equitis|m|horseman, knight|pl. = cavalry
n|pedes,peditis|m|foot soldier|pl. = infantry
pr|is,ea,id||this, that, he, she, it
pr|hic,haec,hoc||this, the latter
pr|ille,illa,illud||that, the former
v|bibo,bibere,bibi||drink
v|curro,currere,cucurri,cursum||run
v|dico,dicere,dixi,dictum||say, tell
v|edo,edere,edi,esum||eat
v|peto,petere,petivi,petitum||seek, ask, attack
v|scribo,scribere,scripsi,scriptum||write
av|olim||once, formerly`,
26: `
n|auctoritas,auctoritatis|f|authority, influence
n|avis,avis|f|bird
n|canis,canis|m./f.|dog
n|clamor,clamoris|m|shout, noise
n|iudex,iudicis|m|judge, juror
n|lapis,lapidis|m|stone
n|legio,legionis|f|legion
n|libertas,libertatis|f|freedom, liberty
n|nox,noctis|f|night
n|princeps,principis|m|chief
n|timor,timoris|m|fear`,
27: `
n|civitas,civitatis|f|state, citizenship
n|homo,hominis|m|man, human being
n|hortus,horti|m|garden
n|labor,laboris|m|work, hardship
n|lex,legis|f|law
n|multitudo,multitudinis|f|crowd, great number
n|pars,partis|f|part, direction
n|pes,pedis|m|foot
n|virtus,virtutis|f|courage, bravery`,
28: `
n|cibus,cibi|m|food
n|modus,modi|m|way, manner, measure
n|murus,muri|m|wall
n|nihil|n|nothing|indeclinable
n|vinum,vini|n|wine
v|amitto,amittere,amisi,amissum||lose
v|committo,committere,commisi,commissum||entrust|proelium committere = begin battle
v|expello,expellere,expuli,expulsum||drive out
v|reddo,reddere,reddidi,redditum||give back, restore`,
29: `
n|adventus,adventus|m|arrival, approach
n|cornu,cornus|n|horn, wing (of an army)
n|cursus,cursus|m|course, running
n|domus,domus|f|house, home
n|exercitus,exercitus|m|army
n|exitus,exitus|m|outcome, way out, departure
n|fluctus,fluctus|m|wave
n|impetus,impetus|m|attack
n|manus,manus|f|hand, band (of men)
n|occasus,occasus|m|setting, downfall
n|passus,passus|m|pace
n|portus,portus|m|harbor, port
n|senatus,senatus|m|senate
n|usus,usus|m|use, experience, advantage`,
30: `
n|milia,milium|n. pl.|thousands|plural only
v|audio,audire,audivi,auditum||hear, listen to
v|convenio,convenire,conveni,conventum||come together, assemble
v|dormio,dormire,dormivi,dormitum||sleep
v|impedio,impedire,impedivi,impeditum||hinder
v|invenio,invenire,inveni,inventum||find, come upon
v|munio,munire,munivi,munitum||fortify, build
v|pervenio,pervenire,perveni,perventum||arrive, reach
v|venio,venire,veni,ventum||come
av|etiam||also, even
av|tamen||nevertheless, yet, still|postpositive
cj|nam||for`,
31: `
n|acies,aciei|f|battle line, line|also: straight line
n|dies,diei|m|day
n|ianua,ianuae|f|door
n|lectus,lecti|m|bed, couch
n|meridies,meridiei|m|noon, midday, south
n|res,rei|f|thing, matter, affair
n|spes,spei|f|hope
a|frumentarius,frumentaria,frumentarium||of grain
a|publicus,publica,publicum||public
cj|itaque||and so, therefore
cj|neque||and not, nor|nec before consonants||0=nec`,
32: `
n|gaudium,gaudi|n|joy, gladness
n|officium,offici|n|duty
n|praemium,praemi|n|reward
n|praesidium,praesidi|n|guard, garrison
n|tergum,tergi|n|back
v|absum,abesse,afui,afuturus||be away, be absent, be distant
v|adsum,adesse,adfui,adfuturus||be present, be near
v|contineo,continere,continui,contentum||hold together, restrain
v|inquam||say|inquis, inquit, inquiunt · in quotations
v|iubeo,iubere,iussi,iussum||order, bid
v|possum,posse,potui||be able, can
v|sustineo,sustinere,sustinui,sustentum||hold up, withstand`,
33: `
a|aequus,aequa,aequum||level, fair, equal
a|amplus,ampla,amplum||large, ample
a|barbarus,barbara,barbarum||foreign, barbarous
a|certus,certa,certum||sure, certain
a|diligens,diligentis||careful, diligent||${NG}
a|felix,felicis||lucky, happy||${NG}
a|iniquus,iniqua,iniquum||unfair, uneven, unfavorable
a|iustus,iusta,iustum||just, right
a|laetus,laeta,laetum||happy, glad, joyful
a|notus,nota,notum||well-known, famous
a|tristis,triste||sad, grim
a|utilis,utile||useful, profitable
cj|quam||than, how|also an adverb`,
34: `
a|aureus,aurea,aureum||golden
a|cupidus,cupida,cupidum||eager, desirous
a|dexter,dextra,dextrum||right
a|difficilis,difficile||difficult
a|dissimilis,dissimile||unlike
a|durus,dura,durum||hard, harsh
a|fidelis,fidele||faithful, loyal
a|idoneus,idonea,idoneum||suitable
a|nobilis,nobile||noble, well-known
a|par,paris||equal||${NG}
a|posterus,postera,posterum||next, following
a|propinquus,propinqua,propinquum||near, nearby
a|propior,propius||nearer
a|proximus,proxima,proximum||nearest, next
a|sinister,sinistra,sinistrum||left
a|validus,valida,validum||strong
av|magis||more
av|magnopere||greatly
av|maxime||most, especially
cj|nisi||unless, if not, except`,
35: `
n|plus,pluris|n|more|a larger amount
a|medius,media,medium||middle of
a|senex,senis||old|masculine only · as a noun: old man|${NG}
av|natu||by birth
av|prope||nearly, almost|as a prep. + acc.: near`,
36: `
n|paulum,pauli|n|a little
av|cotidie||daily, every day
av|deinde||then, next
av|eo||there, to that place
av|huc||here, to this place
av|illuc||there, to that place
av|nondum||not yet
av|numquam||never
av|paene||almost
av|quo||where to?
av|simul||at the same time
av|statim||at once, immediately
av|tandem||at last, finally
cj|atque||as|after aeque, pariter, simul
cj|postquam||after
cj|ut||as, how`,
37: `
n|herba,herbae|f|grass
n|subsidium,subsidi|n|aid, support
n|toga,togae|f|toga
n|victor,victoris|m|victor
a|alienus,aliena,alienum||another's, belonging to another
pr|quisque,quidque||each one
av|unde||from where, whence
av|undique||from all sides, from everywhere
a|unus,una,unum||one|UNUS NAUTA: gen. -ius, dat. -i
a|alius,alia,aliud||other, another|UNUS NAUTA
a|alter,altera,alterum||the other (of two), second|UNUS NAUTA
a|neuter,neutra,neutrum||neither|UNUS NAUTA
a|nullus,nulla,nullum||no, not any|UNUS NAUTA
a|solus,sola,solum||only, alone|UNUS NAUTA
a|totus,tota,totum||whole, entire|UNUS NAUTA
a|ullus,ulla,ullum||any|UNUS NAUTA
a|uter,utra,utrum||which (of two)?|UNUS NAUTA
a|uterque,utraque,utrumque||each (of two)|UNUS NAUTA
pr|ipse,ipsa,ipsum||himself, herself, itself|intensive
pr|idem,eadem,idem||the same`,
38: `
v|claudo,claudere,clausi,clausum||shut, close
v|cresco,crescere,crevi,cretum||grow, increase
v|desisto,desistere,destiti,destitum||stop, leave off
v|dubito,dubitare,dubitavi,dubitatum||doubt, hesitate
v|frango,frangere,fregi,fractum||break
v|instruo,instruere,instruxi,instructum||draw up, equip
v|iungo,iungere,iunxi,iunctum||join
v|lavo,lavare,lavi,lautum||wash
v|ludo,ludere,lusi,lusum||play, mock
v|premo,premere,pressi,pressum||press, crush
v|probo,probare,probavi,probatum||prove, approve of
v|recipio,recipere,recepi,receptum||receive, take back
v|remitto,remittere,remisi,remissum||send back
v|removeo,removere,removi,remotum||move back, remove
v|traho,trahere,traxi,tractum||drag, draw
v|valeo,valere,valui,valitum||be well, be strong|vale = goodbye`,
39: `
v|accedo,accedere,accessi,accessum||approach, go to
v|cognosco,cognoscere,cognovi,cognitum||learn, find out
v|credo,credere,credidi,creditum||believe, trust|+ dat.
v|existimo,existimare,existimavi,existimatum||think, suppose, consider
v|intellego,intellegere,intellexi,intellectum||understand
v|iudico,iudicare,iudicavi,iudicatum||judge, consider
v|lego,legere,legi,lectum||read, choose, gather
v|nego,negare,negavi,negatum||deny, say not
v|nescio,nescire,nescivi,nescitum||not know
v|obtineo,obtinere,obtinui,obtentum||hold, obtain|hold against opposition
v|pertineo,pertinere,pertinui||pertain, extend
v|puto,putare,putavi,putatum||think
v|scio,scire,scivi,scitum||know
v|sentio,sentire,sensi,sensum||feel, realize
v|spero,sperare,speravi,speratum||hope
pp|apud||among, at the house of|+ acc.
pp|circum||around|+ acc.
pp|praeter||beyond, besides, except|+ acc.
pp|pro||on behalf of, in front of, instead of|+ abl.`,
40: `
n|arbor,arboris|f|tree
n|collis,collis|m|hill
n|cupiditas,cupiditatis|f|desire, greed
n|gloria,gloriae|f|glory, fame
n|liberi,liberorum|m. pl.|children|plural only
n|luna,lunae|f|moon
n|mora,morae|f|delay
n|negotium,negoti|n|business, task, trouble
n|senator,senatoris|m|senator
n|sol,solis|m|sun
n|stella,stellae|f|star
n|turris,turris|f|tower|acc. sg. turrim
n|ventus,venti|m|wind
a|suus,sua,suum||his, her, its, their (own)|reflexive
pr|sui,sibi,se||himself, herself, itself, themselves|reflexive|genitive,dative,accusative`,
41: `
v|adduco,adducere,adduxi,adductum||lead to, influence
v|circumvenio,circumvenire,circumveni,circumventum||surround
v|commoveo,commovere,commovi,commotum||alarm, upset
v|compleo,complere,complevi,completum||fill up, complete
v|conspicio,conspicere,conspexi,conspectum||observe, look at
v|deficio,deficere,defeci,defectum||fail, revolt
v|dimitto,dimittere,dimisi,dimissum||send away, dismiss
v|enuntio,enuntiare,enuntiavi,enuntiatum||report, announce
v|expono,exponere,exposui,expositum||explain, set forth
v|incito,incitare,incitavi,incitatum||stir up, arouse
v|intermitto,intermittere,intermisi,intermissum||stop, interrupt
v|occido,occidere,occidi,occisum||kill
v|opprimo,opprimere,oppressi,oppressum||crush, overpower
v|traduco,traducere,traduxi,traductum||lead across`,
47: `
nm|tredecim||thirteen
nm|quattuordecim||fourteen
nm|quindecim||fifteen
nm|sedecim||sixteen
nm|septendecim||seventeen
nm|duodeviginti||eighteen
nm|undeviginti||nineteen
a|communis,commune||common, general
a|immortalis,immortale||immortal
a|privatus,privata,privatum||private
a|quantus,quanta,quantum||how great, how much
a|quot||how many|indeclinable
cj|num||whether, if|in indirect questions
cj|utrum||whether|utrum … an = whether … or · utrum … necne = whether … or not`,
48: `
n|satis|n|enough|indeclinable
a|necesse||necessary|indeclinable
a|talis,tale||such, of such a kind
a|tantus,tanta,tantum||so great, so much
a|tot||so many|indeclinable
v|accido,accidere,accidi||happen, fall upon
v|efficio,efficere,effeci,effectum||bring about, complete
av|ita||so, thus
av|tam||so
av|sic||so, in this way`,
49: `
n|sagitta,sagittae|f|arrow
n|spatium,spati|n|distance, interval
n|studium,studi|n|eagerness, zeal, enthusiasm
n|tempestas,tempestatis|f|storm, weather
a|defessus,defessa,defessum||tired
a|impeditus,impedita,impeditum||hindered, in difficulty
a|mirus,mira,mirum||strange, wonderful
v|conservo,conservare,conservavi,conservatum||save, keep
v|incendo,incendere,incendi,incensum||set on fire, arouse
v|pello,pellere,pepuli,pulsum||push, rout, defeat
v|permoveo,permovere,permovi,permotum||move deeply, alarm
v|produco,producere,produxi,productum||lead forward, bring forth
v|propono,proponere,proposui,propositum||propose, set forth
v|renuntio,renuntiare,renuntiavi,renuntiatum||report, bring back word
v|vasto,vastare,vastavi,vastatum||lay waste, devastate
cj|cum||when, since, although|+ subjunctive`,
50: `
n|Athenae,Athenarum|f. pl.|Athens|plural only
n|Carthago,Carthaginis|f|Carthage
n|Corinthus,Corinthi|f|Corinth
n|rus,ruris|n|country, countryside
v|arbitror,arbitrari,arbitratus sum||think|deponent
v|conor,conari,conatus sum||try, attempt|deponent
v|hortor,hortari,hortatus sum||encourage, urge|deponent
v|loquor,loqui,locutus sum||speak, talk|deponent
v|moror,morari,moratus sum||delay|deponent
v|patior,pati,passus sum||suffer, allow, permit|deponent
v|permitto,permittere,permisi,permissum||permit, entrust
v|polliceor,polliceri,pollicitus sum||promise|deponent
v|proficiscor,proficisci,profectus sum||set out, depart|deponent
v|videor,videri,visus sum||seem|passive of video`,
51: `
n|colloquium,colloqui|n|conference, conversation
n|initium,initi|n|beginning
n|Rhenus,Rheni|m|the Rhine
a|tutus,tuta,tutum||safe
pr|quidam,quaedam,quoddam||a certain, some|neuter pronoun quiddam
av|rursus||again, back
v|aggredior,aggredi,aggressus sum||attack, approach|deponent
v|congredior,congredi,congressus sum||meet, come together|deponent
v|consequor,consequi,consecutus sum||overtake, pursue, obtain|deponent
v|egredior,egredi,egressus sum||go out, disembark|deponent
v|progredior,progredi,progressus sum||advance, go forward|deponent
v|sequor,sequi,secutus sum||follow|deponent
v|vereor,vereri,veritus sum||fear|deponent`,
52: `
v|eo,ire,ii,itum||go|perfect also ivi||2=ivi
v|adeo,adire,adii,aditum||approach, go toward|||2=adivi
v|exeo,exire,exii,exitum||go out|||2=exivi
v|redeo,redire,redii,reditum||return, go back|||2=redivi
v|transeo,transire,transii,transitum||cross|||2=transivi
v|fero,ferre,tuli,latum||carry, bring, bear
v|adfero,adferre,attuli,allatum||bring to, report
v|confero,conferre,contuli,collatum||bring together, compare|se conferre = proceed
v|infero,inferre,intuli,illatum||bring upon, inflict|bellum inferre + dat. = make war on
v|refero,referre,rettuli,relatum||bring back, report
v|tollo,tollere,sustuli,sublatum||raise, lift up, remove`,
53: `
n|aetas,aetatis|f|age
n|classis,classis|f|fleet
n|facultas,facultatis|f|opportunity, ability
n|hospes,hospitis|m|guest, host, stranger
n|mensis,mensis|m|month
n|ordo,ordinis|m|order
v|appropinquo,appropinquare,appropinquavi,appropinquatum||approach, draw near|+ dat. or ad + acc.
v|comparo,comparare,comparavi,comparatum||prepare, compare, get
v|conscribo,conscribere,conscripsi,conscriptum||enroll, enlist
v|disco,discere,didici||learn
v|exerceo,exercere,exercui,exercitum||train, exercise, practice
v|instituo,instituere,institui,institutum||establish, build
v|malo,malle,malui||prefer
v|nolo,nolle,nolui||not want, be unwilling
v|ostendo,ostendere,ostendi,ostentum||show, display
v|veho,vehere,vexi,vectum||carry, transport|passive: ride, sail
v|volo,velle,volui||want, be willing
av|interea||meanwhile
av|quidem||indeed, at least
ph|ne quidem||not even|the stressed word goes in between
av|quoque||also, too|follows the word it stresses`,
54: `
n|aedes,aedis|f|temple|pl. = house
n|caedes,caedis|f|slaughter, murder
n|munitio,munitionis|f|fortification
n|obses,obsidis|m|hostage
n|ratio,rationis|f|reason, plan, account
n|ripa,ripae|f|bank (of a river)
a|aeger,aegra,aegrum||sick
a|apertus,aperta,apertum||open, exposed
a|egregius,egregia,egregium||outstanding
a|integer,integra,integrum||whole, untouched
a|levis,leve||light
a|maritimus,maritima,maritimum||of the sea
a|militaris,militare||military
a|necessarius,necessaria,necessarium||necessary|as a noun: relative
a|prudens,prudentis||wise, prudent||${NG}
a|recens,recentis||recent, fresh||${NG}
a|vetus,veteris||old||${NG}
v|fio,fieri,factus sum||become, be made, happen
v|vendo,vendere,vendidi,venditum||sell`,
55: `
v|audeo,audere,ausus sum||dare|semi-deponent
v|cado,cadere,cecidi,casum||fall
v|caedo,caedere,cecidi,caesum||cut down, kill
v|emo,emere,emi,emptum||buy
v|hiemo,hiemare,hiemavi,hiematum||spend the winter
v|orior,oriri,ortus sum||rise, arise|deponent
v|potior,potiri,potitus sum||get possession of|+ abl.
v|tango,tangere,tetigi,tactum||touch
v|utor,uti,usus sum||use|+ abl.
av|bis||twice
av|circiter||about, approximately
av|fere||almost, nearly
av|frustra||in vain
av|item||likewise
av|omnino||altogether, at all
av|repente||suddenly
av|supra||above
av|vix||hardly, scarcely`,
56: `
n|agmen,agminis|n|column, line of march
n|ancora,ancorae|f|anchor
n|auctor,auctoris|m|author, founder
n|casus,casus|m|chance, accident, fall
n|latus,lateris|n|side, flank
n|os,oris|n|mouth, face
n|palus,paludis|f|swamp, marsh
n|praeda,praedae|f|booty, loot
a|ceteri,ceterae,cetera||the rest, the other
a|complures,complura||several
v|augeo,augere,auxi,auctum||increase
v|consido,considere,consedi,consessum||sit down, settle, encamp
v|convenit,convenire,convenit||it is convenient|impersonal
v|doleo,dolere,dolui,dolitum||grieve, be sorry
v|exploro,explorare,exploravi,exploratum||explore, reconnoiter
v|licet,licere,licuit||it is permitted|impersonal
v|oportet,oportere,oportuit||it is necessary, it is proper|impersonal
v|perturbo,perturbare,perturbavi,perturbatum||alarm, upset
v|suscipio,suscipere,suscepi,susceptum||undertake
v|tego,tegere,texi,tectum||cover
v|vivo,vivere,vixi,victum||live, be alive`,
57: `
a|turpis,turpe||disgraceful, ugly
a|vehemens,vehementis||violent, forceful||${NG}
v|confido,confidere,confisus sum||trust|semi-deponent · + dat.
v|consulo,consulere,consului,consultum||consult|+ dat. = look out for
v|desum,deesse,defui,defuturus||be lacking|+ dat.
v|eripio,eripere,eripui,ereptum||rescue, snatch away
v|noceo,nocere,nocui,nocitum||harm, injure|+ dat.
v|parco,parcere,peperci,parsum||spare|+ dat.
v|pareo,parere,parui,paritum||obey|+ dat.
v|placeo,placere,placui,placitum||please|+ dat.
v|praeficio,praeficere,praefeci,praefectum||put in command of|acc. + dat.
v|praesum,praeesse,praefui,praefuturus||be in command of|+ dat.
v|provideo,providere,providi,provisum||foresee, provide for
v|rapio,rapere,rapui,raptum||seize, snatch
v|resisto,resistere,restiti||resist|+ dat.
v|solvo,solvere,solvi,solutum||loosen, untie, pay
v|studeo,studere,studui||be eager for, desire|+ dat.`,
58: `
n|adulescens,adulescentis|m|young man, youth
n|gratia,gratiae|f|favor, gratitude, influence
n|mos,moris|m|custom, habit
n|quies,quietis|f|rest, sleep
n|rumor,rumoris|m|rumor
n|sanguis,sanguinis|m|blood
n|voluntas,voluntatis|f|wish, willingness, consent
pr|aliquis,aliquid||someone, something
pr|aliqui,aliqua,aliquod||some
pr|qui,qua,quod||any|after si, nisi, ne, num
pr|quis,quid||anyone, anything|after si, nisi, ne, num
pr|quisquam,quidquam||anyone, anything|in negative sentences
pr|quisque,quidque||each, everyone
v|aperio,aperire,aperui,apertum||open, expose
v|coepi,coepisse,coeptum||began|defective|perfect,infinitive,participle
v|consuesco,consuescere,consuevi,consuetum||become accustomed
v|iaceo,iacere,iacui,iacitum||lie
v|incolo,incolere,incolui||inhabit, live in
v|iuvo,iuvare,iuvi,iutum||help, aid
v|rideo,ridere,risi,risum||laugh, smile
v|rumpo,rumpere,rupi,ruptum||burst, break
v|sumo,sumere,sumpsi,sumptum||take, assume`,
59: `
n|beneficium,benefici|n|kindness, favor
n|cohors,cohortis|f|cohort
n|custos,custodis|m|guard
n|equitatus,equitatus|m|cavalry
n|explorator,exploratoris|m|scout
n|infans,infantis|m./f.|baby
n|lacrima,lacrimae|f|tear
n|laus,laudis|f|praise
n|litus,litoris|n|shore
n|magistratus,magistratus|m|magistrate, public office
n|mulier,mulieris|f|woman, wife
n|opinio,opinionis|f|opinion, expectation, reputation
n|plebs,plebis|f|the common people
n|remus,remi|m|oar
n|saxum,saxi|n|rock, stone
n|uxor,uxoris|f|wife
av|inde||from there, thence`,
60: `
v|ascendo,ascendere,ascendi,ascensum||climb up
v|coniungo,coniungere,coniunxi,coniunctum||join together, unite
v|conscendo,conscendere,conscendi,conscensum||board, climb
v|deduco,deducere,deduxi,deductum||lead away, lead down, launch
v|defero,deferre,detuli,delatum||bring, carry, report
v|descendo,descendere,descendi,descensum||descend
v|ineo,inire,inii,initum||enter, begin|consilium inire = adopt a plan
v|mereor,mereri,meritus sum||deserve, earn|deponent
v|miror,mirari,miratus sum||wonder at, be surprised|deponent
v|morior,mori,mortuus sum||die|deponent · fut. part. moriturus
v|nascor,nasci,natus sum||be born|deponent
v|reficio,reficere,refeci,refectum||repair, restore
v|reicio,reicere,reieci,reiectum||throw back, repulse
v|repello,repellere,reppuli,repulsum||drive back
v|reperio,reperire,repperi,repertum||find, discover
v|revertor,reverti,reversus sum||return, go back|deponent
v|taceo,tacere,tacui,tacitum||be silent
v|tribuo,tribuere,tribui,tributum||assign, grant
v|verto,vertere,verti,versum||turn`,
};

// Extra English accepted as correct (not shown on the card).
export const LESSON_SYN = {
  agricola: ['farmers'], fortuna: ['luck', 'fate'], lingua: ['languages'], silva: ['woods', 'forests'], provincia: ['provinces'],
  amo: ['like'], occupo: ['occupy', 'take'], paro: ['get ready'], specto: ['watch', 'look', 'see'], voco: ['summon', 'name'],
  via: ['street', 'path'], villa: ['country house', 'farm house', 'villa'], terra: ['ground'],
  ager: ['land', 'farm'], legatus: ['ambassador', 'lieutenant', 'legate'], ludus: ['play', 'sport'], nuntius: ['news', 'messenger'],
  periculum: ['peril'], regnum: ['rule', 'reign', 'realm'], oppidum: ['city'],
  ferus: ['savage'], latus: ['broad'], magnus: ['big', 'large', 'great'], malus: ['evil', 'wicked'],
  appello: ['address'], habito: ['inhabit', 'reside'], nuntio: ['tell'], supero: ['conquer', 'overcome', 'beat'], narro: ['narrate'],
  miser: ['poor', 'miserable'], pulcher: ['pretty', 'handsome', 'fine'],
  cur: ['why'], diu: ['long'], ibi: ['in that place'], tum: ['at that time'],
  confirmo: ['declare', 'assure'], demonstro: ['demonstrate'], servo: ['preserve', 'protect'], tempto: ['test'],
  animus: ['soul', 'courage'], consilium: ['counsel', 'idea'], copia: ['abundance'], signum: ['military standard'], telum: ['spear', 'dart'],
  cura: ['concern', 'worry'], inopia: ['scarcity', 'shortage', 'need'], socius: ['companion', 'partner'], populus: ['the people'],
  gratus: ['thankful'], inimicus: ['enemy'], paratus: ['prepared'],
  imperium: ['empire', 'rule', 'authority'], imperator: ['emperor'],
  iter: ['road', 'way', 'trip'], tempus: ['season'], carmen: ['chant'],
  finis: ['border', 'limit'], gens: ['tribe', 'people'], mons: ['mount'],
  habeo: ['own', 'consider'], maneo: ['wait'], moneo: ['remind'], teneo: ['keep'],
  gravis: ['heavy', 'grave', 'severe'], acer: ['keen', 'eager'], celer: ['fast', 'quick'],
  debeo: ['must', 'should'], prohibeo: ['prohibit', 'forbid'], retineo: ['retain', 'keep'], terreo: ['scare', 'terrify'],
  iniuria: ['injury', 'harm'], pugna: ['battle'],
  ago: ['act'], cogo: ['force', 'gather'], gero: ['wage', 'manage', 'carry'], trado: ['give up', 'deliver', 'hand down'], vinco: ['win', 'overcome'],
  antiquus: ['old'], clarus: ['bright', 'renowned'], cedo: ['withdraw', 'go'], constituo: ['determine', 'establish'], contendo: ['hurry'],
  conficio: ['complete', 'do'], cupio: ['long for'], fugio: ['run away', 'escape'], interficio: ['slay'],
  peto: ['beg', 'aim at', 'look for', 'request'], dico: ['speak'],
  auctoritas: ['prestige', 'power'], princeps: ['leader', 'chieftain', 'prince'],
  civitas: ['citizenry', 'city'], labor: ['toil', 'labour', 'difficulty'], multitudo: ['multitude', 'large number'], virtus: ['manliness', 'virtue', 'valor'],
  modus: ['kind', 'degree', 'method'], amitto: ['let go'], reddo: ['return'],
  exitus: ['end', 'exit', 'result'], impetus: ['charge', 'assault'], usus: ['practice', 'skill'],
  invenio: ['discover'], munio: ['construct'], pervenio: ['come to', 'get to'], tamen: ['however'],
  res: ['affair', 'event', 'business'], acies: ['battle-line', 'line of battle'],
  praesidium: ['protection', 'defense'], iubeo: ['command', 'tell'], sustineo: ['endure', 'bear', 'sustain', 'resist'],
  aequus: ['even', 'just'], certus: ['definite', 'fixed'], laetus: ['cheerful'], notus: ['known'],
  durus: ['tough', 'rough'], idoneus: ['fit', 'appropriate'], validus: ['powerful', 'healthy'],
  statim: ['immediately', 'right away'], tandem: ['finally'],
  premo: ['press hard', 'oppress', 'overpower'], recipio: ['accept', 'take in', 'recover'], traho: ['pull'],
  cognosco: ['know', 'recognize', 'get to know'], existimo: ['believe', 'judge'], obtineo: ['occupy', 'possess', 'keep'], sentio: ['perceive', 'sense', 'notice'],
  negotium: ['affair', 'job'], cupiditas: ['eagerness', 'passion', 'longing'],
  commoveo: ['disturb', 'move'], deficio: ['desert', 'run out'], expono: ['expose', 'present'], intermitto: ['pause', 'cease'], opprimo: ['oppress', 'overwhelm'],
  tantus: ['such great', 'so large'], efficio: ['cause', 'accomplish', 'make'],
  studium: ['enthusiasm', 'study', 'interest'], tempestas: ['tempest', 'bad weather'], spatium: ['space', 'period', 'time'],
  impeditus: ['handicapped', 'hampered', 'burdened'], mirus: ['amazing', 'marvelous', 'remarkable'],
  incendo: ['burn', 'inflame', 'excite'], pello: ['drive', 'beat', 'drive away'], permoveo: ['upset', 'move'], produco: ['produce', 'bring out', 'prolong'],
  propono: ['put forward', 'offer', 'display'], renuntio: ['announce', 'bring back a message'], vasto: ['ravage', 'destroy', 'devastate'],
  arbitror: ['judge', 'believe', 'consider'], hortor: ['exhort', 'advise'], patior: ['endure', 'let'], proficiscor: ['leave', 'start out'],
  consequor: ['catch up', 'achieve', 'gain'], vereor: ['be afraid', 'respect'],
  fero: ['endure', 'tell'], tollo: ['take away', 'destroy'],
  ratio: ['method', 'manner', 'calculation'], egregius: ['excellent', 'remarkable', 'distinguished'], integer: ['complete', 'unharmed', 'intact'],
};

// Memory hooks for the lessons still ahead on the syllabus.
export const LESSON_HOOK = {
  tredecim: 'tres + decem: three and ten', quattuordecim: 'quattuor + decem', quindecim: 'quinque + decem', sedecim: 'sex + decem',
  septendecim: 'septem + decem', duodeviginti: 'two from twenty', undeviginti: 'one from twenty',
  communis: 'common, communal, community', immortalis: 'in + mortalis: not able to die', privatus: 'private, privacy', quantus: 'quantity: how much',
  quot: 'quota: how many each person gets', num: 'in an indirect question num = whether', utrum: 'utrum … an: whether this … or that',
  satis: 'satisfy: give enough', necesse: 'necessary', talis: 'tal-is: such a kind', tantus: 'tant-us ↔ quant-us: so great ↔ how great. Sets up a result clause',
  tot: 'tot ↔ quot: so many ↔ how many', accido: 'accident: something that happens', efficio: 'effect: bring it about',
  ita: 'ita … ut: so … that (result)', tam: 'tam … ut: so (with adjectives and adverbs)', sic: 'sic: thus, the way it was written',
  sagitta: 'Sagittarius: the archer', spatium: 'space, spacious: a gap of distance or time', studium: 'student, studious: eagerness for something',
  tempestas: 'tempest: a storm. Also just “weather”', defessus: 'de + fessus: worn out, tired', impeditus: 'impede: held back, in trouble',
  mirus: 'miracle, admire: something to wonder at', conservo: 'conserve: keep safe', incendo: 'incendiary, incense: set on fire',
  pello: 'propel, repel, expel: push or drive away', permoveo: 'per + moveo: move deeply, so upset', produco: 'produce: lead forward',
  propono: 'propose: put forward', renuntio: 're + nuntio: bring back a report', vasto: 'devastate, vast: lay waste',
  cum: 'cum + subjunctive: when, since, although. Context picks which',
};
