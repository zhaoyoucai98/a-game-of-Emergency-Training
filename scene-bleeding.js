const BLEEDING_RULES=[
  {id:'bl_intro',on:'intro',priority:10,once:true,type:'hint',lines:['导师提示：急救现场没有重来的机会，但我会纠正你的错误。（S级）需要精准的操作！每一个错误的尝试都会影响最终的评级。谨慎思考，尽量一次做对！']},
  {id:'bl_correct',on:'correct',priority:30,cooldown:1,resolve:p=>({type:'correct',text:p.text})},
  {id:'bl_case_done',on:'case_done',priority:50,resolve:p=>({type:'correct',text:`${p.caseTitle}处理完成。下一例：${p.nextTitle}`})},
  {id:'bl_finished',on:'finished',priority:90,once:true,type:'correct',lines:['全部病例完成，进入止血复盘。']},
  {id:'bl_intervention',on:'mentor_intervention',priority:90,cooldown:1,resolve:p=>({type:'warn',text:`导师干预：${p.text} 当前错误 ${p.mistakeCount} 次，评级已受影响。`})},
  {id:'bl_hold',on:'tick',priority:20,cooldown:3,when:p=>p.caseId==='limb_small'&&p.hold>0&&p.hold<3,type:'hint',lines:['持续按压中，不要松开查看。']},
];

if (typeof window!=='undefined') window.BLEEDING_RULES=BLEEDING_RULES;
if (typeof module!=='undefined') module.exports={BLEEDING_RULES};

