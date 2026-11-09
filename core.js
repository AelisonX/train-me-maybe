/* Train Me Maybe v0.3: raw bigram, authored consequences. */
(function(root){
'use strict';
const initial=[{"id": "c1", "label": "面包店优惠", "text": "Baker Mo will give free cake on Main Street today!", "zh": "面包师 Mo 今天将在大街送免费蛋糕。", "kind": "original"}, {"id": "c2", "label": "镇长停车通知", "text": "Mayor Bun will park his car on Main Street today.", "zh": "镇长 Bun 今天将把车停在大街。", "kind": "original"}, {"id": "c3", "label": "鸽子执法通知", "text": "Warden Coo will fine every car on Main Street today.", "zh": "管理员 Coo 今天将对大街的每辆车开罚单。", "kind": "original"}, {"id": "c4", "label": "拖吊派车单", "text": "Driver Ted will tow every car to the dump.", "zh": "司机 Ted 将把每辆车拖到垃圾场。", "kind": "original"}, {"id": "c5", "label": "目击报告", "text": "Pigeons ate every crumb on Main Street.", "zh": "鸽子吃掉了大街上的每粒面包屑。", "kind": "original"}];
const extra=[{"id": "move", "label": "紧急搬迁方案", "text": "Mayor Bun will move town hall to the dump.", "zh": "镇长 Bun 将把镇公所搬到垃圾场。", "kind": "town"}, {"id": "tax", "label": "鸽子财政方案", "text": "Warden Coo will tax every car on Main Street.", "zh": "管理员 Coo 将对大街上的每辆车收税。", "kind": "town"}, {"id": "appeal", "label": "停车申诉", "text": "Mayor Bun will park his car at the dump.", "zh": "镇长 Bun 将把车停在垃圾场。", "kind": "town"}, {"id": "bread", "label": "面包师损失清单", "text": "Baker Mo will tow every crumb to the dump.", "zh": "面包师 Mo 将把每粒面包屑拖到垃圾场。", "kind": "town"}, {"id": "ban", "label": "正式更正", "text": "Do not tow every car to the dump.", "zh": "不要把每辆车拖到垃圾场。", "kind": "town"}];
const catalog=Object.fromEntries([...initial,...extra].map(c=>[c.id,c]));
function tok(s){return s.toLowerCase().match(/[a-z]+|[.!]/g)||[];}
function train(cards){
 const table={};
 for(const card of cards){const seq=['<s>',...tok(typeof card==='string'?card:card.text)];
 for(let i=0;i<seq.length-1;i++){const a=seq[i],b=seq[i+1];table[a]??={};table[a][b]=(table[a][b]||0)+1;}}
 return table;
}
function gen(table,rng=Math.random,maxlen=15){
 let w='<s>';const tokens=[];
 while(tokens.length<maxlen){const entries=Object.entries(table[w]||{});if(!entries.length)return {tokens,complete:false,reason:'dead-end'};
 let r=rng()*entries.reduce((s,[,n])=>s+n,0);w=entries[entries.length-1][0];for(const [v,n] of entries){r-=n;if(r<0){w=v;break;}}
 tokens.push(w);if(w==='.'||w==='!')return {tokens,complete:true};}
 return {tokens,complete:false,reason:'limit'};
}
function format(tokens){let s=tokens.join(' ').replace(/ ([.!])/g,'$1');s=s.replace(/baker mo/g,'Baker Mo').replace(/mayor bun/g,'Mayor Bun').replace(/king pudding/g,'King Pudding').replace(/warden coo/g,'Warden Coo').replace(/driver ted/g,'Driver Ted').replace(/main street/g,'Main Street');return s.charAt(0).toUpperCase()+s.slice(1);}
function inspect(cards,previous){const m=train(cards),entries=Object.entries(m[previous]||{}),total=entries.reduce((s,[,n])=>s+n,0);
 return entries.map(([token,count])=>({token,count,p:count/total,sources:cards.map(c=>{let seq=['<s>',...tok(c.text)],n=0;for(let i=0;i<seq.length-1;i++)if(seq[i]===previous&&seq[i+1]===token)n++;return {id:c.id,label:c.label,count:n};}).filter(c=>c.count)}));}

function blank(){return {towed:false,carsEaten:false,officeDump:false,council:false,fined:false,cake:false,crowd:'none',pigeonFed:false};}
function classify(draft,state=blank()){
 const variant=state.officeDump?2:state.towed?1:0;
 const ev=(id,actor)=>({id,actor,variant});
 if(!draft.complete||!draft.tokens.length||!['.','!'].includes(draft.tokens.at(-1))||draft.tokens.slice(0,-1).some(t=>t==='.'||t==='!'))return ev('confused');
 const s=draft.tokens.slice(0,-1).join(' ');let m;
 const place='(?: on main street(?: today)?| to the dump| at the dump)?';
 if(/^do not tow every car to the dump$/.test(s))return ev('ban_tow');
 if((m=s.match(new RegExp('^pigeons ate every (car|crumb)'+place+'$'))))return ev(m[1]==='car'?'eat_cars':'eat_crumbs');
 const names='(baker mo|mayor bun|warden coo|driver ted)';
 if((m=s.match(new RegExp('^'+names+' will (tow|fine|tax) every (car|crumb)'+place+'$'))))return ev(m[2]+'_'+(m[3]==='car'?'cars':'crumbs'),m[1]);
 if((m=s.match(new RegExp('^'+names+' will park his car'+place+'$'))))return ev(s.endsWith('dump')?'park_dump':'park_street',m[1]);
 if((m=s.match(new RegExp('^'+names+' will give free cake'+place+'$'))))return ev('cake',m[1]);
 if((m=s.match(new RegExp('^'+names+' will move town hall to the dump$'))))return ev('relocate',m[1]);
 return ev('confused');
}
const events={"tow_cars": {"title": "所有车，包括你自己的。", "cards": ["move", "appeal"], "lines": ["{actor}清空大街。最后上拖吊车的是镇长自己的车。", "“执法一视同仁。谁来接我？”"]}, "tow_crumbs": {"title": "重型设备，微型货物。", "cards": ["bread", "tax"], "lines": ["{actor}把面包屑逐粒装上拖吊车。一只鸽子带着刀叉尾随。", "Ted：“现在按粒收费。”"]}, "relocate": {"title": "镇公所已送达垃圾场", "cards": ["tax"], "lines": ["{actor}把镇公所搬进垃圾场。门垫写着：请分类投放意见。", "镇长：“民意终于有地方放了。”"]}, "park_dump": {"title": "免费停车，气味强烈。", "cards": ["move"], "lines": ["{actor}把车停在垃圾场，用官方彩带圈出专属车位。", "“水岸景观。水坑也算水。”"]}, "park_street": {"title": "一场非常正式的停车", "cards": ["appeal"], "lines": ["{actor}把车停在大街。三只鸽子检查轮胎角度。", "Coo：“平行停车，连环表格。”"]}, "fine_cars": {"title": "人人有单开", "cards": ["appeal", "tax"], "lines": ["{actor}对每辆车开罚单，执法车也有份。", "Coo：“没有利益冲突，只有利息。”"]}, "fine_crumbs": {"title": "面包屑因游荡遭罚款", "cards": ["bread"], "lines": ["{actor}对每粒面包屑开单。Mo 收到比大街还长的账单。", "Mo：“酸面包要求律师到场。”"]}, "tax_cars": {"title": "鸽子税务局", "cards": ["tax"], "lines": ["{actor}对每辆车收税。Coo 用面包箱搭起收费亭。", "Coo：“面包屑付款，恕不找零。”"]}, "tax_crumbs": {"title": "向税务员的午餐征税", "cards": ["bread"], "lines": ["{actor}向每粒面包屑征税。审计之前，Coo 吃掉了凭证。", "Coo：“查无资料。”"]}, "eat_cars": {"title": "交通已被消化", "cards": ["move", "tax"], "lines": ["鸽子吃掉每辆车。Coo 因为它们把车停在体内而开单。", "“轿车不得停放于鸽子内部。”"]}, "eat_crumbs": {"title": "有目击者的街道清洁", "cards": ["bread"], "lines": ["鸽子吃光面包屑，跟着 Mo 的扫把走，像跟着自助餐车。", "Mo：“这不是桌边服务。”"]}, "cake": {"title": "裹着糖霜的承诺", "cards": ["bread"], "lines": ["{actor}派发免费蛋糕。队伍堵住大街。Ted 用拖车绳量队伍长度。", "Ted：“这些人算合法停车吗？”"]}, "ban_tow": {"title": "拖吊车放假了", "cards": ["appeal"], "lines": ["没有人拖车。Ted 给拖吊车戴上度假小帽。", "Ted：“它有工会代表。”"]}, "confused": {"title": "小镇申请补发一个动词", "cards": ["ban"], "lines": ["居民读了两遍，找不到可执行指令。Lulu 露出加载中的表情。", "镇长：“归档为实验性政府。”"]}};
function apply(event,state){const s={...state};switch(event.id){
 case 'tow_cars':s.towed=true;s.crowd='dump';break;
 case 'eat_cars':s.towed=true;s.carsEaten=true;s.pigeonFed=true;break;
 case 'relocate':s.officeDump=true;s.crowd='dump';break;
 case 'park_dump':s.crowd='dump';break;
 case 'fine_cars':case 'fine_crumbs':s.fined=true;break;
 case 'tax_cars':s.council=s.officeDump||s.council;s.fined=true;break;
 case 'cake':s.cake=true;s.crowd='bakery';break;
 case 'eat_crumbs':s.pigeonFed=true;break;
 }return s;}
// Novel full sentence is a recombination, never automatically an error.
function recombined(d,cards){return d.complete&&!cards.some(c=>tok(c.text).join(' ')===d.tokens.join(' '));}
function samplePair(cards,rng=Math.random){const m=train(cards);return [gen(m,rng),gen(m,rng)];}
const api={samplePair,initial,extra,catalog,tok,train,gen,format,inspect,blank,classify,events,apply,recombined};
if(typeof module!=='undefined')module.exports=api;else root.TMM=api;
})(typeof window==='undefined'?globalThis:window);

