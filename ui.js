document.querySelectorAll('.tb').forEach(b=>{const code=b.dataset.key;const down=e=>{if(!keys.has(code)||(code==='KeyI'&&awakenedMode))pressed.add(code);keys.add(code);b.classList.add('active');e.preventDefault()},up=e=>{if(keys.has(code))released.add(code);keys.delete(code);b.classList.remove('active');e.preventDefault?.()};b.addEventListener('touchstart',down,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});b.addEventListener('mousedown',down);b.addEventListener('mouseup',up);b.addEventListener('mouseleave',e=>{if(e.buttons===0)up(e)});b.addEventListener('contextmenu',e=>e.preventDefault())});
addEventListener('blur',()=>resetCombatInput());document.addEventListener('visibilitychange',()=>{if(document.hidden)resetCombatInput()});
const playButton=document.getElementById('play');
const modeSelect=document.getElementById('partyMode'),partyChoices=[...document.querySelectorAll('.partyChoice')],startChoices=[...document.querySelectorAll('input[name="startHero"]')];
function addBushinOptions(){if([...modeSelect.options].some(o=>o.value==='bushin3'))return;for(const n of [3,2,1]){const o=document.createElement('option');o.value='bushin'+n;o.textContent=`武神挑戦モード（${n}人）`;modeSelect.appendChild(o)}}
function modeCount(){const v=modeSelect.value;return v.startsWith('bushin')?Number(v.slice(-1)):v==='awakening'?1:Number(v)}
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
if(isBushinUnlocked())addBushinOptions();
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
function syncPartySetup(){
 const awakening=modeSelect.value==='awakening',bushin=modeSelect.value.startsWith('bushin'),need=modeCount();
 let chosen=partyChoices.filter(b=>b.classList.contains('selected'));
 while(chosen.length>need){chosen.pop().classList.remove('selected');chosen=partyChoices.filter(b=>b.classList.contains('selected'))}
 for(const b of partyChoices)b.classList.toggle('locked',!b.classList.contains('selected')&&chosen.length>=need);
 selectedTypes=partyChoices.filter(b=>b.classList.contains('selected')).map(b=>b.dataset.hero);
 for(const radio of startChoices){radio.disabled=!selectedTypes.includes(radio.value);radio.closest('label').classList.toggle('disabled',radio.disabled)}
 if(!selectedTypes.includes(selectedStartType))selectedStartType=selectedTypes[0]||'knight';
 const radio=startChoices.find(r=>r.value===selectedStartType);if(radio)radio.checked=true;
 playButton.disabled=selectedTypes.length!==need;
 document.getElementById('setupStatus').textContent=selectedTypes.length===need?(awakening?`覚醒無双：${heroInfo[selectedTypes[0]].name}（敵HP1.7倍・攻撃強化・CTなし・手下最大28体）`:bushin?`武神挑戦：${need}人（人数に応じて武神HP補正）`:`${need}人編成：${selectedTypes.map(t=>heroInfo[t].name).join('・')}`):`キャラクターを${need}人選んでください`
}
modeSelect.addEventListener('change',()=>{const awakening=modeSelect.value==='awakening',bushin=modeSelect.value.startsWith('bushin'),need=modeCount();partyChoices.forEach((b,i)=>b.classList.toggle('selected',i<need));selectedStartType=partyChoices.find(b=>b.classList.contains('selected'))?.dataset.hero||'knight';syncPartySetup()});
partyChoices.forEach(b=>b.addEventListener('click',()=>{
 if(b.classList.contains('unlockLocked')){document.getElementById('setupStatus').textContent=({highpriest:'ハイプリーストはヒーラー単独クリアで解放されます',magicblade:'魔剣士はナイト単独クリアで解放されます',runemage:'ルーンメイジは魔法使い単独クリアで解放されます',qigong:'気功師はモンク単独クリアで解放されます',ninja:'忍者は覚醒無双以外を1人または2人でクリアすると解放されます',dragonknight:'竜騎士はどの編成でも1回クリアすると解放されます',dracula:'ドラキュラはステージ2を回復職1人または2人だけで撃破すると解放されます',mimic:'模倣術師は竜騎士単独クリアで解放されます',bushin:'武神は武神挑戦モード撃破で解放されます',monk:'モンクはどの編成でも1回クリアすると解放されます'}[b.dataset.hero]||'特別な条件で解放されます');return}
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
const mimicSetup=document.getElementById('mimicSetup'),mimicBuildRows=document.getElementById('mimicBuildRows'),mimicSaveStart=document.getElementById('mimicSaveStart'),mimicCancel=document.getElementById('mimicCancel');
const mimicBossList=[
 {key:'troll',name:'巨腕トロール・ガンバ'},
 {key:'dracula',name:'夜侯ドラキュラ'},
 {key:'cerberus',name:'冥府の番犬ケルベロス'},
 {key:'dragon',name:'深紅竜ヴォルガノス'},
 {key:'demonking',name:'終焉の魔王アビス'}
];
let pendingMimicLaunch=null;
function mimicPartySignature(){return selectedTypes.filter(t=>t!=='mimic').sort().join('_')||'solo'}
function mimicStorageKey(){return 'jabr_mimic_build_v63_'+mimicPartySignature()}
function readSavedMimicBuild(){try{return JSON.parse(localStorage.getItem(mimicStorageKey())||'null')}catch{return null}}
function optionLabel(skill){return `${skill.name}（${heroInfo[skill.type]?.name||skill.type}）`}
function showMimicBuildScreen(onStart){
 const candidates=mimicCandidatesForTypes(selectedTypes),saved=readSavedMimicBuild()||{};
 if(!candidates.length){mimicBattleBuild=null;onStart();return}
 mimicBuildRows.innerHTML='';
 for(const entry of mimicBossList){
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
 const build={};for(const entry of mimicBossList)build[entry.key]={};
 mimicBuildRows.querySelectorAll('.mimicSkillSelect').forEach(sel=>build[sel.dataset.boss][sel.dataset.button]=sel.value);
 return build
}
mimicCancel.addEventListener('click',()=>{mimicSetup.hidden=true;pendingMimicLaunch=null;startingGame=false;playButton.disabled=false;playButton.textContent='ボス部屋へ入る';document.getElementById('loadStatus').textContent='模倣術設定をキャンセルしました。'});
mimicSaveStart.addEventListener('click',()=>{const build=collectMimicBuild();mimicBattleBuild=build;try{localStorage.setItem(mimicStorageKey(),JSON.stringify(build))}catch{}mimicSetup.hidden=true;const launch=pendingMimicLaunch;pendingMimicLaunch=null;if(launch)launch()});
let startingGame=false,lastStartRequest=0;
function launchBattle(){
 partyDeaths=0;awakeningSoloCarry=null;bushinMode=modeSelect.value.startsWith('bushin');awakenedMode=!bushinMode&&modeSelect.value==='awakening';
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
 if(selectedStartType==='mimic'&&selectedTypes.length>1){showMimicBuildScreen(launchBattle);return}
 mimicBattleBuild=null;launchBattle()
}
window.__bossRushStart=startGame;
['click','pointerup','touchend'].forEach(type=>playButton.addEventListener(type,startGame,{passive:false}));
addEventListener('keydown',e=>{if(!running&&ui.start.style.display!=='none'&&(e.code==='Enter'||e.code==='Space'))startGame(e)});
loadSprites();requestAnimationFrame(loop);
