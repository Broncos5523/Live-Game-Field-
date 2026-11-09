const {test}=require('node:test'),assert=require('node:assert/strict'),S=require('../rotation-preview/spotlight.js');
const p=(position,values,types=[])=>({athlete:{id:'1'},position,values,types:new Set(types)});
for(const sport of ['NFL','CFB']){
 test(sport+' QB uses passing yards, C/ATT and passing TDs',()=>assert.deepEqual(S.stats({},sport,p('QB',{passingyards:'243',completionspassingattempts:'18/32',passingtouchdowns:'0',rushingyards:'10'})),[['YDS','243'],['C/ATT','18/32'],['TD','0']]));
 test(sport+' RB uses attempts, rushing yards and rushing TDs',()=>assert.deepEqual(S.stats({},sport,p('RB',{rushingattempts:'20',rushingyards:'97',rushingtouchdowns:'2',receivingyards:'40'})),[['ATT','20'],['YDS','97'],['TD','2']]));
 test(sport+' WR uses catches, receiving yards and receiving TDs',()=>assert.deepEqual(S.stats({},sport,p('WR',{receptions:'8',receivingyards:'105',receivingtouchdowns:'1'})),[['REC','8'],['YDS','105'],['TD','1']]));
}
test('an RB who throws remains an RB',()=>assert.equal(S.role(p('RB',{},['passing','rushing'])),'RB'));
test('hockey plus/minus preserves negatives and adds positive sign',()=>{assert.deepEqual(S.stats({},'NHL',p('D',{goals:'1',assists:'0',plusminus:'-1'})),[['G','1'],['A','0'],['+/−','-1']]);assert.equal(S.stats({},'NHL',p('LW',{plusminus:'2'}))[2][1],'+2');});
test('baseball PA is distinct from AB and unavailable stays unknown',()=>{assert.equal(S.stats({},'MLB',p('SS',{hits:'2',atbats:'3',plateappearances:'4',homeruns:'0',rbis:'2'}))[0][1],'2/4');assert.equal(S.stats({},'MLB',p('SS',{hits:'2',atbats:'3'}))[0][1],'2/—');});
test('complete verified plate appearances include walks; partial logs are rejected',()=>{const player=p('SS',{hits:'1',atbats:'1',walks:'1'}),play=text=>({summaryType:'N',text,participants:[{type:'batter',athlete:{id:'1'}}]}),summary={plays:[play('Player singled to left.'),play('Player walked.')],atBats:{a:[{$ref:'#/plays/0'}],b:[{$ref:'#/plays/1'}]}};assert.equal(S.plateAppearances(summary,player),'2');summary.atBats.b=[];assert.equal(S.plateAppearances(summary,player),'—');});
test('basketball keeps points rebounds assists and missing values do not become zero',()=>{assert.deepEqual(S.stats({},'NBA',p('G',{points:'20',rebounds:'0',assists:'8'})),[['PTS','20'],['REB','0'],['AST','8']]);assert.equal(S.stats({},'NHL',p('D',{}))[0][1],'—');});
test('MLB missing leaders selects only verified batters, not pitching hits allowed',()=>{const summary={header:{competitions:[{competitors:[{homeAway:'home',team:{id:'t'}}]}]},boxscore:{players:[{team:{id:'t'},statistics:[{type:'pitching',keys:['hits'],athletes:[{athlete:{id:'pitcher'},stats:['15']}]},{type:'batting',keys:['hits','RBIs','homeRuns','plateAppearances'],athletes:[{athlete:{id:'hitter'},stats:['2','3','1','4']}]}]}]}};assert.equal(S.select(summary,'MLB','home').athlete.id,'hitter');});

test('an explicitly reported infield single counts as a hit in PA verification',()=>{const player=p('CF',{hits:'1',atbats:'1',walks:'0'});assert.equal(S.plateAppearances({plays:[{summaryType:'N',text:'Cowser reached on infield single to first.',participants:[{type:'batter',athlete:{id:'1'}}]}],atBats:{a:[{$ref:'#/plays/0'}]}},player),'1');});

test('season columns cannot replace requested game stats',()=>{
 assert.deepEqual(S.stats({},'NHL',p('LW',{goals:'1',assists:'2',plusminus:'-1',ytdgoals:'40',ytdassists:'50'})),[['G','1'],['A','2'],['+/−','-1']]);
 assert.deepEqual(S.stats({},'MLB',p('CF',{hits:'2',plateappearances:'4',homeruns:'1',rbis:'3',avg:'.300',ytdhomeruns:'40',ytdrbis:'100'})),[['H/PA','2/4'],['HR','1'],['RBI','3']]);
});
test('a summary belonging to a different game is rejected',()=>{assert.equal(S.select({header:{id:'other'}},'NFL','home','selected-game'),null);});

test('already-signed hockey values do not get a second plus sign',()=>assert.equal(S.stats({},'NHL',p('LW',{plusminus:'+2'}))[2][1],'+2'));
