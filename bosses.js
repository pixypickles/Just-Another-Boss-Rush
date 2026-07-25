function pointSegmentDistance(px,py,x1,y1,x2,y2){const vx=x2-x1,vy=y2-y1,wx=px-x1,wy=py-y1,c1=vx*wx+vy*wy,c2=vx*vx+vy*vy,t=c2?clamp(c1/c2,0,1):0;return Math.hypot(px-(x1+vx*t),py-(y1+vy*t))}
class Boss{
 constructor(def){const partyScale=def.kind==='bushin'?([0,1,1.7,2.4][selectedTypes.length]||2.4):1;const hp=Math.round(def.hp*partyScale*(awakenedMode?1.7:1)),speed=def.speed*(awakenedMode?1.12:1);Object.assign(this,{...def,hp,maxHp:hp,speed,x:def.kind==='bushin'?700:735,y:510,vx:0,vy:0,r:def.kind==='bushin'?38:def.kind==='foxtrio'?48:def.kind==='dragon'?82:def.kind==='cerberus'?76:def.kind==='troll'?70:64,cd:1.1,attack:0,volley:0,slow:0,freezeStop:0,dead:false,phase:0,inv:0,touchCd:0,foxFormationTime:0,foxFormationStep:0,bushinState:'idle',bushinTimer:1.0,bushinAir:0,bushinKick:false,bushinLine:null,bushinHitDone:false,bushinStart:null,bushinTarget:null,bushinKickDirX:1,bushinCounterTarget:null,bushinCounterTriggered:false,bushinEcho:null,bushinEchoLife:0})}
 damage(n){return enemyDamage(n)*(this.kind==='demonking'?1.08:this.kind==='foxtrio'?1.18:1)}
 hurt(n){if(this.dead)return false;if(this.kind==='bushin'){if(this.bushinEcho&&this.bushinEchoLife>0){ctx.save();const wob=Math.sin(performance.now()/48)*5;ctx.globalAlpha=.16+.18*(this.bushinEchoLife/.55);drawSprite(sprites.boss_bushin,this.bushinEcho.x+wob,this.bushinEcho.y,112,126,flip,.35,0);ctx.restore()}
  if(this.bushinState==='counterStance'){this.triggerBushinCounter();return false}if(this.bushinAir>0||this.bushinState==='counterVanish'||this.bushinState==='counterRise'||this.bushinState==='counterPause'||this.bushinState==='counterDive')return false}this.inv=.12;this.hp-=n;burst(this.x,this.y,'#ffd29d',5,150);if(this.hp<=0){this.hp=0;this.dead=true;bossDefeated()}return true}
 update(dt){if(this.dead)return;if(this.kind==='bushin'){this.updateBushin(dt);return}this.inv=Math.max(0,this.inv-dt);this.cd-=dt;this.attack=Math.max(0,this.attack-dt);this.volley=Math.max(0,this.volley-dt);this.slow=Math.max(0,this.slow-dt);this.freezeStop=Math.max(0,this.freezeStop-dt);this.touchCd=Math.max(0,this.touchCd-dt);if(this.kind==='foxtrio'){this.foxFormationTime+=dt;if(this.foxFormationTime>=2.6){this.foxFormationTime-=2.6;this.foxFormationStep=(this.foxFormationStep+1)%3}}const alive=heroes.filter(h=>!h.dead);if(!alive.length)return;const target=alive.sort((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)-Math.hypot(b.x-this.x,b.y-this.y))[0],n=norm(target.x-this.x,target.y-this.y),d=Math.hypot(target.x-this.x,target.y-this.y);let mx=0,my=0,sp=this.speed;if(this.kind==='foxtrio'){if(d<235){mx=-n.x*.82;my=-n.y*.82}else{mx=-n.y*.8;my=n.x*.8}sp*=1.05}else if(this.kind==='troll'){mx=n.x;my=n.y;sp*=1.08}else if(this.kind==='cerberus'){if(d>205){mx=n.x;my=n.y}else if(d<125){mx=-n.x*.55;my=-n.y*.55}else{mx=-n.y*.42;my=n.x*.42}}else{const pref=this.kind==='dracula'?350:this.kind==='dragon'?330:370;if(d<pref-65){mx=-n.x;my=-n.y}else if(d>pref+70){mx=n.x*.45;my=n.y*.45}else{const side=Math.sin(performance.now()/650+bossIndex)>0?1:-1;mx=-n.y*.55*side;my=n.x*.55*side}sp*=this.kind==='dracula'?.72:this.kind==='dragon'?.62:.68}if(this.freezeStop>0){mx=my=0;sp=0}else if(this.slow>0)sp*=.38;this.vx+=(mx*sp-this.vx)*Math.min(1,dt*(this.kind==='troll'?4.2:2.6));this.vy+=(my*sp-this.vy)*Math.min(1,dt*(this.kind==='troll'?4.2:2.6));if(d<this.r+target.r+10){
 const minD=this.r+target.r+12,overlap=Math.max(0,minD-d);
 target.x+=n.x*(overlap*.72+4);target.y+=n.y*(overlap*.72+4);
 this.x-=n.x*(overlap*.28+2);this.y-=n.y*(overlap*.28+2);
 clampArena(target);clampArena(this);
 if(this.touchCd<=0){target.hurt(this.damage(52+bossIndex*10),n.x*250,n.y*250);this.touchCd=.62}
 this.vx-=n.x*70;this.vy-=n.y*70
}if(this.cd<=0&&this.freezeStop<=0){this.special(target);this.cd=(this.kind==='foxtrio'?.72:this.kind==='troll'?1.75:this.kind==='dracula'?1.8:this.kind==='cerberus'?1.55:this.kind==='dragon'?1.4:Math.max(.82,1.25-this.phase*.015))*(awakenedMode?.82:1)}this.x+=this.vx*dt;this.y+=this.vy*dt;clampArena(this)}
 updateBushin(dt){
  this.inv=Math.max(0,this.inv-dt);this.touchCd=Math.max(0,this.touchCd-dt);this.bushinTimer-=dt;this.bushinEchoLife=Math.max(0,this.bushinEchoLife-dt);
  const alive=heroes.filter(h=>!h.dead);if(!alive.length)return;
  const target=alive.reduce((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)<Math.hypot(b.x-this.x,b.y-this.y)?a:b);
  const n=norm(target.x-this.x,target.y-this.y),d=Math.hypot(target.x-this.x,target.y-this.y);
  if(this.bushinState==='idle'){
   this.bushinAir=0;this.bushinKick=false;this.bushinLine=null;
   const desired=d>175?1:d<105?-0.55:0;this.vx+=(n.x*this.speed*desired-this.vx)*Math.min(1,dt*5);this.vy+=(n.y*this.speed*desired-this.vy)*Math.min(1,dt*5);
   this.x+=this.vx*dt;this.y+=this.vy*dt;clampArena(this);
   if(this.bushinTimer<=0){const r=Math.random();if(r<.18)this.startBushinCounter(target);else if(d<165&&r<.52)this.startBushinPunch(target);else if(r<.77)this.startBushinJump(target);else this.startBushinLine(target)}
   return
  }
  this.vx*=.82;this.vy*=.82;
  if(this.bushinState==='punchWindup'&&this.bushinTimer<=0){
   this.bushinState='punchRecover';this.bushinTimer=.38;const aim=norm(target.x-this.x,target.y-this.y);fistAfterimage(this.x+aim.x*48,this.y-42+aim.y*48,aim.x,aim.y,1.35,true,true);
   if(Math.hypot(target.x-this.x,target.y-this.y)<148){target.hurt(this.damage(72),aim.x*430,aim.y*430);shake=12}burst(this.x+aim.x*60,this.y+aim.y*35,'#fff1bd',12,210)
  }else if(this.bushinState==='punchRecover'&&this.bushinTimer<=0){this.finishBushinAction(.65)}
  else if(this.bushinState==='jumpRise'){
   const p=clamp(1-this.bushinTimer/.38,0,1);this.bushinAir=Math.sin(p*Math.PI/2)*150;
   if(this.bushinTimer<=0){this.bushinState='jumpPause';this.bushinTimer=.13;this.bushinAir=150;this.bushinTarget={x:target.x,y:target.y};this.bushinStart={x:this.x,y:this.y}}
  }else if(this.bushinState==='jumpPause'&&this.bushinTimer<=0){this.bushinState='jumpDive';this.bushinTimer=.34;this.bushinKick=true;this.bushinKickDirX=(this.bushinTarget.x-this.bushinStart.x)||1;this.bushinHitDone=false}
  else if(this.bushinState==='jumpDive'){
   const p=clamp(1-this.bushinTimer/.34,0,1),e=1-Math.pow(1-p,2);this.x=this.bushinStart.x+(this.bushinTarget.x-this.bushinStart.x)*e;this.y=this.bushinStart.y+(this.bushinTarget.y-this.bushinStart.y)*e;this.bushinAir=150*(1-e);clampArena(this);
   if(!this.bushinHitDone&&p>.56){this.bushinHitDone=true;for(const h of heroes)if(!h.dead&&Math.hypot(h.x-this.x,h.y-this.y)<92+h.r){const k=norm(h.x-this.x,h.y-this.y);h.hurt(this.damage(96),k.x*520,k.y*520)}}
   if(this.bushinTimer<=0){burst(this.x,this.y,'#d8c09a',28,390);shake=18;this.finishBushinAction(.82)}
  }else if(this.bushinState==='lineTelegraph'&&this.bushinTimer<=0){
   this.bushinState='lineKick';this.bushinTimer=.16;this.bushinKick=true;const l=this.bushinLine;this.bushinKickDirX=(l.x2-l.x1)||1;this.x=l.x2;this.y=l.y2;clampArena(this);
   for(const h of heroes)if(!h.dead&&pointSegmentDistance(h.x,h.y,l.x1,l.y1,l.x2,l.y2)<30+h.r){const dir=norm(l.x2-l.x1,l.y2-l.y1);h.hurt(Math.max(this.damage(110),h.maxHp*.95),dir.x*720,dir.y*720)}shake=24
  }else if(this.bushinState==='lineKick'&&this.bushinTimer<=0){this.finishBushinAction(1.0)}
  else if(this.bushinState==='counterStance'){
   this.vx=this.vy=0;this.slow=0;this.freezeStop=0;
   if(this.bushinTimer<=0)this.finishBushinAction(.75)
  }else if(this.bushinState==='counterVanish'&&this.bushinTimer<=0){
   const t=this.bushinCounterTarget&&!this.bushinCounterTarget.dead?this.bushinCounterTarget:target,face=t.facing&&Math.hypot(t.facing.x,t.facing.y)>.1?t.facing:norm(t.x-this.x,t.y-this.y);this.bushinState='counterStrike';this.bushinTimer=.2;this.bushinKick=true;this.bushinKickDirX=face.x||1;this.x=clamp(t.x-face.x*82,100,900);this.y=clamp(t.y-face.y*82,150,900);this.bushinAir=0;const k=norm(t.x-this.x,t.y-this.y);t.hurt(this.damage(112),k.x*690,k.y*690);shake=22;burst(this.x,this.y,'#bdeeff',25,360)
  }else if(this.bushinState==='counterStrike'&&this.bushinTimer<=0){this.finishBushinAction(1.05)}
 }
 startBushinCounter(target){this.bushinState='counterStance';this.bushinTimer=.9;this.bushinCounterTarget=target;this.bushinCounterTriggered=false;this.vx=this.vy=0;this.slow=this.freezeStop=0;notice('青の構え――攻撃するな！','#9bdcff',760)}
 triggerBushinCounter(){if(this.bushinCounterTriggered)return;this.bushinCounterTriggered=true;this.bushinEcho={x:this.x,y:this.y};this.bushinEchoLife=.55;this.bushinState='counterVanish';this.bushinTimer=.09;this.bushinAir=0;this.bushinKick=false;this.vx=this.vy=0;this.slow=this.freezeStop=0;burst(this.x,this.y,'#8fd8ff',38,360);notice('見切られた！ 武神の反撃！','#b8e8ff',720)}
 startBushinPunch(target){this.bushinState='punchWindup';this.bushinTimer=.24;this.vx=this.vy=0;this.attack=.3}
 startBushinJump(target){this.bushinState='jumpRise';this.bushinTimer=.38;this.bushinAir=1;this.vx=this.vy=0;notice('武神が跳躍した！','#ffe7a8',520)}
 startBushinLine(target){const dir=norm(target.x-this.x,target.y-this.y),len=1050;this.bushinLine={x1:this.x,y1:this.y,x2:this.x+dir.x*len,y2:this.y+dir.y*len};this.bushinState='lineTelegraph';this.bushinTimer=.72;this.vx=this.vy=0;notice('神速飛び蹴り――赤線から離れろ！','#ff8a94',720)}
 finishBushinAction(delay){this.bushinState='idle';this.bushinTimer=delay;this.bushinAir=0;this.bushinKick=false;this.bushinLine=null;this.bushinCounterTarget=null;this.bushinCounterTriggered=false;this.attack=0}
 foxPositions(target){
  // 画面を上・中・下の3帯に分け、三影が同じ高さへ固まらないようにする。
  // 数秒ごとに担当帯を交代するが、各個体は担当帯の範囲内だけで動く。
  const now=performance.now(),laneCenters=[270,525,780],laneHalf=92;
  const order=[[0,1,2],[1,2,0],[2,0,1]][this.foxFormationStep]||[0,1,2];
  const baseX=target?target.x:this.x,xOffsets=[-165,0,165];
  return order.map((laneIndex,role)=>{
   const bob=Math.sin(now/(205+role*27)+role*2.15)*24;
   const drift=Math.sin(now/(430+role*35)+role*1.7)*58;
   const laneY=clamp(laneCenters[laneIndex]+bob,laneCenters[laneIndex]-laneHalf,laneCenters[laneIndex]+laneHalf);
   const x=clamp(baseX+xOffsets[role]+drift,105,895);
   return{x,y:laneY,role,lane:laneIndex}
  })
 }
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
  if(this.pattern==='foxtrio'){const foxes=this.foxPositions(target),mode=this.phase%4;if(mode===0){this.volley=.8;for(const f of foxes){const aim=Math.atan2(target.y-f.y,target.x-f.x);for(const aoff of [-.17,0,.17]){const a=aim+aoff;shots.push({team:'boss',type:'foxshuriken',x:f.x,y:f.y,vx:Math.cos(a)*650,vy:Math.sin(a)*650,r:11,life:2.2,damage:this.damage(50)})}}}else if(mode===1){for(const f of foxes){const tx=f.x,ty=f.y;holyFx.push({x:tx,y:ty,type:'iceSpike',r:70,life:.55,max:.55});setTimeout(()=>{if(!running||this.dead)return;for(const h of heroes)if(!h.dead&&Math.hypot(h.x-tx,h.y-ty)<h.r+78){h.hurt(this.damage(36));h.vx*=.08;h.vy*=.08;h.inv=Math.max(h.inv,.22)}burst(tx,ty,'#a8eaff',22,240)},120)}}else if(mode===2){const dashers=[foxes[1],foxes[2]];for(const f of dashers){const away=norm(f.x-target.x,f.y-target.y),tx=clamp(f.x+away.x*118,95,905),ty=clamp(f.y+away.y*118,145,905);slashes.push({x:(f.x+tx)/2,y:(f.y+ty)/2,side:away.x<0?-1:1,life:.18,max:.18,ninjaDash:true,length:118})}const away=norm(this.x-target.x,this.y-target.y);this.x+=away.x*82;this.y+=away.y*82;clampArena(this)}else{this.inv=1.8;for(let wave=0;wave<3;wave++)setTimeout(()=>{if(!running||this.dead)return;const current=this.foxPositions(target);for(let k=0;k<3;k++){const f=current[k],a=wave*.7+k*Math.PI*2/3;shots.push({team:'boss',type:'foxfire',x:f.x,y:f.y,vx:0,vy:0,r:20,life:3,damage:this.damage(82),spiral:true,spiralX:f.x,spiralY:f.y,spiralAngle:a,spiralRadius:22,spiralRadial:112+wave*14,spiralAngular:4.1+wave*.35})}burst(this.x,this.y,'#b9f2ff',20,240)},wave*230)}return}
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
 drawBushin(){
  const target=heroes.filter(h=>!h.dead).sort((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)-Math.hypot(b.x-this.x,b.y-this.y))[0];/* 元画像は左向き。右へ進む／右を見る場合だけ反転する */const flip=this.bushinKick?this.bushinKickDirX>0:(target?target.x>this.x:false);
  if(this.bushinLine){ctx.save();const pulse=.35+.25*Math.sin(performance.now()/70);ctx.globalAlpha=pulse;ctx.strokeStyle='#ff4e5e';ctx.shadowBlur=10;ctx.shadowColor='#ff233b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(this.bushinLine.x1,this.bushinLine.y1);ctx.lineTo(this.bushinLine.x2,this.bushinLine.y2);ctx.stroke();ctx.restore()}
  const y=this.y-this.bushinAir;ctx.save();ctx.globalAlpha=.3;ctx.fillStyle='#000';ctx.beginPath();const shadowScale=clamp(1-this.bushinAir/220,.25,1);ctx.ellipse(this.x,this.y+27,39*shadowScale,11*shadowScale,0,0,Math.PI*2);ctx.fill();ctx.restore();
  if(this.bushinEcho&&this.bushinEchoLife>0){ctx.save();const wob=Math.sin(performance.now()/48)*5;ctx.globalAlpha=.16+.18*(this.bushinEchoLife/.55);drawSprite(sprites.boss_bushin,this.bushinEcho.x+wob,this.bushinEcho.y,112,126,flip,.35,0);ctx.restore()}
  if(this.bushinState==='counterStance'){ctx.save();const pulse=.28+.14*Math.sin(performance.now()/85);ctx.globalAlpha=.68;ctx.strokeStyle='#8fd8ff';ctx.shadowBlur=24;ctx.shadowColor='#55bfff';ctx.lineWidth=7;ctx.beginPath();ctx.arc(this.x,y-9,50+pulse*8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.22;ctx.fillStyle='#68c7ff';ctx.beginPath();ctx.arc(this.x,y-9,47,0,Math.PI*2);ctx.fill();ctx.restore()}
  const vanish=this.bushinState==='counterVanish';const key=this.bushinKick?'boss_bushin_kick':'boss_bushin';const size=this.bushinKick?[138,112]:[112,126];if(!vanish&&!drawSprite(sprites[key],this.x,y,size[0],size[1],flip,this.inv>0?.55:1,0)){ctx.fillStyle='#34251d';ctx.beginPath();ctx.arc(this.x,y-20,42,0,Math.PI*2);ctx.fill()}
 }
 draw(){
  if(this.kind==='bushin'){this.drawBushin();return}
  if(this.kind==='foxtrio'){const target=heroes.filter(h=>!h.dead).sort((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)-Math.hypot(b.x-this.x,b.y-this.y))[0],foxes=this.foxPositions(target);for(let i=0;i<foxes.length;i++){const f=foxes[i],flip=target?target.x<f.x:false;ctx.save();ctx.globalAlpha=.24;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(f.x,f.y+35,38,12,0,0,Math.PI*2);ctx.fill();drawSprite(sprites.hero_fox,f.x,f.y,126,142,flip,this.inv>0?.62:1,Math.sin(performance.now()/170+i)*3);ctx.restore()}return}
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
 heroes.forEach(validateHeroSkills);
 if(awakenedMode&&awakeningSoloCarry){const h=heroes.find(x=>x.type===awakeningSoloCarry.type&&!x.dead);if(h){if(h.type==='magicblade')h.demonMode=8;else if(h.type==='ninja')h.cloneTime=15;else if(h.type==='runemage')h.runeOverload=15;else if(h.type==='highpriest')h.divineMode=12;else if(h.type==='qigong')h.qigongFocus=10;else if(h.type==='dragonknight')h.dragonBreath=10;else if(h.type==='dracula')h.dominationTime=10}awakeningSoloCarry=null}
 boss=new Boss(foxMode?foxTrioDef:(bushinMode?bushinDef:bossDefs[bossIndex]));
 heroIndex=heroes.findIndex(h=>h.type===selectedStartType);if(heroIndex<0)heroIndex=0;
 shots.length=particles.length=walls.length=slashes.length=fistTrails.length=minions.length=lasers.length=holyFx.length=holyDots.length=runes.length=0;
 updateUI();notice(foxMode?'キツネ対戦――三影を打ち破れ！':bushinMode?'武神挑戦――力を示せ！':(awakenedMode?'覚醒・封印の間 ':'封印の間 ')+(bossIndex+1),foxMode?'#bceeff':bushinMode?'#ffc98a':awakenedMode?'#fff08a':'#ffd88b',1100)
}
function bossDefeated(){resetCombatInput();if(foxMode){running=false;let msg='白狐忍・三影を撃破！';if(!isFoxUnlocked()){saveFoxUnlock();unlockFoxChoice();msg+=' 白狐忍が仲間になった！'}notice(msg,'#d7f7ff',3600);document.getElementById('loadStatus').textContent=msg;setTimeout(()=>ui.start.style.display='grid',1600);return}if(bushinMode){running=false;let msg='武神撃破！ 真の強者の証を得た！';if(!isPlayableBushinUnlocked()){savePlayableBushinUnlock();unlockBushinChoice();msg+=' 武神はその強さを認め、秘伝の武術を解放した！ 武神が仲間になった！'}notice(msg,'#fff08a',3800);document.getElementById('loadStatus').textContent=msg;setTimeout(()=>ui.start.style.display='grid',1600);return}if(bossIndex===1&&!isDraculaUnlocked()&&selectedTypes.length>0&&selectedTypes.every(t=>t==='healer'||t==='highpriest')){saveDraculaUnlock();unlockDraculaChoice();notice('ドラキュラ 解放！ 聖なる力により魔王による呪いが解けた！','#f3a1bc',1800);document.getElementById('loadStatus').textContent='ドラキュラが解放されました！'}for(const h of heroes)h.chargeB=0;awakeningSoloCarry=null;if(awakenedMode){const h=heroes.find(x=>!x.dead);if(h&&((h.type==='magicblade'&&h.demonMode>0)||(h.type==='ninja'&&h.cloneTime>0)||(h.type==='runemage'&&h.runeOverload>0)||(h.type==='highpriest'&&h.divineMode>0)||(h.type==='qigong'&&h.qigongFocus>0)||(h.type==='dragonknight'&&h.dragonBreath>0)||(h.type==='dracula'&&h.dominationTime>0)))awakeningSoloCarry={type:h.type}}transition=2.2;notice('BOSS DEFEATED!','#fff08a',1500);for(const h of heroes)if(!h.dead)h.heal(h.maxHp*.24)}

// v68 training ground
function createTrainingProxy(){
 return {kind:'training',name:'修行場',x:500,y:500,r:1,hp:100,maxHp:100,dead:false,inv:0,volley:0,vx:0,vy:0,
  update(){const t=minions[0];if(t){this.x=t.x;this.y=t.y}},
  draw(){},
  hurt(n){const t=minions.reduce((best,m)=>!best||Math.hypot(m.x-this.x,m.y-this.y)<Math.hypot(best.x-this.x,best.y-this.y)?m:best,null);if(!t)return false;t.hp-=n;return true}
 }
}
function trainingMinionLimit(){return trainingPartySize===3?16:trainingPartySize===2?12:8}
function trainingHpMultiplier(){return trainingPartySize===3?2:trainingPartySize===2?1.5:1}
function spawnTrainingMinion(){
 const limit=trainingMinionLimit();
 if(!trainingMode||trainingFinished||(trainingChallenge==='time'&&trainingKills+minions.length>=100)||minions.length>=limit)return;
 const pointIndex=Math.floor(Math.random()*TRAINING_SPAWN_POINTS.length),p=TRAINING_SPAWN_POINTS[pointIndex],progress=trainingChallenge==='limit'?Math.min(1,trainingElapsed/60):Math.min(1,trainingKills/70),strong=Math.random()<Math.min(.32,.08+(trainingChallenge==='limit'?trainingElapsed*.003:trainingKills*.0022)),baseHp=strong?(78+112*progress):(38+67*progress),hp=Math.round(baseHp*trainingHpMultiplier());
 trainingSpawnFlash[pointIndex]=.38;
 minions.push({x:p[0]+rnd(-25,25),y:p[1]+rnd(-25,25),vx:0,vy:0,r:strong?27:21,hp,maxHp:hp,life:9999,cd:rnd(.35,.9),damage:strong?34:23,strong,training:true})
}
function setupTrainingBattle(){
 resetCombatInput();
 trainingPartySize=Math.max(1,Math.min(3,selectedTypes.length));
 const starts=trainingPartySize===1?[[500,545]]:trainingPartySize===2?[[450,545],[550,545]]:[[410,565],[500,515],[590,565]];
 heroes=selectedTypes.slice(0,trainingPartySize).map((type,i)=>new Hero(type,starts[i][0],starts[i][1]));heroes.forEach(validateHeroSkills);heroIndex=Math.max(0,heroes.findIndex(h=>h.type===selectedStartType));
 boss=createTrainingProxy();
 shots.length=particles.length=walls.length=slashes.length=fistTrails.length=minions.length=lasers.length=holyFx.length=holyDots.length=runes.length=0;
 trainingKills=0;trainingElapsed=0;trainingSpawnTimer=0;trainingFinished=false;timeStop=0;trainingSpawnFlash.fill(0);
 const initial=trainingPartySize===3?12:trainingPartySize===2?9:6;for(let i=0;i<initial;i++)spawnTrainingMinion();
 updateUI();notice(trainingChallenge==='limit'?`無双修行――${trainingPartySize}人で60秒間、限界まで倒せ！`:`修行開始――${trainingPartySize}人で手下100体を倒せ！`,'#9feaff',1500)
}
function finishTraining(){
 if(trainingFinished)return;trainingFinished=true;running=false;resetCombatInput();
 const types=heroes.map(h=>h.type),names=types.map(t=>heroInfo[t]?.name||t).join('・');
 let ranks,rank,msg,status;
 if(trainingChallenge==='limit'){
  ranks=saveTrainingScore(trainingKills,types);rank=ranks.findIndex(r=>Array.isArray(r.types)&&r.types.join('|')===types.join('|')&&r.kills===trainingKills)+1;
  msg=`TIME UP!! ${trainingKills}体撃破 / ${types.length}人部門${rank>0?' / TOP '+rank:''}`;status=`60秒撃破 ${trainingKills}体　${types.length}人部門　${names}`;
 }else{
  ranks=saveTrainingRank(trainingElapsed,types);rank=ranks.findIndex(r=>Array.isArray(r.types)&&r.types.join('|')===types.join('|')&&Math.abs(r.time-trainingElapsed)<.002)+1;
  msg=`FINISH!! ${formatTrainingTime(trainingElapsed)} / ${types.length}人部門${rank>0?' / TOP '+rank:''}`;status=`100体撃破 ${formatTrainingTime(trainingElapsed)}　${types.length}人部門　${names}`;
 }
 if(types.includes('mage')&&!isArchmageUnlocked()){saveArchmageUnlock();if(window.unlockArchmageChoice)window.unlockArchmageChoice();msg+=' / アークメイジ解放！';status+='　魔法の極致に達し、アークメイジが解放された！'}
 notice(msg,'#fff08a',4200);document.getElementById('loadStatus').textContent=status;
 if(window.refreshTrainingMenu)window.refreshTrainingMenu();setTimeout(()=>ui.start.style.display='grid',1700)
}
