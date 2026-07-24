function nextHero(){for(let k=1;k<=heroes.length;k++){const ni=(heroIndex+k)%heroes.length;if(!heroes[ni].dead){heroIndex=ni;notice(heroInfo[heroes[ni].type].name+'にチェンジ','#aee8ff',600);break}}}
function updateShots(dt){for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.life-=dt;if(s.homing&&!boss.dead){const desired=norm(boss.x-s.x,boss.y-s.y),speed=Math.hypot(s.vx,s.vy),cur=norm(s.vx,s.vy),blend=Math.min(1,dt*4.6),nn=norm(cur.x*(1-blend)+desired.x*blend,cur.y*(1-blend)+desired.y*blend);s.vx=nn.x*speed;s.vy=nn.y*speed}s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.life<=0||s.x<45||s.x>955||s.y<110||s.y>940){shots.splice(i,1);continue}if(s.team==='hero'){
 if(s.bulletCut){for(let j=shots.length-1;j>=0;j--){const q=shots[j];if(q!==s&&q.team==='boss'&&Math.hypot(s.x-q.x,s.y-q.y)<s.r+q.r+10){burst(q.x,q.y,'#c084fc',8,150);shots.splice(j,1);if(j<i)i--}}}
 let hitMinion=false;
 if(!s.bossOnly)for(const m of minions){if(Math.hypot(s.x-m.x,s.y-m.y)<s.r+m.r){const dealt=Math.min(m.hp,s.damage);m.hp-=s.damage;if(s.lifeSteal&&s.owner&&!s.owner.dead)s.owner.heal(Math.min(38,dealt*s.lifeSteal));burst(s.x,s.y,'#d8b5ff',10,150);shots.splice(i,1);hitMinion=true;break}}
 if(hitMinion)continue;
 if(!boss.dead&&Math.hypot(s.x-boss.x,s.y-boss.y)<s.r+boss.r){const damaged=boss.hurt(s.damage)!==false;if(damaged&&s.lifeSteal&&s.owner&&!s.owner.dead)s.owner.heal(Math.min(38,s.damage*s.lifeSteal));if(damaged&&s.type==='freeze'){boss.freezeStop=Math.max(boss.freezeStop,.38);boss.slow=Math.max(boss.slow,2.4);boss.vx*=.15;boss.vy*=.15;notice('フリーズ！ 足止め！','#bceeff',520)}burst(s.x,s.y,damaged?(s.type==='fire'?'#ff7d3c':s.type==='holy'?'#fff5a8':s.type==='darkblade'?'#bd75ff':s.type==='shuriken'?'#9cc7ff':'#bceeff'):'#8fd8ff',18,250);shots.splice(i,1)}}else{let blocked=false;for(const r of runes){if(r.enhanced&&r.kind==='fire'&&Math.hypot(s.x-r.x,s.y-r.y)<r.r+s.r){burst(s.x,s.y,'#ff9a63',12,190);shots.splice(i,1);blocked=true;break}}if(blocked)continue;for(const h of heroes){if(!h.dead&&h.type==='mage'&&h.tornado>0&&Math.hypot(s.x-h.x,s.y-h.y)<95+s.r){burst(s.x,s.y,'#c6f4ff',12,180);shots.splice(i,1);blocked=true;break}}if(blocked)continue;for(const h of heroes){if(!h.dead&&h.type==='knight'&&h.guard>0&&Math.hypot(s.x-h.x,s.y-h.y)<92+s.r){burst(s.x,s.y,'#ccefff',14,190);shots.splice(i,1);blocked=true;break}}if(blocked)continue;let wallBlocked=false;for(const w of walls){if(w.type==='qigong'&&w.life>0&&Math.hypot(s.x-w.x,s.y-w.y)<w.r+s.r){burst(s.x,s.y,'#9eefff',10,170);w.hits--;shots.splice(i,1);wallBlocked=true;if(w.hits<=0)w.life=0;break}}if(wallBlocked)continue;let reflected=false;for(const w of walls){if(w.type!=='qigong'&&w.life>0&&Math.hypot(s.x-w.owner.x,s.y-w.owner.y)<w.r){s.team='hero';s.type='holy';const n=norm(boss.x-s.x,boss.y-s.y);const sp=Math.hypot(s.vx,s.vy)*1.25;s.vx=n.x*sp;s.vy=n.y*sp;s.damage*=1.25;s.homing=true;reflected=true;burst(s.x,s.y,'#f4eaff',12,180);break}}if(reflected)continue;for(const h of heroes){if(!h.dead&&Math.hypot(s.x-h.x,s.y-h.y)<s.r+h.r){h.hurt(s.damage,s.vx*.25,s.vy*.25);shots.splice(i,1);break}}}}}
