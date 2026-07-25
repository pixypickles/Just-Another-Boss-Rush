document.querySelectorAll('.tb').forEach(b=>{const code=b.dataset.key;const down=e=>{if(!keys.has(code)||(code==='KeyI'&&awakenedMode))pressed.add(code);keys.add(code);b.classList.add('active');e.preventDefault()},up=e=>{if(keys.has(code))released.add(code);keys.delete(code);b.classList.remove('active');e.preventDefault?.()};b.addEventListener('touchstart',down,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});b.addEventListener('mousedown',down);b.addEventListener('mouseup',up);b.addEventListener('mouseleave',e=>{if(e.buttons===0)up(e)});b.addEventListener('contextmenu',e=>e.preventDefault())});
addEventListener('blur',()=>resetCombatInput());document.addEventListener('visibilitychange',()=>{if(document.hidden)resetCombatInput()});
const playButton=document.getElementById('play');
const modeSelect=document.getElementById('partyMode'),partyChoices=[...document.querySelectorAll('.partyChoice')],startChoices=[...document.querySelectorAll('input[name="startHero"]')];
const trainingPlay=document.getElementById('trainingPlay'),trainingLimitPlay=document.getElementById('trainingLimitPlay'),trainingRank=document.getElementById('trainingRank'),trainingMenuButton=document.getElementById('trainingMenuButton'),trainingPanel=document.getElementById('trainingPanel'),trainingBack=document.getElementById('trainingBack'),mainActions=document.getElementById('mainActions'),trainingPartyChoices=document.getElementById('trainingPartyChoices'),trainingPartySummary=document.getElementById('trainingPartySummary');
let trainingSelectedTypes=[];
const heroUnlockConditions={
 highpriest:'ハイプリーストはヒーラー単独クリアで解放されます',
 magicblade:'魔剣士はナイト単独クリアで解放されます',
 runemage:'ルーンメイジは魔法使い単独クリアで解放されます',
 archmage:'アークメイジは魔法使いを含む編成で修行場をクリアすると解放されます',
 qigong:'気功師はモンク単独クリアで解放されます',
 ninja:'忍者は覚醒無双以外を1人または2人でクリアすると解放されます',
 dragonknight:'竜騎士はどの編成でも1回クリアすると解放されます',
 dracula:'ドラキュラはステージ2を回復職1人または2人だけで撃破すると解放されます',
 mimic:'模倣術師は竜騎士単独クリアで解放されます',
 bushin:'武神は武神挑戦モード撃破で解放されます',
 fox:'白狐忍は忍者単独・覚醒無双なしで通常クリア後、キツネ対戦モードを制覇すると解放されます',
 monk:'モンクはどの編成でも1回クリアすると解放されます'
};
function heroUnlockCondition(type){return heroUnlockConditions[type]||'特別な条件で解放されます'}
function trainingRankHtml(title,book,score=false){return `<b>${title} 部門別 TOP 3</b>`+[1,2,3].map(size=>{const ranks=book[size]||[];return `<div class="rankSection"><div class="rankTitle">${size}人部門</div>${ranks.length?ranks.map((r,i)=>{const types=Array.isArray(r.types)?r.types:[r.type];return `<div class="rankRow"><span>${i+1}位</span><span class="rankParty">${types.map(t=>heroInfo[t]?.name||t).join('・')}</span><strong>${score?r.kills+'体':formatTrainingTime(r.time)}</strong></div>`}).join(''):'<div>記録はまだありません。</div>'}</div>`}).join('')}
function refreshTrainingPartyUi(){
 const unlocked=isTrainingUnlocked(),count=trainingSelectedTypes.length;
 trainingPartySummary.textContent=count?`${count}人部門：${trainingSelectedTypes.map(t=>heroInfo[t]?.name||t).join('・')}`:'参加キャラクターを選んでください';
 [...trainingPartyChoices.querySelectorAll('.trainingPartyChoice')].forEach(b=>{const selected=trainingSelectedTypes.includes(b.dataset.hero);b.classList.toggle('selected',selected);b.classList.toggle('locked',!selected&&count>=3)});
 trainingPlay.disabled=!unlocked||count<1||count>3;trainingLimitPlay.disabled=!unlocked||count<1||count>3;
}
function buildTrainingPartyChoices(){
 trainingPartyChoices.innerHTML='';
 for(const source of partyChoices){const b=document.createElement('button');b.type='button';b.className='trainingPartyChoice';b.dataset.hero=source.dataset.hero;b.textContent=heroInfo[source.dataset.hero]?.name||source.textContent.replace('（未解放）','');const locked=source.classList.contains('unlockLocked');b.classList.toggle('unlockLocked',locked);if(locked)b.textContent+='（未解放）';b.addEventListener('click',()=>{const type=b.dataset.hero;if(b.classList.contains('unlockLocked')){trainingPartySummary.textContent=heroUnlockCondition(type);return}const i=trainingSelectedTypes.indexOf(type);if(i>=0)trainingSelectedTypes.splice(i,1);else if(trainingSelectedTypes.length<3)trainingSelectedTypes.push(type);refreshTrainingPartyUi()});trainingPartyChoices.appendChild(b)}
 refreshTrainingPartyUi();
}
function refreshTrainingMenu(){const unlocked=isTrainingUnlocked();trainingMenuButton.disabled=!unlocked;trainingMenuButton.textContent=unlocked?'修行場':'修行場（通常クリアで解放）';trainingPlay.innerHTML='<strong>100体撃破タイムアタック</strong><span>100体を倒すまでの最速タイムを競う</span>';trainingLimitPlay.innerHTML='<strong>60秒・制限時間撃破</strong><span>覚醒無双で60秒間の撃破数を競う</span>';trainingRank.innerHTML=trainingRankHtml('100体撃破',readTrainingRankBook())+trainingRankHtml('60秒撃破',readTrainingScoreBook(),true);buildTrainingPartyChoices()}
refreshTrainingMenu();

