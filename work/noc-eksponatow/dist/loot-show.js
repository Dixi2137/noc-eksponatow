/* One predetermined discovery: seal, fast reel, slow finish, reveal. */
(() => {
 'use strict';
 let active=null,sequence=0;
 const $=id=>document.getElementById(id);
 const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
 const clamp=value=>Math.max(0,Math.min(1,value));
 function closeAudio(state){
  for(const source of state.sources){try{source.stop();}catch(_){}try{source.disconnect();}catch(_){}}
  state.sources.clear();
  if(state.context){try{const closing=state.context.close();closing?.catch?.(()=>{});}catch(_){}state.context=null;}
 }
 function detach(state){
  if(state.frame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(state.frame);
  clearTimeout(state.fallback);state.frame=null;state.fallback=null;
  document.removeEventListener?.('visibilitychange',state.onVisibility);
  state.reel.style.willChange=state.previousWillChange;
 }
 function cancel(){
  sequence++;
  if(!active)return;
  const state=active;active=null;state.cancelled=true;detach(state);clearTimeout(state.audioCleanup);
  closeAudio(state);
  for(const card of state.cards){card.classList.remove('is-current','is-winning');}
 }
 function soundAllowed(state){
  if(state.reduced||state.cancelled||document.hidden)return false;
  try{return !!state.isSoundEnabled?.();}catch(_){return false;}
 }
 function tone(state,frequency,duration,volume,type='sine',delay=0,endFrequency=frequency){
  if(!soundAllowed(state))return;
  try{
   const AudioContext=window.AudioContext||window.webkitAudioContext;
   if(!AudioContext)return;
   if(!state.context)state.context=new AudioContext();
   const context=state.context;
   if(context.state==='closed')return;
   if(context.state==='suspended')context.resume()?.catch?.(()=>{});
   const at=context.currentTime+delay,oscillator=context.createOscillator(),gain=context.createGain();
   oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,at);
   if(endFrequency!==frequency)oscillator.frequency.exponentialRampToValueAtTime(endFrequency,at+duration);
   gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(volume,at+.012);
   gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
   oscillator.connect(gain);gain.connect(context.destination);state.sources.add(oscillator);
   oscillator.onended=()=>{state.sources.delete(oscillator);try{oscillator.disconnect();gain.disconnect();}catch(_){}};
   oscillator.start(at);oscillator.stop(at+duration+.015);
  }catch(_){/* A blocked or unavailable audio device never delays the discovery. */}
 }
 function stage(state,phase){
  if(state.phase===phase)return;
  state.phase=phase;state.panel.dataset.lootPhase=phase;
  const copy={seal:['ZERWANIE PIECZĘCI','Muzealny zamek ustępuje…'],rush:['SKRZYNIA OTWARTA','Eksponaty przesuwają się przez galerię.'],slow:['OSTATNI OBRÓT','Zapisane odkrycie za chwilę trafi do twojej kolekcji.'],hold:['ODKRYCIE GOTOWE','Jeszcze jeden oddech…']}[phase];
  if($('lootStageLabel'))$('lootStageLabel').textContent=copy[0];
  if($('lootStageHint'))$('lootStageHint').textContent=copy[1];
  if(phase==='hold')state.cards[state.winner].classList.add('is-winning');
 }
 function position(state,progress){
  state.reel.style.transform=`translateX(${state.startX+(state.endX-state.startX)*progress}px)`;
 }
 function progressBar(state,value){
  const percentage=`${Math.round(clamp(value)*100)}%`;
  if($('lootProgressFill'))$('lootProgressFill').style.width=percentage;
  state.panel.style.setProperty('--roll-progress',percentage);
 }
 function finish(state){
  if(active!==state||state.cancelled||state.done||state.token!==sequence)return;
  state.done=true;detach(state);position(state,1);progressBar(state,1);
  if(!state.reduced)stage(state,'hold');
  tone(state,261.63,.65,.037,'sine');tone(state,329.63,.62,.028,'sine',.045);tone(state,392,.68,.028,'sine',.09);tone(state,523.25,.55,.021,'sine',.14);
  state.audioCleanup=setTimeout(()=>closeAudio(state),950);
  state.onReveal();
 }
 function tickCenter(state,elapsed,x){
  const atCenter=state.viewport.clientWidth/2-x;
  let closest=0,distance=Infinity;
  for(let index=0;index<state.centers.length;index++){
   const next=Math.abs(state.centers[index]-atCenter);
   if(next<distance){distance=next;closest=index;}
  }
  if(closest===state.centerIndex)return;
  state.cards[state.centerIndex]?.classList.remove('is-current');state.centerIndex=closest;
  state.cards[closest]?.classList.add('is-current');
  if(elapsed-state.lastTick>=65){state.lastTick=elapsed;tone(state,360+(closest%3)*42,.055,.019,'triangle',0,200);}
 }
 function update(state){
  if(active!==state||state.done||state.cancelled||state.token!==sequence)return;
  const elapsed=Math.max(0,now()-state.started);
  progressBar(state,elapsed/state.total);
  if(elapsed>=state.total){finish(state);return;}
  if(!state.reduced){
   if(elapsed<state.seal){stage(state,'seal');position(state,0);}
   else{
    const roll=clamp((elapsed-state.seal)/state.roll),eased=1-Math.pow(1-roll,3);
    position(state,eased);
    if(roll>=1)stage(state,'hold');
    else{stage(state,elapsed-state.seal>=state.roll-2000?'slow':'rush');tickCenter(state,elapsed,state.startX+(state.endX-state.startX)*eased);}
   }
  }
  if(typeof requestAnimationFrame==='function')state.frame=requestAnimationFrame(()=>update(state));
 }
 function start({reel,viewport,cards,winner,onReveal,isSoundEnabled}={}){
  cancel();
  const elements=Array.from(cards||[]),index=Number(winner),panel=$('lootPanel');
  if(!reel||!viewport||!panel||!Number.isInteger(index)||!elements[index]||typeof onReveal!=='function')return cancel;
  let reduced=false;try{reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}catch(_){}
  const centers=elements.map(card=>card.offsetLeft+card.offsetWidth/2),half=viewport.clientWidth/2;
  const state={token:sequence,reel,viewport,cards:elements,winner:index,panel,onReveal,isSoundEnabled,reduced,
   centers,startX:half-centers[0],endX:half-centers[index],started:now(),seal:900,roll:6500,total:reduced?500:8200,
   centerIndex:0,lastTick:-Infinity,phase:null,done:false,cancelled:false,frame:null,fallback:null,audioCleanup:null,
   context:null,sources:new Set(),previousWillChange:reel.style.willChange||'',onVisibility:null};
  active=state;reel.style.willChange=reduced?'':'transform';
  for(const card of elements)card.classList.remove('is-current','is-winning');
  stage(state,'seal');position(state,reduced?1:0);progressBar(state,0);
  tone(state,112,.46,.065,'sine',0,42);
  state.onVisibility=()=>{if(!document.hidden){if(state.frame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(state.frame);state.frame=null;update(state);}};
  document.addEventListener?.('visibilitychange',state.onVisibility);
  // The deadline also works if RAF is unavailable or throttled by a hidden tab.
  state.fallback=setTimeout(()=>finish(state),state.total+100);
  if(typeof requestAnimationFrame==='function')state.frame=requestAnimationFrame(()=>update(state));
  return ()=>{if(active===state)cancel();};
 }
 window.MuseumLootShow=Object.freeze({start,cancel});
})();
