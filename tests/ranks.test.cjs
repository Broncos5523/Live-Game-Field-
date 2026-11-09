const {test}=require('node:test'),assert=require('node:assert/strict'),r=require('../rotation-preview/ranks.js');
const event={competitions:[{competitors:[{homeAway:'home',rank:9},{homeAway:'away',curatedRank:{current:12}}]}]};
test('recorded college ranks follow team identity',()=>assert.deepEqual(r.forSnapshot({sport:'CBB',event}),{home:9,away:12}));
test('CFB and CBB display frozen engine ranks, including unranked',()=>{for(const sport of ['CFB','CBB'])assert.deepEqual(r.forSnapshot({sport,event,ranks:{home:2,away:null}}),{home:2,away:null});});
test('professional leagues have no rank indicator',()=>{for(const sport of ['NBA','WNBA','NFL','NHL','MLB'])assert.deepEqual(r.forSnapshot({sport,event}),{home:null,away:null});});
test('unranked and invalid ranks have no badge',()=>{for(const n of [null,0,26,99,'',undefined,-1,2.5])assert.equal(r.valid(n),null);});
