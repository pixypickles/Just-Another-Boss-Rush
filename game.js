(()=>{'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),W=1000,H=1000;
const keys=new Set(),pressed=new Set(),released=new Set();let running=false,last=0,heroIndex=0,bossIndex=0,transition=0,shake=0,joy={x:0,y:0,id:null};let selectedTypes=['knight','mage','healer'],selectedStartType='knight',awakenedMode=false,partyDeaths=0,awakeningSoloCarry=null;
const AWAKEN_UNLOCK_KEY='jabrAwakeningUnlockedV1',MONK_UNLOCK_KEY='jabrMonkUnlockedV1',HIGHPRIEST_UNLOCK_KEY='jabrHighPriestUnlockedV1',DRAGONKNIGHT_UNLOCK_KEY='jabrDragonKnightUnlockedV1',DRACULA_UNLOCK_KEY='jabrPlayableDraculaUnlockedV1';
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
function enemyDamage(n){return awakenedMode?n*1.25:n}
function resetCombatInput(){keys.clear();pressed.clear();released.clear();joy.x=0;joy.y=0;joy.id=null;const stick=document.getElementById('stick');if(stick)stick.style.transform='translate(0,0)';document.querySelectorAll('.tb.active').forEach(b=>b.classList.remove('active'))}
const shots=[],particles=[],walls=[],slashes=[],fistTrails=[],minions=[],lasers=[],bloodBeams=[],holyFx=[],holyDots=[],runes=[];
const AWAKEN_MINION_LIMIT=28,AWAKEN_SUMMON_MULTIPLIER=4;
const spriteFiles={
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
const ui={stageNo:document.getElementById('stageNo'),bossName:document.getElementById('bossName'),bossFill:document.getElementById('bossFill'),heroName:document.getElementById('heroName'),ability:document.getElementById('ability'),hpFill:document.getElementById('hpFill'),hpText:document.getElementById('hpText'),notice:document.getElementById('notice'),start:document.getElementById('start'),party:{knightFill:document.getElementById('partyKnightFill'),knightText:document.getElementById('partyKnightText'),mageFill:document.getElementById('partyMageFill'),mageText:document.getElementById('partyMageText'),healerFill:document.getElementById('partyHealerFill'),healerText:document.getElementById('partyHealerText'),monkFill:document.getElementById('partyMonkFill'),monkText:document.getElementById('partyMonkText'),magicbladeFill:document.getElementById('partyMagicbladeFill'),magicbladeText:document.getElementById('partyMagicbladeText'),ninjaFill:document.getElementById('partyNinjaFill'),ninjaText:document.getElementById('partyNinjaText'),highpriestFill:document.getElementById('partyHighpriestFill'),highpriestText:document.getElementById('partyHighpriestText'),runemageFill:document.getElementById('partyRunemageFill'),runemageText:document.getElementById('partyRunemageText'),qigongFill:document.getElementById('partyQigongFill'),qigongText:document.getElementById('partyQigongText'),dragonknightFill:document.getElementById('partyDragonknightFill'),dragonknightText:document.getElementById('partyDragonknightText'),draculaFill:document.getElementById('partyDraculaFill'),draculaText:document.getElementById('partyDraculaText')}};
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
const heroInfo={knight:{name:'ナイト',hp:540,speed:188,ability:'A：剣・大ダメージ　B：円形バリア　C：自己回復・中'},mage:{name:'魔法使い',hp:340,speed:175,ability:'A：2方向ファイアボール　B：2方向フリーズ　C：小竜巻'},healer:{name:'ヒーラー',hp:390,speed:188,ability:'A：誘導ライトボール　B：範囲回復・中　C：反射壁'},monk:{name:'モンク',hp:650,speed:196,ability:'A：連続パンチ　B：気功弾　C：気合い（弾消去・吹き飛ばし・攻撃＆自然回復アップ）'},magicblade:{name:'魔剣士',hp:470,speed:192,ability:'A：魔力斬り（弾消去・吸収）　B：三日月の魔剣波（弾消去・吸収）　C：回転斬り（吸収）　1人D：魔人化'},ninja:{name:'忍者',hp:400,speed:246,ability:'A：自動追尾手裏剣3連発　B：瞬身斬　C：煙玉・反対位置へ瞬移　1人D：分身'},highpriest:{name:'ハイプリースト',hp:410,speed:184,ability:'A：十字の中回復　B：範囲リジェネ　C：広範囲大回復　1人D：神威降臨'},runemage:{name:'ルーンメイジ',hp:420,speed:202,ability:'A：炎ルーン×3　B：氷ルーン×4　C：雷ルーン×5　1人D：ルーンオーバーロード'},qigong:{name:'気功師',hp:460,speed:190,ability:'A：規則拡散気功弾　B：気功壁（敵・敵弾を遮断）　C：爆芯掌（上限なし・中心ほど高威力）　1人D：気脈解放'},dragonknight:{name:'竜騎士',hp:560,speed:205,ability:'A：ボスへ自動照準ドラゴンスラスト　B：短押し突進／長押し強化ドラゴンチャージ　C：広範囲ドラゴンスイープ　1人D：三竜の息吹'},dracula:{name:'ドラキュラ',hp:430,speed:198,ability:'A：押しっぱなしブラッドレーザー（吸血）　B：追尾コウモリ×3　C：コウモリ変化（8秒無敵・移動速度120%・攻撃可）　1人D：眷属支配'}};
class Hero{
 constructor(type,x,y){const i=heroInfo[type];Object.assign(this,{type,x,y,vx:0,vy:0,r:24,hp:i.hp,maxHp:i.hp,cdA:0,cdB:0,cdC:0,inv:0,guard:0,tornado:0,drainFx:0,dead:false,facing:{x:1,y:0},attackAnim:0,attackSide:1,soloCd:0,spiritFx:0,healFx:0,powerUp:0,demonMode:0,cloneTime:0,smokeTime:0,hidden:false,divineMode:0,runeOverload:0,regenTime:0,regenRate:0,chargeA:0,chargeB:0,chargeC:0,qigongFocus:0,qigongALock:0,qigongBLock:0,dragonBreath:0,breathTick:0,dragonChargeFx:0,batForm:0,bloodLaserTime:0,dominationTime:0})}
 heal(n){if(this.dead)return;this.hp=Math.min(this.maxHp,this.hp+n);burst(this.x,this.y,'#7dffad',10,120)}
 hurt(n,kx=0,ky=0){if(this.dead||this.inv>0||this.batForm>0)return;if(this.guard>0)n*=.1;if(this.type==='qigong'&&(this.chargeA>0||this.chargeC>0))n*=2;this.hp-=n;this.vx+=kx;this.vy+=ky;this.inv=.3;shake=9;burst(this.x,this.y,'#ff6571',15,220);if(this.hp<=0){this.hp=0;this.dead=true;partyDeaths++;notice(heroInfo[this.type].name+'が倒れた！','#ff8c97')}}
 update(dt,i){this.cdA=Math.max(0,this.cdA-dt);this.cdB=Math.max(0,this.cdB-dt);this.cdC=Math.max(0,this.cdC-dt);this.inv=Math.max(0,this.inv-dt);this.guard=Math.max(0,this.guard-dt);this.tornado=Math.max(0,this.tornado-dt);this.drainFx=Math.max(0,this.drainFx-dt);this.spiritFx=Math.max(0,this.spiritFx-dt);this.healFx=Math.max(0,this.healFx-dt);this.powerUp=Math.max(0,this.powerUp-dt);this.demonMode=Math.max(0,this.demonMode-dt);this.cloneTime=Math.max(0,this.cloneTime-dt);this.divineMode=Math.max(0,this.divineMode-dt);this.runeOverload=Math.max(0,this.runeOverload-dt);this.qigongFocus=Math.max(0,this.qigongFocus-dt);this.qigongALock=Math.max(0,this.qigongALock-dt);this.qigongBLock=Math.max(0,this.qigongBLock-dt);this.dragonBreath=Math.max(0,this.dragonBreath-dt);this.breathTick=Math.max(0,this.breathTick-dt);this.dragonChargeFx=Math.max(0,this.dragonChargeFx-dt);this.batForm=Math.max(0,this.batForm-dt);this.dominationTime=Math.max(0,this.dominationTime-dt);if(this.regenTime>0){this.regenTime=Math.max(0,this.regenTime-dt);this.hp=Math.min(this.maxHp,this.hp+this.regenRate*dt)}this.smokeTime=Math.max(0,this.smokeTime-dt);this.attackAnim=Math.max(0,this.attackAnim-dt);this.soloCd=Math.max(0,this.soloCd-dt);if(awakenedMode){this.cdA=0;if(this.type!=='dracula')this.cdC=0;this.soloCd=0;if(this.type!=='qigong')this.cdB=0}if(this.dead)return;if(this.type==='knight'&&this.guard>0)this.hp=Math.min(this.maxHp,this.hp+8*dt);if(this.type==='monk')this.hp=Math.min(this.maxHp,this.hp+(this.powerUp>0?14:4.5)*dt);
  if(this.type==='dragonknight'&&this.dragonBreath>0&&this.breathTick<=0){this.breathTick=.14;const aim=boss&&!boss.dead?norm(boss.x-this.x,boss.y-this.y):this.facing;this.facing=aim;const flip=aim.x<0?1:-1,origins=[{x:this.x-flip*31,y:this.y-49,off:-.18},{x:this.x-flip*3,y:this.y-36,off:0},{x:this.x+flip*31,y:this.y-49,off:.18}];const base=Math.atan2(aim.y,aim.x);origins.forEach(o=>{const a=base+o.off;shots.push({team:'hero',type:'dragonfire',owner:this,x:o.x,y:o.y,vx:Math.cos(a)*520,vy:Math.sin(a)*520,r:18,life:.72,damage:16,bulletCut:true,pierce:2});burst(o.x,o.y,'#ff7a38',5,100)});}
  let mx=0,my=0;
  if(i===heroIndex){mx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joy.x;my=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+joy.y;if(this.type==='dracula'){if(keys.has('KeyJ'))this.bloodLaser(dt);else this.bloodLaserTime=0;if(pressed.has('KeyK')){pressed.delete('KeyK');this.b()}if(pressed.has('KeyL')){pressed.delete('KeyL');this.c()}}else if(this.type==='qigong'){const rate=this.qigongFocus>0?10:1;if(pressed.has('KeyJ')){pressed.delete('KeyJ');if(this.qigongFocus>0&&this.qigongALock<=0){this.qigongALock=.34;this.fireQigongA(4)}}if(pressed.has('KeyK')){pressed.delete('KeyK');this.deployQigongWall()}if(keys.has('KeyJ')&&this.qigongFocus<=0)this.chargeA=Math.min(4,this.chargeA+dt);if(keys.has('KeyL'))this.chargeC+=dt*rate;if(released.has('KeyJ')&&this.chargeA>0){this.fireQigongA(this.chargeA);this.chargeA=0}if(released.has('KeyL')&&this.chargeC>0){this.fireQigongC(this.chargeC);this.chargeC=0}}else if(this.type==='dragonknight'){if(pressed.has('KeyJ')){pressed.delete('KeyJ');this.a()}if(pressed.has('KeyK')){pressed.delete('KeyK');if(this.cdB<=0)this.chargeB=.001}if(keys.has('KeyK')&&this.chargeB>0&&this.cdB<=0)this.chargeB=Math.min(2,this.chargeB+dt);if(released.has('KeyK')&&this.chargeB>0){const charge=this.chargeB;this.chargeB=0;this.dragonCharge(charge)}if(pressed.has('KeyL')){pressed.delete('KeyL');this.c()}}else{if(pressed.has('KeyJ')){pressed.delete('KeyJ');this.a()}if(pressed.has('KeyK')){pressed.delete('KeyK');this.b()}if(pressed.has('KeyL')){pressed.delete('KeyL');this.c()}if(this.type==='dracula'&&this.batForm>0){ctx.save();ctx.translate(this.x,this.y-10);ctx.fillStyle='#321126';ctx.strokeStyle='#d34d7b';ctx.shadowBlur=14;ctx.shadowColor='#a51e52';for(let k=0;k<7;k++){const a=performance.now()/330+k*Math.PI*2/7,rr=38+(k%2)*16,bx=Math.cos(a)*rr,by=Math.sin(a)*rr*.62;ctx.save();ctx.translate(bx,by);ctx.rotate(a+.7);ctx.globalAlpha=.72;ctx.beginPath();ctx.moveTo(-12,0);ctx.quadraticCurveTo(-5,-9,0,-2);ctx.quadraticCurveTo(5,-9,12,0);ctx.quadraticCurveTo(5,5,0,2);ctx.quadraticCurveTo(-5,5,-12,0);ctx.fill();ctx.restore()}ctx.restore()}
  if(this.type==='runemage'&&this.runeOverload>0){if(keys.has('KeyJ')&&this.cdA<=0)this.a();if(keys.has('KeyK')&&this.cdB<=0)this.b();if(keys.has('KeyL')&&this.cdC<=0)this.c()}}}
  else{const d=Math.hypot(boss.x-this.x,boss.y-this.y),n=norm(boss.x-this.x,boss.y-this.y);if(this.type==='knight'){mx=n.x;my=n.y;if(d<105&&this.cdA<=0)this.a();if(this.cdB<=0)this.b();if(this.hp<this.maxHp*.33&&this.cdC<=0)this.c()}else if(this.type==='mage'){if(d<360){mx=-n.x;my=-n.y}else if(d>470){mx=n.x;my=n.y}else{mx=-n.y*.34;my=n.x*.34}if(this.cdA<=0)this.a();if(this.cdB<=0&&Math.random()<.028)this.b();if((d<155||boss.volley>0)&&this.cdC<=0)this.c()}else if(this.type==='monk'){mx=n.x;my=n.y;if(d<105&&this.cdA<=0)this.a();if(d>=105&&this.cdB<=0)this.b();if((d<125||boss.volley>0)&&this.cdC<=0)this.c()}else if(this.type==='magicblade'){if(d>135){mx=n.x;my=n.y}else{mx=-n.y*.28;my=n.x*.28}if(d<145&&this.cdA<=0)this.a();if(d>=120&&this.cdB<=0)this.b();if((this.hp<this.maxHp*.65||boss.volley>0)&&this.cdC<=0)this.c()}else if(this.type==='ninja'){if(d>260){mx=n.x;my=n.y}else{mx=-n.y*.55;my=n.x*.55}if(this.cdA<=0)this.a();if(d>170&&this.cdB<=0&&Math.random()<.035)this.b();if((boss.volley>0||d<115)&&this.cdC<=0)this.c()}else if(this.type==='runemage'){if(d<260){mx=-n.x*.55;my=-n.y*.55}else if(d>470){mx=n.x*.35;my=n.y*.35}else{mx=-n.y*.42;my=n.x*.42}if(this.cdA<=0)this.a();if(this.cdB<=0&&Math.random()<.045)this.b();if(this.cdC<=0&&Math.random()<.085)this.c()}else if(this.type==='dracula'){if(d<330){mx=-n.x*.4;my=-n.y*.4}else if(d>520){mx=n.x*.35;my=n.y*.35}else{mx=-n.y*.36;my=n.x*.36}this.bloodLaser(dt);if(this.cdB<=0&&Math.random()<.025)this.b();if((boss.volley>0||d<150)&&this.cdC<=0)this.c()}else if(this.type==='dragonknight'){if(d>235){mx=n.x;my=n.y}else{mx=-n.y*.25;my=n.x*.25}if(d<340&&this.cdA<=0)this.a();if(d>180&&this.cdB<=0&&Math.random()<.025)this.b();if((minions.length>2||d<155)&&this.cdC<=0)this.c()}else if(this.type==='qigong'){if(d<280){mx=-n.x*.45;my=-n.y*.45}else if(d>500){mx=n.x*.35;my=n.y*.35}else{mx=-n.y*.3;my=n.x*.3}if(this.cdA<=0)this.fireQigongA(3.1);if(this.cdB<=0&&(boss.volley>0||d<210))this.deployQigongWall()}else if(this.type==='highpriest'){const low=heroes.filter(h=>!h.dead).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(low&&low.hp/low.maxHp<.7){mx=low.x-this.x;my=low.y-this.y;if(this.cdA<=0)this.a();if(this.cdB<=0)this.b();if(low.hp/low.maxHp<.38&&this.cdC<=0)this.c()}else{if(d<430){mx=-n.x*.55;my=-n.y*.55}else{mx=n.x*.25;my=n.y*.25}}}else{const low=heroes.filter(h=>!h.dead).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(low&&low.hp/low.maxHp<.82){mx=low.x-this.x;my=low.y-this.y;if(Math.hypot(mx,my)<245&&this.cdB<=0)this.b()}else{if(d<390){mx=-n.x*.7;my=-n.y*.7}else if(d>520){mx=n.x*.55;my=n.y*.55}else{mx=-n.y*.22;my=n.x*.22}if(this.cdA<=0)this.a();if(this.cdC<=0&&boss.volley>0)this.c()}}}
  const has=Math.abs(mx)+Math.abs(my)>.05,n=norm(mx,my),sp=heroInfo[this.type].speed*(this.type==='dracula'&&this.batForm>0?1.2:1);this.vx+=(has?n.x*sp-this.vx:-this.vx)*Math.min(1,dt*13);this.vy+=(has?n.y*sp-this.vy:-this.vy)*Math.min(1,dt*13);if(has)this.facing=n;this.x+=this.vx*dt;this.y+=this.vy*dt;clampArena(this);
  if(this.tornado>0){
   if(!boss.dead&&Math.hypot(this.x-boss.x,this.y-boss.y)<95+boss.r){boss.hurt(12*dt);boss.vx+=(boss.x-this.x)*dt*.7;boss.vy+=(boss.y-this.y)*dt*.7}
   for(const m of minions)if(Math.hypot(this.x-m.x,this.y-m.y)<95+m.r){m.hp-=30*dt;const push=norm(m.x-this.x,m.y-this.y);m.vx+=push.x*180*dt;m.vy+=push.y*180*dt}
  }
 }
  qigongHandPoint(){const flip=boss&&!boss.dead?boss.x<this.x:this.facing.x<0;return{x:this.x+(flip?19:-19),y:this.y-35}}
  qigongBurstPoint(){const aim=boss&&!boss.dead?norm(boss.x-this.x,boss.y-this.y):this.facing,hand=this.qigongHandPoint();return{x:hand.x+aim.x*86,y:hand.y+aim.y*86,aim}}
  fireQigongA(charge){if(this.cdA>0)return;const t=clamp(charge/4,0,1),aim=boss&&!boss.dead?norm(boss.x-this.x,boss.y-this.y):this.facing,base=Math.atan2(aim.y,aim.x),count=3+2*Math.floor(t*3),rows=1+Math.floor(t*2),spread=.18+.42*t,hand=this.qigongHandPoint(),pellets=count*rows,totalDamage=150+210*t,shotDamage=totalDamage/pellets;this.facing=aim;this.cdA=.75;for(let row=0;row<rows;row++)for(let k=0;k<count;k++){const u=count===1?0:k/(count-1)-.5,a=base+u*spread,dir={x:Math.cos(a),y:Math.sin(a)},back=row*8;shots.push({team:'hero',type:'qigong',owner:this,x:hand.x-dir.x*back,y:hand.y-dir.y*back,vx:dir.x*(610+row*28),vy:dir.y*(610+row*28),r:9+4*t,life:2,damage:shotDamage,bulletCut:true})}burst(hand.x,hand.y,'#ffd36d',22+18*t,260);notice('拡散気功弾！','#ffe29c',500)}
  deployQigongWall(){if(this.cdB>0)return;const focused=this.qigongFocus>0,life=focused?5:4;this.cdB=focused?5:8;for(let i=walls.length-1;i>=0;i--)if(walls[i].type==='qigong'&&walls[i].owner===this)walls.splice(i,1);walls.push({type:'qigong',owner:this,x:this.x,y:this.y,r:142,life,maxLife:life,hits:30,maxHits:30});burst(this.x,this.y,'#8defff',34,290);notice(`気功壁！ ${life}秒／耐久30`,'#baf5ff',700)}
  fireQigongC(charge){const p=this.qigongBurstPoint(),aim=p.aim,cx=p.x,cy=p.y,scale=Math.max(.04,charge/30),radius=95+Math.min(260,charge*5.5),ring=d=>d<=radius*.2?1:d<=radius*.4?.8:d<=radius*.6?.6:d<=radius*.8?.4:.2,base=80+(boss&&!boss.dead?boss.maxHp*1.08:2200)*scale*scale;this.facing=aim;this.cdC=.9;for(let i=shots.length-1;i>=0;i--){const q=shots[i];if(q.team==='boss'&&Math.hypot(q.x-cx,q.y-cy)<radius+q.r){burst(q.x,q.y,'#fff0a8',7,120);shots.splice(i,1)}}if(!boss.dead){const d=Math.hypot(boss.x-cx,boss.y-cy);if(d<radius+boss.r){boss.hurt(base*ring(Math.max(0,d-boss.r)));shake=22}}for(const m of minions){const d=Math.hypot(m.x-cx,m.y-cy);if(d<radius+m.r)m.hp-=Math.min(2500,base*ring(Math.max(0,d-m.r)))}holyFx.push({x:cx,y:cy,type:'circle',r:radius,life:.75,max:.75,big:true});burst(cx,cy,'#fff0a0',60,620);notice(`爆芯掌！ ${charge.toFixed(1)}秒チャージ`,'#fff1a6',900)}
 bloodLaser(dt){if(!boss||boss.dead)return;const aim=norm(boss.x-this.x,boss.y-this.y),sx=this.x+aim.x*28,sy=this.y-24+aim.y*28,maxRange=760;this.facing=aim;this.bloodLaserTime=Math.min(5,this.bloodLaserTime+dt);const width=2.2+Math.min(2.8,this.bloodLaserTime*.55),ex=sx+aim.x*maxRange,ey=sy+aim.y*maxRange,vx=ex-sx,vy=ey-sy,len2=vx*vx+vy*vy,t=clamp(((boss.x-sx)*vx+(boss.y-sy)*vy)/len2,0,1),px=sx+vx*t,py=sy+vy*t,hit=Math.hypot(boss.x-px,boss.y-py)<boss.r+width;bloodBeams.push({x:sx,y:sy,dx:aim.x,dy:aim.y,width,hit});if(hit){const dmg=31*dt;boss.hurt(dmg);this.heal(dmg*.24)}}
 summonBats(count=3,x=this.x,y=this.y,damage=32){if(!boss||boss.dead)return;for(let k=0;k<count;k++){const a=(k-(count-1)/2)*.34+Math.atan2(boss.y-y,boss.x-x),sp=310+k*18;shots.push({team:'hero',type:'bat',owner:this,x:x+Math.cos(a)*22,y:y+Math.sin(a)*22,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:13,life:3.2,damage,homing:true,pierce:0});burst(x,y,'#9b264b',5,100)}}
 dragonAim(){if(boss&&!boss.dead)return norm(boss.x-this.x,boss.y-this.y);return norm(this.facing.x||1,this.facing.y||0)}
 dragonThrust(){const aim=this.dragonAim(),range=285,width=38,startX=this.x,startY=this.y-12,endX=startX+aim.x*range,endY=startY+aim.y*range,angle=Math.atan2(aim.y,aim.x);this.facing=aim;this.attackAnim=.30;this.attackSide=aim.x<0?-1:1;slashes.push({x:(startX+endX)/2,y:(startY+endY)/2,side:1,angle,life:.24,max:.24,dragonThrust:true,length:range});const hit=(x,y,r)=>{const vx=endX-startX,vy=endY-startY,len2=vx*vx+vy*vy,t=clamp(((x-startX)*vx+(y-startY)*vy)/len2,0,1),px=startX+vx*t,py=startY+vy*t;return Math.hypot(x-px,y-py)<width+r};for(let i=shots.length-1;i>=0;i--){const q=shots[i];if(q.team==='boss'&&hit(q.x,q.y,q.r)){burst(q.x,q.y,'#ffb06d',7,130);shots.splice(i,1)}}for(const m of minions)if(hit(m.x,m.y,m.r)){m.hp-=125;m.vx+=aim.x*300;m.vy+=aim.y*300}if(!boss.dead&&hit(boss.x,boss.y,boss.r)){boss.hurt(108);boss.vx+=aim.x*230;boss.vy+=aim.y*230;shake=13}burst(endX,endY,'#ffcf91',26,330);notice('ドラゴンスラスト！','#ffd09a',500)}
 dragonCharge(charge=0){if(this.cdB>0)return;const t=clamp(charge/2,0,1),aim=this.dragonAim(),startX=this.x,startY=this.y,dist=410,endX=this.x+aim.x*dist,endY=this.y+aim.y*dist,width=52+28*t,damage=112*(1+2*t),minionDamage=135*(1+2*t),push=390+310*t;this.cdB=3.0;this.facing=aim;this.inv=.58;this.dragonChargeFx=.42+.24*t;for(let i=shots.length-1;i>=0;i--){const q=shots[i];if(q.team!=='boss')continue;const vx=endX-startX,vy=endY-startY,len2=vx*vx+vy*vy,u=clamp(((q.x-startX)*vx+(q.y-startY)*vy)/len2,0,1),px=startX+vx*u,py=startY+vy*u;if(Math.hypot(q.x-px,q.y-py)<width+q.r){burst(q.x,q.y,'#ff8c45',8+Math.floor(t*5),150);shots.splice(i,1)}}for(const m of minions){const vx=endX-startX,vy=endY-startY,len2=vx*vx+vy*vy,u=clamp(((m.x-startX)*vx+(m.y-startY)*vy)/len2,0,1),px=startX+vx*u,py=startY+vy*u;if(Math.hypot(m.x-px,m.y-py)<width+6+m.r){m.hp-=minionDamage;m.vx+=aim.x*(500+300*t);m.vy+=aim.y*(500+300*t)}}if(!boss.dead){const vx=endX-startX,vy=endY-startY,len2=vx*vx+vy*vy,u=clamp(((boss.x-startX)*vx+(boss.y-startY)*vy)/len2,0,1),px=startX+vx*u,py=startY+vy*u;if(Math.hypot(boss.x-px,boss.y-py)<width+8+boss.r){boss.hurt(damage);boss.vx+=aim.x*push;boss.vy+=aim.y*push;shake=15+Math.floor(t*8)}}this.x=endX;this.y=endY;clampArena(this);this.vx=aim.x*520;this.vy=aim.y*520;burst(startX,startY,t>=.99?'#ffdf85':'#ff6d36',24+Math.floor(t*22),300+180*t);burst(this.x,this.y,'#ffc26d',34+Math.floor(t*24),420+220*t);notice(t>=.99?'最大・ドラゴンチャージ！':t>.15?`ドラゴンチャージ！ ${(charge).toFixed(1)}秒`:'ドラゴンチャージ！','#ffb36b',650)}
 placeRune(kind,limit){
  const enhanced=this.runeOverload>0;
  const activeLimit=enhanced?Infinity:limit;
  const mine=runes.filter(r=>r.owner===this&&r.kind===kind);
  if(mine.length>=activeLimit){
   const oldest=mine.reduce((a,b)=>a.born<b.born?a:b);
   const idx=runes.indexOf(oldest);
   if(idx>=0)runes.splice(idx,1)
  }
  const baseR=kind==='fire'?40:kind==='ice'?42:36;
  const rune={owner:this,kind,x:this.x,y:this.y,r:baseR*(enhanced?1.2:1),enhanced,born:performance.now(),pulse:Math.random()*Math.PI*2};
  clampRuneToArena(rune);
  runes.push(rune);
  burst(rune.x,rune.y,kind==='fire'?'#ff8b57':kind==='ice'?'#8edbff':'#ffe56f',10,100)
 }
 a(){if(this.cdA>0)return;if(this.type==='dracula'){return}else if(this.type==='knight'){this.cdA=.72;this.attackAnim=.32;const f={x:boss.x<this.x?-1:1,y:0};this.facing=f;this.attackSide=f.x<0?-1:1;const hx=this.x+f.x*78,hy=this.y;slashes.push({x:this.x,y:this.y,side:f.x<0?-1:1,life:.24,max:.24});for(const m of minions)if(Math.hypot(m.x-hx,m.y-hy)<m.r+72)m.hp-=110;if(Math.hypot(boss.x-hx,boss.y-hy)<boss.r+72){boss.hurt(88);boss.vx+=f.x*170;boss.vy+=f.y*170;shake=14;burst(boss.x,boss.y,'#f4f8ff',28,380)}}else if(this.type==='dragonknight'){this.cdA=.78;this.dragonThrust()}else if(this.type==='mage'){this.cdA=.72;tripleShot(this,'fire',560,34);notice('ファイア！','#ffad62',450)}else if(this.type==='monk'){this.cdA=.58;this.attackAnim=.3;const f=boss&&!boss.dead?norm(boss.x-this.x,boss.y-this.y):this.facing;this.facing=f;const punchY=this.y-28,hx=this.x+f.x*62,hy=punchY+f.y*62;let hit=false;for(const m of minions)if(Math.hypot(m.x-hx,m.y-hy)<m.r+58){m.hp-=84*(this.powerUp>0?1.5:1);const n=norm(m.x-this.x,m.y-this.y);m.vx+=n.x*170;m.vy+=n.y*170;hit=true}if(!boss.dead&&Math.hypot(boss.x-hx,boss.y-hy)<boss.r+58){boss.hurt(72*(this.powerUp>0?1.5:1));boss.vx+=f.x*120;boss.vy+=f.y*120;hit=true}for(let k=0;k<4;k++)setTimeout(()=>{const d=43+k*15;fistAfterimage(this.x+f.x*d-f.y*(k%2?7:-7),punchY+f.y*d+f.x*(k%2?7:-7),f.x,f.y,.78+k*.06,false);burst(this.x+f.x*d,punchY+f.y*d,'#ffd47d',5,115)},k*42);if(hit)shake=8;notice('連続パンチ！','#ffe09b',400)}else if(this.type==='magicblade'){const demon=this.demonMode>0,range=demon?112:76,width=demon?104:72,mult=demon?1.55:1;this.cdA=demon?.38:.68;this.attackAnim=.34;const f=boss&&!boss.dead?norm(boss.x-this.x,boss.y-this.y):this.facing;this.facing=f;this.attackSide=f.x<0?-1:1;const hx=this.x+f.x*range,hy=this.y+f.y*range;slashes.push({x:this.x,y:this.y,side:this.attackSide,life:.3,max:.3,magic:true,wide:demon});for(let i=shots.length-1;i>=0;i--){const q=shots[i];if(q.team==='boss'&&Math.hypot(q.x-hx,q.y-hy)<width+q.r){burst(q.x,q.y,q.type==='dragonfire'?'#ff7a38':'#c084fc',8,150);shots.splice(i,1)}}let drained=0;for(const m of minions)if(Math.hypot(m.x-hx,m.y-hy)<m.r+width){const dmg=Math.min(m.hp,92*mult);m.hp-=92*mult;drained+=dmg;const n=norm(m.x-this.x,m.y-this.y);m.vx+=n.x*230;m.vy+=n.y*230}if(!boss.dead&&Math.hypot(boss.x-hx,boss.y-hy)<boss.r+width){const dmg=80*mult;boss.hurt(dmg);drained+=dmg;boss.vx+=f.x*165;boss.vy+=f.y*165;shake=13}this.heal(Math.min(demon?42:28,drained*.18));burst(hx,hy,'#bd75ff',demon?28:18,demon?360:260);notice('魔力斬り！ 弾消去＋吸収！','#d9a6ff',500)}else if(this.type==='ninja'){this.cdA=.82;const aim=boss&&!boss.dead?norm(boss.x-this.x,boss.y-this.y):this.facing;this.facing=aim;const origins=[[this.x,this.y]];if(this.cloneTime>0){origins.push([this.x+(-aim.y)*58,this.y+aim.x*58]);origins.push([this.x-(-aim.y)*58,this.y-aim.x*58]);}origins.forEach((o,ci)=>{for(let k=0;k<3;k++)setTimeout(()=>{if(this.dead)return;const target=!boss.dead?boss:minions[0];const a=target?norm(target.x-o[0],target.y-o[1]):aim;shots.push({team:'hero',type:'shuriken',owner:this,x:o[0]+a.x*30,y:o[1]+a.y*30,vx:a.x*700,vy:a.y*700,r:10,life:1.8,damage:30,homing:true,pierce:0});burst(o[0]+a.x*30,o[1]+a.y*30,'#8ab4ff',6,120)},k*105)});notice(this.cloneTime>0?'分身・手裏剣九連！':'手裏剣三連！','#9cc7ff',520)}else if(this.type==='runemage'){this.cdA=this.runeOverload>0?.48:1.25;this.placeRune('fire',3);notice('炎ルーン設置！ 最大3個','#ff9a63',520)}else if(this.type==='highpriest'){this.cdA=2.2;const range=1200,width=90;holyFx.push({x:this.x,y:this.y,type:'cross',r:range,life:.72,max:.72,wide:true});for(const h of heroes)if(!h.dead&&(Math.abs(h.x-this.x)<width&&Math.abs(h.y-this.y)<range||Math.abs(h.y-this.y)<width&&Math.abs(h.x-this.x)<range))h.heal(105);if(this.divineMode>0){if(!boss.dead&&(Math.abs(boss.x-this.x)<width+boss.r&&Math.abs(boss.y-this.y)<range+boss.r||Math.abs(boss.y-this.y)<width+boss.r&&Math.abs(boss.x-this.x)<range+boss.r))boss.hurt(92);for(const m of minions)if(Math.abs(m.x-this.x)<width+m.r&&Math.abs(m.y-this.y)<range+m.r||Math.abs(m.y-this.y)<width+m.r&&Math.abs(m.x-this.x)<range+m.r)m.hp-=105}burst(this.x,this.y,'#fff1a8',30,330);notice(this.divineMode>0?'ホーリークロス！ 回復＋聖光ダメージ！':'ホーリークロス！ 中回復！','#fff5bd',650)}else{
 const activeLights=shots.filter(s=>s.team==='hero'&&s.type==='holy'&&s.owner===this).length;
 if(activeLights>=2)return;
 this.cdA=.55;spawnHoming(this);notice('ライトボール！','#fff7ad',450)
}}
 b(){if(this.cdB>0)return;if(this.type==='dracula'){this.cdB=2.15;this.summonBats(3);notice('コウモリ召喚！','#e58aa8',520)}else if(this.type==='knight'){this.cdB=3.2;this.guard=2.0;notice('サークルシールド！','#ccecff')}else if(this.type==='dragonknight'){this.dragonCharge(0)}else if(this.type==='mage'){this.cdB=1.05;tripleShot(this,'freeze',600,13);notice('フリーズ！','#bceeff',500)}else if(this.type==='monk'){this.cdB=1.05;const aim=boss&&!boss.dead?norm(boss.x-this.x,boss.y-this.y):this.facing;this.facing=aim;shots.push({team:'hero',type:'ki',owner:this,x:this.x+aim.x*34,y:this.y+aim.y*34,vx:aim.x*650,vy:aim.y*650,r:14,life:1.8,damage:46*(this.powerUp>0?1.5:1)});notice('気功弾！','#8fffe0',450)}else if(this.type==='magicblade'){const demon=this.demonMode>0,mult=demon?1.55:1;this.cdB=demon?.78:1.45;const aim=boss&&!boss.dead?norm(boss.x-this.x,boss.y-this.y):this.facing;this.facing=aim;shots.push({team:'hero',type:'darkblade',owner:this,x:this.x+aim.x*42,y:this.y+aim.y*42,vx:aim.x*(demon?760:620),vy:aim.y*(demon?760:620),r:demon?34:23,life:1.65,damage:64*mult,bulletCut:true,crescent:true,lifeSteal:.18});burst(this.x+aim.x*42,this.y+aim.y*42,'#9e58ff',demon?34:22,demon?360:250);notice('魔剣波！ 三日月斬撃＋吸収！','#c791ff',600)}else if(this.type==='ninja'){this.cdB=3.1;this.inv=.55;const dir=boss&&!boss.dead?(boss.x<this.x?-1:1):(this.facing.x<0?-1:1),startX=this.x,startY=this.y,endX=clamp(this.x+dir*520,100,900);const lanes=[0];if(this.cloneTime>0)lanes.push(58,-58);for(const off of lanes){const y=startY+off;slashes.push({x:(startX+endX)/2,y,side:dir,life:.32,max:.32,ninjaDash:true,length:Math.abs(endX-startX)});for(const m of minions)if(Math.abs(m.y-y)<m.r+36&&m.x>Math.min(startX,endX)-m.r&&m.x<Math.max(startX,endX)+m.r)m.hp-=92;if(!boss.dead&&Math.abs(boss.y-y)<boss.r+38&&boss.x>Math.min(startX,endX)-boss.r&&boss.x<Math.max(startX,endX)+boss.r)boss.hurt(78)}this.x=endX;this.vx=dir*520;clampArena(this);burst(startX,startY,'#c7dcff',22,300);burst(this.x,this.y,'#c7dcff',22,300);shake=12;notice('瞬身斬！','#b9d7ff',620)}else if(this.type==='runemage'){this.cdB=this.runeOverload>0?.58:1.55;this.placeRune('ice',4);notice('氷ルーン設置！ 最大4個','#9fe5ff',520)}else if(this.type==='highpriest'){this.cdB=6.2;const radius=185;holyFx.push({x:this.x,y:this.y,type:'circle',r:radius,life:1.0,max:1.0});for(const h of heroes)if(!h.dead&&Math.hypot(h.x-this.x,h.y-this.y)<radius+h.r){h.regenTime=Math.max(h.regenTime,8);h.regenRate=Math.max(h.regenRate,14)}if(this.divineMode>0){if(!boss.dead&&Math.hypot(boss.x-this.x,boss.y-this.y)<radius+boss.r)holyDots.push({target:boss,life:8,rate:42,tick:0});for(const m of minions)if(Math.hypot(m.x-this.x,m.y-this.y)<radius+m.r)holyDots.push({target:m,life:8,rate:42,tick:0})}burst(this.x,this.y,'#fff0a0',34,280);notice(this.divineMode>0?'リジェネサークル！ 回復＋聖炎！':'リジェネサークル！ 8秒間徐々に回復！','#fff2ad',750)}else{this.cdB=2.6;this.healFx=.72;for(const h of heroes)if(!h.dead&&Math.hypot(h.x-this.x,h.y-this.y)<245)h.heal(105);notice('ヒールサークル！','#9fffc0',500)
}}
 c(){if(this.cdC>0)return;if(this.type==='dracula'){const duration=awakenedMode?10:8;this.cdC=awakenedMode?10:12;this.batForm=duration;this.inv=.45;burst(this.x,this.y,'#5e1737',38,330);notice(`コウモリ変化！ ${duration}秒間無敵・移動速度120%・攻撃可能！`,'#d88ba8',900)}else if(this.type==='knight'){this.cdC=5.2;this.heal(112);notice('セルフヒール・中！','#aaffc2')}else if(this.type==='dragonknight'){this.cdC=4.8;this.dragonSweep()}else if(this.type==='mage'){this.cdC=4.3;this.tornado=2.8;notice('ミニトルネード！','#c6f4ff')}else if(this.type==='monk'){this.cdC=4.4;this.spiritFx=.9;this.powerUp=5;const radius=240;for(let i=shots.length-1;i>=0;i--){const q=shots[i];if(q.team==='boss'&&Math.hypot(q.x-this.x,q.y-this.y)<radius+q.r){burst(q.x,q.y,'#fff0a0',8,150);shots.splice(i,1)}}for(const m of minions){const d=Math.hypot(m.x-this.x,m.y-this.y);if(d<radius+m.r){const n=norm(m.x-this.x,m.y-this.y);m.vx+=n.x*620;m.vy+=n.y*620}}if(!boss.dead){const d=Math.hypot(boss.x-this.x,boss.y-this.y);if(d<radius+boss.r){const n=norm(boss.x-this.x,boss.y-this.y);boss.vx+=n.x*430;boss.vy+=n.y*430}}burst(this.x,this.y,'#ffe88b',40,440);shake=12;notice('気合い！ 弾消去＋吹き飛ばし／攻撃・自然回復アップ！','#fff09a',1050)}else if(this.type==='magicblade'){const demon=this.demonMode>0,radius=demon?245:160,mult=demon?1.55:1;this.cdC=demon?2.8:5.2;this.attackAnim=.5;this.drainFx=.72;slashes.push({x:this.x,y:this.y,side:1,life:.5,max:.5,magic:true,spin:true,wide:demon});for(let i=shots.length-1;i>=0;i--){const q=shots[i];if(q.team==='boss'&&Math.hypot(q.x-this.x,q.y-this.y)<radius+q.r){burst(q.x,q.y,'#c084fc',9,170);shots.splice(i,1)}}let drained=0;if(!boss.dead&&Math.hypot(this.x-boss.x,this.y-boss.y)<radius+boss.r){const dmg=108*mult;boss.hurt(dmg);drained+=dmg;const n=norm(boss.x-this.x,boss.y-this.y);boss.vx+=n.x*260;boss.vy+=n.y*260}for(const m of minions)if(Math.hypot(this.x-m.x,this.y-m.y)<radius+m.r){const dmg=Math.min(m.hp,86*mult);m.hp-=86*mult;drained+=dmg;const n=norm(m.x-this.x,m.y-this.y);m.vx+=n.x*330;m.vy+=n.y*330}this.heal(Math.min(demon?190:135,drained*.32));burst(this.x,this.y,'#a855f7',demon?52:38,demon?520:390);shake=14;notice('回転斬り！ ライフスティール！','#e0b3ff',850)}else if(this.type==='ninja'){this.cdC=5.4;this.inv=.9;this.smokeTime=.55;this.hidden=true;const ox=this.x,oy=this.y;burst(ox,oy,'#b9c4d0',46,320);setTimeout(()=>{if(this.dead)return;this.x=clamp(1000-ox,95,905);this.y=clamp(1050-oy,145,905);clampArena(this);this.hidden=false;burst(this.x,this.y,'#dce4ec',46,320);if(this.cloneTime>0){burst(this.x+58,this.y,'#8aaeff',22,230);burst(this.x-58,this.y,'#8aaeff',22,230)}},520);notice('煙玉！ 次に現れるまで無敵！','#dce4ec',720)}else if(this.type==='runemage'){this.cdC=this.runeOverload>0?.30:.82;this.placeRune('thunder',5);notice('雷ルーン設置！ 最大5個','#fff18a',520)}else if(this.type==='highpriest'){this.cdC=9.5;const radius=310;holyFx.push({x:this.x,y:this.y,type:'circle',r:radius,life:1.15,max:1.15,big:true});for(const h of heroes)if(!h.dead&&Math.hypot(h.x-this.x,h.y-this.y)<radius+h.r)h.heal(225);if(this.divineMode>0){if(!boss.dead&&Math.hypot(boss.x-this.x,boss.y-this.y)<radius+boss.r)boss.hurt(175);for(const m of minions)if(Math.hypot(m.x-this.x,m.y-this.y)<radius+m.r)m.hp-=210}burst(this.x,this.y,'#fff7c7',56,460);shake=10;notice(this.divineMode>0?'グレーターヒール！ 大回復＋神罰！':'グレーターヒール！ 広範囲大回復！','#fff6c4',900)}else{this.cdC=5.0;walls.push({owner:this,life:2.8,r:76});notice('リフレクトウォール！','#f5eaff')}}
 soloSkill(){
  if(this.soloCd>0||heroes.filter(h=>!h.dead).length!==1||this.dead)return;
  if(this.type==='dracula'){
   this.soloCd=14;this.dominationTime=10;this.inv=.6;burst(this.x,this.y,'#7e123d',58,480);notice('眷属支配！ 10秒間、手下を吸血コウモリへ！','#ef9ab8',1200)
  }else if(this.type==='knight'){
   this.soloCd=6.5;slashes.push({x:this.x,y:this.y,side:1,life:.48,max:.48,spin:true});
   if(!boss.dead&&Math.hypot(this.x-boss.x,this.y-boss.y)<160+boss.r){const n=norm(boss.x-this.x,boss.y-this.y);boss.hurt(145);boss.vx+=n.x*520;boss.vy+=n.y*520}
   for(const m of minions)if(Math.hypot(this.x-m.x,this.y-m.y)<160+m.r){const n=norm(m.x-this.x,m.y-this.y);m.hp-=180;m.vx+=n.x*620;m.vy+=n.y*620}
   burst(this.x,this.y,'#edf7ff',38,430);shake=18;notice('回転斬り！','#eaf7ff',650)
  }else if(this.type==='dragonknight'){
   this.soloCd=14;this.dragonBreath=10;this.breathTick=0;this.inv=.7;burst(this.x,this.y,'#ff6d32',60,520);shake=14;notice('三竜の息吹！ 肩の竜魂と三方向ブレス！','#ffb06a',1200)
  }else if(this.type==='mage'){
   this.soloCd=8;this.drainFx=.72;let drained=0;
   if(!boss.dead&&Math.hypot(this.x-boss.x,this.y-boss.y)<245+boss.r){boss.hurt(105);drained+=105}
   for(const m of minions)if(Math.hypot(this.x-m.x,this.y-m.y)<245+m.r){const amount=Math.min(75,m.hp);m.hp-=75;drained+=amount}
   this.heal(Math.min(220,drained*.65));burst(this.x,this.y,'#c06cff',42,310);notice('ライフドレイン！','#dc9cff',750)
  }else if(this.type==='monk'){
   this.soloCd=7.2;const target=!boss.dead?boss:minions[0];if(target){const n=norm(target.x-this.x,target.y-this.y);this.x=clamp(target.x-n.x*(target.r+62),90,910);this.y=clamp(target.y-n.y*(target.r+62),140,910);clampArena(this);for(let k=0;k<10;k++)setTimeout(()=>{if(!target||target.dead)return;const aim=norm(target.x-this.x,target.y-this.y),side=k%2?1:-1,dist=48+k*5,punchY=this.y-28;fistAfterimage(this.x+aim.x*dist-aim.y*side*(10+k*.8),punchY+aim.y*dist+aim.x*side*(10+k*.8),aim.x,aim.y,k===9?1.35:.92+k*.025,k===9);const dmg=42*(this.powerUp>0?1.5:1);if(target===boss)boss.hurt(dmg);else target.hp-=dmg;burst(target.x+rnd(-22,22),target.y+rnd(-22,22),k===9?'#fff4b0':'#ffbf66',12,230);shake=k===9?15:9},k*70)}this.inv=.9;notice('百裂拳！ 十連撃！','#ffd47d',900)
  }else if(this.type==='magicblade'){
   this.soloCd=13;this.demonMode=8;this.inv=.8;this.spiritFx=.9;burst(this.x,this.y,'#8b2cff',64,560);shake=16;notice('魔人化！ 8秒間 攻撃速度・威力・ABC攻撃幅アップ！','#e6c2ff',1250)
  }else if(this.type==='ninja'){
   this.soloCd=14;this.cloneTime=15;this.inv=.7;burst(this.x,this.y,'#7ea6ff',52,430);burst(this.x+58,this.y,'#b5caff',38,330);burst(this.x-58,this.y,'#b5caff',38,330);notice('分身二体！ 15秒間すべての行動を複製！','#b7ccff',1100)
  }else if(this.type==='runemage'){
   this.soloCd=14;this.runeOverload=15;this.inv=.6;burst(this.x,this.y,'#6ec7ff',58,470);notice('ルーンオーバーロード！ 雑魚を同色の追尾弾へ変換！','#bfeaff',1250)
  }else if(this.type==='qigong'){
   this.soloCd=14;this.qigongFocus=10;this.inv=.45;burst(this.x,this.y,'#ffcf5c',58,480);notice('気脈解放！ 10秒間 A即最大／気功壁強化／Cチャージ10倍！','#ffe39a',1200)
  }else if(this.type==='highpriest'){
   this.soloCd=13;this.divineMode=12;this.inv=.7;holyFx.push({x:this.x,y:this.y,type:'circle',r:215,life:1.2,max:1.2,big:true});burst(this.x,this.y,'#fff2a8',64,520);shake=12;notice('神威降臨！ 12秒間、回復魔法が敵には神罰となる！','#fff4ad',1200)
  }else{
   this.soloCd=7.2;const aim=norm(boss.x-this.x,boss.y-this.y);
   this.heal(120);
   lasers.push({x:this.x,y:this.y,dx:aim.x,dy:aim.y,life:.55,max:.55,width:34,damage:180,knockback:520});
   notice('ホーリーライト！ セルフヒール！','#fff7b5',850)
  }
 }
 draw(i){
  const ctl=i===heroIndex&&!this.dead,img=sprites['hero_'+this.type]||(this.type==='magicblade'?sprites.hero_knight:null);
  const flip=boss&&!boss.dead?boss.x<this.x:this.facing.x<0;
  const bob=Math.hypot(this.vx,this.vy)>25?Math.sin(performance.now()/85+i)*3:0;
  ctx.save();ctx.globalAlpha=.22;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(this.x,this.y+25,36,13,0,0,Math.PI*2);ctx.fill();
  if(ctl){ctx.strokeStyle='#fff09b';ctx.lineWidth=5;ctx.beginPath();ctx.arc(this.x,this.y+3,48,0,Math.PI*2);ctx.stroke()}
  if(this.type==='dragonknight'&&this.chargeB>0){const t=clamp(this.chargeB/2,0,1),pulse=1+Math.sin(performance.now()/75)*.05;ctx.save();ctx.translate(this.x,this.y-8);ctx.scale(pulse,pulse);ctx.globalAlpha=.25+.35*t;ctx.strokeStyle=t>=.99?'#fff0a0':'#ff9a52';ctx.fillStyle='#ff5f2a';ctx.lineWidth=4+5*t;ctx.shadowBlur=18+22*t;ctx.shadowColor='#ff5b2e';ctx.beginPath();ctx.arc(0,0,46+24*t,0,Math.PI*2);ctx.stroke();for(let k=0;k<3;k++){const a=performance.now()/420+k*Math.PI*2/3;ctx.beginPath();ctx.arc(Math.cos(a)*(30+18*t),Math.sin(a)*(18+10*t),5+5*t,0,Math.PI*2);ctx.fill()}if(t>=.99){ctx.globalAlpha=.22+.08*Math.sin(performance.now()/90);ctx.strokeStyle='#ffcf83';ctx.lineWidth=7;for(const off of [-42,0,42]){ctx.beginPath();ctx.arc(off,-70,26,Math.PI*.12,Math.PI*1.88);ctx.stroke();ctx.beginPath();ctx.moveTo(off-18,-62);ctx.lineTo(off,-92);ctx.lineTo(off+18,-62);ctx.stroke()}ctx.beginPath();ctx.moveTo(-42,-44);ctx.quadraticCurveTo(0,-112,42,-44);ctx.stroke()}ctx.restore()}
  const sw=this.type==='dracula'?158:this.type==='monk'?154:this.type==='magicblade'?174:this.type==='ninja'?135:this.type==='highpriest'?126:this.type==='runemage'?128:this.type==='qigong'?138:this.type==='dragonknight'?168:112,sh=this.type==='dracula'?176:this.type==='monk'?174:this.type==='magicblade'?150:this.type==='ninja'?126:this.type==='highpriest'?149:this.type==='runemage'?150:this.type==='qigong'?156:this.type==='dragonknight'?166:126;if(this.hidden){ctx.globalAlpha=.18}
  if(this.type==='dracula'&&this.batForm>0){
   const frame=Math.floor(performance.now()/190)%2,wing=frame?12:4,poses=[[-28,-2,-.18],[0,-19,0],[29,1,.18]];ctx.save();ctx.translate(this.x,this.y-4+bob);ctx.fillStyle='#3b1029';ctx.strokeStyle='#d85884';ctx.lineWidth=2;for(const [bx,by,rot] of poses){ctx.save();ctx.translate(bx,by);ctx.rotate(rot);ctx.beginPath();ctx.moveTo(-17,2);ctx.quadraticCurveTo(-9,-wing,0,-4);ctx.quadraticCurveTo(9,-wing,17,2);ctx.quadraticCurveTo(8,9,0,5);ctx.quadraticCurveTo(-8,9,-17,2);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ff6a91';ctx.beginPath();ctx.arc(3,-1,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3b1029';ctx.restore()}ctx.restore();
  }else if(!drawSprite(img,this.x,this.y+(this.type==='monk'?14:this.type==='dracula'?7:0),sw,sh,flip,this.dead?.32:1,bob)){ctx.save();ctx.translate(this.x,this.y+bob);ctx.fillStyle=this.type==='knight'?'#7488aa':this.type==='mage'?'#304e9c':this.type==='monk'?'#d7ad72':this.type==='magicblade'?'#6d3aa8':this.type==='qigong'?'#c92e2e':this.type==='dragonknight'?'#9f3a2d':this.type==='dracula'?'#221421':'#f2efe5';ctx.beginPath();ctx.arc(0,-14,27,0,Math.PI*2);ctx.fill();ctx.fillRect(-25,5,50,48);ctx.restore();}
  if(this.type==='ninja'&&this.cloneTime>0&&!this.hidden){for(const off of [-58,58]){ctx.save();ctx.globalAlpha=.62;ctx.shadowBlur=18;ctx.shadowColor='#76a5ff';drawSprite(img,this.x+off,this.y,sw,sh,flip,.68,bob);ctx.restore()}}
  if((this.type==='knight'||this.type==='magicblade')&&this.attackAnim>0){
    const p=1-this.attackAnim/.32,side=this.attackSide,angle=-1.25+p*2.55;
    ctx.save();ctx.translate(this.x,this.y-5+bob);ctx.scale(side,1);ctx.rotate(angle);ctx.strokeStyle='#8b5a2b';ctx.lineWidth=10;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(45,0);ctx.stroke();ctx.fillStyle=this.type==='magicblade'?'#d8b4fe':'#e9f3ff';ctx.beginPath();ctx.moveTo(40,-8);ctx.lineTo(112,0);ctx.lineTo(40,8);ctx.closePath();ctx.fill();
    ctx.strokeStyle=this.type==='magicblade'?'#f3e8ffaa':'#ffffffaa';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(50,-2);ctx.lineTo(103,0);ctx.stroke();ctx.restore();
  }
  if(this.guard>0){const pulse=1+Math.sin(performance.now()/95)*.035;ctx.save();ctx.translate(this.x,this.y);ctx.scale(pulse,pulse);ctx.globalAlpha=.2;ctx.fillStyle='#bfe7ff';ctx.beginPath();ctx.arc(0,0,91,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.82;ctx.strokeStyle='#d9f5ff';ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,0,91,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.45;ctx.strokeStyle='#72cfff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,75,0,Math.PI*2);ctx.stroke();ctx.restore();ctx.globalAlpha=1}
  if(this.type==='qigong'){const total=Math.max(this.chargeA,this.chargeC),hand=this.qigongHandPoint(),burstPoint=this.qigongBurstPoint(),cx=this.chargeC>0?burstPoint.x:hand.x,cy=this.chargeC>0?burstPoint.y:hand.y;if(total>0){const c=this.chargeC>0?this.chargeC:this.chargeA,radius=this.chargeC>0?95+Math.min(260,c*5.5):26+Math.min(42,c*12);ctx.save();ctx.globalAlpha=.72;ctx.strokeStyle='#ffe29a';ctx.shadowBlur=18;ctx.shadowColor='#ffbd3e';ctx.lineWidth=3;for(let k=1;k<=5;k++){ctx.globalAlpha=.16+k*.08;ctx.beginPath();ctx.arc(cx,cy,radius*k/5,0,Math.PI*2);ctx.stroke()}ctx.fillStyle='#fff1b0';ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(cx,cy,8+Math.min(22,c*2),0,Math.PI*2);ctx.fill();ctx.restore()}if(this.qigongFocus>0){ctx.save();ctx.globalAlpha=.48;ctx.strokeStyle='#ffcf5c';ctx.lineWidth=6;ctx.shadowBlur=24;ctx.shadowColor='#ff9f2f';ctx.beginPath();ctx.arc(this.x,this.y,62,0,Math.PI*2);ctx.stroke();ctx.restore()}}
  if(this.type==='dragonknight'&&this.dragonBreath>0){const aim=boss&&!boss.dead?norm(boss.x-this.x,boss.y-this.y):this.facing,ang=Math.atan2(aim.y,aim.x),flipHead=aim.x<0?1:-1;for(const side of [-1,1]){const hx=this.x+side*flipHead*31,hy=this.y-49;ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);ctx.globalAlpha=.43+.12*Math.sin(performance.now()/100+side);ctx.fillStyle='#a12f22';ctx.strokeStyle='#ffb071';ctx.lineWidth=3;ctx.shadowBlur=18;ctx.shadowColor='#ff6a32';ctx.beginPath();ctx.moveTo(-9,-12);ctx.quadraticCurveTo(8,-23,30,-14);ctx.lineTo(52,0);ctx.lineTo(30,14);ctx.quadraticCurveTo(8,23,-9,12);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffd36e';ctx.beginPath();ctx.arc(28,-6,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffc08a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(34,0);ctx.lineTo(49,0);ctx.stroke();ctx.restore()}}
  if(this.type==='runemage'&&this.runeOverload>0){const pulse=1+Math.sin(performance.now()/95)*.06;ctx.save();ctx.translate(this.x,this.y);ctx.scale(pulse,pulse);ctx.globalAlpha=.42;ctx.strokeStyle='#6ec7ff';ctx.lineWidth=5;ctx.shadowBlur=22;ctx.shadowColor='#4aaeff';ctx.beginPath();ctx.arc(0,0,58,0,Math.PI*2);ctx.stroke();ctx.restore()}
  if(this.type==='highpriest'&&this.divineMode>0){const pulse=1+Math.sin(performance.now()/110)*.05;ctx.save();ctx.translate(this.x,this.y);ctx.scale(pulse,pulse);ctx.globalAlpha=.48;ctx.strokeStyle='#ffe98a';ctx.lineWidth=5;ctx.shadowBlur=25;ctx.shadowColor='#fff0a0';ctx.beginPath();ctx.arc(0,0,62,0,Math.PI*2);ctx.stroke();ctx.restore()}
  if(this.type==='magicblade'&&this.demonMode>0){const pulse=1+Math.sin(performance.now()/90)*.06;ctx.save();ctx.translate(this.x,this.y);ctx.scale(pulse,pulse);ctx.globalAlpha=.42;ctx.strokeStyle='#c084fc';ctx.lineWidth=6;ctx.shadowBlur=24;ctx.shadowColor='#a855f7';ctx.beginPath();ctx.arc(0,0,58,0,Math.PI*2);ctx.stroke();ctx.restore()}
   if(this.spiritFx>0){const t=this.spiritFx/.55,r=165*(1-(1-t)*.18);ctx.save();ctx.globalAlpha=.14+.2*t;ctx.fillStyle='#ffd95d';ctx.beginPath();ctx.arc(this.x,this.y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.75*t;ctx.strokeStyle='#fff0a0';ctx.lineWidth=10;ctx.shadowBlur=22;ctx.shadowColor='#ffd95d';ctx.beginPath();ctx.arc(this.x,this.y,r,0,Math.PI*2);ctx.stroke();ctx.restore()}
  if(this.drainFx>0){const t=this.drainFx/.72,p=1-t,e=1-Math.pow(1-p,3),r=245-(205*e);ctx.save();ctx.globalAlpha=.10+.18*t;ctx.fillStyle='#8d35c7';ctx.beginPath();ctx.arc(this.x,this.y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.35+.45*t;ctx.strokeStyle='#d27aff';ctx.lineWidth=7;ctx.shadowBlur=20;ctx.shadowColor='#b84dff';ctx.beginPath();ctx.arc(this.x,this.y,r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.32*t;ctx.strokeStyle='#f0c8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,Math.max(18,r-18),0,Math.PI*2);ctx.stroke();ctx.restore()}
  if(this.healFx>0){const t=this.healFx/.72,p=1-t,e=1-Math.pow(1-p,3),r=30+215*e;ctx.save();ctx.globalAlpha=.08+.16*t;ctx.fillStyle='#efffb0';ctx.beginPath();ctx.arc(this.x,this.y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.28+.62*t;ctx.strokeStyle='#fffbd0';ctx.lineWidth=8;ctx.shadowBlur=24;ctx.shadowColor='#eaff86';ctx.beginPath();ctx.arc(this.x,this.y,r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.42*t;ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,Math.max(12,r-18),0,Math.PI*2);ctx.stroke();ctx.restore()}
  if(this.tornado>0){ctx.globalAlpha=.75;ctx.strokeStyle='#d3f7ff';ctx.lineWidth=7;for(let r=42;r<82;r+=13){ctx.beginPath();ctx.arc(this.x,this.y,r,performance.now()/210+r,performance.now()/210+r+4.6);ctx.stroke()}ctx.globalAlpha=1}
  ctx.restore();
 }
}
function tripleShot(h,type,speed,damage){const aim=boss&&!boss.dead?norm(boss.x-h.x,boss.y-h.y):h.facing;h.facing=aim;const base=Math.atan2(aim.y,aim.x);[-.11,.11].forEach(a=>{const ang=base+a;shots.push({team:'hero',type,x:h.x+Math.cos(ang)*32,y:h.y+Math.sin(ang)*32,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,r:type==='fire'?13:9,life:1.8,damage})})}
function spawnHoming(h){const n=boss&&!boss.dead?norm(boss.x-h.x,boss.y-h.y):h.facing;h.facing=n;shots.push({team:'hero',type:'holy',owner:h,x:h.x+n.x*30,y:h.y+n.y*30,vx:n.x*330,vy:n.y*330,r:11,life:3.1,damage:22,homing:true})}
const bossDefs=[
{name:'巨腕トロール・ガンバ',kind:'troll',hp:1750,speed:102,pattern:'slam'},
{name:'夜侯ドラキュラ',kind:'dracula',hp:2050,speed:142,pattern:'fire'},
{name:'冥府の番犬ケルベロス',kind:'cerberus',hp:2550,speed:166,pattern:'all'},
{name:'深紅竜ヴォルガノス',kind:'dragon',hp:3250,speed:128,pattern:'dragon'},
{name:'終焉の魔王アビス',kind:'demonking',hp:3600,speed:145,pattern:'final'}];
class Boss{
 constructor(def){const hp=Math.round(def.hp*(awakenedMode?1.7:1)),speed=def.speed*(awakenedMode?1.12:1);Object.assign(this,{...def,hp,maxHp:hp,speed,x:735,y:510,vx:0,vy:0,r:def.kind==='dragon'?82:def.kind==='cerberus'?76:def.kind==='troll'?70:64,cd:1.1,attack:0,volley:0,slow:0,freezeStop:0,dead:false,phase:0,inv:0,touchCd:0})}
 damage(n){return enemyDamage(n)*(this.kind==='demonking'?1.08:1)}
 hurt(n){if(this.dead)return;this.inv=.12;this.hp-=n;burst(this.x,this.y,'#ffd29d',5,150);if(this.hp<=0){this.hp=0;this.dead=true;bossDefeated()}}
 update(dt){if(this.dead)return;this.inv=Math.max(0,this.inv-dt);this.cd-=dt;this.attack=Math.max(0,this.attack-dt);this.volley=Math.max(0,this.volley-dt);this.slow=Math.max(0,this.slow-dt);this.freezeStop=Math.max(0,this.freezeStop-dt);this.touchCd=Math.max(0,this.touchCd-dt);const alive=heroes.filter(h=>!h.dead);if(!alive.length)return;const target=alive.sort((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)-Math.hypot(b.x-this.x,b.y-this.y))[0],n=norm(target.x-this.x,target.y-this.y),d=Math.hypot(target.x-this.x,target.y-this.y);let mx=0,my=0,sp=this.speed;if(this.kind==='troll'){mx=n.x;my=n.y;sp*=1.08}else if(this.kind==='cerberus'){if(d>205){mx=n.x;my=n.y}else if(d<125){mx=-n.x*.55;my=-n.y*.55}else{mx=-n.y*.42;my=n.x*.42}}else{const pref=this.kind==='dracula'?350:this.kind==='dragon'?330:370;if(d<pref-65){mx=-n.x;my=-n.y}else if(d>pref+70){mx=n.x*.45;my=n.y*.45}else{const side=Math.sin(performance.now()/650+bossIndex)>0?1:-1;mx=-n.y*.55*side;my=n.x*.55*side}sp*=this.kind==='dracula'?.72:this.kind==='dragon'?.62:.68}if(this.freezeStop>0){mx=my=0;sp=0}else if(this.slow>0)sp*=.38;this.vx+=(mx*sp-this.vx)*Math.min(1,dt*(this.kind==='troll'?4.2:2.6));this.vy+=(my*sp-this.vy)*Math.min(1,dt*(this.kind==='troll'?4.2:2.6));if(d<this.r+target.r+10){
 const minD=this.r+target.r+12,overlap=Math.max(0,minD-d);
 target.x+=n.x*(overlap*.72+4);target.y+=n.y*(overlap*.72+4);
 this.x-=n.x*(overlap*.28+2);this.y-=n.y*(overlap*.28+2);
 clampArena(target);clampArena(this);
 if(this.touchCd<=0){target.hurt(this.damage(52+bossIndex*10),n.x*250,n.y*250);this.touchCd=.62}
 this.vx-=n.x*70;this.vy-=n.y*70
}if(this.cd<=0&&this.freezeStop<=0){this.special(target);this.cd=(this.kind==='troll'?1.75:this.kind==='dracula'?1.8:this.kind==='cerberus'?1.55:this.kind==='dragon'?1.4:Math.max(.82,1.25-this.phase*.015))*(awakenedMode?.82:1)}this.x+=this.vx*dt;this.y+=this.vy*dt;clampArena(this)}
 radial(count,speed,type='enemy',damage=30,spread=0){for(let i=0;i<count;i++){const a=Math.PI*2*i/count+spread;shots.push({team:'boss',type,x:this.x,y:this.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:12,life:3.2,damage:this.damage(damage)})}}
 aimed(target,count=3,speed=330,type='enemy',damage=34){const base=Math.atan2(target.y-this.y,target.x-this.x);for(let i=0;i<count;i++){const a=base+(i-(count-1)/2)*.16;shots.push({team:'boss',type,x:this.x,y:this.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:13,life:3,damage:this.damage(damage)})}}
 summon(count=2,strong=false){
  const requested=awakenedMode?count*AWAKEN_SUMMON_MULTIPLIER:count;
  const available=awakenedMode?Math.max(0,AWAKEN_MINION_LIMIT-minions.length):requested;
  const spawnCount=Math.min(requested,available);
  if(spawnCount<=0){if(awakenedMode)notice(`手下は最大${AWAKEN_MINION_LIMIT}体！`,'#d9a5ff',600);return}
  for(let i=0;i<spawnCount;i++){const a=Math.PI*2*i/spawnCount+Math.random()*.8,d=105+rnd(0,85);minions.push({
   x:clamp(this.x+Math.cos(a)*d,120,880),y:clamp(this.y+Math.sin(a)*d,180,870),vx:0,vy:0,r:strong?25:21,
   hp:strong?170:105,maxHp:strong?170:105,damage:this.damage(strong?34:24),cd:rnd(.2,.7),life:strong?22:16,strong
  })}
  notice(awakenedMode?`覚醒召喚！ 手下${spawnCount}体（最大${AWAKEN_MINION_LIMIT}体）`:(strong?'強化手下を召喚！':'手下を召喚！'),'#d9a5ff',700)
 }
 special(target){
  this.phase++;
  if(this.pattern==='slam'){const n=norm(target.x-this.x,target.y-this.y);this.vx=n.x*360;this.vy=n.y*360;this.slam(72)}
  else if(this.pattern==='fire'){this.volley=.9;this.aimed(target,5,335,'enemy',34)}
  else if(this.pattern==='all'){
   if(this.phase%4===0)this.summon(1,false);
   else if(this.phase%3===0)this.slam(78);
   else{this.volley=1;this.aimed(target,5,355,'enemy',39)}
  }else if(this.pattern==='dragon'){
   if(this.phase%3===0)this.summon(2,false);
   else if(this.phase%4===0)this.slam(86);
   else{this.volley=1;this.aimed(target,7,375,'enemy',44)}
  }else{
   if(this.phase%3===0)this.summon(this.hp<this.maxHp*.5?3:2,true);
   else if(this.phase%4===0)this.slam(this.hp<this.maxHp*.35?112:94);
   else if(this.phase%2===0){this.volley=1;this.radial(14,320,'enemy',46,performance.now()/700)}
   else{this.volley=1;this.aimed(target,this.hp<this.maxHp*.4?9:7,395,'enemy',52)}
  }
 }
 slam(dmg){this.attack=.75;setTimeout(()=>{if(!running||this.dead)return;for(const h of heroes)if(!h.dead&&Math.hypot(h.x-this.x,h.y-this.y)<205)h.hurt(this.damage(dmg));burst(this.x,this.y,'#ffd08a',42,470);shake=22},430)}
 draw(){
  const alive=heroes.filter(h=>!h.dead),target=alive.length?alive.reduce((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)<Math.hypot(b.x-this.x,b.y-this.y)?a:b):null;
  const flip=target?target.x<this.x:false;let key='boss_'+this.kind;
  if(this.kind==='troll')key=this.attack>0&&this.attack<.48?'boss_troll_down':'boss_troll_up';
  const sizes={troll:[220,250],dracula:[190,220],cerberus:[250,215],dragon:[280,250],demonking:[210,238]},sz=sizes[this.kind]||[210,230];
  const bob=this.kind==='dracula'?Math.sin(performance.now()/170)*7:Math.sin(performance.now()/240)*2;
  ctx.save();ctx.globalAlpha=.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(this.x,this.y+44,sz[0]*.34,21,0,0,Math.PI*2);ctx.fill();
  if(!drawSprite(sprites[key],this.x,this.y,sz[0],sz[1],flip,this.inv>0?.55:1,bob)){ctx.fillStyle='#803838';ctx.beginPath();ctx.arc(this.x,this.y-25,this.r*1.35,0,Math.PI*2);ctx.fill();}
  if(this.attack>0){ctx.globalAlpha=.2;ctx.fillStyle='#ff5f45';ctx.beginPath();ctx.arc(this.x,this.y,205,0,Math.PI*2);ctx.fill()}ctx.restore();
 }
}
let heroes=[],boss;
function setupBattle(){
 resetCombatInput();
 const layouts={1:[[260,525]],2:[[250,455],[250,610]],3:[[270,420],[235,535],[280,650]]};
 const pos=layouts[selectedTypes.length]||layouts[3];
 heroes=selectedTypes.map((type,i)=>new Hero(type,pos[i][0],pos[i][1]));
 if(awakenedMode&&awakeningSoloCarry){const h=heroes.find(x=>x.type===awakeningSoloCarry.type&&!x.dead);if(h){if(h.type==='magicblade')h.demonMode=8;else if(h.type==='ninja')h.cloneTime=15;else if(h.type==='runemage')h.runeOverload=15;else if(h.type==='highpriest')h.divineMode=12;else if(h.type==='qigong')h.qigongFocus=10;else if(h.type==='dragonknight')h.dragonBreath=10;else if(h.type==='dracula')h.dominationTime=10}awakeningSoloCarry=null}
 boss=new Boss(bossDefs[bossIndex]);
 heroIndex=heroes.findIndex(h=>h.type===selectedStartType);if(heroIndex<0)heroIndex=0;
 shots.length=particles.length=walls.length=slashes.length=fistTrails.length=minions.length=lasers.length=holyFx.length=holyDots.length=runes.length=0;
 updateUI();notice((awakenedMode?'覚醒・封印の間 ':'封印の間 ')+(bossIndex+1),awakenedMode?'#fff08a':'#ffd88b',1100)
}
function bossDefeated(){resetCombatInput();if(bossIndex===1&&!isDraculaUnlocked()&&selectedTypes.length>0&&selectedTypes.every(t=>t==='healer'||t==='highpriest')){saveDraculaUnlock();unlockDraculaChoice();notice('ドラキュラ 解放！ 聖なる力で呪いが解けた！','#f3a1bc',1800);document.getElementById('loadStatus').textContent='ドラキュラが解放されました！'}for(const h of heroes)h.chargeB=0;awakeningSoloCarry=null;if(awakenedMode){const h=heroes.find(x=>!x.dead);if(h&&((h.type==='magicblade'&&h.demonMode>0)||(h.type==='ninja'&&h.cloneTime>0)||(h.type==='runemage'&&h.runeOverload>0)||(h.type==='highpriest'&&h.divineMode>0)||(h.type==='qigong'&&h.qigongFocus>0)||(h.type==='dragonknight'&&h.dragonBreath>0)||(h.type==='dracula'&&h.dominationTime>0)))awakeningSoloCarry={type:h.type}}transition=2.2;notice('BOSS DEFEATED!','#fff08a',1500);for(const h of heroes)if(!h.dead)h.heal(h.maxHp*.24)}
function nextHero(){for(let k=1;k<=heroes.length;k++){const ni=(heroIndex+k)%heroes.length;if(!heroes[ni].dead){heroIndex=ni;notice(heroInfo[heroes[ni].type].name+'にチェンジ','#aee8ff',600);break}}}
function updateShots(dt){for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.life-=dt;if(s.homing&&!boss.dead){const desired=norm(boss.x-s.x,boss.y-s.y),speed=Math.hypot(s.vx,s.vy),cur=norm(s.vx,s.vy),blend=Math.min(1,dt*4.6),nn=norm(cur.x*(1-blend)+desired.x*blend,cur.y*(1-blend)+desired.y*blend);s.vx=nn.x*speed;s.vy=nn.y*speed}s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.life<=0||s.x<45||s.x>955||s.y<110||s.y>940){shots.splice(i,1);continue}if(s.team==='hero'){
 if(s.bulletCut){for(let j=shots.length-1;j>=0;j--){const q=shots[j];if(q!==s&&q.team==='boss'&&Math.hypot(s.x-q.x,s.y-q.y)<s.r+q.r+10){burst(q.x,q.y,'#c084fc',8,150);shots.splice(j,1);if(j<i)i--}}}
 let hitMinion=false;
 if(!s.bossOnly)for(const m of minions){if(Math.hypot(s.x-m.x,s.y-m.y)<s.r+m.r){const dealt=Math.min(m.hp,s.damage);m.hp-=s.damage;if(s.lifeSteal&&s.owner&&!s.owner.dead)s.owner.heal(Math.min(38,dealt*s.lifeSteal));burst(s.x,s.y,'#d8b5ff',10,150);shots.splice(i,1);hitMinion=true;break}}
 if(hitMinion)continue;
 if(!boss.dead&&Math.hypot(s.x-boss.x,s.y-boss.y)<s.r+boss.r){boss.hurt(s.damage);if(s.lifeSteal&&s.owner&&!s.owner.dead)s.owner.heal(Math.min(38,s.damage*s.lifeSteal));if(s.type==='freeze'){boss.freezeStop=Math.max(boss.freezeStop,.38);boss.slow=Math.max(boss.slow,2.4);boss.vx*=.15;boss.vy*=.15;notice('フリーズ！ 足止め！','#bceeff',520)}burst(s.x,s.y,s.type==='fire'?'#ff7d3c':s.type==='holy'?'#fff5a8':s.type==='darkblade'?'#bd75ff':s.type==='shuriken'?'#9cc7ff':'#bceeff',18,250);shots.splice(i,1)}}else{let blocked=false;for(const r of runes){if(r.enhanced&&r.kind==='fire'&&Math.hypot(s.x-r.x,s.y-r.y)<r.r+s.r){burst(s.x,s.y,'#ff9a63',12,190);shots.splice(i,1);blocked=true;break}}if(blocked)continue;for(const h of heroes){if(!h.dead&&h.type==='mage'&&h.tornado>0&&Math.hypot(s.x-h.x,s.y-h.y)<95+s.r){burst(s.x,s.y,'#c6f4ff',12,180);shots.splice(i,1);blocked=true;break}}if(blocked)continue;for(const h of heroes){if(!h.dead&&h.type==='knight'&&h.guard>0&&Math.hypot(s.x-h.x,s.y-h.y)<92+s.r){burst(s.x,s.y,'#ccefff',14,190);shots.splice(i,1);blocked=true;break}}if(blocked)continue;let wallBlocked=false;for(const w of walls){if(w.type==='qigong'&&w.life>0&&Math.hypot(s.x-w.x,s.y-w.y)<w.r+s.r){burst(s.x,s.y,'#9eefff',10,170);w.hits--;shots.splice(i,1);wallBlocked=true;if(w.hits<=0)w.life=0;break}}if(wallBlocked)continue;let reflected=false;for(const w of walls){if(w.type!=='qigong'&&w.life>0&&Math.hypot(s.x-w.owner.x,s.y-w.owner.y)<w.r){s.team='hero';s.type='holy';const n=norm(boss.x-s.x,boss.y-s.y);const sp=Math.hypot(s.vx,s.vy)*1.25;s.vx=n.x*sp;s.vy=n.y*sp;s.damage*=1.25;s.homing=true;reflected=true;burst(s.x,s.y,'#f4eaff',12,180);break}}if(reflected)continue;for(const h of heroes){if(!h.dead&&Math.hypot(s.x-h.x,s.y-h.y)<s.r+h.r){h.hurt(s.damage,s.vx*.25,s.vy*.25);shots.splice(i,1);break}}}}}
function runeHitTarget(r,t){return t&&!t.dead&&t.hp>0&&Math.hypot(r.x-t.x,r.y-t.y)<r.r+t.r}
function clampRuneToArena(r){clampArena(r)}
function convertMinionToRuneShot(r,m){
 const n=boss&&!boss.dead?norm(boss.x-m.x,boss.y-m.y):{x:0,y:-1},type=r.kind==='fire'?'fire':r.kind==='ice'?'ice':'thunder',c=r.kind==='fire'?'#ff6b35':r.kind==='ice'?'#8ad9ff':'#ffe45c';
 shots.push({team:'hero',type,owner:r.owner,x:m.x,y:m.y,vx:n.x*460,vy:n.y*460,r:12,life:3.1,damage:118,homing:true,bossOnly:true});
 burst(m.x,m.y,c,20,260)
}
function triggerRune(r,target){const c=r.kind==='fire'?'#ff6b35':r.kind==='ice'?'#8ad9ff':'#ffe45c';if(r.kind==='fire'){if(target===boss)boss.hurt(245);else target.hp-=270;burst(r.x,r.y,c,48,500);shake=16}else if(r.kind==='ice'){if(target===boss){boss.hurt(48);let n=norm(boss.vx,boss.vy);if(Math.hypot(boss.vx,boss.vy)<55)n=norm(boss.x-r.x,boss.y-r.y);boss.runeSlide={dx:n.x||1,dy:n.y||0,time:2.2,flip:0}}else{target.hp-=72;target.vx*=.1;target.vy*=.1}burst(r.x,r.y,c,34,360);shake=9}else{if(target===boss){boss.hurt(118);boss.freezeStop=Math.max(boss.freezeStop,.48);boss.vx*=.12;boss.vy*=.12}else{target.hp-=135;target.vx=target.vy=0;target.cd=Math.max(target.cd,.55)}if(r.enhanced){const nearby=runes.filter(q=>q!==r).sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0];if(nearby){const n=norm(nearby.x-target.x,nearby.y-target.y),push=target===boss?210:255;target.vx+=n.x*push;target.vy+=n.y*push}}burst(r.x,r.y,c,30,320);shake=8}}
function updateRunes(dt){
 for(let i=runes.length-1;i>=0;i--){
  const r=runes[i];r.pulse+=dt*2.4;
  if(r.enhanced&&r.kind==='ice'&&boss&&!boss.dead&&!boss.runeSlide){
   const n=norm(boss.x-r.x,boss.y-r.y),speed=58;
   r.x+=n.x*speed*dt;r.y+=n.y*speed*dt;clampRuneToArena(r)
  }
  let target=null;
  if(!(r.enhanced&&r.kind==='ice'&&boss.runeSlide)&&runeHitTarget(r,boss))target=boss;
  else{
   const mi=minions.findIndex(m=>runeHitTarget(r,m));
   if(mi>=0){
    if(r.enhanced){const m=minions[mi];convertMinionToRuneShot(r,m);minions.splice(mi,1);continue}
    target=minions[mi]
   }
  }
  if(target){triggerRune(r,target);runes.splice(i,1)}
 }
 if(boss&&boss.runeSlide){
  const z=boss.runeSlide;z.time-=dt;z.flip+=dt*18;
  const beforeX=boss.x,beforeY=boss.y;boss.x+=z.dx*720*dt;boss.y+=z.dy*720*dt;
  clampArena(boss);
  const hit=Math.hypot(boss.x-beforeX-z.dx*720*dt,boss.y-beforeY-z.dy*720*dt)>.5;
  if(hit||z.time<=0){
   if(hit){boss.hurt(155);burst(boss.x,boss.y,'#c7efff',42,430);shake=18}
   boss.runeSlide=null
  }
 }
}
function updateMinions(dt){
 for(let i=minions.length-1;i>=0;i--){
  const m=minions[i];m.life-=dt;m.cd-=dt;
  if(m.life<=0||m.hp<=0){if(m.hp<=0)burst(m.x,m.y,'#b46cff',15,210);minions.splice(i,1);continue}
  const alive=heroes.filter(h=>!h.dead);if(!alive.length)continue;
  const t=alive.reduce((a,b)=>Math.hypot(a.x-m.x,a.y-m.y)<Math.hypot(b.x-m.x,b.y-m.y)?a:b);
  const n=norm(t.x-m.x,t.y-m.y),sp=m.strong?150:122;
  m.vx+=(n.x*sp-m.vx)*Math.min(1,dt*4.5);m.vy+=(n.y*sp-m.vy)*Math.min(1,dt*4.5);
  m.x+=m.vx*dt;m.y+=m.vy*dt;clampArena(m);
  const d=Math.hypot(t.x-m.x,t.y-m.y);
  if(d<m.r+t.r+5){
   const overlap=m.r+t.r+7-d;t.x+=n.x*Math.max(0,overlap);t.y+=n.y*Math.max(0,overlap);clampArena(t);
   if(m.cd<=0){t.hurt(m.damage,n.x*135,n.y*135);m.cd=m.strong?.7:.95}
  }
 }
}
function updateLasers(dt){
 for(let i=lasers.length-1;i>=0;i--){
  const l=lasers[i];l.life-=dt;
  if(!l.hit){
   l.hit=true;const ax=l.x,ay=l.y,bx=l.x+l.dx*1100,by=l.y+l.dy*1100;
   const hitLine=(x,y,r)=>{const vx=bx-ax,vy=by-ay,wx=x-ax,wy=y-ay,t=clamp((wx*vx+wy*vy)/(vx*vx+vy*vy),0,1),px=ax+vx*t,py=ay+vy*t;return Math.hypot(x-px,y-py)<r+l.width*.5};
   if(!boss.dead&&hitLine(boss.x,boss.y,boss.r)){
    boss.hurt(l.damage);
    if(l.knockback){boss.vx+=l.dx*l.knockback;boss.vy+=l.dy*l.knockback}
   }
   for(const m of minions)if(hitLine(m.x,m.y,m.r)){
    m.hp-=l.damage*.8;
    if(l.knockback){m.vx+=l.dx*l.knockback*1.2;m.vy+=l.dy*l.knockback*1.2}
   }
   burst(ax+l.dx*160,ay+l.dy*160,'#fff7ad',28,260);shake=13
  }
  if(l.life<=0)lasers.splice(i,1)
 }
}
function updateUI(){
 const alive=heroes.filter(x=>!x.dead),h=heroes[heroIndex],dBtn=document.getElementById('d');if(dBtn){const soloReady=alive.length===1;dBtn.innerHTML=soloReady?'<b>D</b>専用技':'<b>D</b>交代';dBtn.classList.toggle('soloReady',soloReady);}ui.stageNo.textContent='BOSS '+(bossIndex+1)+' / 5';ui.bossName.textContent=bossDefs[bossIndex].name;ui.bossFill.style.width=(boss.hp/boss.maxHp*100)+'%';ui.heroName.textContent=heroInfo[h.type].name;ui.ability.textContent=heroInfo[h.type].ability;ui.hpFill.style.width=(h.hp/h.maxHp*100)+'%';ui.hpText.textContent=Math.ceil(h.hp)+' / '+h.maxHp+' HP';
 document.querySelectorAll('.partyRow').forEach(row=>{const type=row.dataset.hero,hero=heroes.find(x=>x.type===type);row.hidden=!hero;if(!hero)return;const pct=Math.max(0,hero.hp/hero.maxHp*100),fill=ui.party[type+'Fill'],text=ui.party[type+'Text'];if(fill)fill.style.width=pct+'%';if(text)text.textContent=Math.ceil(hero.hp)+'/'+hero.maxHp;row.classList.toggle('active',hero===h);row.classList.toggle('dead',hero.dead)})
}
function enforceQigongWalls(){for(const w of walls){if(w.type!=='qigong'||w.life<=0)continue;const repel=e=>{if(!e||e.dead||e.hp<=0)return;let dx=e.x-w.x,dy=e.y-w.y,d=Math.hypot(dx,dy),min=w.r+(e.r||20);if(d<min){if(d<.001){dx=1;dy=0;d=1}e.x=w.x+dx/d*min;e.y=w.y+dy/d*min;const out=norm(dx,dy);e.vx=Math.max(e.vx||0,out.x*70);e.vy=Math.max(e.vy||0,out.y*70);clampArena(e)}};repel(boss);for(const m of minions)repel(m)}}
function update(dt){bloodBeams.length=0;const aliveNow=heroes.filter(h=>!h.dead);if(aliveNow.length&&heroes[heroIndex]?.dead)heroIndex=heroes.indexOf(aliveNow[0]);if(pressed.has('KeyI')){pressed.delete('KeyI');if(aliveNow.length===1)aliveNow[0].soloSkill();else nextHero()}if(heroes.every(h=>h.dead)){running=false;notice('PARTY DOWN','#ff7a86',1500);setTimeout(()=>ui.start.style.display='grid',1000);return}if(transition>0){transition-=dt;if(transition<=0){bossIndex++;if(bossIndex>=5){running=false;const firstAwaken=!isAwakeningUnlocked(),firstMonk=!isMonkUnlocked(),firstDragonKnight=!isDragonKnightUnlocked(),firstHighPriest=partyDeaths===0&&!isHighPriestUnlocked();if(firstAwaken){saveAwakeningUnlock();addAwakeningOption()}if(firstMonk){saveMonkUnlock();unlockMonkChoice()}if(firstDragonKnight){saveDragonKnightUnlock();unlockDragonKnightChoice()}if(firstHighPriest){saveHighPriestUnlock();unlockHighPriestChoice()}document.getElementById('loadStatus').textContent=firstHighPriest?'ノーデスクリア！ ハイプリーストが解放されました！':(firstAwaken||firstMonk||firstDragonKnight)?'覚醒無双モード・モンク・竜騎士が解放されました！':'クリア済み追加要素は解放済みです。';notice(firstHighPriest?'ハイプリースト 解放！':firstDragonKnight?'竜騎士 解放！':firstMonk?'モンク 解放！':firstAwaken?'覚醒無双モード 解放！':'ALL CHAMBERS CLEARED!','#fff08a',3000);setTimeout(()=>ui.start.style.display='grid',1800);bossIndex=0}else setupBattle()}return}heroes.forEach((h,i)=>h.update(dt,i));boss.update(dt);updateRunes(dt);updateShots(dt);updateMinions(dt);const dominator=heroes.find(h=>!h.dead&&h.type==='dracula'&&h.dominationTime>0);if(dominator&&boss&&!boss.dead){for(let i=minions.length-1;i>=0;i--){const m=minions[i];dominator.summonBats(1,m.x,m.y,42);burst(m.x,m.y,'#8f244c',12,160);minions.splice(i,1)}}enforceQigongWalls();updateLasers(dt);for(let i=walls.length-1;i>=0;i--){walls[i].life-=dt;if(walls[i].life<=0)walls.splice(i,1)}for(let i=slashes.length-1;i>=0;i--){slashes[i].life-=dt;if(slashes[i].life<=0)slashes.splice(i,1)}for(let i=fistTrails.length-1;i>=0;i--){const f=fistTrails[i];f.life-=dt;f.x+=f.dx*90*dt;f.y+=f.dy*90*dt;if(f.life<=0)fistTrails.splice(i,1)}for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;if(p.life<=0)particles.splice(i,1)}for(let i=holyFx.length-1;i>=0;i--){holyFx[i].life-=dt;if(holyFx[i].life<=0)holyFx.splice(i,1)}for(let i=holyDots.length-1;i>=0;i--){const d=holyDots[i];d.life-=dt;d.tick+=dt;if(!d.target||d.target.dead||d.target.hp<=0||d.life<=0){holyDots.splice(i,1);continue}while(d.tick>=.25){d.tick-=.25;if(d.target===boss)d.target.hurt(d.rate*.25);else d.target.hp-=d.rate*.25}}updateUI();released.clear()}
function drawDoor(x,dir){ctx.save();ctx.translate(x,525);ctx.fillStyle='#171b22';ctx.fillRect(dir<0?-55:0,-105,55,210);ctx.strokeStyle='#9d8a5c';ctx.lineWidth=9;ctx.strokeRect(dir<0?-55:0,-105,55,210);ctx.strokeStyle='#514833';ctx.lineWidth=6;for(let y=-72;y<=72;y+=36){ctx.beginPath();ctx.moveTo(dir<0?-49:6,y);ctx.lineTo(dir<0?-6:49,y);ctx.stroke()}ctx.fillStyle='#d7b85e';ctx.beginPath();ctx.arc(dir<0?-16:16,0,8,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#888';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(dir<0?-52:3,-70);ctx.lineTo(dir<0?-3:52,70);ctx.moveTo(dir<0?-3:52,-70);ctx.lineTo(dir<0?-52:3,70);ctx.stroke();ctx.restore()}
function drawArena(){ctx.fillStyle='#11141a';ctx.fillRect(0,0,W,H);const g=ctx.createRadialGradient(500,520,100,500,520,580);g.addColorStop(0,'#4b4944');g.addColorStop(1,'#25272b');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(250,120);ctx.lineTo(750,120);ctx.lineTo(930,300);ctx.lineTo(930,750);ctx.lineTo(750,930);ctx.lineTo(250,930);ctx.lineTo(70,750);ctx.lineTo(70,300);ctx.closePath();ctx.fill();ctx.strokeStyle='#b6a472';ctx.lineWidth=16;ctx.stroke();ctx.strokeStyle='#ffffff24';ctx.lineWidth=4;ctx.beginPath();ctx.arc(500,525,95,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(500,135);ctx.lineTo(500,915);ctx.stroke();for(let i=0;i<20;i++){const a=i*2.399,r=170+(i%5)*65;ctx.fillStyle='#ffffff12';ctx.beginPath();ctx.arc(500+Math.cos(a)*r,525+Math.sin(a)*r,4+(i%3)*2,0,Math.PI*2);ctx.fill()}drawDoor(72,-1);drawDoor(928,1)}
function draw(){
 ctx.save();
 if(shake>0){ctx.translate(rnd(-shake,shake),rnd(-shake,shake));shake*=.84}
 drawArena();
 if(!boss||!heroes.length){ctx.restore();ctx.globalAlpha=1;return}
 for(const r of runes){const p=.5+.5*Math.sin(r.pulse),col=r.kind==='fire'?'#ff6b35':r.kind==='ice'?'#74d4ff':'#ffe45c';ctx.save();ctx.translate(r.x,r.y);ctx.globalAlpha=.13+.07*p;ctx.strokeStyle=col;ctx.lineWidth=3;ctx.shadowBlur=8;ctx.shadowColor=col;ctx.beginPath();ctx.arc(0,0,r.r,0,Math.PI*2);ctx.stroke();ctx.rotate(r.pulse*.18);ctx.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;ctx.moveTo(Math.cos(a)*12,Math.sin(a)*12);ctx.lineTo(Math.cos(a)*r.r*.72,Math.sin(a)*r.r*.72)}ctx.stroke();ctx.restore()}
 for(const w of walls){
 const wx=w.type==='qigong'?w.x:w.owner.x,wy=w.type==='qigong'?w.y:w.owner.y;ctx.save();ctx.translate(wx,wy);
 const pulse=1+Math.sin(performance.now()/110)*.03;ctx.scale(pulse,pulse);
 if(w.type==='qigong'){const ratio=Math.max(0,w.hits/w.maxHits);ctx.globalAlpha=.09+.08*ratio;ctx.fillStyle='#7feaff';ctx.beginPath();ctx.arc(0,0,w.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.72;ctx.strokeStyle='#b9f7ff';ctx.shadowBlur=18;ctx.shadowColor='#59dfff';ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,w.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.38;ctx.lineWidth=3;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,w.r-18-k*18,(performance.now()/900+k)*.7,(performance.now()/900+k)*.7+Math.PI*1.25);ctx.stroke()}ctx.globalAlpha=.8;ctx.fillStyle='#d8fbff';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText(`${Math.max(0,w.hits)}/30`,0,-w.r-12)}else{ctx.globalAlpha=.20;ctx.fillStyle='#eadcff';ctx.beginPath();ctx.arc(0,0,w.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.82;ctx.strokeStyle='#f3e8ff';ctx.lineWidth=10;ctx.beginPath();ctx.arc(0,0,w.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.42;ctx.strokeStyle='#b78cff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,w.r-14,0,Math.PI*2);ctx.stroke()}
 ctx.restore()
}
 for(const m of minions){
 ctx.save();ctx.globalAlpha=.22;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(m.x,m.y+15,m.r+7,8,0,0,Math.PI*2);ctx.fill();
 ctx.globalAlpha=1;ctx.fillStyle=m.strong?'#77248f':'#4f3269';ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#ff73dd';ctx.beginPath();ctx.arc(m.x-7,m.y-5,3,0,Math.PI*2);ctx.arc(m.x+7,m.y-5,3,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#17131d';ctx.fillRect(m.x-m.r,m.y-m.r-10,m.r*2,5);ctx.fillStyle='#c77cff';ctx.fillRect(m.x-m.r,m.y-m.r-10,m.r*2*Math.max(0,m.hp/m.maxHp),5);ctx.restore()
}
boss.draw();heroes.forEach((h,i)=>h.draw(i));
 for(const s of shots){ctx.save();ctx.translate(s.x,s.y);ctx.fillStyle=s.type==='fire'?'#ff7c36':s.type==='freeze'||s.type==='ice'?'#aeefff':s.type==='thunder'?'#ffe45c':s.type==='holy'?'#fff6a8':s.type==='ki'?'#7dffd8':s.type==='qigong'?'#ffd36a':s.type==='dragonfire'?'#ff6a32':s.type==='darkblade'?'#b066ff':'#ff725e';ctx.shadowBlur=s.type==='holy'?22:12;ctx.shadowColor=ctx.fillStyle;if(s.type==='bat'){const a=Math.atan2(s.vy,s.vx);ctx.rotate(a);ctx.fillStyle='#46132d';ctx.strokeStyle='#d8517d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-14,0);ctx.quadraticCurveTo(-6,-12,0,-3);ctx.quadraticCurveTo(6,-12,14,0);ctx.quadraticCurveTo(7,7,0,3);ctx.quadraticCurveTo(-7,7,-14,0);ctx.fill();ctx.stroke();ctx.fillStyle='#ff5b83';ctx.beginPath();ctx.arc(2,-1,2,0,Math.PI*2);ctx.fill()}else if(s.type==='shuriken'){const a=Math.atan2(s.vy,s.vx)+performance.now()/80;ctx.rotate(a);ctx.fillStyle='#dce8ff';ctx.strokeStyle='#5f7fae';ctx.lineWidth=2;for(let k=0;k<4;k++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(18,5);ctx.lineTo(8,0);ctx.lineTo(18,-5);ctx.closePath();ctx.fill();ctx.stroke()}}else if(s.type==='darkblade'&&s.crescent){const a=Math.atan2(s.vy,s.vx);ctx.rotate(a);ctx.strokeStyle='#c084fc';ctx.lineWidth=Math.max(10,s.r*.55);ctx.lineCap='round';ctx.beginPath();ctx.arc(0,0,s.r*1.35,-1.08,1.08);ctx.stroke();ctx.strokeStyle='#f0d9ff';ctx.lineWidth=Math.max(3,s.r*.16);ctx.beginPath();ctx.arc(0,0,s.r*1.34,-1.03,1.03);ctx.stroke()}else{ctx.beginPath();ctx.arc(0,0,s.r,0,Math.PI*2);ctx.fill()}ctx.restore()}
 for(const f of fistTrails){const k=clamp(f.life/f.max,0,1),ang=Math.atan2(f.dy,f.dx);ctx.save();ctx.translate(f.x,f.y);ctx.rotate(ang);ctx.globalAlpha=k*(f.finisher?.95:.82);ctx.scale(f.scale,f.scale);ctx.shadowBlur=f.finisher?22:12;ctx.shadowColor='#fff1bd';ctx.fillStyle='#fffdf5';ctx.strokeStyle='#b8c3cc';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-31,-12,30,24,7);ctx.fill();ctx.stroke();ctx.strokeStyle='#9eaab4';ctx.lineWidth=2;for(let b=-25;b<=-7;b+=7){ctx.beginPath();ctx.moveTo(b,-10);ctx.lineTo(b+4,10);ctx.stroke()}ctx.fillStyle='#fffdf5';ctx.beginPath();ctx.ellipse(9,0,f.finisher?24:20,f.finisher?21:17,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(16,8,f.finisher?9:7,.15,Math.PI*1.35);ctx.stroke();ctx.strokeStyle='#d5dde3';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-9);ctx.quadraticCurveTo(8,-14,18,-8);ctx.moveTo(2,-2);ctx.quadraticCurveTo(12,-7,23,-1);ctx.stroke();ctx.restore()}
 for(const q of holyFx){const k=clamp(q.life/q.max,0,1);ctx.save();ctx.translate(q.x,q.y);ctx.globalAlpha=k*.85;ctx.strokeStyle='#fff2a8';ctx.shadowBlur=24;ctx.shadowColor='#ffe066';ctx.lineWidth=q.wide?28:(q.big?16:11);if(q.type==='cross'){ctx.beginPath();ctx.moveTo(-q.r,0);ctx.lineTo(q.r,0);ctx.moveTo(0,-q.r);ctx.lineTo(0,q.r);ctx.stroke()}else{ctx.beginPath();ctx.arc(0,0,q.r*(1.15-k*.15),0,Math.PI*2);ctx.stroke()}ctx.restore()}
 for(const q of slashes){const k=clamp(q.life/q.max,0,1);ctx.save();ctx.translate(q.x,q.y);if(q.dragonThrust)ctx.rotate(q.angle||0);else ctx.scale(q.side||1,1);ctx.globalAlpha=k;ctx.strokeStyle='#edf7ff';ctx.lineWidth=15*k+4;if(q.magic){ctx.strokeStyle='#c084fc';ctx.shadowBlur=18;ctx.shadowColor='#a855f7'}if(q.ninjaDash){ctx.strokeStyle='#9fc5ff';ctx.shadowBlur=18;ctx.shadowColor='#6ea0ff';ctx.lineWidth=18*k+5;ctx.beginPath();ctx.moveTo(-q.length/2,0);ctx.lineTo(q.length/2,0);ctx.stroke();ctx.strokeStyle='#f4f8ff';ctx.lineWidth=5;ctx.stroke()}else if(q.dragonThrust){const len=q.length||285,tail=-len*.5,tip=len*.5;ctx.shadowBlur=20;ctx.shadowColor='#55bfff';ctx.lineCap='round';ctx.globalAlpha=k*.32;ctx.strokeStyle='#8edaff';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(tail,12);ctx.lineTo(tip-18,1);ctx.stroke();ctx.globalAlpha=k*.48;ctx.strokeStyle='#bcecff';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(tail-12,-10);ctx.lineTo(tip-7,-1);ctx.stroke();ctx.globalAlpha=k;ctx.fillStyle='#eafbff';ctx.beginPath();ctx.moveTo(tail,0);ctx.lineTo(tip-30,-8);ctx.lineTo(tip,0);ctx.lineTo(tip-30,8);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(tail+12,0);ctx.lineTo(tip-5,0);ctx.stroke()}else if(q.spin){ctx.beginPath();ctx.arc(0,0,145,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=q.magic?'#e9d5ff':'#9edbff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,122,0,Math.PI*2);ctx.stroke()}else{ctx.beginPath();ctx.arc(0,0,96,-1.05,1.05);ctx.stroke();ctx.strokeStyle=q.magic?'#e9d5ff':'#9edbff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,113,-.9,.9);ctx.stroke()}ctx.restore()}
 for(const l of bloodBeams){ctx.save();ctx.globalAlpha=.9;ctx.strokeStyle=l.hit?'#d41446':'#8d1738';ctx.shadowBlur=6;ctx.shadowColor='#ff174f';ctx.lineCap='round';ctx.lineWidth=l.width;ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x+l.dx*760,l.y+l.dy*760);ctx.stroke();ctx.strokeStyle='#ff9ab3';ctx.lineWidth=Math.max(1,l.width*.32);ctx.stroke();ctx.restore()}
 for(const l of lasers){const k=clamp(l.life/l.max,0,1);ctx.save();ctx.globalAlpha=.45+.5*k;ctx.strokeStyle='#fffbd0';ctx.shadowBlur=28;ctx.shadowColor='#fff4a8';ctx.lineWidth=l.width*k+8;ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x+l.dx*1100,l.y+l.dy*1100);ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(4,l.width*.32*k);ctx.stroke();ctx.restore()}
 for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}
 ctx.restore();ctx.globalAlpha=1
}
let fatalErrorShown=false;
function showRuntimeError(err){
 console.error(err);
 if(fatalErrorShown)return;
 fatalErrorShown=true;running=false;
 const msg=err&&err.message?err.message:String(err);
 notice('エラーを検出しました: '+msg,'#ff8f9b',5000);
 const status=document.getElementById('loadStatus');
 if(status)status.textContent='動作エラー: '+msg+'（ページ再読込後も出る場合はこの表示をお知らせください）';
 setTimeout(()=>{ui.start.style.display='grid'},500);
}
window.addEventListener('error',e=>showRuntimeError(e.error||new Error(e.message)));
window.addEventListener('unhandledrejection',e=>showRuntimeError(e.reason||new Error('Promise error')));
function loop(t){
 const dt=Math.min(.033,(t-last)/1000||0);last=t;
 try{if(running)update(dt);draw()}catch(err){showRuntimeError(err)}
 requestAnimationFrame(loop)
}
addEventListener('keydown',e=>{if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault()});addEventListener('keyup',e=>{keys.delete(e.code);released.add(e.code)});
const joyEl=document.getElementById('joystick'),stick=document.getElementById('stick');function joyMove(e){const r=joyEl.getBoundingClientRect(),p=[...e.changedTouches].find(t=>t.identifier===joy.id);if(!p)return;let x=p.clientX-(r.left+r.width/2),y=p.clientY-(r.top+r.height/2),d=Math.hypot(x,y),m=r.width*.34;if(d>m){x=x/d*m;y=y/d*m}joy.x=x/m;joy.y=y/m;stick.style.transform=`translate(${x}px,${y}px)`}joyEl.addEventListener('touchstart',e=>{const t=e.changedTouches[0];joy.id=t.identifier;joyMove(e);e.preventDefault()},{passive:false});joyEl.addEventListener('touchmove',e=>{joyMove(e);e.preventDefault()},{passive:false});joyEl.addEventListener('touchend',e=>{joy.x=joy.y=0;joy.id=null;stick.style.transform='translate(0,0)';e.preventDefault()},{passive:false});
document.querySelectorAll('.tb').forEach(b=>{const code=b.dataset.key;const down=e=>{if(!keys.has(code))pressed.add(code);keys.add(code);b.classList.add('active');e.preventDefault()},up=e=>{if(keys.has(code))released.add(code);keys.delete(code);b.classList.remove('active');e.preventDefault?.()};b.addEventListener('touchstart',down,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});b.addEventListener('mousedown',down);b.addEventListener('mouseup',up);b.addEventListener('mouseleave',e=>{if(e.buttons===0)up(e)});b.addEventListener('contextmenu',e=>e.preventDefault())});
addEventListener('blur',()=>resetCombatInput());document.addEventListener('visibilitychange',()=>{if(document.hidden)resetCombatInput()});
const playButton=document.getElementById('play');
const modeSelect=document.getElementById('partyMode'),partyChoices=[...document.querySelectorAll('.partyChoice')],startChoices=[...document.querySelectorAll('input[name="startHero"]')];
function addAwakeningOption(){if([...modeSelect.options].some(o=>o.value==='awakening'))return;const o=document.createElement('option');o.value='awakening';o.textContent='覚醒無双モード（1人・CTなし・大量召喚）';modeSelect.appendChild(o)}
function unlockHighPriestChoice(){document.querySelectorAll('[data-hero="highpriest"],input[value="highpriest"]').forEach(el=>{el.disabled=false;el.closest('label')?.classList.remove('disabled')});const b=document.querySelector('.partyChoice[data-hero="highpriest"]');if(b){b.classList.remove('unlockLocked');b.textContent='ハイプリースト'}}
function unlockDragonKnightChoice(){document.querySelectorAll('[data-hero="dragonknight"],input[value="dragonknight"]') .forEach(el=>{el.disabled=false;el.closest('label')?.classList.remove('disabled')});const b=document.querySelector('.partyChoice[data-hero="dragonknight"]');if(b){b.classList.remove('unlockLocked');b.textContent='竜騎士'}}
function unlockDraculaChoice(){document.querySelectorAll('[data-hero="dracula"],input[value="dracula"]').forEach(el=>{el.disabled=false;el.closest('label')?.classList.remove('disabled')});const b=document.querySelector('.partyChoice[data-hero="dracula"]');if(b){b.classList.remove('unlockLocked');b.textContent='ドラキュラ'}}
function unlockMonkChoice(){document.querySelectorAll('[data-hero="monk"],input[value="monk"]').forEach(el=>{el.disabled=false;el.closest('label')?.classList.remove('disabled')});const b=document.querySelector('.partyChoice[data-hero="monk"]');if(b){b.classList.remove('unlockLocked');b.textContent='モンク'}}
if(isAwakeningUnlocked()){addAwakeningOption();document.getElementById('loadStatus').textContent='覚醒無双モード解放済み。敵強化・CTなし・手下最大28体。'}
if(isMonkUnlocked())unlockMonkChoice();
if(isDragonKnightUnlocked())unlockDragonKnightChoice();
if(isHighPriestUnlocked())unlockHighPriestChoice();
if(isDraculaUnlocked())unlockDraculaChoice();
function syncPartySetup(){
 const awakening=modeSelect.value==='awakening',need=awakening?1:Number(modeSelect.value);
 let chosen=partyChoices.filter(b=>b.classList.contains('selected'));
 while(chosen.length>need){chosen.pop().classList.remove('selected');chosen=partyChoices.filter(b=>b.classList.contains('selected'))}
 for(const b of partyChoices)b.classList.toggle('locked',!b.classList.contains('selected')&&chosen.length>=need);
 selectedTypes=partyChoices.filter(b=>b.classList.contains('selected')).map(b=>b.dataset.hero);
 for(const radio of startChoices){radio.disabled=!selectedTypes.includes(radio.value);radio.closest('label').classList.toggle('disabled',radio.disabled)}
 if(!selectedTypes.includes(selectedStartType))selectedStartType=selectedTypes[0]||'knight';
 const radio=startChoices.find(r=>r.value===selectedStartType);if(radio)radio.checked=true;
 playButton.disabled=selectedTypes.length!==need;
 document.getElementById('setupStatus').textContent=selectedTypes.length===need?(awakening?`覚醒無双：${heroInfo[selectedTypes[0]].name}（敵HP1.7倍・攻撃強化・CTなし・手下最大28体）`:`${need}人編成：${selectedTypes.map(t=>heroInfo[t].name).join('・')}`):`キャラクターを${need}人選んでください`
}
modeSelect.addEventListener('change',()=>{const awakening=modeSelect.value==='awakening',need=awakening?1:Number(modeSelect.value);partyChoices.forEach((b,i)=>b.classList.toggle('selected',i<need));selectedStartType=partyChoices.find(b=>b.classList.contains('selected'))?.dataset.hero||'knight';syncPartySetup()});
partyChoices.forEach(b=>b.addEventListener('click',()=>{
 if(b.classList.contains('unlockLocked')){document.getElementById('setupStatus').textContent=b.dataset.hero==='highpriest'?'ハイプリーストは、どのモードでも全員生存でクリアすると解放されます':b.dataset.hero==='dragonknight'?'竜騎士は通常モードを1回クリアすると解放されます':b.dataset.hero==='dracula'?'ドラキュラはステージ2をヒーラー／ハイプリーストだけで撃破すると解放されます':'モンクは通常モードを1回クリアすると解放されます';return}
 const awakening=modeSelect.value==='awakening',need=awakening?1:Number(modeSelect.value),selected=b.classList.contains('selected');
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
let startingGame=false,lastStartRequest=0;
function startGame(e){
 if(e){e.preventDefault?.();e.stopPropagation?.()}
 const now=performance.now();if(startingGame||now-lastStartRequest<250)return;lastStartRequest=now;
 syncPartySetup();
 const awakening=modeSelect.value==='awakening',need=awakening?1:Number(modeSelect.value),chosen=partyChoices.filter(b=>b.classList.contains('selected'));
 if(chosen.length!==need){document.getElementById('setupStatus').textContent=`キャラクターを${need}人選んでください`;return}
 startingGame=true;playButton.textContent='開始しています…';document.getElementById('loadStatus').textContent='ボス部屋を準備しています…';
 partyDeaths=0;awakeningSoloCarry=null;awakenedMode=awakening;
 const launch=()=>{try{bossIndex=0;transition=0;setupBattle();running=true;last=performance.now();ui.notice.style.opacity=0;ui.start.style.display='none';playButton.disabled=false;playButton.textContent='ボス部屋へ入る';startingGame=false}catch(err){running=false;ui.start.style.display='grid';playButton.disabled=false;playButton.textContent='ボス部屋へ入る';startingGame=false;const status=document.getElementById('loadStatus');status.textContent='開始エラー: '+(err&&err.message?err.message:String(err));console.error(err)}};
 requestAnimationFrame(launch);setTimeout(()=>{if(startingGame)launch()},180);
}
window.__bossRushStart=startGame;
['click','pointerup','touchend'].forEach(type=>playButton.addEventListener(type,startGame,{passive:false}));
addEventListener('keydown',e=>{if(!running&&ui.start.style.display!=='none'&&(e.code==='Enter'||e.code==='Space'))startGame(e)});
loadSprites();requestAnimationFrame(loop);
})();