function openTrainingPanel(){if(!isTrainingUnlocked())return;if(!trainingSelectedTypes.length){trainingSelectedTypes=partyChoices.filter(b=>b.classList.contains('selected')&&!b.disabled).slice(0,3).map(b=>b.dataset.hero);if(!trainingSelectedTypes.length)trainingSelectedTypes=['knight']}buildTrainingPartyChoices();mainActions.hidden=true;trainingPanel.hidden=false;document.getElementById('loadStatus').textContent='修行場：参加キャラクターを1〜3人選び、種目を選択してください。'}
function closeTrainingPanel(){trainingPanel.hidden=true;mainActions.hidden=false;document.getElementById('loadStatus').textContent='ボス部屋または修行場を選択してください。'}
trainingMenuButton.addEventListener('click',openTrainingPanel);
trainingBack.addEventListener('click',closeTrainingPanel);
function addBushinOptions(){if([...modeSelect.options].some(o=>o.value==='bushin3'))return;for(const n of [3,2,1]){const o=document.createElement('option');o.value='bushin'+n;o.textContent=`武神挑戦モード（${n}人）`;modeSelect.appendChild(o)}}
function modeConfig(v=modeSelect.value){
 const configs={hard1:{count:1,hp:1.35,atk:1.35,label:'1人ハード'},hard2:{count:2,hp:1.55,atk:1.45,label:'2人ハード'},hard3:{count:3,hp:1.7,atk:1.5,label:'3人ハード'},oni3:{count:3,hp:2.3,atk:1.9,label:'3人鬼ハード'}};
 if(configs[v])return {...configs[v],hard:true};
 if(v==='fox3')return {count:3,hp:1,atk:1,label:'キツネ対戦',hard:false};
 if(v.startsWith('bushin'))return {count:Number(v.slice(-1)),hp:1,atk:1,label:'武神挑戦',hard:false};
 if(v==='awakening')return {count:1,hp:1,atk:1,label:'覚醒無双',hard:false};
 return {count:Number(v),hp:1,atk:1,label:`${v}人`,hard:false};
}
function modeCount(){return modeConfig().count}
function addFoxModeOption(){if([...modeSelect.options].some(o=>o.value==='fox3'))return;const o=document.createElement('option');o.value='fox3';o.textContent='キツネ対戦モード（3人限定）';modeSelect.appendChild(o)}
function addAwakeningOption(){if([...modeSelect.options].some(o=>o.value==='awakening'))return;const o=document.createElement('option');o.value='awakening';o.textContent='覚醒無双モード（1人・CTなし・大量召喚）';modeSelect.appendChild(o)}
function unlockHighPriestChoice(){document.querySelectorAll('[data-hero="highpriest"],input[value="highpriest"]').forEach(el=>{el.disabled=false;el.closest('label')?.classList.remove('disabled')});const b=document.querySelector('.partyChoice[data-hero="highpriest"]');if(b){b.classList.remove('unlockLocked');b.textContent='ハイプリースト'}}
function unlockDragonKnightChoice(){document.querySelectorAll('[data-hero="dragonknight"],input[value="dragonknight"]') .forEach(el=>{el.disabled=false;el.closest('label')?.classList.remove('disabled')});const b=document.querySelector('.partyChoice[data-hero="dragonknight"]');if(b){b.classList.remove('unlockLocked');b.textContent='竜騎士'}}
function unlockDraculaChoice(){document.querySelectorAll('[data-hero="dracula"],input[value="dracula"]').forEach(el=>{el.disabled=false;el.closest('label')?.classList.remove('disabled')});const b=document.querySelector('.partyChoice[data-hero="dracula"]');if(b){b.classList.remove('unlockLocked');b.textContent='ドラキュラ'}}
function unlockMonkChoice(){document.querySelectorAll('[data-hero="monk"],input[value="monk"]').forEach(el=>{el.disabled=false;el.closest('label')?.classList.remove('disabled')});const b=document.querySelector('.partyChoice[data-hero="monk"]');if(b){b.classList.remove('unlockLocked');b.textContent='モンク'}}

