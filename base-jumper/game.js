const $ = (s)=>document.querySelector(s);
const $$ = (s)=>[...document.querySelectorAll(s)];

const screens = {
  title: $('#titleScreen'), setup: $('#setupScreen'), story: $('#storyScreen'), jump: $('#jumpScreen'),
  reward: $('#rewardScreen'), bfl: $('#bflScreen'), gameover: $('#gameOverScreen')
};

const state = {
  name:'DAN', nationality:'British', hair:'Blonde', complexion:'Fair',
  luck:5, followers:0, likes:0, friends:0, sti:0, money:0, credit:0,
  xp:0, relationship:100, responsibilities:100, bfl:1125, deaths:0, luckUses:0,
  storyIndex:0, rewardQueue:[], rewardIndex:0
};

const multipliers = {
  British:{money:2,friends:1,sti:3},
  American:{money:3,friends:2,sti:1},
  Australian:{money:2,friends:3,sti:1}
};

const story = [
  ['PLAYER', 'Fuck yeah, I’m gonna be a BASE jumper.'],
  ['BRIAN', 'Nobody cares, mate.'],
  ['DAVE', 'Couldn’t give a shit.'],
  ['PLAYER', 'I’ll do it properly. Safe progression. No stupid partying.'],
  ['GAME', 'Excellent. That promise will age terribly.']
];

function show(name){ Object.values(screens).forEach(s=>s.classList.remove('active')); screens[name].classList.add('active'); renderHud(); }
function renderHud(){
  const html = [
    ['🍀',state.luck],['👥',state.followers],['❤',state.likes],['🧑‍🤝‍🧑',state.friends],
    ['♀',state.sti],['£',state.money],['💳',state.credit],['XP',state.xp]
  ].map(([i,v])=>`<div class="hud-item">${i}<strong>${v}</strong></div>`).join('');
  ['hud','jumpHud','rewardHud'].forEach(id=>{ const el=$('#'+id); if(el) el.innerHTML=html; });
}

function choiceGroup(group){
  $$(`[data-group="${group}"] .choice`).forEach(btn=>btn.addEventListener('click',()=>{
    $$(`[data-group="${group}"] .choice`).forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected'); state[group]=btn.dataset.value;
  }));
}
['nationality','hair','complexion'].forEach(choiceGroup);

$('#newRunBtn').addEventListener('click',()=>show('setup'));
$('#startCareerBtn').addEventListener('click',()=>{
  state.name=($('#playerName').value.trim()||'DAN').toUpperCase();
  state.storyIndex=0; showStory(); show('story');
});

function showStory(){
  const [sp,txt] = story[state.storyIndex];
  $('#speaker').textContent = sp;
  $('#dialogueText').textContent = txt;
  $('#nextDialogueBtn').textContent = state.storyIndex===story.length-1 ? 'START JUMP' : 'NEXT';
}
$('#nextDialogueBtn').addEventListener('click',()=>{
  if(state.storyIndex < story.length-1){ state.storyIndex++; showStory(); }
  else startJump();
});

let power=0, dir=1, holding=false, raf=null, last=0;
function difficultySpeed(){ return state.hair==='Ginger'?0.095:state.hair==='Brown'?0.08:0.065; }
function startJump(){
  power=0;dir=1;holding=false;$('#powerMarker').style.bottom='0%';
  $('#jumper').style.left='28%';$('#jumper').style.bottom='56%';$('#jumper').style.transform='rotate(0deg)';
  $('#jumpMessage').textContent='Hold EXIT and release in the green.'; show('jump');
}
function tick(ts){
  if(!holding) return;
  if(!last) last=ts; const dt=Math.min(40,ts-last); last=ts;
  power += dir*difficultySpeed()*dt;
  if(power>=100){power=100;dir=-1}else if(power<=0){power=0;dir=1}
  $('#powerMarker').style.bottom=`${power}%`;
  raf=requestAnimationFrame(tick);
}
function beginHold(e){ e.preventDefault(); if(holding) return; holding=true; last=0; raf=requestAnimationFrame(tick); }
function endHold(e){
  if(!holding) return; if(e)e.preventDefault(); holding=false; cancelAnimationFrame(raf); resolveExit();
}
$('#exitBtn').addEventListener('pointerdown',beginHold);
window.addEventListener('pointerup',endHold);
window.addEventListener('pointercancel',endHold);

function resolveExit(){
  const j=$('#jumper');
  if(power>=40 && power<=60){
    $('#jumpMessage').textContent='PERFECT EXIT! Stable. PITCH!';
    j.style.left='48%';j.style.bottom='24%';j.style.transform='rotate(8deg)';
    setTimeout(()=>queueRewards(),900);
  } else {
    const low=power<40;
    $('#jumpMessage').textContent=low?'TOO WEAK — HEAD HIGH — UNSTABLE':'TOO MUCH POWER — HEAD LOW — UNSTABLE';
    j.style.left='54%';j.style.bottom='6%';j.style.transform=`rotate(${low?-65:120}deg)`;
    setTimeout(()=>death(low?'weak exit / head-high instability':'overpowered exit / head-low instability'),850);
  }
}

function queueRewards(){
  const m=multipliers[state.nationality];
  state.rewardQueue=[
    {icon:'❤',label:'LIKES',value:125,apply:()=>state.likes+=125},
    {icon:'👥',label:'FOLLOWERS',value:42,apply:()=>state.followers+=42},
    {icon:'🧑‍🤝‍🧑',label:'REAL FRIENDS',value:2*m.friends,apply:()=>state.friends+=2*m.friends},
    {icon:'XP',label:'EXPERIENCE',value:1,apply:()=>state.xp+=1}
  ]; state.rewardIndex=0; show('reward'); showReward();
}
function showReward(){
  const r=state.rewardQueue[state.rewardIndex];
  $('#rewardIcon').textContent=r.icon;$('#rewardLabel').textContent=r.label;$('#rewardValue').textContent=`+${r.value}`;
  r.apply(); renderHud();
  $('#rewardNextBtn').textContent=state.rewardIndex===state.rewardQueue.length-1?'FINISH SLICE':'NEXT';
}
$('#rewardNextBtn').addEventListener('click',()=>{
  state.rewardIndex++;
  if(state.rewardIndex>=state.rewardQueue.length) finishRun(); else showReward();
});

function death(cause){
  state.deaths++; state.bfl++;
  $('#bflNumber').textContent=`BFL #${state.bfl}`;
  $('#bflReport').innerHTML = `<strong>${state.name}</strong><br>Location: Training Roof (fictional)<br>Experience: ${state.xp}<br>Exit: ${cause}<br><br>${state.xp<5?'A heroic amount of confidence was displayed relative to the amount of experience available.':'Respect. The jumper committed fully to a very poor outcome.'}`;
  $('#useLuckBtn').disabled=state.luck<=0;
  $('#useLuckBtn').textContent=state.luck>0?`🍀 USE LUCK — GO BACK (${state.luck})`:'🍀 NO LUCK LEFT';
  show('bfl');
}
$('#useLuckBtn').addEventListener('click',()=>{
  if(state.luck<=0)return; state.luck--;state.luckUses++;startJump();
});
$('#acceptDeathBtn').addEventListener('click',finishRun);

function calculateScore(){
  let raw=state.likes + state.followers*3 + state.friends*5 + state.sti*10 + state.xp*20;
  return Math.max(0,Math.round(raw*Math.pow(.95,state.luckUses)));
}
function finishRun(){ $('#finalScore').textContent=calculateScore().toLocaleString(); show('gameover'); }
$('#restartBtn').addEventListener('click',()=>location.reload());

renderHud();
