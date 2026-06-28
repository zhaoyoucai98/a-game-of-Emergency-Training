/* shared.js — 多场景急救游戏共享核心
   提供 Mentor / makeTutor / Sound / Review / SceneHost
   浏览器：window.X；Node 测试：通过 vm 沙箱加载后读 sandbox.window.X
*/

/* —— 音频层：节拍 + 提示音 + 胜负 sting —— */
window.Sound = (()=>{
  let ctx=null,on=true,metroOn=false,nextT=0,look=null,_skip=false;
  const INT=60/110;
  function unlock(){ if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==='suspended')ctx.resume(); }
  function at(freq,t0,dur,gain,type){ if(!ctx||!on)return;const t=ctx.currentTime+t0;
    const o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.value=freq;
    o.connect(g);g.connect(ctx.destination);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.start(t);o.stop(t+dur+.02); }
  function click(time){const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='square';o.frequency.value=1000;o.connect(g);g.connect(ctx.destination);
    g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(.22,time+.001);
    g.gain.exponentialRampToValueAtTime(.0001,time+.04);o.start(time);o.stop(time+.05);}
  function sched(){ while(nextT<ctx.currentTime+0.1){ click(nextT); nextT+=INT; } }
  function startMetro(){ if(!ctx||!on||metroOn)return;metroOn=true;nextT=ctx.currentTime+.05;look=setInterval(sched,25); }
  function stopMetro(){ metroOn=false; if(look){clearInterval(look);look=null;} }
  function setOn(v){ on=v; if(!on)stopMetro(); }
  function msgCue(type){ if(_skip){_skip=false;return;}
    if(type==='warn')at(220,0,.13,.16,'triangle');else if(type==='correct')at(660,0,.09,.14,'sine'); }
  function skipNextCue(){ _skip=true; }
  function cueWin(){ at(523.25,0,.16,.16,'triangle');at(659.25,.13,.16,.16,'triangle');
    at(783.99,.26,.16,.16,'triangle');at(1046.5,.39,.5,.18,'sine'); }
  function cueLose(){ at(392,0,.18,.14,'sine');at(311.13,.16,.2,.14,'sine');at(220,.34,.9,.12,'sine'); }
  return{unlock,startMetro,stopMetro,setOn,isOn:()=>on,msgCue,skipNextCue,cueWin,cueLose};
})();

/* —— 表现层：导师卡 —— */
window.Mentor = (()=>{
  const c=document.getElementById('mentorCard'),t=document.getElementById('mentorText');
  const q=[];let busy=false;
  function say({type='hint',text='',duration=6200}={}){if(q.some(m=>m.text===text))return;q.push({type,text,duration});if(!busy)next();}
  function next(){if(!q.length){busy=false;return;}busy=true;const{type,text,duration}=q.shift();
    c.dataset.type=type;c.style.setProperty('--fdur',duration+'ms');c.classList.remove('is-counting');c.classList.add('is-show');
    window.Sound.msgCue(type);
    tw(text,()=>{void c.offsetWidth;c.classList.add('is-counting');});}
  function tw(text,done){let i=0;t.innerHTML='<span class="mentor__caret"></span>';const k=t.querySelector('.mentor__caret');
    const tm=setInterval(()=>{if(i>=text.length){clearInterval(tm);k.remove();done();return;}k.insertAdjacentText('beforebegin',text[i++]);},28);}
  function dismiss(){c.classList.remove('is-show','is-counting');setTimeout(next,260);}
  c.querySelector('.mentor__progress').addEventListener('animationend',dismiss);c.addEventListener('click',dismiss);
  return{say};
})();

/* —— 决策层：统一引擎 —— */
window.makeTutor = function(rules){const cd={},fired=new Set(),lineIx={};let clock=0;
  function emit(type,p={}){clock=p._now??clock;
    const hit=rules.filter(r=>r.on===type).filter(r=>!(r.once&&fired.has(r.id)))
      .filter(r=>(cd[r.id]??0)<=clock).filter(r=>!r.when||r.when(p)).sort((a,b)=>b.priority-a.priority)[0];
    if(!hit)return;cd[hit.id]=clock+(hit.cooldown??0);if(hit.once)fired.add(hit.id);
    let ty=hit.type,text;
    if(hit.resolve){const r=hit.resolve(p);text=r.text;ty=r.type??hit.type;}
    else{const i=(lineIx[hit.id]??-1)+1;lineIx[hit.id]=i;text=hit.lines[i%hit.lines.length];}
    window.Mentor.say({type:ty,text});}
  return{emit};};

/* —— 复盘 —— */
const WIN='M0,48 H40 l6,-2 4,4 6,-30 6,52 6,-24 6,2 H120 l6,-1 4,2 6,-34 6,56 6,-26 6,2 H240 l6,-1 4,2 6,-36 6,58 6,-26 6,3 H360';
const FAIL='M0,48 l30,0 4,-26 5,48 5,-22 6,0 H120 l20,0 4,-14 5,26 5,-12 6,0 H230 l10,0 3,-6 4,12 4,-6 H360';
window.Review = {
  show({total,g,rows,fail,verdict,sub}){
    const ov=document.getElementById('review'); if(ov.classList.contains('on'))return;
    document.getElementById('ecgSvg').innerHTML=`<path d="${fail?FAIL:WIN}" stroke="${fail?'#E5383B':'#0E8A6F'}" pathLength="1"/>`;
    document.getElementById('reviewCard').classList.toggle('review--fail',fail);
    const worst=rows.reduce((a,b)=>b[1]/b[2]<a[1]/a[2]?b:a);
    document.getElementById('reviewBody').innerHTML=
     `<div class="review__head"><span class="review__grade">${g}</span><div>
        <div class="review__verdict">${verdict}</div><div class="review__sub">${sub}</div></div></div>
      <div class="rows">${rows.map(([l,v,m])=>`<div class="row">${l}<div class="row__bar"><i style="width:${Math.round(v/m*100)}%"></i></div><span class="row__score">${v}/${m}</span></div>`).join('')}</div>
      <p class="review__tip">导师寄语：${worst[3]}</p>
      <button class="btn" onclick="location.reload()">再来一次</button>`;
    ov.classList.add('on'); document.querySelector('#reviewBody .btn').focus();
  }
};

/* —— 场景宿主 —— */
window.SceneHost = (()=>{
  const scenes={}; let cur=null, timer=null, clock=0;
  function register(id, factory){ scenes[id]=factory; }
  function launch(id){
    const root=document.getElementById('sceneRoot');
    const ctx={ mentor:window.Mentor, tutor:null, sound:window.Sound, review:window.Review, root,
      onOver:(res)=>{ if(timer){clearInterval(timer);timer=null;} window.Review.show(res); } };
    cur=scenes[id](ctx); cur.mount();
    clock=0; timer=setInterval(()=>{clock++; if(cur.tick)cur.tick(clock);},1000);
    bindKeys();
  }
  function bindKeys(){ window.onkeydown=(e)=>{ const km=cur&&cur.keymap&&cur.keymap(); if(km&&km[e.key])km[e.key](); }; }
  function start(){
    const menu=document.getElementById('menu'); menu.classList.add('on'); menu.hidden=false;
    menu.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{ menu.classList.remove('on'); launch(b.dataset.scene); });
    const first=menu.querySelector('[data-scene]'); if(first)first.focus();
  }
  return { register, launch, start, _scenes:scenes };
})();
