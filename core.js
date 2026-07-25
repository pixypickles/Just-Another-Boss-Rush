'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),W=1000,H=1000;
const keys=new Set(),pressed=new Set(),released=new Set();let running=false,last=0,heroIndex=0,bossIndex=0,transition=0,shake=0,joy={x:0,y:0,id:null};let selectedTypes=['knight','mage','healer'],selectedStartType='knight',awakenedMode=false,bushinMode=false,foxMode=false,hardMode=false,difficultyMode='normal',enemyHpMultiplier=1,enemyAttackMultiplier=1,difficultyLabel='',trainingMode=false,partyDeaths=0,awakeningSoloCarry=null,dInputBuffer=0,timeStop=0;
let trainingKills=0,trainingElapsed=0,trainingSpawnTimer=0,trainingFinished=false,trainingPartySize=1,trainingChallenge='time';
let moleScore=0,moleCombo=0,moleSpawnTimer=0,moleAttackFx=0,moleAttackDir='',moleFinished=false,moles=[],moleInputQueue=[];
let shootingScore=0,shootingCombo=0,shootingSpawnTimer=0,shootingFireCd=0,shootingFinished=false,shootingTargets=[],shootingBullets=[];
const MOLE_DURATION=60,MOLE_ALLOWED=['knight','magicblade','dragonknight','bushin'];
const SHOOTING_DURATION=60,SHOOTING_ALLOWED=['mage','ninja','archmage','fox'];
const MOLE_HOLES=[[285,325],[500,285],[715,325],[750,500],[715,675],[500,715],[285,675],[250,500]];
const TRAINING_SPAWN_POINTS=[[145,190],[855,190],[145,825],[855,825]],trainingSpawnFlash=[0,0,0,0];
let mimicBattleBuild=null;
const AWAKEN_UNLOCK_KEY='jabrAwakeningUnlockedV1',MONK_UNLOCK_KEY='jabrMonkUnlockedV1',HIGHPRIEST_UNLOCK_KEY='jabrHighPriestUnlockedV2',MAGICBLADE_UNLOCK_KEY='jabrMagicbladeUnlockedV1',RUNEMAGE_UNLOCK_KEY='jabrRunemageUnlockedV1',QIGONG_UNLOCK_KEY='jabrQigongUnlockedV1',NINJA_UNLOCK_KEY='jabrNinjaUnlockedV1',DRAGONKNIGHT_UNLOCK_KEY='jabrDragonKnightUnlockedV1',DRACULA_UNLOCK_KEY='jabrPlayableDraculaUnlockedV1',MIMIC_UNLOCK_KEY='jabrMimicUnlockedV1',BUSHIN_UNLOCK_KEY='jabrBushinChallengeUnlockedV1',PLAYABLE_BUSHIN_UNLOCK_KEY='jabrPlayableBushinUnlockedV1',FOX_MODE_UNLOCK_KEY='jabrFoxBattleUnlockedV1',FOX_UNLOCK_KEY='jabrPlayableFoxUnlockedV1',TRAINING_UNLOCK_KEY='jabrTrainingUnlockedV1',TRAINING_RANK_KEY='jabrTraining100Top3V3',TRAINING_LEGACY_RANK_KEY='jabrTraining100Top5V2',TRAINING_SCORE_KEY='jabrTraining60Top3V1',MOLE_SCORE_KEY='jabrMoleTop3V1',SHOOTING_SCORE_KEY='jabrShootingTop3V1',ARCHMAGE_UNLOCK_KEY='jabrArchmageUnlockedV1',HARD3_CLEAR_KEY='jabrHard3ClearedV1',HARD2_CLEAR_KEY='jabrHard2ClearedV1',HARD1_CLEAR_KEY='jabrHard1ClearedV1',ONI3_CLEAR_KEY='jabrOniHard3ClearedV1';
function isAwakeningUnlocked(){try{return localStorage.getItem(AWAKEN_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveAwakeningUnlock(){try{localStorage.setItem(AWAKEN_UNLOCK_KEY,'1')}catch(e){}}
function isMonkUnlocked(){try{return localStorage.getItem(MONK_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveMonkUnlock(){try{localStorage.setItem(MONK_UNLOCK_KEY,'1')}catch(e){}}
function isHighPriestUnlocked(){try{return localStorage.getItem(HIGHPRIEST_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveHighPriestUnlock(){try{localStorage.setItem(HIGHPRIEST_UNLOCK_KEY,'1')}catch(e){}}
function isDragonKnightUnlocked(){try{return localStorage.getItem(DRAGONKNIGHT_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveDragonKnightUnlock(){try{localStorage.setItem(DRAGONKNIGHT_UNLOCK_KEY,'1')}catch(e){}}
function isDraculaUnlocked(){try{return localStorage.getItem(DRACULA_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveDraculaUnlock(){try{localStorage.setItem(DRACULA_UNLOCK_KEY,'1')}catch(e){}}

function isMagicbladeUnlocked(){try{return localStorage.getItem(MAGICBLADE_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveMagicbladeUnlock(){try{localStorage.setItem(MAGICBLADE_UNLOCK_KEY,'1')}catch(e){}}
function isRunemageUnlocked(){try{return localStorage.getItem(RUNEMAGE_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveRunemageUnlock(){try{localStorage.setItem(RUNEMAGE_UNLOCK_KEY,'1')}catch(e){}}
function isQigongUnlocked(){try{return localStorage.getItem(QIGONG_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveQigongUnlock(){try{localStorage.setItem(QIGONG_UNLOCK_KEY,'1')}catch(e){}}
function isNinjaUnlocked(){try{return localStorage.getItem(NINJA_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveNinjaUnlock(){try{localStorage.setItem(NINJA_UNLOCK_KEY,'1')}catch(e){}}
function isMimicUnlocked(){try{return localStorage.getItem(MIMIC_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveMimicUnlock(){try{localStorage.setItem(MIMIC_UNLOCK_KEY,'1')}catch(e){}}
function isBushinUnlocked(){try{return localStorage.getItem(BUSHIN_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveBushinUnlock(){try{localStorage.setItem(BUSHIN_UNLOCK_KEY,'1')}catch(e){}}
function isPlayableBushinUnlocked(){try{return localStorage.getItem(PLAYABLE_BUSHIN_UNLOCK_KEY)==='1'}catch(e){return false}}
function savePlayableBushinUnlock(){try{localStorage.setItem(PLAYABLE_BUSHIN_UNLOCK_KEY,'1')}catch(e){}}
function isFoxModeUnlocked(){try{return localStorage.getItem(FOX_MODE_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveFoxModeUnlock(){try{localStorage.setItem(FOX_MODE_UNLOCK_KEY,'1')}catch(e){}}
function isFoxUnlocked(){try{return localStorage.getItem(FOX_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveFoxUnlock(){try{localStorage.setItem(FOX_UNLOCK_KEY,'1')}catch(e){}}



function isArchmageUnlocked(){try{return localStorage.getItem(ARCHMAGE_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveArchmageUnlock(){try{localStorage.setItem(ARCHMAGE_UNLOCK_KEY,'1')}catch(e){}}
function isHard3Cleared(){try{return localStorage.getItem(HARD3_CLEAR_KEY)==='1'}catch(e){return false}}
function saveHard3Clear(){try{localStorage.setItem(HARD3_CLEAR_KEY,'1')}catch(e){}}
function isHard2Cleared(){try{return localStorage.getItem(HARD2_CLEAR_KEY)==='1'}catch(e){return false}}
function saveHard2Clear(){try{localStorage.setItem(HARD2_CLEAR_KEY,'1')}catch(e){}}
function isHard1Cleared(){try{return localStorage.getItem(HARD1_CLEAR_KEY)==='1'}catch(e){return false}}
function saveHard1Clear(){try{localStorage.setItem(HARD1_CLEAR_KEY,'1')}catch(e){}}
function isOniHard3Cleared(){try{return localStorage.getItem(ONI3_CLEAR_KEY)==='1'}catch(e){return false}}
function saveOniHard3Clear(){try{localStorage.setItem(ONI3_CLEAR_KEY,'1')}catch(e){}}
function isTrainingUnlocked(){try{return localStorage.getItem(TRAINING_UNLOCK_KEY)==='1'}catch(e){return false}}
function saveTrainingUnlock(){try{localStorage.setItem(TRAINING_UNLOCK_KEY,'1')}catch(e){}}
function emptyTrainingBook(){return {1:[],2:[],3:[]}}
function readTrainingRankBook(){try{let v=JSON.parse(localStorage.getItem(TRAINING_RANK_KEY)||'null');if(!v||Array.isArray(v))v=emptyTrainingBook();for(const n of [1,2,3])if(!Array.isArray(v[n]))v[n]=[];if(!v[1].length&&!v[2].length&&!v[3].length){const legacy=JSON.parse(localStorage.getItem(TRAINING_LEGACY_RANK_KEY)||'null');if(legacy){if(Array.isArray(legacy))v[1]=legacy.map(r=>({time:r.time,types:Array.isArray(r.types)?r.types:[r.type]}));else for(const n of [1,2,3])if(Array.isArray(legacy[n]))v[n]=legacy[n]} }for(const n of [1,2,3])v[n]=v[n].slice(0,3);return v}catch(e){return emptyTrainingBook()}}
function readTrainingScoreBook(){try{const v=JSON.parse(localStorage.getItem(TRAINING_SCORE_KEY)||'null')||emptyTrainingBook();for(const n of [1,2,3])if(!Array.isArray(v[n]))v[n]=[];return v}catch(e){return emptyTrainingBook()}}
function readTrainingRanks(size=trainingPartySize){return readTrainingRankBook()[size].slice(0,3)}
function saveTrainingRank(time,types){const size=Math.max(1,Math.min(3,types.length)),book=readTrainingRankBook(),ranks=book[size];ranks.push({time:Math.round(time*1000)/1000,types:[...types]});ranks.sort((a,b)=>a.time-b.time);book[size]=ranks.slice(0,3);try{localStorage.setItem(TRAINING_RANK_KEY,JSON.stringify(book))}catch(e){}return book[size]}
function saveTrainingScore(kills,types){const size=Math.max(1,Math.min(3,types.length)),book=readTrainingScoreBook(),ranks=book[size];ranks.push({kills,types:[...types]});ranks.sort((a,b)=>b.kills-a.kills);book[size]=ranks.slice(0,3);try{localStorage.setItem(TRAINING_SCORE_KEY,JSON.stringify(book))}catch(e){}return book[size]}
function formatTrainingTime(sec){const m=Math.floor(sec/60),s=Math.floor(sec%60),cs=Math.floor((sec-Math.floor(sec))*100);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`}
function isMoleUnlocked(){const b=readTrainingRankBook();return [1,2,3].some(n=>(b[n]||[]).length>0)}
function readMoleScoreBook(){try{const v=JSON.parse(localStorage.getItem(MOLE_SCORE_KEY)||'{}')||{};for(const t of MOLE_ALLOWED)if(!Array.isArray(v[t]))v[t]=[];return v}catch(e){const v={};for(const t of MOLE_ALLOWED)v[t]=[];return v}}
function saveMoleScore(score,type){const book=readMoleScoreBook(),r=book[type]||[];r.push({score,date:Date.now()});r.sort((a,b)=>b.score-a.score);book[type]=r.slice(0,3);try{localStorage.setItem(MOLE_SCORE_KEY,JSON.stringify(book))}catch(e){}return book[type]}
function readShootingScoreBook(){try{const v=JSON.parse(localStorage.getItem(SHOOTING_SCORE_KEY)||'{}')||{};for(const t of SHOOTING_ALLOWED)if(!Array.isArray(v[t]))v[t]=[];return v}catch(e){const v={};for(const t of SHOOTING_ALLOWED)v[t]=[];return v}}
function saveShootingScore(score,type){const book=readShootingScoreBook(),r=book[type]||[];r.push({score,date:Date.now()});r.sort((a,b)=>b.score-a.score);book[type]=r.slice(0,3);try{localStorage.setItem(SHOOTING_SCORE_KEY,JSON.stringify(book))}catch(e){}return book[type]}

function enemyDamage(n){return n*(awakenedMode?1.25:1)*enemyAttackMultiplier}
function resetCombatInput(){keys.clear();pressed.clear();released.clear();dInputBuffer=0;moleInputQueue.length=0;joy.x=0;joy.y=0;joy.id=null;const stick=document.getElementById('stick');if(stick)stick.style.transform='translate(0,0)';document.querySelectorAll('.tb.active').forEach(b=>b.classList.remove('active'))}
const shots=[],particles=[],walls=[],slashes=[],fistTrails=[],minions=[],lasers=[],bloodBeams=[],holyFx=[],holyDots=[],runes=[];
const AWAKEN_MINION_LIMIT=28,AWAKEN_SUMMON_MULTIPLIER=4;
const spriteFiles={
 boss_bushin:'boss_bushin.png',
 boss_bushin_kick:'boss_bushin_kick.png',
 hero_archmage:'hero_archmage.png',
 hero_fox:'hero_fox.png',
 hero_mimic:'hero_mimic.png',
 hero_dracula:'hero_dracula.png',
 hero_dragonknight:'hero_dragonknight.png',
 hero_qigong:'hero_qigong.png',
 hero_runemage:'hero_runemage.png',
 hero_highpriest:'hero_highpriest.png',
 hero_ninja:'hero_ninja.png',
 hero_monk:'hero_monk.png',
 hero_magicblade:'hero_magicblade.png',
 hero_mage:'hero_mage.png',
 hero_knight:'hero_knight.png',
 hero_healer:'hero_healer.png',
 boss_troll_up:'boss_troll_up.png',
 boss_troll_down:'boss_troll_down.png',
 boss_dracula:'boss_dracula.png',
 boss_cerberus:'boss_cerberus.png',
 boss_dragon:'boss_dragon.png',
 boss_demonking:'boss_demonking.png'
};
const sprites={};
let assetsReady=true;
const scriptBase=(()=>{try{const src=document.currentScript&&document.currentScript.src;return src?new URL('.',src):new URL('.',document.baseURI)}catch(e){return new URL('.',location.href)}})();
function loadSprites(){
 const entries=Object.entries(spriteFiles),status=document.getElementById('imageLoadStatus')||document.getElementById('loadStatus');
 let loaded=0,failed=0;
 const refresh=()=>{const done=loaded+failed;if(done<entries.length)status.textContent=`画像読み込み ${done}/${entries.length}（成功 ${loaded}）`;else status.textContent=failed?`画像読み込み ${done}/${entries.length}（成功 ${loaded}・失敗 ${failed}）`:`画像準備完了 ${loaded}/${entries.length}`};
 refresh();
 for(const [key,file] of entries){
  const im=new Image();sprites[key]=im;im.decoding='async';
  const candidates=[new URL(file,scriptBase).href,new URL('assets/sprites/'+file,scriptBase).href];let ci=0;
  im.onload=()=>{loaded++;refresh()};
  im.onerror=()=>{ci++;if(ci<candidates.length){im.src=candidates[ci];return}failed++;console.warn('Sprite load failed:',key,candidates);refresh()};
  im.src=candidates[0];
 }
}
function drawSprite(img,x,y,maxW,maxH,flip=false,alpha=1,bob=0){
 if(!img||!img.complete||!img.naturalWidth)return false;
 const s=Math.min(maxW/img.naturalWidth,maxH/img.naturalHeight),w=img.naturalWidth*s,h=img.naturalHeight*s;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y+bob);ctx.scale(flip?-1:1,1);ctx.drawImage(img,-w/2,-h*.78,w,h);ctx.restore();return true;
}
const ui={stageNo:document.getElementById('stageNo'),bossName:document.getElementById('bossName'),bossFill:document.getElementById('bossFill'),heroName:document.getElementById('heroName'),ability:document.getElementById('ability'),hpFill:document.getElementById('hpFill'),hpText:document.getElementById('hpText'),notice:document.getElementById('notice'),start:document.getElementById('start'),party:{knightFill:document.getElementById('partyKnightFill'),knightText:document.getElementById('partyKnightText'),mageFill:document.getElementById('partyMageFill'),mageText:document.getElementById('partyMageText'),healerFill:document.getElementById('partyHealerFill'),healerText:document.getElementById('partyHealerText'),monkFill:document.getElementById('partyMonkFill'),monkText:document.getElementById('partyMonkText'),magicbladeFill:document.getElementById('partyMagicbladeFill'),magicbladeText:document.getElementById('partyMagicbladeText'),ninjaFill:document.getElementById('partyNinjaFill'),ninjaText:document.getElementById('partyNinjaText'),highpriestFill:document.getElementById('partyHighpriestFill'),highpriestText:document.getElementById('partyHighpriestText'),runemageFill:document.getElementById('partyRunemageFill'),runemageText:document.getElementById('partyRunemageText'),archmageFill:document.getElementById('partyArchmageFill'),archmageText:document.getElementById('partyArchmageText'),qigongFill:document.getElementById('partyQigongFill'),qigongText:document.getElementById('partyQigongText'),dragonknightFill:document.getElementById('partyDragonknightFill'),dragonknightText:document.getElementById('partyDragonknightText'),draculaFill:document.getElementById('partyDraculaFill'),draculaText:document.getElementById('partyDraculaText'),mimicFill:document.getElementById('partyMimicFill'),mimicText:document.getElementById('partyMimicText'),bushinFill:document.getElementById('partyBushinFill'),bushinText:document.getElementById('partyBushinText'),foxFill:document.getElementById('partyFoxFill'),foxText:document.getElementById('partyFoxText')}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d}},rnd=(a,b)=>a+Math.random()*(b-a);
function clampArena(o){
 const r=o.r||24,s=Math.SQRT2*r;
 o.x=clamp(o.x,70+r,930-r);o.y=clamp(o.y,120+r,930-r);
 let v=370+s-(o.x+o.y);if(v>0){o.x+=v*.5;o.y+=v*.5}
 v=(o.x-o.y)-(630-s);if(v>0){o.x-=v*.5;o.y+=v*.5}
 v=(o.y-o.x)-(680-s);if(v>0){o.x+=v*.5;o.y-=v*.5}
 v=(o.x+o.y)-(1680-s);if(v>0){o.x-=v*.5;o.y-=v*.5}
 o.x=clamp(o.x,70+r,930-r);o.y=clamp(o.y,120+r,930-r)
}
function notice(t,c='#fff',ms=950){ui.notice.textContent=t;ui.notice.style.color=c;ui.notice.style.opacity=1;clearTimeout(notice.t);notice.t=setTimeout(()=>ui.notice.style.opacity=0,ms)}
function burst(x,y,c,n=15,s=220){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=rnd(30,s);particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rnd(.25,.7),max:.7,r:rnd(2,7),c})}}
function fistAfterimage(x,y,dx,dy,scale=1,finisher=false,sharp=false){fistTrails.push({x,y,dx,dy,scale,finisher,sharp,life:sharp?.22:(finisher?.34:.26),max:sharp?.22:(finisher?.34:.26)})}
const heroInfo={knight:{name:'ナイト',hp:540,speed:188,ability:'A：剣・大ダメージ　B：円形バリア　C：自己回復・中'},mage:{name:'魔法使い',hp:340,speed:175,ability:'A：2方向ファイアボール　B：2方向フリーズ　C：小竜巻'},healer:{name:'ヒーラー',hp:390,speed:188,ability:'A：誘導ライトボール　B：範囲回復・中　C：反射壁'},monk:{name:'モンク',hp:650,speed:196,ability:'A：連続パンチ　B：気功弾　C：気合い（弾消去・吹き飛ばし・攻撃＆自然回復アップ）'},magicblade:{name:'魔剣士',hp:470,speed:192,ability:'A：魔力斬り（弾消去・吸収）　B：三日月の魔剣波（弾消去・吸収）　C：回転斬り（吸収）　1人D：魔人化'},ninja:{name:'忍者',hp:400,speed:246,ability:'A：自動追尾手裏剣3連発　B：瞬身斬　C：煙玉・反対位置へ瞬移　1人D：分身'},highpriest:{name:'ハイプリースト',hp:410,speed:184,ability:'A：十字の中回復　B：範囲リジェネ　C：広範囲大回復　1人D：神威降臨'},runemage:{name:'ルーンメイジ',hp:420,speed:202,ability:'A：炎ルーン×3　B：氷ルーン×4　C：雷ルーン×5　1人D：ルーンオーバーロード'},archmage:{name:'アークメイジ',hp:390,speed:210,ability:'A：3方向ファイアボール・大　B：5方向フリーズ・中　C：ライフドレインストーム　1人D：タイムストップ（5秒）'},qigong:{name:'気功師',hp:460,speed:190,ability:'A：規則拡散気功弾　B：気功壁（敵・敵弾を遮断）　C：爆芯掌（上限なし・中心ほど高威力）　1人D：気脈解放'},dragonknight:{name:'竜騎士',hp:560,speed:205,ability:'A：ボスへ自動照準ドラゴンスラスト　B：短押し突進／長押し強化ドラゴンチャージ　C：広範囲ドラゴンスイープ　1人D：三竜の息吹'},dracula:{name:'ドラキュラ',hp:430,speed:198,ability:'A：押しっぱなしブラッドレーザー（吸血）　B：追尾コウモリ×3　C：コウモリ変化（8秒無敵・移動速度120%・攻撃可）　1人D：眷属支配'},fox:{name:'白狐忍',hp:360,speed:266,ability:'A：白青手裏剣・3方向同時（短CT）　B：氷柱（小ダメージ・足止め・弾を45度上へ反射）　C：瞬歩（方向入力／無入力は後方・ほぼCTなし）　D：狐火九星（無敵・螺旋9発・特大ダメージ）'},mimic:{name:'模倣術師',hp:450,speed:205,ability:'A/B：ボス別に仲間の模倣可能技を自由設定（ソロ：巨棍撃／竜散弾）　C：獣化・双牙突進　1人D：模倣暴走（仮）'},bushin:{name:'武神',hp:520,speed:225,ability:'A：神速拳　B：天翔急降下蹴り　C：無心の構え（近接反撃）　1人D：神速飛び蹴り（最大HP95%）'}};
const skillErrorKeys=new Set();
function reportSkillError(hero,skill,err){
 const name=heroInfo[hero?.type]?.name||hero?.type||'不明';
 const key=`${hero?.type||'unknown'}:${skill}:${err?.message||err}`;
 console.error(`[Skill Error] ${name} ${skill}`,err);
 if(!skillErrorKeys.has(key)){skillErrorKeys.add(key);notice(`${name}の${skill}でエラー：その技だけ停止しました`,'#ff8fa3',1800)}
}
function validateHeroSkills(hero){
 const common=['a','b','c','soloSkill'];
 const extra={runemage:['placeRune'],dragonknight:['dragonThrust','dragonCharge','dragonSweep'],qigong:['fireQigongA','fireQigongC','deployQigongWall'],dracula:['bloodLaser','summonBats'],mimic:['mimicCopy','mimicSoloA','mimicSoloB','beastDoubleDash','beastDashSegment']}[hero.type]||[];
 for(const name of [...common,...extra])if(typeof hero[name]!=='function')reportSkillError(hero,name,new Error(`${name} is not a function`));
}