function runeHitTarget(r,t){return t&&!t.dead&&t.hp>0&&Math.hypot(r.x-t.x,r.y-t.y)<r.r+t.r}
function clampRuneToArena(r){clampArena(r)}
function convertMinionToRuneShot(r,m){
 const n=boss&&!boss.dead?norm(boss.x-m.x,boss.y-m.y):{x:0,y:-1},type=r.kind==='fire'?'fire':r.kind==='ice'?'ice':'thunder',c=r.kind==='fire'?'#ff6b35':r.kind==='ice'?'#8ad9ff':'#ffe45c';
 shots.push({team:'hero',type,owner:r.owner,x:m.x,y:m.y,vx:n.x*460,vy:n.y*460,r:12,life:3.1,damage:118,homing:true,bossOnly:true});
 burst(m.x,m.y,c,20,260)
}
function triggerRune(r,target){const c=r.kind==='fire'?'#ff6b35':r.kind==='ice'?'#8ad9ff':'#ffe45c';if(r.kind==='fire'){if(target===boss)boss.hurt(245);else target.hp-=270;burst(r.x,r.y,c,48,500);shake=16}else if(r.kind==='ice'){if(target===boss){const damaged=boss.hurt(48)!==false;if(damaged){let n=norm(boss.vx,boss.vy);if(Math.hypot(boss.vx,boss.vy)<55)n=norm(boss.x-r.x,boss.y-r.y);boss.runeSlide={dx:n.x||1,dy:n.y||0,time:2.2,flip:0}}}else{target.hp-=72;target.vx*=.1;target.vy*=.1}burst(r.x,r.y,c,34,360);shake=9}else{if(target===boss){const damaged=boss.hurt(118)!==false;if(damaged){boss.freezeStop=Math.max(boss.freezeStop,.48);boss.vx*=.12;boss.vy*=.12}}else{target.hp-=135;target.vx=target.vy=0;target.cd=Math.max(target.cd,.55)}if(r.enhanced){const nearby=runes.filter(q=>q!==r).sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0];if(nearby){const n=norm(nearby.x-target.x,nearby.y-target.y),push=target===boss?210:255;target.vx+=n.x*push;target.vy+=n.y*push}}burst(r.x,r.y,c,30,320);shake=8}}
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
 const alive=heroes.filter(x=>!x.dead),h=heroes[heroIndex],dBtn=document.getElementById('d');if(dBtn){const soloReady=alive.length===1;dBtn.innerHTML=soloReady?'<b>D</b>専用技':'<b>D</b>交代';dBtn.classList.toggle('soloReady',soloReady);}ui.stageNo.textContent=bushinMode?'SPECIAL BOSS':'BOSS '+(bossIndex+1)+' / 5';ui.bossName.textContent=bushinMode?'武神':bossDefs[bossIndex].name;ui.bossFill.style.width=(boss.hp/boss.maxHp*100)+'%';ui.heroName.textContent=heroInfo[h.type].name;ui.ability.textContent=heroInfo[h.type].ability;ui.hpFill.style.width=(h.hp/h.maxHp*100)+'%';ui.hpText.textContent=Math.ceil(h.hp)+' / '+h.maxHp+' HP';
 document.querySelectorAll('.partyRow').forEach(row=>{const type=row.dataset.hero,hero=heroes.find(x=>x.type===type);row.hidden=!hero;if(!hero)return;const pct=Math.max(0,hero.hp/hero.maxHp*100),fill=ui.party[type+'Fill'],text=ui.party[type+'Text'];if(fill)fill.style.width=pct+'%';if(text)text.textContent=Math.ceil(hero.hp)+'/'+hero.maxHp;row.classList.toggle('active',hero===h);row.classList.toggle('dead',hero.dead)})
}
function enforceQigongWalls(){for(const w of walls){if(w.type!=='qigong'||w.life<=0)continue;const repel=e=>{if(!e||e.dead||e.hp<=0)return;let dx=e.x-w.x,dy=e.y-w.y,d=Math.hypot(dx,dy),min=w.r+(e.r||20);if(d<min){if(d<.001){dx=1;dy=0;d=1}e.x=w.x+dx/d*min;e.y=w.y+dy/d*min;const out=norm(dx,dy);e.vx=Math.max(e.vx||0,out.x*70);e.vy=Math.max(e.vy||0,out.y*70);clampArena(e)}};repel(boss);for(const m of minions)repel(m)}}
function update(dt){bloodBeams.length=0;const aliveNow=heroes.filter(h=>!h.dead);if(aliveNow.length&&heroes[heroIndex]?.dead)heroIndex=heroes.indexOf(aliveNow[0]);if(pressed.has('KeyI')){pressed.delete('KeyI');if(aliveNow.length===1)aliveNow[0].safeUse('soloSkill');else nextHero()}if(heroes.every(h=>h.dead)){running=false;notice('PARTY DOWN','#ff7a86',1500);setTimeout(()=>ui.start.style.display='grid',1000);return}if(transition>0){transition-=dt;if(transition<=0){bossIndex++;if(bossIndex>=5){running=false;const solo=selectedTypes.length===1,soloType=solo?selectedTypes[0]:null,unlocks=[];const cursedTrio=selectedTypes.length===3&&['dracula','dragonknight','mimic'].every(t=>selectedTypes.includes(t));if(((!awakenedMode&&solo)||cursedTrio)&&!isBushinUnlocked()){saveBushinUnlock();addBushinOptions();unlocks.push('武神挑戦モードが解放された！')}if(!isAwakeningUnlocked()){saveAwakeningUnlock();addAwakeningOption();unlocks.push('覚醒無双モードが解放された！')}if(!isMonkUnlocked()){saveMonkUnlock();unlockMonkChoice();unlocks.push('モンクが仲間になった！')}if(!isDragonKnightUnlocked()){saveDragonKnightUnlock();unlockDragonKnightChoice();unlocks.push('魔王による竜の呪いが解け、竜騎士が仲間になった！')}if(soloType==='healer'&&!isHighPriestUnlocked()){saveHighPriestUnlock();unlockHighPriestChoice();unlocks.push('聖なる力を極め、ハイプリーストが仲間になった！')}if(soloType==='knight'&&!isMagicbladeUnlocked()){saveMagicbladeUnlock();unlockMagicbladeChoice();unlocks.push('闇の剣技を継承し、魔剣士が仲間になった！')}if(soloType==='mage'&&!isRunemageUnlocked()){saveRunemageUnlock();unlockRunemageChoice();unlocks.push('古代ルーンを読み解き、ルーンメイジが仲間になった！')}if(soloType==='monk'&&!isQigongUnlocked()){saveQigongUnlock();unlockQigongChoice();unlocks.push('気の極意を悟り、気功師が仲間になった！')}if(!awakenedMode&&selectedTypes.length<=2&&!isNinjaUnlocked()){saveNinjaUnlock();unlockNinjaChoice();unlocks.push('少数精鋭の戦いを見届け、忍者が仲間になった！')}if(soloType==='dragonknight'&&!isMimicUnlocked()){saveMimicUnlock();unlockMimicChoice();unlocks.push('魔王によるケルベロスの呪いが解け、模倣術師が仲間になった！')}document.getElementById('loadStatus').textContent=unlocks.length?unlocks.join(' / '):'クリア済み追加要素は解放済みです。';notice(unlocks.length?unlocks.join(' / '):'ALL CHAMBERS CLEARED!','#fff08a',4200);setTimeout(()=>ui.start.style.display='grid',1800);bossIndex=0}else setupBattle()}return}heroes.forEach((h,i)=>h.update(dt,i));boss.update(dt);updateRunes(dt);updateShots(dt);updateMinions(dt);const dominator=heroes.find(h=>!h.dead&&h.type==='dracula'&&h.dominationTime>0);if(dominator&&boss&&!boss.dead){for(let i=minions.length-1;i>=0;i--){const m=minions[i];dominator.summonBats(1,m.x,m.y,42);burst(m.x,m.y,'#8f244c',12,160);minions.splice(i,1)}}enforceQigongWalls();updateLasers(dt);for(let i=walls.length-1;i>=0;i--){walls[i].life-=dt;if(walls[i].life<=0)walls.splice(i,1)}for(let i=slashes.length-1;i>=0;i--){slashes[i].life-=dt;if(slashes[i].life<=0)slashes.splice(i,1)}for(let i=fistTrails.length-1;i>=0;i--){const f=fistTrails[i];f.life-=dt;f.x+=f.dx*90*dt;f.y+=f.dy*90*dt;if(f.life<=0)fistTrails.splice(i,1)}for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;if(p.life<=0)particles.splice(i,1)}for(let i=holyFx.length-1;i>=0;i--){holyFx[i].life-=dt;if(holyFx[i].life<=0)holyFx.splice(i,1)}for(let i=holyDots.length-1;i>=0;i--){const d=holyDots[i];d.life-=dt;d.tick+=dt;if(!d.target||d.target.dead||d.target.hp<=0||d.life<=0){holyDots.splice(i,1);continue}while(d.tick>=.25){d.tick-=.25;if(d.target===boss)d.target.hurt(d.rate*.25);else d.target.hp-=d.rate*.25}}updateUI();released.clear()}
