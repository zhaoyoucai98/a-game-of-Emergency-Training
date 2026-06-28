/* scene-cpr.js — CPR 场景模块
   消费: SceneHost.register, ctx.{mentor,sound,review,root,onOver}, makeTutor
   产出: 注册 id 'cpr' 的场景工厂
*/

const COOP_RULES=[
  {id:'intro',on:'intro',priority:10,once:true,type:'hint',lines:['有人倒下了！先「呼救」召集帮手，再开始按压——你一个人忙不过来。']},
  {id:'crew_join',on:'crew_joined',priority:50,resolve:p=>({type:'correct',text:`${p.name}赶来帮忙（${p.trait}）——把活儿分给合适的人！`})},
  {id:'crew_full',on:'help_called',priority:40,when:p=>p.full,type:'hint',lines:['人手够了，专注抢救！']},
  {id:'aed_ready',on:'aed_fetched',priority:60,resolve:p=>({type:'correct',text:`${p.name}取回了 AED！切过去尽快电击。`})},
  {id:'nurse_errand',on:'assign_errand',priority:70,cooldown:5,when:p=>p.key==='nurse',type:'warn',lines:['护士按压最专业，别让她跑腿——派跑得快的人去取 AED。']},
  {id:'interrupt',on:'tick',priority:80,cooldown:8,when:p=>p.noCpr>=6,type:'warn',lines:['按压不能停！中断超过 10 秒，心脑供血就断了。']},
  {id:'fatigue',on:'tick',priority:75,cooldown:6,when:p=>p.activeTired,resolve:p=>({type:'warn',text:p.activeKey==='athlete'?'年轻人力气大但累得快，赶紧换人接力！':'按压在变浅了，切个体力好的人接力！'})},
  {id:'win',on:'shock',priority:90,once:true,type:'correct',lines:['电击成功，恢复自主心跳！人尽其才，团队救回一条命。']},
  {id:'defeat',on:'defeat',priority:90,once:true,type:'warn',lines:['失去生命体征…复盘：呼救够早吗？按压有没有常中断？']},
];

const CPR_CFG={survStart:100,decay:1,interruptPenalty:3,cprGain:3,cprTiredGain:.7,fatRest:5,tiredAt:70,aedTravel:8,callTime:4,maxCrew:4,cprGraceSec:9};

const G=k=>`<svg class="ch__glyph" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${k}</svg>`;
const CPR_ARCH={
  player:{label:'你',trait:'均衡',fatUp:3,gainMul:1.0,travel:1.0,glyph:G('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>')},
  nurse:{label:'护士',trait:'质量高·耐力强',fatUp:1.5,gainMul:1.3,travel:1.0,glyph:G('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8" stroke="#E5383B"/>')},
  athlete:{label:'青年',trait:'力量大·易疲劳',fatUp:5,gainMul:1.25,travel:.7,glyph:G('<path d="M13 2 5 13h6l-1 9 8-11h-6z"/>')},
  worker:{label:'上班族',trait:'机动快',fatUp:3.5,gainMul:.85,travel:.7,glyph:G('<circle cx="11" cy="5" r="2.5"/><path d="M11 8l-3 5 4 2 1 7M11 13l5-1"/>')},
};
const CPR_RECRUITS=['athlete','worker','nurse'];

const CPR_HTML=`
<main class="stage">
  <svg class="victim" aria-hidden="true" viewBox="0 0 230 104" fill="none">
    <ellipse cx="115" cy="90" rx="106" ry="9" fill="#E8E8E6"/>
    <circle cx="48" cy="60" r="17" stroke="#16181D" stroke-width="2"/>
    <rect x="65" y="49" width="135" height="26" rx="13" stroke="#16181D" stroke-width="2"/>
  </svg>
</main>
<nav class="crew" id="crew"></nav>
<footer class="actions">
  <button class="btn-a is-red" data-act="compress">按 压</button>
  <button class="btn-a" data-act="call">呼救</button>
  <button class="btn-a" data-act="aed">取 AED</button>
  <button class="btn-a" data-act="shock" disabled>电击</button>
</footer>`;

