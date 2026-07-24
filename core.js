'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),W=1000,H=1000;
const keys=new Set(),pressed=new Set(),released=new Set();let running=false,last=0,heroIndex=0,bossIndex=0,transition=0,shake=0,joy={x:0,y:0,id:null};let selectedTypes=['knight','mage','healer'],selectedStartType='knight',awakenedMode=false,partyDeaths=0,awakeningSoloCarry=null;
let mimicBattleBuild=null;
const AWAKEN_UNLOCK_KEY='jabrAwakeningUnlockedV1',MONK_UNLOCK_KEY='jabrMonkUnlockedV1',HIGHPRIEST_UNLOCK_KEY='jabrHighPriestUnlockedV2',MAGICBLADE_UNLOCK_KEY='jabrMagicbladeUnlockedV1',RUNEMAGE_UNLOCK_KEY='jabrRunemageUnlockedV1',QIGONG_UNLOCK_KEY='jabrQigongUnlockedV1',NINJA_UNLOCK_KEY='jabrNinjaUnlockedV1',DRAGONKNIGHT_UNLOCK_KEY='jabrDragonKnightUnlockedV1',DRACULA_UNLOCK_KEY='jabrPlayableDraculaUnlockedV1',MIMIC_UNLOCK_KEY='jabrMimicUnlockedV1';
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

function enemyDamage(n){return awakenedMode?n*1.25:n}
function resetCombatInput(){keys.clear();pressed.clear();released.clear();joy.x=0;joy.y=0;joy.id=null;const stick=document.getElementById('stick');if(stick)stick.style.transform='translate(0,0)';document.querySelectorAll('.tb.active').forEach(b=>b.classList.remove('active'))}
const shots=[],particles=[],walls=[],slashes=[],fistTrails=[],minions=[],lasers=[],bloodBeams=[],holyFx=[],holyDots=[],runes=[];
const AWAKEN_MINION_LIMIT=28,AWAKEN_SUMMON_MULTIPLIER=4;
const spriteFiles={
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
const ui={stageNo:document.getElementById('stageNo'),bossName:document.getElementById('bossName'),bossFill:document.getElementById('bossFill'),heroName:document.getElementById('heroName'),ability:document.getElementById('ability'),hpFill:document.getElementById('hpFill'),hpText:document.getElementById('hpText'),notice:document.getElementById('notice'),start:document.getElementById('start'),party:{knightFill:document.getElementById('partyKnightFill'),knightText:document.getElementById('partyKnightText'),mageFill:document.getElementById('partyMageFill'),mageText:document.getElementById('partyMageText'),healerFill:document.getElementById('partyHealerFill'),healerText:document.getElementById('partyHealerText'),monkFill:document.getElementById('partyMonkFill'),monkText:document.getElementById('partyMonkText'),magicbladeFill:document.getElementById('partyMagicbladeFill'),magicbladeText:document.getElementById('partyMagicbladeText'),ninjaFill:document.getElementById('partyNinjaFill'),ninjaText:document.getElementById('partyNinjaText'),highpriestFill:document.getElementById('partyHighpriestFill'),highpriestText:document.getElementById('partyHighpriestText'),runemageFill:document.getElementById('partyRunemageFill'),runemageText:document.getElementById('partyRunemageText'),qigongFill:document.getElementById('partyQigongFill'),qigongText:document.getElementById('partyQigongText'),dragonknightFill:document.getElementById('partyDragonknightFill'),dragonknightText:document.getElementById('partyDragonknightText'),draculaFill:document.getElementById('partyDraculaFill'),draculaText:document.getElementById('partyDraculaText'),mimicFill:document.getElementById('partyMimicFill'),mimicText:document.getElementById('partyMimicText')}};
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
function fistAfterimage(x,y,dx,dy,scale=1,finisher=false){fistTrails.push({x,y,dx,dy,scale,finisher,life:finisher?.34:.26,max:finisher?.34:.26})}
const heroInfo={knight:{name:'ナイト',hp:540,speed:188,ability:'A：剣・大ダメージ　B：円形バリア　C：自己回復・中'},mage:{name:'魔法使い',hp:340,speed:175,ability:'A：2方向ファイアボール　B：2方向フリーズ　C：小竜巻'},healer:{name:'ヒーラー',hp:390,speed:188,ability:'A：誘導ライトボール　B：範囲回復・中　C：反射壁'},monk:{name:'モンク',hp:650,speed:196,ability:'A：連続パンチ　B：気功弾　C：気合い（弾消去・吹き飛ばし・攻撃＆自然回復アップ）'},magicblade:{name:'魔剣士',hp:470,speed:192,ability:'A：魔力斬り（弾消去・吸収）　B：三日月の魔剣波（弾消去・吸収）　C：回転斬り（吸収）　1人D：魔人化'},ninja:{name:'忍者',hp:400,speed:246,ability:'A：自動追尾手裏剣3連発　B：瞬身斬　C：煙玉・反対位置へ瞬移　1人D：分身'},highpriest:{name:'ハイプリースト',hp:410,speed:184,ability:'A：十字の中回復　B：範囲リジェネ　C：広範囲大回復　1人D：神威降臨'},runemage:{name:'ルーンメイジ',hp:420,speed:202,ability:'A：炎ルーン×3　B：氷ルーン×4　C：雷ルーン×5　1人D：ルーンオーバーロード'},qigong:{name:'気功師',hp:460,speed:190,ability:'A：規則拡散気功弾　B：気功壁（敵・敵弾を遮断）　C：爆芯掌（上限なし・中心ほど高威力）　1人D：気脈解放'},dragonknight:{name:'竜騎士',hp:560,speed:205,ability:'A：ボスへ自動照準ドラゴンスラスト　B：短押し突進／長押し強化ドラゴンチャージ　C：広範囲ドラゴンスイープ　1人D：三竜の息吹'},dracula:{name:'ドラキュラ',hp:430,speed:198,ability:'A：押しっぱなしブラッドレーザー（吸血）　B：追尾コウモリ×3　C：コウモリ変化（8秒無敵・移動速度120%・攻撃可）　1人D：眷属支配'},mimic:{name:'模倣術師',hp:450,speed:205,ability:'A/B：ボス別に仲間の模倣可能技を自由設定（ソロ：巨棍撃／竜散弾）　C：獣気解放（仮）　1人D：模倣暴走（仮）'}};
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
