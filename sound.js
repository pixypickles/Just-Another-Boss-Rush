'use strict';
(() => {
 const AudioCtx=window.AudioContext||window.webkitAudioContext;
 let ctx=null,master=null,enabled=true,last={};
 const ensure=()=>{
  if(!AudioCtx||!enabled)return null;
  if(!ctx){ctx=new AudioCtx();master=ctx.createGain();master.gain.value=.16;master.connect(ctx.destination)}
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  return ctx;
 };
 const tone=(freq,dur=.08,type='sine',gain=.18,slide=1,delay=0)=>{
  const ac=ensure();if(!ac)return;
  const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(Math.max(30,freq),t);o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*slide),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);
 };
 const noise=(dur=.07,gain=.1,cutoff=1200,delay=0)=>{
  const ac=ensure();if(!ac)return;const t=ac.currentTime+delay,len=Math.max(1,Math.floor(ac.sampleRate*dur)),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
  const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=buf;f.type='lowpass';f.frequency.value=cutoff;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t);
 };
 const throttle=(name,ms)=>{const now=performance.now();if(now-(last[name]||0)<ms)return false;last[name]=now;return true};
 const play=(name,detail={})=>{
  if(!enabled)return;
  switch(name){
   case 'attack': tone(260,.055,'square',.11,1.7);noise(.035,.035,2200);break;
   case 'special': tone(190,.12,'sawtooth',.11,2.2);tone(380,.1,'triangle',.07,.72,.025);break;
   case 'support': tone(520,.16,'sine',.1,1.45);tone(780,.18,'sine',.06,1.18,.045);break;
   case 'solo': tone(110,.22,'sawtooth',.13,3.8);tone(440,.24,'square',.07,1.9,.04);noise(.16,.06,1700);break;
   case 'hit': if(throttle('hit',45)){tone(detail.heavy?105:145,detail.heavy?.09:.055,'square',detail.heavy?.12:.07,.58);noise(detail.heavy?.08:.045,detail.heavy?.09:.045,900)}break;
   case 'hurt': if(throttle('hurt',120)){tone(165,.16,'sawtooth',.13,.42);noise(.1,.08,700)}break;
   case 'heal': if(throttle('heal',180)){tone(440,.13,'sine',.09,1.5);tone(660,.16,'sine',.055,1.35,.045)}break;
   case 'switch': tone(330,.09,'triangle',.1,1.8);tone(660,.11,'triangle',.07,.9,.04);break;
   case 'bossStart': tone(82,.3,'sawtooth',.12,1.15);tone(123,.28,'square',.07,1.05,.12);noise(.22,.055,500);break;
   case 'victory': [523,659,784,1047].forEach((f,i)=>tone(f,.22,'triangle',.09,1.02,i*.09));break;
   case 'down': tone(220,.28,'sawtooth',.13,.35);tone(110,.35,'square',.08,.55,.08);break;
   case 'ui': tone(620,.045,'sine',.045,1.08);break;
  }
 };
 const unlock=()=>ensure();
 ['pointerdown','touchstart','keydown'].forEach(ev=>window.addEventListener(ev,unlock,{once:true,passive:true}));
 window.sfx={play,unlock,setEnabled(v){enabled=!!v;if(master)master.gain.value=enabled?.16:0},get enabled(){return enabled}};
})();