function unlockChoice(type,label){document.querySelectorAll(`[data-hero="${type}"],input[value="${type}"]`).forEach(el=>{el.disabled=false;el.closest('label')?.classList.remove('disabled')});const b=document.querySelector(`.partyChoice[data-hero="${type}"]`);if(b){b.classList.remove('unlockLocked');b.textContent=label}}
function unlockMagicbladeChoice(){unlockChoice('magicblade','魔剣士')}
function unlockRunemageChoice(){unlockChoice('runemage','ルーンメイジ')}
function unlockNinjaChoice(){unlockChoice('ninja','忍者')}
function unlockQigongChoice(){unlockChoice('qigong','気功師')}
function unlockMimicChoice(){unlockChoice('mimic','模倣術師')}
function unlockBushinChoice(){unlockChoice('bushin','武神')}
function unlockFoxChoice(){unlockChoice('fox','白狐忍')}
function unlockArchmageChoice(){unlockChoice('archmage','アークメイジ')}
window.unlockArchmageChoice=unlockArchmageChoice;
if(isBushinUnlocked())addBushinOptions();
if(isFoxModeUnlocked())addFoxModeOption();
if(isAwakeningUnlocked()){addAwakeningOption();document.getElementById('loadStatus').textContent='覚醒無双モード解放済み。敵強化・CTなし・手下最大28体。'}
if(isMonkUnlocked())unlockMonkChoice();
if(isDragonKnightUnlocked())unlockDragonKnightChoice();
if(isHighPriestUnlocked())unlockHighPriestChoice();
if(isDraculaUnlocked())unlockDraculaChoice();
if(isMagicbladeUnlocked())unlockMagicbladeChoice();
if(isRunemageUnlocked())unlockRunemageChoice();
if(isNinjaUnlocked())unlockNinjaChoice();
if(isQigongUnlocked())unlockQigongChoice();
if(isMimicUnlocked())unlockMimicChoice();
if(isPlayableBushinUnlocked())unlockBushinChoice();
if(isFoxUnlocked())unlockFoxChoice();
if(isArchmageUnlocked())unlockArchmageChoice();
function syncPartySetup(){
 const cfg=modeConfig(),awakening=modeSelect.value==='awakening',bushin=modeSelect.value.startsWith('bushin'),fox=modeSelect.value==='fox3',hard=cfg.hard,need=cfg.count;
 let chosen=partyChoices.filter(b=>b.classList.contains('selected'));
 while(chosen.length>need){chosen.pop().classList.remove('selected');chosen=partyChoices.filter(b=>b.classList.contains('selected'))}
 for(const b of partyChoices)b.classList.toggle('locked',!b.classList.contains('selected')&&chosen.length>=need);
 selectedTypes=partyChoices.filter(b=>b.classList.contains('selected')).map(b=>b.dataset.hero);
 for(const radio of startChoices){radio.disabled=!selectedTypes.includes(radio.value);radio.closest('label').classList.toggle('disabled',radio.disabled)}
 if(!selectedTypes.includes(selectedStartType))selectedStartType=selectedTypes[0]||'knight';
 const radio=startChoices.find(r=>r.value===selectedStartType);if(radio)radio.checked=true;
 playButton.disabled=selectedTypes.length!==need;
 document.getElementById('setupStatus').textContent=selectedTypes.length===need?(awakening?`覚醒無双：${heroInfo[selectedTypes[0]].name}（敵HP1.7倍・攻撃強化・CTなし・手下最大28体）`:bushin?`武神挑戦：${need}人（人数に応じて武神HP補正）`:fox?'キツネ対戦：3人編成で白狐忍3体に挑戦':hard?`${cfg.label}：${selectedTypes.map(t=>heroInfo[t].name).join('・')}（敵HP${cfg.hp}倍・攻撃力${cfg.atk}倍）`:`${need}人編成：${selectedTypes.map(t=>heroInfo[t].name).join('・')}`):`キャラクターを${need}人選んでください`
}
modeSelect.addEventListener('change',()=>{const cfg=modeConfig(),awakening=modeSelect.value==='awakening',bushin=modeSelect.value.startsWith('bushin'),fox=modeSelect.value==='fox3',hard=cfg.hard,need=cfg.count;partyChoices.forEach((b,i)=>b.classList.toggle('selected',i<need));selectedStartType=partyChoices.find(b=>b.classList.contains('selected'))?.dataset.hero||'knight';syncPartySetup()});
partyChoices.forEach(b=>b.addEventListener('click',()=>{
 if(b.classList.contains('unlockLocked')){document.getElementById('setupStatus').textContent=heroUnlockCondition(b.dataset.hero);return}
 const awakening=modeSelect.value==='awakening',need=modeCount(),selected=b.classList.contains('selected');
 if(!selected){
  const chosen=partyChoices.filter(x=>x.classList.contains('selected'));
  if(chosen.length>=need){
   const replace=chosen.find(x=>x.dataset.hero!==selectedStartType)||chosen[chosen.length-1];
   if(replace)replace.classList.remove('selected')
  }
  b.classList.add('selected');
  selectedStartType=b.dataset.hero
 }
 syncPartySetup()
}));
startChoices.forEach(r=>r.addEventListener('change',()=>{if(r.checked)selectedStartType=r.value}));
syncPartySetup();
const mimicSetup=document.getElementById('mimicSetup'),mimicBuildRows=document.getElementById('mimicBuildRows'),mimicSaveStart=document.getElementById('mimicSaveStart'),mimicCancel=document.getElementById('mimicCancel'),mimicSetupDescription=document.getElementById('mimicSetupDescription');
const mimicBossList=[
 {key:'troll',name:'巨腕トロール・ガンバ'},
 {key:'dracula',name:'夜侯ドラキュラ'},
 {key:'cerberus',name:'冥府の番犬ケルベロス'},
 {key:'dragon',name:'深紅竜ヴォルガノス'},
 {key:'demonking',name:'終焉の魔王アビス'}
];
const mimicOtherList=[{key:'other',name:'その他（全戦共通）'}];
let pendingMimicLaunch=null,activeMimicEntries=mimicBossList;
function mimicPartySignature(){return selectedTypes.filter(t=>t!=='mimic').sort().join('_')||'solo'}
function mimicStorageKey(single=false){return 'jabr_mimic_build_v74_'+(single?'other_':'boss_')+mimicPartySignature()}
function readSavedMimicBuild(single=false){try{return JSON.parse(localStorage.getItem(mimicStorageKey(single))||'null')}catch{return null}}
function optionLabel(skill){return `${skill.name}（${heroInfo[skill.type]?.name||skill.type}）`}
function showMimicBuildScreen(onStart,single=false){
 activeMimicEntries=single?mimicOtherList:mimicBossList;
 const candidates=mimicCandidatesForTypes(selectedTypes),saved=readSavedMimicBuild(single)||{};
 mimicSetupDescription.textContent=single?'この挑戦で共通して使うA・B技を1組だけ設定します。同じ技を両方へ設定でき、クールタイムは独立します。':'5体のボスごとにA・Bへ技を設定します。同じ技を両方へ設定でき、クールタイムは独立します。';
 if(!candidates.length){mimicBattleBuild=null;onStart();return}
 mimicBuildRows.innerHTML='';
 for(const entry of activeMimicEntries){
  const row=document.createElement('div');row.className='mimicBossRow';
  const title=document.createElement('b');title.textContent='VS '+entry.name;row.appendChild(title);
  for(const button of ['a','b']){
   const wrap=document.createElement('label'),caption=document.createElement('span'),select=document.createElement('select');
   caption.className='mimicSlotLabel';caption.textContent=button.toUpperCase()+'ボタン';select.className='mimicSkillSelect';select.dataset.boss=entry.key;select.dataset.button=button;
   for(const skill of candidates){const opt=document.createElement('option');opt.value=skill.id;opt.textContent=optionLabel(skill);select.appendChild(opt)}
   const wanted=saved?.[entry.key]?.[button];select.value=candidates.some(x=>x.id===wanted)?wanted:candidates[(button==='b'&&candidates.length>1)?1:0].id;
   wrap.append(caption,select);row.appendChild(wrap)
  }
  mimicBuildRows.appendChild(row)
 }
 pendingMimicLaunch=onStart;mimicSetup.hidden=false;
}
function collectMimicBuild(){
 const build={};for(const entry of activeMimicEntries)build[entry.key]={};
 mimicBuildRows.querySelectorAll('.mimicSkillSelect').forEach(sel=>build[sel.dataset.boss][sel.dataset.button]=sel.value);
 return build
}
mimicCancel.addEventListener('click',()=>{mimicSetup.hidden=true;pendingMimicLaunch=null;startingGame=false;playButton.disabled=false;playButton.textContent='ボス部屋へ入る';document.getElementById('loadStatus').textContent='模倣術設定をキャンセルしました。'});
mimicSaveStart.addEventListener('click',()=>{const build=collectMimicBuild();mimicBattleBuild=build;try{localStorage.setItem(mimicStorageKey(activeMimicEntries===mimicOtherList),JSON.stringify(build))}catch{}mimicSetup.hidden=true;const launch=pendingMimicLaunch;pendingMimicLaunch=null;if(launch)launch()});
let startingGame=false,lastStartRequest=0;
function launchBattle(){
 partyDeaths=0;awakeningSoloCarry=null;trainingMode=false;bushinMode=modeSelect.value.startsWith('bushin');foxMode=modeSelect.value==='fox3';const cfg=modeConfig();hardMode=cfg.hard;difficultyMode=hardMode?modeSelect.value:'normal';enemyHpMultiplier=cfg.hp;enemyAttackMultiplier=cfg.atk;difficultyLabel=hardMode?cfg.label:'';awakenedMode=!bushinMode&&!foxMode&&!hardMode&&modeSelect.value==='awakening';
 const launch=()=>{try{bossIndex=0;transition=0;setupBattle();running=true;last=performance.now();ui.notice.style.opacity=0;ui.start.style.display='none';playButton.disabled=false;playButton.textContent='ボス部屋へ入る';startingGame=false}catch(err){running=false;ui.start.style.display='grid';playButton.disabled=false;playButton.textContent='ボス部屋へ入る';startingGame=false;const status=document.getElementById('loadStatus');status.textContent='開始エラー: '+(err&&err.message?err.message:String(err));console.error(err)}};
 requestAnimationFrame(launch);setTimeout(()=>{if(startingGame)launch()},180)
}
function startGame(e){
 if(e){e.preventDefault?.();e.stopPropagation?.()}
 const now=performance.now();if(startingGame||now-lastStartRequest<250)return;lastStartRequest=now;
 syncPartySetup();
 const awakening=modeSelect.value==='awakening',need=modeCount(),chosen=partyChoices.filter(b=>b.classList.contains('selected'));
 if(chosen.length!==need){document.getElementById('setupStatus').textContent=`キャラクターを${need}人選んでください`;return}
 startingGame=true;playButton.disabled=true;playButton.textContent='開始しています…';document.getElementById('loadStatus').textContent='ボス部屋を準備しています…';
 if(selectedStartType==='mimic'&&selectedTypes.length>1){showMimicBuildScreen(launchBattle,modeSelect.value==='fox3'||modeSelect.value.startsWith('bushin'));return}
 mimicBattleBuild=null;launchBattle()
}
window.__bossRushStart=startGame;

