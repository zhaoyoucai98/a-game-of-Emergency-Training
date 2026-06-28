const HEIMLICH_RULES=[
  {id:'hm_intro',on:'intro',priority:10,once:true,type:'hint',lines:['先判断，再施救。完全梗阻会快速缺氧，错误尝试和拖延都会降低评级。']},
  {id:'hm_step_completed',on:'step_completed',priority:80,cooldown:1,resolve:p=>({type:'correct',text:p.text})},
  {id:'hm_phase_advanced',on:'phase_advanced',priority:70,cooldown:1,type:'correct',lines:['进入施救阶段。现在执行海姆立克急救法。']},
  {id:'hm_thrust',on:'thrust_progress',priority:40,cooldown:1,resolve:p=>({type:'correct',text:`腹部冲击 ${p.thrustCount}/5，保持向内向上的节奏。`})},
  {id:'hm_intervention',on:'mentor_intervention',priority:90,cooldown:1,resolve:p=>({type:'warn',text:`导师纠正：${p.text}`})},
  {id:'hm_learning',on:'learning_intervention',priority:85,cooldown:1,resolve:p=>({type:'warn',text:`错误后果：${p.text}`})},
  {id:'hm_timeout',on:'timeout_warning',priority:95,cooldown:1,type:'warn',lines:['长时间没有有效操作，缺氧正在加重，请立刻判断并施救。']},
  {id:'hm_failed',on:'failed',priority:99,once:true,type:'warn',lines:['缺氧倒计时耗尽，施救失败。']},
  {id:'hm_cleared',on:'cleared',priority:99,once:true,type:'correct',lines:['异物排出，呼吸恢复。']},
];

if (typeof window!=='undefined') window.HEIMLICH_RULES=HEIMLICH_RULES;
if (typeof module!=='undefined') module.exports={HEIMLICH_RULES};