SceneHost.register('cpr',(ctx)=>{
  const tutor=makeTutor(COOP_RULES);

  const CFG=CPR_CFG;
  const ARCH=CPR_ARCH;
  const RECRUITS=CPR_RECRUITS.slice();
  let recruitIx=0;
  const AV=[];
  let activeId=0;
  const V={surv:CFG.survStart,noCpr:0,aedReady:false,over:false};
  const STATS={callTime:null,interruptions:0,noCprTotal:0,tiredCompressSeconds:0,misassign:0,shocked:false,_wasComp:false};
  function addAvatar(key){const A=ARCH[key];const a={id:AV.length,key,arch:A,name:A.label,task:'idle',fatigue:0,t:0};AV.push(a);return a;}
  addAvatar('player');

  function setActive(id){if(V.over||!AV[id])return;const prev=AV[activeId];if(prev&&prev.task==='compressing')prev.task='idle';activeId=id;render();}

  const TASKLABEL={idle:'待命',compressing:'按压中',fetchingAED:'取 AED 中',calling:'呼救中'};
  const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');

  const ACT={
    compress(a){a.task=a.task==='compressing'?'idle':'compressing';},
    call(a){if(AV.length>=CFG.maxCrew){tutor.emit('help_called',{_now:_clock,full:true});return;}
      if(STATS.callTime==null)STATS.callTime=_clock;a.task='calling';a.t=CFG.callTime;},
    aed(a){if(V.aedReady||AV.some(x=>x.task==='fetchingAED'))return;if(a.key==='nurse')STATS.misassign++;
      tutor.emit('assign_errand',{_now:_clock,key:a.key});a.task='fetchingAED';a.t=Math.round(CFG.aedTravel*a.arch.travel);},
    shock(a){if(!V.aedReady)return;V.over=true;STATS.shocked=true;
      ctx.sound.stopMetro();ctx.sound.skipNextCue();
      tutor.emit('shock',{_now:_clock});
      ctx.sound.cueWin();render();},
  };

  let _clock=0;
  let _paused=false;
  let _done=false;

  function render(){
    const crewEl=document.getElementById('crew');
    const survBar=document.getElementById('survBar');
    const survPct=document.getElementById('survPct');
    const survWrap=document.getElementById('survWrap');
    if(!crewEl)return;
    survBar.style.width=V.surv+'%';
    survBar.style.background=V.surv>50?'var(--vital)':V.surv>25?'var(--amber)':'var(--critical)';
    survPct.textContent=Math.round(V.surv)+'%';
    survWrap.setAttribute('aria-valuenow',Math.round(V.surv));
    const focusedId=document.activeElement&&document.activeElement.classList.contains('ch')?document.activeElement.dataset.id:null;
    crewEl.innerHTML=AV.map(a=>{const stam=100-Math.round(a.fatigue);
      const lvl=stam>50?'':stam>25?'ch--mid':'ch--low';
      const active=a.id===activeId;
      const beat=(active&&a.task==='compressing')?'pip--beat':'';
      return `<button class="ch ${active?'ch--active':''} ${lvl}" data-id="${a.id}" aria-pressed="${active}" aria-label="${a.name}，${a.arch.trait}，${TASKLABEL[a.task]}，体力${stam}%">
        <div class="ch__top">${a.arch.glyph}<span class="ch__name">${a.name}</span></div>
        <div class="ch__role">${a.arch.trait}</div>
        <div class="ch__task"><i class="pip ${beat}"></i>${TASKLABEL[a.task]}</div>
        <div class="ch__stam"><div class="ch__bar"><i style="width:${stam}%"></i></div><span class="ch__val">${stam}</span></div></button>`;
    }).join('');
    if(focusedId!=null){const el=crewEl.querySelector(`.ch[data-id="${focusedId}"]`);if(el)el.focus();}
    const a=AV[activeId];
    document.querySelectorAll('#sceneRoot .actions .btn-a').forEach(b=>{
      if(b.dataset.act==='shock')b.disabled=!V.aedReady||V.over;else b.disabled=V.over;
      if(b.dataset.act==='compress'){const on=a&&a.task==='compressing';b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',String(!!on));}});
    const compressingNow=AV[activeId]&&AV[activeId].task==='compressing'&&!V.over;
    if(compressingNow)ctx.sound.startMetro();else ctx.sound.stopMetro();
    if(V.over && !_done){_done=true; ctx.onOver(grade());}
  }

  function grade(){
    const s=STATS;
    const call=s.callTime==null?0:Math.max(0,Math.round(25-Math.max(0,s.callTime-8)*3));
    const cont=Math.max(0,Math.round(30-s.interruptions*4-Math.max(0,s.noCprTotal-CFG.cprGraceSec)*2));
    const rot=Math.max(0,Math.round(25-s.tiredCompressSeconds*2));
    const role=Math.max(0,Math.round(20-s.misassign*10));
    let total=call+cont+rot+role;if(!s.shocked)total=Math.min(total,55);
    const fail=!s.shocked;
    const g=total>=90?'S':total>=75?'A':total>=60?'B':'C';
    const verdict=fail?'未能挽回':'抢救成功';
    const sub=`综合评分 ${total} · 用时 ${fmt(_clock)}`;
    return{total,g,fail,verdict,sub,rows:[
      ['呼救时机',call,25,'下次更早呼救，越早到的帮手越多。'],
      ['按压连续性',cont,30,'减少切换，让按压尽量不中断。'],
      ['轮换时机',rot,25,'体力变红就立刻换人，别硬扛。'],
      ['人岗匹配',role,20,'护士留着按压，跑腿交给机动快的人。'],
    ]};
  }

  function bindActionButtons(){
    document.getElementById('crew').addEventListener('click',e=>{const el=e.target.closest('.ch');if(el)setActive(+el.dataset.id);});
    document.querySelectorAll('#sceneRoot .actions .btn-a').forEach(b=>b.addEventListener('click',()=>{if(V.over)return;ACT[b.dataset.act](AV[activeId]);render();}));
    document.getElementById('pauseBtn').addEventListener('click',e=>{_paused=!_paused;e.target.textContent=_paused?'继续':'暂停';if(_paused)ctx.sound.stopMetro();});
    const soundBtn=document.getElementById('soundBtn');
    soundBtn.addEventListener('click',()=>{ctx.sound.unlock();const on=!ctx.sound.isOn();ctx.sound.setOn(on);soundBtn.setAttribute('aria-pressed',String(on));soundBtn.textContent=on?'声音 ♪':'声音 ✕';});
    document.getElementById('timer').textContent='00:00';
  }

  return {
    mount(){
      ctx.root.innerHTML=CPR_HTML;
      bindActionButtons();
      tutor.emit('intro',{_now:_clock});
      render();
    },
    action(name){
      if(V.over)return;
      ACT[name]&&ACT[name](AV[activeId]);
      render();
    },
    tick(c){
      _clock=c;
      if(V.over||_paused)return;
      document.getElementById('timer').textContent=fmt(_clock);
      let compressing=false;
      AV.forEach(a=>{const active=a.id===activeId;
        if(a.task==='compressing'&&active){compressing=true;a.fatigue=Math.min(100,a.fatigue+a.arch.fatUp);
          V.surv+=(a.fatigue<CFG.tiredAt?CFG.cprGain:CFG.cprTiredGain)*a.arch.gainMul;}
        else if(a.task!=='compressing'){a.fatigue=Math.max(0,a.fatigue-CFG.fatRest);}
        if(a.task==='fetchingAED'){if(--a.t<=0){a.task='idle';V.aedReady=true;tutor.emit('aed_fetched',{_now:_clock,name:a.name});}}
        if(a.task==='calling'){if(--a.t<=0){a.task='idle';const b=addAvatar(RECRUITS[recruitIx++%RECRUITS.length]);tutor.emit('crew_joined',{_now:_clock,name:b.name,trait:b.arch.trait});}}
      });
      V.surv-=CFG.decay;
      if(!compressing){V.noCpr++;V.surv-=CFG.interruptPenalty;STATS.noCprTotal++;}else V.noCpr=0;
      if(STATS._wasComp&&!compressing)STATS.interruptions++;STATS._wasComp=compressing;
      const ca=AV[activeId];
      if(ca&&ca.task==='compressing'&&ca.fatigue>=CFG.tiredAt)STATS.tiredCompressSeconds++;
      tutor.emit('tick',{_now:_clock,noCpr:V.noCpr,activeTired:!!(ca&&ca.task==='compressing'&&ca.fatigue>=CFG.tiredAt),activeKey:ca&&ca.key});
      V.surv=Math.max(0,Math.min(100,V.surv));
      if(V.surv<=0&&!V.over){V.over=true;ctx.sound.stopMetro();ctx.sound.skipNextCue();tutor.emit('defeat',{_now:_clock});ctx.sound.cueLose();}
      render();
    },
    keymap(){const m={};AV.forEach(a=>m[String(a.id+1)]=()=>setActive(a.id));return m;},
    unmount(){ctx.sound.stopMetro();ctx.root.innerHTML='';},
  };
});
