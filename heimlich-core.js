const HeimlichCore = {
  H_CFG:{maxOxygen:100,passiveLoss:2,wrongLoss:20,timeoutSec:20,thrustTarget:5},
  ACTIONS:{
    confirm_full:{label:'确认完全梗阻',text:'患者无法发声、手掐脖子、面色涨红，符合完全气道异物梗阻特征。'},
    give_water:{label:'喂水帮助吞咽',text:'患者已无法发声，属于完全梗阻。此时喂水会导致异物卡得更死，还可能误吸。专心处理气道梗阻。'},
    blind_back:{label:'先拍背试试看',text:'患者已无法发声，属于完全梗阻，盲目拍背可能导致异物移位锁死气道。'},
    continue_thrust:{label:'继续腹部冲击',text:'保持从后方环抱，向内向上快速冲击。'},
    adjust_thrust:{label:'调整站位再次冲击',text:'重新贴近患者背后，拳眼置于脐上两横指处，再次向内向上冲击。'},
    clear_mouth:{label:'侧头清理口腔',text:'出现呕吐反应时，先侧头清理口腔，避免误吸，然后继续冲击。'},
    back_again:{label:'异物松动，拍背试试',text:'完全梗阻施救中不要突然改为拍背，可能改变异物位置并延误有效冲击。'},
    stop_struggle:{label:'患者挣扎，停止操作',text:'挣扎常来自缺氧和恐惧，停止操作会继续缺氧，应稳定体位继续有效冲击。'},
    lay_flat:{label:'让患者躺平',text:'患者仍有意识时不应直接躺平，会耽误站立位海姆立克急救法。'},
    pinch_renzhong:{label:'掐人中刺激',text:'掐人中不能解除气道异物梗阻，会浪费关键时间。'},
    finger_sweep:{label:'伸手抠出异物',text:'不要盲目用手指抠取，看不见异物时可能把异物推得更深。'},
    next:{label:'下一步',text:'继续下一阶段。'},
  },
  create(rng){ return {phase:'assess',stepStatus:'active',oxygen:100,mistakeCount:0,thrustCount:0,round:0,roundEvent:null,roundOptions:null,sceneText:'面色涨红，手掐脖子，无法发声。',correctPicked:{},learned:{},lastActionAt:0,_clock:0,_timeoutCharged:false,_rng:typeof rng==='function'?rng:Math.random,stats:{assessed:false,clearedAt:null,failedAt:null}}; },
  actionMeta(name){ return this.ACTIONS[name]||{label:name,text:'这个动作不适合当前阶段。'}; },
  idsFor(H){
    if(H.phase==='assess')return ['confirm_full','give_water','blind_back'];
    if(H.phase==='rescue'){
      if(H.stepStatus==='completed')return ['continue_thrust','give_water','finger_sweep'];
      if(!H.roundOptions)this.refreshRound(H);
      return H.roundOptions;
    }
    return [];
  },
  options(H){ const ids=this.idsFor(H).slice(); if(H.stepStatus==='completed')ids.push('next'); return ids.map(id=>Object.assign({id,correct:this.isCorrect(H,id)},this.actionMeta(id))); },
  isCorrect(H,id){ if(H.stepStatus==='completed')return id==='next'; if(H.phase==='assess')return id==='confirm_full'; if(H.phase==='rescue')return H.roundEvent==='vomit'?id==='clear_mouth':id==='continue_thrust'||id==='adjust_thrust'; return false; },
  pick(H,arr,n){ const pool=arr.slice(), out=[]; while(out.length<n&&pool.length){ const i=Math.floor((H._rng?H._rng():Math.random())*pool.length)%pool.length; out.push(pool.splice(i,1)[0]); } return out; },
  shuffle(H,arr){ const out=arr.slice(); for(let i=out.length-1;i>0;i--){ const j=Math.floor((H._rng?H._rng():Math.random())*(i+1)); const t=out[i]; out[i]=out[j]; out[j]=t; } return out; },
  refreshRound(H){
    if(H.roundEvent==='vomit'){ H.roundOptions=this.shuffle(H,['clear_mouth','give_water','lay_flat']); return; }
    const correct=H.thrustCount%2===0?'continue_thrust':'adjust_thrust';
    const wrong=this.pick(H,['give_water','back_again','stop_struggle','lay_flat','pinch_renzhong','finger_sweep'],2);
    H.roundOptions=this.shuffle(H,[correct].concat(wrong));
  },
  act(H,name){
    if(H.phase==='cleared'||H.phase==='failed')return {event:'noop'};
    H.lastActionAt=H._clock; H._timeoutCharged=false;
    if(name==='next')return this.next(H);
    if(H.phase==='assess'){
      if(name==='confirm_full')return this.completeAssess(H,name);
      return this.intervene(H,name,this.actionMeta(name));
    }
    if(H.phase==='rescue'){
      if(this.isCorrect(H,name))return name==='clear_mouth'?this.resolveEvent(H,name):this.successThrust(H,name);
      return this.intervene(H,name,this.actionMeta(name));
    }
    return {event:'noop'};
  },
  completeAssess(H,name){ H.stepStatus='completed'; H.correctPicked[name]=true; H.stats.assessed=true; return this.res(H,'step_completed',name,this.actionMeta(name),{text:'判断正确。操作正确，但在紧急慌乱中，人们常犯以下错误：喂水、盲目拍背。你可以点击它们查看后果，再进入下一步。'}); },
  next(H){
    if(H.stepStatus!=='completed')return this.intervene(H,'next',{label:'下一步',text:'先完成当前正确操作，再进入下一步。'});
    if(H.phase==='assess'){ H.phase='rescue'; H.stepStatus='active'; H.round=1; H.roundOptions=null; H.sceneText='已确认完全梗阻。立刻开始第一轮腹部冲击。'; this.refreshRound(H); return this.res(H,'phase_advanced','next',this.actionMeta('next'),{sceneText:H.sceneText}); }
    if(H.phase==='rescue'){ H.phase='cleared'; H.stats.clearedAt=H._clock; H.sceneText='异物排出，呼吸恢复。'; return this.res(H,'cleared','next',{label:'完成',text:'异物排出，呼吸恢复。'},{sceneText:H.sceneText}); }
    return {event:'noop'};
  },
  successThrust(H,name){
    H.thrustCount++;
    H.round++;
    const texts=['冲击有效，患者身体随冲击起伏。但异物未排出，继续！','患者面色依然紫绀，需要更用力的冲击！','注意！患者出现呕吐反应，防止误吸！','坚持住，异物正在松动...','最后一轮有效冲击，异物即将排出！'];
    H.sceneText=texts[Math.min(H.thrustCount-1,texts.length-1)];
    H.roundEvent=H.thrustCount===3?'vomit':null;
    H.roundOptions=null;
    if(H.thrustCount>=this.H_CFG.thrustTarget){ H.stepStatus='completed'; H.correctPicked.continue_thrust=true; H.correctPicked.adjust_thrust=true; H.sceneText='连续有效冲击完成，异物正在松动。也可以查看错误做法后果，再点击下一步完成。'; return this.res(H,'step_completed',name,this.actionMeta(name),{text:H.sceneText,sceneText:H.sceneText,thrustCount:H.thrustCount}); }
    this.refreshRound(H);
    return this.res(H,'thrust_progress',name,this.actionMeta(name),{sceneText:H.sceneText,thrustCount:H.thrustCount,round:H.round});
  },
  resolveEvent(H,name){ H.roundEvent=null; H.roundOptions=null; H.sceneText='已侧头清理口腔，避免误吸。立刻恢复腹部冲击。'; this.refreshRound(H); return this.res(H,'event_resolved',name,this.actionMeta(name),{sceneText:H.sceneText,thrustCount:H.thrustCount,round:H.round}); },
  tick(H,clock){
    if(H.phase==='cleared'||H.phase==='failed'||H.stepStatus==='completed')return {event:'noop',oxygen:H.oxygen};
    H._clock=clock;
    H.oxygen=Math.max(0,H.oxygen-this.H_CFG.passiveLoss);
    if(clock-H.lastActionAt>=this.H_CFG.timeoutSec&&!H._timeoutCharged){
      H._timeoutCharged=true; H.mistakeCount++; H.oxygen=Math.max(0,H.oxygen-12);
      if(H.oxygen<=0)return this.fail(H,'缺氧倒计时耗尽，患者失去意识，施救失败。');
      return {event:'timeout_warning',oxygen:H.oxygen,mistakeCount:H.mistakeCount,text:'长时间没有有效操作，缺氧正在加重，请立刻判断并施救。'};
    }
    if(H.oxygen<=0)return this.fail(H,'缺氧倒计时耗尽，患者失去意识，施救失败。');
    return {event:'tick',oxygen:H.oxygen};
  },
  intervene(H,name,meta){
    H.mistakeCount++; H.learned[name]=true;
    if(H.stepStatus!=='completed'){
      H.oxygen=Math.max(0,H.oxygen-this.H_CFG.wrongLoss);
      if(H.mistakeCount>=2)H.oxygen=Math.max(0,H.oxygen-15);
      if(H.oxygen<=0)return this.fail(H,meta.text,name,meta);
      return this.res(H,'mentor_intervention',name,meta,{mistakeCount:H.mistakeCount,oxygen:H.oxygen,sceneText:H.sceneText});
    }
    return this.res(H,'learning_intervention',name,meta,{mistakeCount:H.mistakeCount,oxygen:H.oxygen,sceneText:H.sceneText});
  },
  fail(H,text,name,meta){ H.phase='failed'; H.oxygen=0; H.stats.failedAt=H._clock; H.sceneText=text; return this.res(H,'failed',name||'timeout',meta||{label:'缺氧失败',text}, {text,sceneText:text,oxygen:0,mistakeCount:H.mistakeCount}); },
  res(H,event,name,meta,extra){ return Object.assign({event,action:name,label:meta.label,text:meta.text,phase:H.phase,stepStatus:H.stepStatus,oxygen:H.oxygen,mistakeCount:H.mistakeCount},extra||{}); },
  grade(H){
    const progressScore=(H.stats.assessed?25:0)+(H.phase==='rescue'||H.phase==='cleared'?10:0)+(H.thrustCount>=5?30:Math.round(H.thrustCount/5*30));
    let base=H.phase==='failed'?45:H.phase==='cleared'?100:Math.min(74,progressScore);
    const mistakePenalty=H.mistakeCount*12;
    const timePenalty=H.stats.clearedAt!=null?Math.min(15,Math.floor(H.stats.clearedAt/10)*5):0;
    const total=Math.max(0,Math.min(H.phase==='failed'?45:100,base-mistakePenalty-timePenalty));
    const g=total>=90?'S':total>=75?'A':total>=60?'B':total>=50?'C':'D';
    return {total,g,fail:H.phase==='failed',rows:[
      ['梗阻判断',H.stats.assessed?25:0,25,'先识别无法发声、手掐脖子、面色涨红等完全梗阻特征。'],
      ['操作时效',Math.max(0,25-timePenalty),25,'完全梗阻会快速缺氧，必须迅速判断并开始施救。'],
      ['动态施救',H.thrustCount>=5?30:Math.round(H.thrustCount/5*30),30,'每轮根据患者反应选择继续冲击、调整站位或处理呕吐风险。'],
      ['错误辨析',Math.max(0,20-mistakePenalty),20,'喂水、停止操作、掐人中、盲目抠取异物都会延误救治并加重风险。'],
    ]};
  },
};
if (typeof window!=='undefined') window.HeimlichCore=HeimlichCore;
if (typeof module!=='undefined') module.exports=HeimlichCore;