function startTraining(e,challenge='time'){
 e.preventDefault();
 if(!isTrainingUnlocked()||startingGame)return;
 const need=trainingSelectedTypes.length;
 if(need<1||need>3){document.getElementById('loadStatus').textContent='修行場用にキャラクターを1〜3人選んでください。';return}
 selectedTypes=[...trainingSelectedTypes];selectedStartType=selectedTypes[0];trainingPartySize=need;trainingChallenge=challenge;
 startingGame=true;trainingPlay.disabled=true;trainingLimitPlay.disabled=true;document.getElementById('loadStatus').textContent=`${need}人部門の${challenge==='limit'?'60秒撃破':'100体撃破'}を準備しています…`;
 const launch=()=>{try{trainingPanel.hidden=true;mainActions.hidden=false;partyDeaths=0;awakeningSoloCarry=null;trainingMode=true;bushinMode=foxMode=hardMode=false;difficultyMode='normal';enemyHpMultiplier=enemyAttackMultiplier=1;difficultyLabel='';awakenedMode=trainingChallenge==='limit';bossIndex=0;transition=0;setupTrainingBattle();running=true;last=performance.now();ui.notice.style.opacity=0;ui.start.style.display='none';startingGame=false;refreshTrainingMenu()}catch(err){running=false;startingGame=false;ui.start.style.display='grid';refreshTrainingMenu();document.getElementById('loadStatus').textContent='修行場開始エラー: '+(err?.message||err);console.error(err)}};
 if(selectedTypes.includes('mimic'))showMimicBuildScreen(launch,true);else launch()
}
trainingPlay.addEventListener('click',e=>startTraining(e,'time'));
trainingLimitPlay.addEventListener('click',e=>startTraining(e,'limit'));
window.refreshTrainingMenu=refreshTrainingMenu;

['click','pointerup','touchend'].forEach(type=>playButton.addEventListener(type,startGame,{passive:false}));
addEventListener('keydown',e=>{if(!running&&ui.start.style.display!=='none'&&(e.code==='Enter'||e.code==='Space'))startGame(e)});
loadSprites();requestAnimationFrame(loop);