if (typeof SceneHost !== 'undefined') SceneHost.register('heimlich',(ctx)=>{
  const tutor=makeTutor(HEIMLICH_RULES);
  let H=HeimlichCore.create();
  let _over=false;
  let _blocked=false;
  const payload=(extra={})=>Object.assign({oxygen:H.oxygen,phase:H.phase,mistakeCount:H.mistakeCount,thrustCount:H.thrustCount},extra);
  function emit(res){ if(!res||res.event==='noop')return; tutor.emit(res.event,payload(res)); }
  function buildGrade(){ const g=HeimlichCore.grade(H); return Object.assign(g,{verdict:H.phase==='cleared'?'梗阻解除':'施救失败',sub:`综合评分 ${g.total} · 错误 ${H.mistakeCount} 次 · 冲击 ${H.thrustCount}/5`}); }
  function over(){ if(_over)return; _over=true; ctx.sound.skipNextCue(); ctx.sound[H.phase==='cleared'?'cueWin':'cueLose'](); ctx.onOver(buildGrade()); }
  const HTML=`
   <div class="hm hm-sim">
     <div class="hm__top"><span class="hm__o2-label">缺氧倒计时</span>
       <div class="surv hm__o2"><i id="o2bar"></i></div><span class="surv-pct" id="o2pct">100%</span></div>
     <div class="hm__stage"><svg viewBox="0 0 220 120" class="victim" aria-hidden="true">
       <circle cx="60" cy="50" r="18" stroke="#16181D" stroke-width="2" fill="none"/>
       <path d="M60 68 q-24 6 -24 40 M60 68 q24 6 24 40" stroke="#16181D" stroke-width="2" fill="none"/>
       <path d="M52 44 q8 -8 16 0" stroke="#E5383B" stroke-width="2" fill="none"/>
       <path d="M88 56 q20 -20 48 -8" stroke="#E5383B" stroke-width="2" fill="none" stroke-dasharray="4 4"/></svg>
       <div class="hm__copy"><div class="hm__phase" id="hmPhase">阶段一 · 评估</div><p class="hm__hint" id="hmHint"></p><p class="hm__learn" id="hmLearn" hidden></p><p class="hm__score" id="hmScore"></p>
       <div class="hm__thrust" id="hmThrust" hidden><i></i><span></span></div></div></div>
     <div class="hm__actions" id="hmActions"></div>
     <div class="hm__toast" id="hmToast" hidden role="dialog" aria-modal="true" aria-label="导师纠正">
       <div class="hm__toast-card"><b>导师纠正</b><p id="hmToastText"></p><button class="btn-a hm__toast-ok" id="hmToastOk">我知道了</button></div>
     </div>
   </div>`;
  function updateMeters(){
    const o2bar=document.getElementById('o2bar'); if(!o2bar)return;
    o2bar.style.width=H.oxygen+'%';
    o2bar.style.background=`linear-gradient(90deg,var(--critical),var(--amber),var(--vital))`;
    document.getElementById('o2pct').textContent=Math.round(H.oxygen)+'%';
    const grade=HeimlichCore.grade(H);
    const label=H.stats.assessed||H.thrustCount>0||H.mistakeCount>0||H.phase==='cleared'||H.phase==='failed'?grade.g:'待评估';
    document.getElementById('hmScore').textContent=`当前评级 ${label} · 错误尝试 ${H.mistakeCount} 次`;
    const th=document.getElementById('hmThrust');
    if(H.phase==='rescue'||H.phase==='cleared'){ th.hidden=false; th.querySelector('i').style.width=(H.thrustCount/5*100)+'%'; th.querySelector('span').textContent=`有效冲击 ${H.thrustCount}/5`; }
    else th.hidden=true;
  }
  function thrustAnim(){ const v=document.querySelector('.victim'); if(!v)return; v.classList.remove('is-thrust'); void v.offsetWidth; v.classList.add('is-thrust'); }
  function showCorrection(text){ _blocked=true; const toast=document.getElementById('hmToast'); const t=document.getElementById('hmToastText'); const ok=document.getElementById('hmToastOk'); t.textContent=text; toast.hidden=false; toast.classList.add('is-show'); document.querySelectorAll('#hmActions .btn-a').forEach(b=>b.disabled=true); ok.onclick=()=>{ toast.classList.remove('is-show'); toast.hidden=true; _blocked=false; render(); }; ok.focus(); }
  function render(){ if(_blocked)return; updateMeters();
    const hint=H.phase==='assess'?'面色涨红，手掐脖子，无法发声。先判断是否为完全气道异物梗阻。':H.phase==='rescue'?H.sceneText:H.phase==='cleared'?'异物排出，呼吸恢复。':'缺氧倒计时耗尽，施救失败。';
    document.getElementById('hmHint').textContent=hint;
    const learn=document.getElementById('hmLearn');
    learn.hidden=H.stepStatus!=='completed';
    learn.textContent=H.phase==='assess'?'操作正确。但在紧急慌乱中，人们常犯以下错误：喂水、盲目拍背。你可以点击它们查看后果，再进入下一步。':'操作正确。请留意旁边的错误做法：喂水和盲目抠取异物都会让风险更高。';
    document.getElementById('hmPhase').textContent=H.phase==='assess'?'阶段一 · 评估':H.phase==='rescue'?'阶段二 · 施救':H.phase==='cleared'?'完成':'失败';
    const wrap=document.getElementById('hmActions');
    wrap.innerHTML=HeimlichCore.options(H).map(a=>`<button class="btn-a hm__choice${a.id==='next'?' hm__next':''}${H.correctPicked[a.id]?' success':''}${H.learned[a.id]?' error':''}" data-h="${a.id}" aria-label="${a.label}"><span>${a.label}</span><i aria-hidden="true">${H.correctPicked[a.id]?'✓':H.learned[a.id]?'×':''}</i></button>`).join('');
    wrap.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>inst.action(b.dataset.h));
    updateMeters();
  }
  const inst={
    mount(){ ctx.root.innerHTML=HTML; document.getElementById('timer').textContent='00:00'; tutor.emit('intro',payload()); render(); },
    action(name){ if(_over||_blocked)return; const btn=document.querySelector(`#hmActions [data-h="${name}"]`); const res=HeimlichCore.act(H,name); const ok=res.event==='step_completed'||res.event==='phase_advanced'||res.event==='thrust_progress'||res.event==='event_resolved'||res.event==='cleared'; if(btn){ btn.classList.add(ok?'success':'error'); btn.querySelector('i').textContent=ok?'✓':'×'; }
      if(res.event==='thrust_progress'||res.event==='step_completed'&&H.phase==='rescue')thrustAnim();
      updateMeters(); emit(res);
      if(res.event==='mentor_intervention'||res.event==='learning_intervention'||res.event==='failed'){ showCorrection(res.text); if(res.event==='failed')setTimeout(over,900); return; }
      if(res.event==='cleared'){ setTimeout(()=>{render();over();},650); return; }
      setTimeout(render,280);
    },
    tick(clock){ if(_over||_blocked)return; document.getElementById('timer').textContent=String(Math.floor(clock/60)).padStart(2,'0')+':'+String(clock%60).padStart(2,'0'); const r=HeimlichCore.tick(H,clock); updateMeters(); emit(r); if(r.event==='timeout_warning')showCorrection(r.text); if(r.event==='failed'){ showCorrection(r.text); setTimeout(over,900); } },
    unmount(){},
  };
  return inst;
});