if (typeof SceneHost !== 'undefined') SceneHost.register('bleeding',(ctx)=>{
  const tutor=makeTutor(BLEEDING_RULES);
  let B=BleedingCore.create();
  let _over=false;
  let _paused=false;
  let _blocked=false;
  const HTML=`
   <div class="bl">
     <div class="bl__stage">
       <svg viewBox="0 0 260 136" class="bl__victim" aria-hidden="true">
         <ellipse cx="130" cy="118" rx="104" ry="8" fill="#E8E8E6"/>
         <circle cx="76" cy="56" r="18" stroke="#16181D" stroke-width="2" fill="none"/>
         <path d="M94 58 H184 q18 0 18 18 q0 18 -18 18 H94 q-18 0 -18 -18 q0 -18 18 -18Z" stroke="#16181D" stroke-width="2" fill="none"/>
         <path id="blMark" d="M168 70 l16 12 m0 -12 l-16 12" stroke="#E5383B" stroke-width="3" stroke-linecap="round"/>
       </svg>
       <div class="bl__copy">
         <div class="bl__kicker" id="blCount">病例 1 / 5</div>
         <h2 id="blTitle">出血止血</h2>
         <p id="blDesc"></p>
         <p class="bl__rule">导师提示：急救现场没有重来的机会，但我会纠正你的错误。（S级）需要精准的操作！每一个错误的尝试都会影响最终的评级。谨慎思考，尽量一次做对！</p>
         <p class="bl__hint" id="blHint"></p>
         <p class="bl__score" id="blScore"></p>
         <div class="bl__hold" id="blHold" hidden><i></i><span></span></div>
       </div>
     </div>
     <footer class="actions bl__actions" id="blActions"></footer>
     <div class="bl__toast" id="blToast" hidden role="dialog" aria-modal="true" aria-label="导师纠正">
       <div class="bl__toast-card"><b>导师纠正</b><p id="blToastText"></p><button class="btn-a bl__toast-ok" id="blToastOk">我知道了</button></div>
     </div>
   </div>`;
  function payload(res){
    const c=BleedingCore.current(B);
    const next=BleedingCore.CASES[B.index]||c;
    return Object.assign({caseId:c.id,caseTitle:res.caseTitle||c.title,nextTitle:next.title,hold:B.hold},res);
  }
  function emit(res){ if(!res||res.event==='noop')return; tutor.emit(res.event,payload(res)); }
  function over(){ if(_over)return; _over=true; ctx.sound.skipNextCue(); ctx.sound[BleedingCore.grade(B).fail?'cueLose':'cueWin'](); ctx.onOver(BleedingCore.grade(B)); }
  function updateScore(){ const el=document.getElementById('blScore'); if(el)el.textContent=`当前评级 ${BleedingCore.grade(B).g} · 错误尝试 ${B.mistakeCount} 次`; }
  function showCorrection(res){ _blocked=true; const toast=document.getElementById('blToast'); const text=document.getElementById('blToastText'); const ok=document.getElementById('blToastOk'); text.textContent=res.text; toast.hidden=false; toast.classList.add('is-show'); document.querySelectorAll('#blActions .btn-a').forEach(b=>b.disabled=true); ok.onclick=()=>{ toast.classList.remove('is-show'); toast.hidden=true; _blocked=false; render(); }; ok.focus(); }
  function render(){ if(_blocked)return;
    const c=BleedingCore.current(B);
    const total=BleedingCore.CASES.length;
    const pct=Math.max(0,Math.round(B.risk));
    const bar=document.getElementById('survBar');
    const wrap=document.getElementById('survWrap');
    if(bar){ bar.style.width=pct+'%'; bar.style.background=pct>60?'var(--vital)':pct>35?'var(--amber)':'var(--critical)'; }
    if(wrap)wrap.setAttribute('aria-valuenow',pct);
    const pctEl=document.getElementById('survPct'); if(pctEl)pctEl.textContent=pct+'%';
    document.getElementById('blCount').textContent=`病例 ${Math.min(B.index+1,total)} / ${total}`;
    document.getElementById('blTitle').textContent=c.title;
    document.getElementById('blDesc').textContent=c.desc;
    document.getElementById('blHint').textContent=c.hint;
    updateScore();
    const hold=document.getElementById('blHold');
    if(c.id==='limb_small'&&B.hold>0){ hold.hidden=false; hold.querySelector('i').style.width=Math.round(B.hold/c.hold*100)+'%'; hold.querySelector('span').textContent=`持续按压 ${B.hold}/${c.hold}`; }
    else hold.hidden=true;
    const actions=document.getElementById('blActions');
    actions.innerHTML=BleedingCore.options(B).map(a=>`<button class="btn-a bl__choice" data-b="${a.id}" aria-label="${a.label}"><span>${a.label}</span><i aria-hidden="true"></i></button>`).join('');
    actions.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>inst.action(b.dataset.b));
  }
  const inst={
    mount(){ ctx.root.innerHTML=HTML; document.getElementById('timer').textContent='00:00'; document.getElementById('pauseBtn').onclick=e=>{_paused=!_paused;e.target.textContent=_paused?'继续':'暂停';}; const soundBtn=document.getElementById('soundBtn'); soundBtn.onclick=()=>{ctx.sound.unlock();const on=!ctx.sound.isOn();ctx.sound.setOn(on);soundBtn.setAttribute('aria-pressed',String(on));soundBtn.textContent=on?'声音 ♪':'声音 ✕';}; tutor.emit('intro',{_now:0}); render(); },
    action(name){ if(_over||_blocked)return; const btn=document.querySelector(`#blActions [data-b="${name}"]`); const before=B.case&&B.case.title; const res=BleedingCore.act(B,name); if(btn){ btn.classList.add(res.event==='mentor_intervention'?'is-wrong':'is-correct'); btn.querySelector('i').textContent=res.event==='mentor_intervention'?'×':'✓'; }
      if(res.event==='mentor_intervention'){ updateScore(); emit(res); showCorrection(res); return; }
      if(res.event==='case_done'&&before)res.caseTitle=before; emit(res); updateScore(); setTimeout(()=>{render(); if(B.finished)setTimeout(over,650);},260); },
    tick(clock){ if(_over||_paused||_blocked)return; document.getElementById('timer').textContent=String(Math.floor(clock/60)).padStart(2,'0')+':'+String(clock%60).padStart(2,'0'); const r=BleedingCore.tick(B,clock); tutor.emit('tick',payload(r)); render(); },
    unmount(){},
  };
  return inst;
});
