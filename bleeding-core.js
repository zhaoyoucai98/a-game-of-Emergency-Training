const BleedingCore = {
  CASES:[
    {id:'abrasion',title:'轻微擦伤',desc:'膝盖擦伤，有泥沙和少量渗血。',steps:['rinse','iodine','cover'],score:'clean',hint:'流动清水冲洗污物 → 碘伏消毒 → 无菌纱布/创可贴覆盖。'},
    {id:'limb_small',title:'四肢小伤口渗血',desc:'前臂小伤口持续渗血，需要加压止血。',steps:['press','elevate'],score:'pressure',hold:3,hint:'无菌纱布或干净毛巾持续按压 5-10 分钟，不可中途松开，并抬高肢体。'},
    {id:'arterial',title:'严重动脉大出血',desc:'小腿伤口呈喷射状出血，普通按压效果有限。',steps:['thick_press','tourniquet','proximal','pad_cloth','record_time','loosen_note'],score:'tourniquet',hint:'厚纱布多层覆盖并持续重压；无效时止血带绑近心端、垫布料、记录时间。'},
    {id:'nose',title:'鼻出血',desc:'鼻腔出血，患者紧张地想往后仰。',steps:['lean_forward','pinch_nose','mouth_breathe','cold_compress'],score:'lethal',hint:'身体微前倾，捏住鼻翼软肉 10 分钟，用嘴呼吸，冷敷鼻梁。'},
    {id:'head',title:'头部磕碰出血',desc:'头部出血，伴随持续呕吐和意识模糊。',steps:['do_not_move','side_lying','call_120'],score:'lethal',hint:'出现呕吐、意识模糊或昏迷，严禁移动；侧卧防窒息，立即拨打 120。'},
  ],
  ACTIONS:{
    rinse:{label:'流动清水冲洗',text:'先把泥沙和污物冲掉，降低感染风险。'},
    iodine:{label:'碘伏消毒',text:'碘伏适合用于皮肤破损处周围消毒。'},
    cover:{label:'无菌覆盖',text:'用无菌纱布或创可贴覆盖，保持清洁。'},
    alcohol:{label:'酒精直接涂抹',text:'酒精刺激性太强，会损伤组织，不应用来直接涂抹破损伤口。',lethal:true,score:'clean'},
    alcohol_pad:{label:'用酒精棉球直接擦拭伤口',text:'酒精会刺激破损组织，影响愈合，破损伤口不应直接擦拭。',lethal:true,score:'clean'},
    powder:{label:'撒消炎粉覆盖伤口',text:'粉末可能结块、污染创面，也会影响后续清创判断。',lethal:true,score:'clean'},
    liquor:{label:'白酒冲伤口',text:'白酒不能替代规范消毒，可能刺激伤口并增加感染风险。',lethal:true,score:'clean'},
    toothpaste:{label:'涂草药泥',text:'未经消毒的草药泥可能污染伤口，增加感染风险。',lethal:true,score:'clean'},
    press:{label:'持续按压',text:'保持压力，不要反复掀开查看。'},
    peek:{label:'松开查看',text:'中途松开会破坏血凝块，让出血反复。',score:'pressure'},
    elevate:{label:'抬高肢体',text:'让受伤肢体高于心脏，有助于减少出血。'},
    thick_press:{label:'多层厚纱布重压',text:'严重出血先用厚纱布多层覆盖并持续重压。'},
    tourniquet:{label:'使用止血带',text:'加压无效时才考虑止血带。'},
    proximal:{label:'绑在近心端',text:'止血带应绑在伤口靠近心脏一侧。'},
    distal:{label:'绑在远心端',text:'绑在远心端无法有效阻断来血，会延误止血。',lethal:true,score:'tourniquet'},
    pad_cloth:{label:'皮肤处垫布料',text:'皮肤处必须垫布料，不能直接勒皮肤。'},
    bare_skin:{label:'直接勒皮肤',text:'止血带直接勒皮肤会造成严重组织损伤。',lethal:true,score:'tourniquet'},
    record_time:{label:'记录绑扎时间',text:'必须记录止血带绑扎时间，方便后续救治。'},
    loosen_note:{label:'记住定时放松',text:'每 30-40 分钟松开 1-2 分钟，防止肢体坏死。'},
    wire:{label:'铁丝/电线代替',text:'严禁用铁丝、电线、细绳代替止血带。',lethal:true,score:'tourniquet'},
    lean_forward:{label:'身体微前倾',text:'前倾可避免血液倒流入口咽。'},
    pinch_nose:{label:'捏住鼻翼软肉',text:'连续捏住鼻翼软肉约 10 分钟。'},
    mouth_breathe:{label:'用嘴呼吸',text:'捏鼻时用嘴呼吸，保持冷静。'},
    cold_compress:{label:'冷敷鼻梁',text:'冷敷可辅助收缩血管。'},
    head_back:{label:'仰头止血',text:'仰头可能导致血液倒流，呛入气管引发窒息。',lethal:true,score:'lethal'},
    stuff_paper:{label:'鼻孔塞纸巾',text:'纸巾可能污染鼻腔、残留纤维，不推荐塞入鼻孔。',lethal:true,score:'lethal'},
    do_not_move:{label:'不要移动患者',text:'有呕吐、意识模糊或昏迷时，严禁随意移动。'},
    side_lying:{label:'平躺侧卧',text:'侧卧可减少呕吐物误吸窒息风险。'},
    call_120:{label:'拨打 120',text:'疑似严重头部损伤必须立即拨打 120。'},
    move_patient:{label:'扶起来转移',text:'伴随呕吐或意识障碍时移动患者可能加重损伤。',lethal:true,score:'lethal'},
    shake:{label:'摇晃叫醒',text:'不要摇晃疑似头部损伤患者，可能加重伤情。',lethal:true,score:'lethal'},
  },
  DISTRACTORS:{
    rinse:['alcohol_pad','powder'], iodine:['alcohol','liquor'], cover:['powder','alcohol_pad'],
    press:['peek','elevate'], elevate:['peek','press'],
    thick_press:['tourniquet','wire'], tourniquet:['wire','distal'], proximal:['distal','bare_skin'], pad_cloth:['bare_skin','wire'], record_time:['loosen_note','distal'], loosen_note:['wire','bare_skin'],
    lean_forward:['head_back','stuff_paper'], pinch_nose:['head_back','stuff_paper'], mouth_breathe:['stuff_paper','head_back'], cold_compress:['head_back','stuff_paper'],
    do_not_move:['move_patient','shake'], side_lying:['move_patient','shake'], call_120:['shake','move_patient'],
  },
  create(){ const B={index:0,case:null,risk:100,finished:false,hold:0,mistakeCount:0,elapsed:0,stats:{done:0,actions:0},history:[]}; return this.ensure(B); },
  ensure(B){ if(!B.case) B.case=this.buildCase(B.index); return B; },
  buildCase(index){ const src=this.CASES[index]; return Object.assign({},src,{step:0,done:false}); },
  actionMeta(name){ return this.ACTIONS[name]||{label:name,text:'这个动作不适合当前处置。'}; },
  current(B){ this.ensure(B); return B.case; },
  expected(B){ this.ensure(B); return B.case.steps[B.case.step]; },
  options(B){ this.ensure(B); const expected=this.expected(B); const ids=[expected].concat(this.DISTRACTORS[expected]||[]); return ids.slice(0,3).map(k=>Object.assign({id:k},this.actionMeta(k))); },
  skipCase(B){ this.ensure(B); this.advance(B,{skipped:true}); return B.case; },
  act(B,name){ this.ensure(B); if(B.finished)return {event:'noop'}; B.stats.actions++; const c=B.case, expected=this.expected(B), meta=this.actionMeta(name);
    if(c.id==='limb_small'&&name==='press'&&expected==='press'){ B.hold=Math.max(B.hold,1); c.step=1; return this.res(B,'correct',name,meta); }
    if(c.id==='limb_small'&&name==='elevate'&&expected==='elevate'&&B.hold<c.hold)return this.intervene(B,name,Object.assign({},meta,{text:'按压时间还不够，先保持持续按压，不要急着抬高手臂。'}));
    if(name!==expected)return this.intervene(B,name,meta);
    c.step++;
    if(c.step>=c.steps.length)return this.advance(B,this.res(B,'case_done',name,meta));
    return this.res(B,'correct',name,meta);
  },
  tick(B,clock){ this.ensure(B); if(B.finished)return {event:'noop'}; B.elapsed=Math.max(B.elapsed||0,clock||0); if(B.case.id==='limb_small'&&B.hold>0)B.hold=Math.min(B.case.hold,B.hold+1); return {event:'tick',hold:B.hold,clock}; },
  intervene(B,name,meta){ B.mistakeCount++; B.risk=Math.max(0,B.risk-10); return this.res(B,'mentor_intervention',name,meta,{lethal:!!meta.lethal,mistakeCount:B.mistakeCount}); },
  advance(B,res){ B.stats.done++; B.case.done=true; B.index++; B.hold=0; if(B.index>=this.CASES.length){ B.finished=true; return Object.assign({},res,{event:'finished'}); } B.case=this.buildCase(B.index); return res; },
  res(B,event,name,meta,extra){ const r=Object.assign({event,action:name,label:meta.label,text:meta.text,caseId:B.case.id,caseTitle:B.case.title,step:B.case.step,risk:B.risk},extra||{}); B.history.push(r); return r; },
  grade(B){ const m=B.mistakeCount; const timePenalty=Math.min(15,Math.floor((B.elapsed||0)/20)*5); let base=m===0?100:m===1?85:m===2?70:m===3?60:45; let total=Math.max(0,base-timePenalty); const g=total>=90?'S':total>=75?'A':total>=60?'B':total>=50?'C':'D'; return {total,g,fail:false,timePenalty,verdict:B.finished?'止血处置完成':'训练进行中',sub:`综合评分 ${total} · 错误尝试 ${m} 次 · 时间扣分 ${timePenalty}`,rows:[
      ['清洁消毒',Math.max(0,25-m*3),25,'擦伤先清水冲洗，再碘伏消毒并无菌覆盖，别直接用酒精棉球或撒粉末。'],
      ['加压止血',Math.max(0,25-m*3),25,'小伤口渗血要持续按压 5-10 分钟，别中途松开查看。'],
      ['止血带安全',Math.max(0,25-m*3),25,'止血带只在加压无效时使用，绑近心端、垫布料、记录时间。'],
      ['精准决策',Math.max(0,25-m*4),25,'每次导师干预都会降低最终评级，追求 S 需要一次做对。'],
    ]}; },
};
if (typeof window!=='undefined') window.BleedingCore=BleedingCore;
if (typeof module!=='undefined') module.exports=BleedingCore;
