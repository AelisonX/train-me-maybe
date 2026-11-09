// Dependency-free UI state unit tests. A minimal view mock; not a browser test.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),M=require('./core.js');
const nodes=new Map(),storage=new Map();
function node(s){if(!nodes.has(s))nodes.set(s,{textContent:'',innerHTML:'',hidden:false,setAttribute(k,v){this[k]=v},querySelectorAll(){return []},scrollIntoView(){},showModal(){},close(){}});return nodes.get(s);}
const context={TMM:M,document:{querySelector:node,documentElement:{}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},window:{scrollTo(){}},console};vm.createContext(context);
vm.runInContext(fs.readFileSync('i18n.js','utf8')+'\n'+fs.readFileSync('ui.js','utf8'),context);
const run=s=>vm.runInContext(s,context);run('render();game.selected=["c1","c2"];sampleDrafts();');assert.equal(run('game.sampleCount'),2);assert.equal(run('game.drafts.length'),2);
const drafts=run('JSON.stringify(game.drafts)'),town=run('JSON.stringify(game.state)');node('#lang-en').onclick();assert.equal(run('lang'),'en');assert.equal(run('JSON.stringify(game.drafts)'),drafts);assert.equal(run('JSON.stringify(game.state)'),town);assert(!/[\u3400-\u9fff]/.test(node('#left').innerHTML+node('#right').innerHTML));
node('#lang-zh').onclick();assert.equal(run('JSON.stringify(game.drafts)'),drafts);assert(node('#right').innerHTML.includes('再抽两份'));node('#reroll').onclick();assert.equal(run('game.sampleCount'),4);assert.equal(run('game.day'),1);assert.equal(run('game.history.length'),0);assert.equal(run('JSON.stringify(game.state)'),town);
node('#reselect').onclick();assert.equal(run('game.phase'),'select');assert.equal(run('game.selected.join(",")'),'c1,c2');run('game.selected=["c2","c5"];sampleDrafts();');assert.equal(run('game.sampleCount'),6);
run('publish(0)');assert.equal(run('game.history.length'),1);assert.equal(run('game.phase'),'reaction');node('#lang-en').onclick();assert(!/[\u3400-\u9fff]/.test(node('#left').innerHTML+node('#right').innerHTML));node('#advance').onclick();assert.equal(run('game.day'),2);assert.equal(run('game.sampleCount'),0);assert.equal(run('lang'),'en');assert.equal(storage.get('tmm-language'),'en');
let calls=0;const pair=M.samplePair([M.initial[0],M.initial[1]],()=>{calls++;return 0});assert.deepEqual(pair[0],pair[1]);assert.equal(calls,pair[0].tokens.length+pair[1].tokens.length);
for(const [id,e]of Object.entries(M.events)){assert.equal(run(`EN_EVENTS[${JSON.stringify(id)}].length`),e.lines.length+1);}
for(const c of Object.values(M.catalog))for(const t of M.tok(c.text))assert(run(`WORD_ZH[${JSON.stringify(t)}]`));
console.log('PASS: retries, card reselection, language changes preserve drafts/state, English content, next-day reset, preference persistence, unfiltered duplicate sampling, all event translations and tokens.');

