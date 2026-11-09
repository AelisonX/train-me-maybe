/* v0.3: state does not affect event IDs or card unlocks. Exhaustively audit ALL reachable historical-announcement variants, days 1–3.
   Exact bounded output support. Equal-event branches are NOT merged unless their
   available card multisets and the event-relevant crown state are identical.
   Two independent drafts do not change support: any output can be in both slots.
   Run node audit_all_histories.js. CSV uses model IDs; model_cards.json maps them. */
const fs=require('fs'),path=require('path'),assert=require('assert'),M=require('./core.js');
const dir=path.join(__dirname,'test-results-v03');fs.mkdirSync(dir,{recursive:true});
function combos(a,fn){for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){fn([a[i],a[j]]);for(let k=j+1;k<a.length;k++)fn([a[i],a[j],a[k]]);}}
function dist(cards){const t=M.train(cards),rows=[];function visit(tokens,w,p){if(w==='.'||w==='!'){rows.push({tokens,complete:true,p});return;}if(tokens.length===15||!t[w]){rows.push({tokens,complete:false,p});return;}let e=Object.entries(t[w]),n=e.reduce((s,[,v])=>s+v,0);for(const [v,c]of e)visit([...tokens,v],v,p*c/n);}visit([],'<s>',1);return rows;}
// Text-normalized cards are enough for model behavior. Separate equal-text cards
// remain separate array entries (original + two daily histories can coexist).
const allModels=new Map(),catalogue={},records=[],days=[];let modelNo=0,checks=0;
const f=fs.openSync(path.join(dir,'all_reachable_probabilities.csv'),'w');
fs.writeSync(f,'day,model_id,state_independent,output_paths,copy_probability,truncated_probability,'+Object.keys(M.events).join(',')+'\n');
function model(cards){const texts=cards.map(c=>c.text).sort(),key=JSON.stringify(texts);let v=allModels.get(key);if(!v){const id='m'+(++modelNo),d=dist(texts.map(text=>({text})));v={id,d,byCrown:{},days:new Set()};allModels.set(key,v);catalogue[id]=texts;}
return v;}
function eventRows(v,crowned){if(v.byCrown[crowned])return v.byCrown[crowned];const state={...M.blank(),crowned};const stats=Object.fromEntries(Object.keys(M.events).map(k=>[k,0]));const result=v.d.map(d=>{const e=M.classify(d,state);stats[e.id]+=d.p;return {d,e};});assert(Math.abs(Object.values(stats).reduce((s,p)=>s+p,0)-1)<1e-8);v.byCrown[crowned]={result,stats};return v.byCrown[crowned];}
function scenarioKey(s){return JSON.stringify([s.crowned,[...s.authored].sort(),s.history.map(c=>c.text).sort()]);}
let scenarios=new Map();const start={crowned:false,authored:M.initial.map(c=>c.id),history:[]};scenarios.set(scenarioKey(start),start);
for(let day=1;day<=3;day++){
 const next=new Map();let combosCount=0,outputChecks=0;
 for(const s of scenarios.values()){
 const pool=[...s.authored.map(id=>M.catalog[id]),...s.history];
 combos(pool,cards=>{combosCount++;const v=model(cards),{result,stats}=eventRows(v,s.crowned),recordKey=day+':'+s.crowned;
 if(!v.days.has(recordKey)){v.days.add(recordKey);const original=new Set(cards.map(c=>M.tok(c.text).join(' ')));let copy=0,trunc=0;for(const d of v.d){if(!d.complete)trunc+=d.p;else if(original.has(d.tokens.join(' ')))copy+=d.p;}
 fs.writeSync(f,[day,v.id,s.crowned,v.d.length,copy,trunc,...Object.keys(M.events).map(k=>stats[k])].join(',')+'\n');checks++;}
 outputChecks+=result.length;
 if(day<3)for(const {d,e}of result){const authored=[...new Set([...s.authored,...M.events[e.id].cards])];const crown=false;
 const n={crowned:crown,authored,history:[...s.history,{id:'h'+day,label:'Lulu historical announcement',text:M.format(d.tokens),kind:'history'}]};const k=scenarioKey(n);if(!next.has(k))next.set(k,n);}
 });
 }
 const r={day,reachablePools:scenarios.size,combinations:combosCount,outputChecks,nextPools:next.size,uniqueModels:allModels.size};days.push(r);console.log(JSON.stringify(r));scenarios=next;
}
fs.closeSync(f);fs.writeFileSync(path.join(dir,'model_cards.json'),JSON.stringify(catalogue));fs.writeFileSync(path.join(dir,'all_histories_summary.json'),JSON.stringify({days,probabilityRows:checks,uniqueModels:allModels.size,coverage:'EXHAUSTIVE through day 3 over every positive-probability output of every legal 2/3-card choice, including every possible historical announcement. Histories with identical text multisets are merged; event IDs and unlocked cards do not depend on state in v0.3. State-dependent report variants and mutations are checked separately by test_v03.js. Per-row probabilities are conditional on selected cards not an overall probability over player strategies.'},null,2));

