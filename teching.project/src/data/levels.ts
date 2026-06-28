import type { Level } from '@/types/game';

/**
 * 成人心肺复苏关卡
 */
export const cprAdultLevel: Level = {
  id: 'cpr-adult',
  chapter: 'life-basic',
  title: '成人心肺复苏',
  subtitle: 'CPR - Adult',
  difficulty: 'medium',
  isMVP: true,
  knowledgeCards: ['cpr-basics', 'aed-usage'],
  steps: [
    {
      id: 'check-consciousness',
      title: '判断意识',
      description: '轻拍患者双肩并大声呼唤，观察是否有反应',
      actionType: 'click',
      targetArea: 'patient-shoulders',
      correctFeedback: '正确！患者无反应，需要立即施救',
      wrongFeedback: '不要直接开始按压，先判断意识！',
      hint: '点击患者的双肩区域',
    },
    {
      id: 'call-help',
      title: '呼救',
      description: '让旁人拨打120并取来AED',
      actionType: 'sequence',
      correctFeedback: '太棒了！呼救是关键',
      wrongFeedback: '不要忘记呼救，单人施救成功率很低',
      hint: '先拨打120，再取AED',
    },
    {
      id: 'check-breathing',
      title: '判断呼吸',
      description: '观察胸廓起伏5-10秒，判断是否有正常呼吸',
      actionType: 'click',
      duration: 10,
      correctFeedback: '无正常呼吸，立即开始胸外按压',
      wrongFeedback: '观察时间不够，需要5-10秒',
      hint: '观察胸廓起伏',
    },
    {
      id: 'chest-compression',
      title: '胸外按压',
      description: '在两乳头连线中点，掌根发力，按压深度5-6cm，频率100-120次/分钟',
      actionType: 'rhythmic',
      targetArea: 'chest-center',
      duration: 30,
      correctFeedback: '按压频率和深度都很标准！',
      wrongFeedback: '注意按压频率，应在100-120次/分钟之间',
      hint: '跟随节拍器的节奏按压',
    },
    {
      id: 'rescue-breath',
      title: '人工呼吸',
      description: '仰头抬颏开放气道，捏住鼻子，嘴对嘴吹气2次',
      actionType: 'sequence',
      correctFeedback: '人工呼吸操作正确，胸廓有起伏',
      wrongFeedback: '注意要先开放气道，再捏住鼻子吹气',
      hint: '步骤：仰头→抬颏→捏鼻→吹气',
    },
  ],
};

/**
 * 婴儿心肺复苏关卡
 */
export const cprInfantLevel: Level = {
  id: 'cpr-infant',
  chapter: 'life-basic',
  title: '婴儿心肺复苏',
  subtitle: 'CPR - Infant',
  difficulty: 'hard',
  isMVP: true,
  knowledgeCards: ['cpr-infant-special'],
  steps: [
    {
      id: 'check-consciousness-infant',
      title: '判断意识',
      description: '轻拍婴儿足底，观察反应',
      actionType: 'click',
      correctFeedback: '婴儿判断意识用拍足底而非肩膀',
      wrongFeedback: '婴儿不能拍肩膀，应该拍足底',
      hint: '婴儿的特殊判断方法',
    },
    {
      id: 'compression-infant',
      title: '两指按压',
      description: '使用两根手指按压婴儿胸部中央，深度约4cm',
      actionType: 'rhythmic',
      duration: 30,
      correctFeedback: '婴儿按压深度和方法正确',
      wrongFeedback: '婴儿按压深度过深可能造成伤害',
      hint: '只用两根手指，深度约4cm',
    },
  ],
};

/**
 * 海姆立克急救关卡
 */
export const heimlichAdultLevel: Level = {
  id: 'heimlich-adult',
  chapter: 'life-basic',
  title: '海姆立克急救法',
  subtitle: '气道异物梗阻',
  difficulty: 'medium',
  isMVP: true,
  knowledgeCards: ['heimlich-basics'],
  steps: [
    {
      id: 'position',
      title: '正确姿势',
      description: '站在患者身后，双臂环抱患者腰腹部',
      actionType: 'drag',
      correctFeedback: '位置正确！',
      wrongFeedback: '应该站在患者身后',
      hint: '环抱患者腰腹部',
    },
    {
      id: 'fist-position',
      title: '握拳位置',
      description: '一手握拳，拳心抵住上腹部（肚脐上方两横指处）',
      actionType: 'drag',
      targetArea: 'upper-abdomen',
      correctFeedback: '握拳位置准确',
      wrongFeedback: '位置过高或过低都会影响效果',
      hint: '肚脐上方两横指处',
    },
    {
      id: 'thrust',
      title: '快速冲击',
      description: '快速向内上方冲击5次',
      actionType: 'rhythmic',
      duration: 5,
      correctFeedback: '异物已经咳出！',
      wrongFeedback: '方向要向内上方',
      hint: '向内上方用力',
    },
  ],
};

/**
 * AED使用关卡
 */
export const aedUsageLevel: Level = {
  id: 'aed-usage',
  chapter: 'life-basic',
  title: 'AED自动体外除颤仪',
  subtitle: 'AED Usage',
  difficulty: 'medium',
  isMVP: true,
  knowledgeCards: ['aed-usage'],
  steps: [
    {
      id: 'power-on',
      title: '开机',
      description: '按下AED电源按钮，按语音提示操作',
      actionType: 'click',
      correctFeedback: 'AED已开启，听语音提示',
      wrongFeedback: '先开机再操作其他',
      hint: '找到电源按钮',
    },
    {
      id: 'attach-pads',
      title: '贴电极片',
      description: '将电极片贴在右上胸和左乳头外侧',
      actionType: 'drag',
      correctFeedback: '电极片位置正确',
      wrongFeedback: '位置错误，请检查电极片图示',
      hint: '右上胸 + 左乳头外侧',
    },
    {
      id: 'analyze',
      title: '心律分析',
      description: '等待AED分析心律，所有人离开患者',
      actionType: 'click',
      duration: 5,
      correctFeedback: '分析完成，准备除颤',
      wrongFeedback: '分析期间不能接触患者',
      hint: '所有人离开！',
    },
    {
      id: 'shock',
      title: '电击除颤',
      description: '按下放电按钮，之后立即恢复CPR',
      actionType: 'click',
      correctFeedback: '除颤成功，立即继续CPR',
      wrongFeedback: '除颤后不要中断，立即恢复按压',
      hint: '除颤后立即恢复CPR',
    },
  ],
};

/* ================================================================ */
/* 第二篇章：出血止血                                                  */
/* ================================================================ */

/** 1. 轻微擦伤、表皮划伤 */
export const minorAbrasionLevel: Level = {
  id: 'bleed-minor',
  chapter: 'bleeding',
  title: '轻微擦伤处理',
  subtitle: '表皮划伤 / 擦伤',
  difficulty: 'easy',
  isMVP: true,
  knowledgeCards: ['bleed-basics'],
  steps: [
    {
      id: 'wash-wound',
      title: '流水冲洗',
      description: '用流动的清水冲洗伤口，把污物和细菌冲走',
      actionType: 'click',
      correctFeedback: '冲洗到位，污物已经冲走了！',
      wrongFeedback: '不能直接包扎，要先把脏东西冲走',
      hint: '记得用流动的清水，不要用脏水或不流动的水',
    },
    {
      id: 'disinfect',
      title: '碘伏消毒',
      description: '用棉签蘸碘伏，从伤口中心向外画圈消毒',
      actionType: 'drag',
      correctFeedback: '消毒规范，杀菌到位！',
      wrongFeedback: '错误！不能用白酒、酒精直接涂破损伤口，会剧痛并损伤组织',
      hint: '只用碘伏，不要用酒精、白酒、双氧水',
    },
    {
      id: 'cover-wound',
      title: '覆盖伤口',
      description: '用无菌纱布或创可贴轻轻覆盖伤口',
      actionType: 'drag',
      correctFeedback: '覆盖完毕，伤口干净清爽！',
      wrongFeedback: '错误！绝不能涂牙膏、烟灰、草药，极易感染！',
      hint: '只用干净的纱布或创可贴',
    },
  ],
};

/** 2. 四肢小伤口渗血（加压止血） */
export const limbBleedLevel: Level = {
  id: 'bleed-limb',
  chapter: 'bleeding',
  title: '四肢渗血加压止血',
  subtitle: '加压止血法',
  difficulty: 'easy',
  isMVP: true,
  knowledgeCards: ['bleed-pressure'],
  steps: [
    {
      id: 'press-wound',
      title: '按压伤口',
      description: '用无菌纱布或干净毛巾按压伤口，持续 5-10 分钟不松开',
      actionType: 'rhythmic',
      duration: 10,
      correctFeedback: '按压稳定，血止住了！',
      wrongFeedback: '中途松开会重新出血，要持续按压',
      hint: '按住别松开，5-10 分钟',
    },
    {
      id: 'raise-limb',
      title: '抬高受伤肢体',
      description: '将受伤肢体抬高至高于心脏的位置，减少出血',
      actionType: 'drag',
      correctFeedback: '抬高得当，血流减缓',
      wrongFeedback: '应抬高肢体高于心脏',
      hint: '让伤口高于心脏',
    },
  ],
};

/** 3. 严重动脉大出血（喷射状） */
export const arteryBleedLevel: Level = {
  id: 'bleed-artery',
  chapter: 'bleeding',
  title: '动脉大出血急救',
  subtitle: '喷射状出血 / 止血带',
  difficulty: 'hard',
  isMVP: true,
  knowledgeCards: ['bleed-tourniquet'],
  steps: [
    {
      id: 'heavy-press',
      title: '直接加压止血',
      description: '用厚纱布多层覆盖伤口，持续重压',
      actionType: 'rhythmic',
      duration: 10,
      correctFeedback: '加压有效，血流减缓',
      wrongFeedback: '需要更大力气、更厚纱布',
      hint: '多层纱布、用力按压',
    },
    {
      id: 'tourniquet-position',
      title: '使用止血带（近心端）',
      description: '加压无效时，将止血带绑在伤口近心端（靠近心脏一侧）',
      actionType: 'drag',
      correctFeedback: '位置正确！止血带绑在伤口近心端',
      wrongFeedback: '错误！止血带要绑在伤口近心端，不是远心端',
      hint: '靠近心脏一侧',
    },
    {
      id: 'tourniquet-cushion',
      title: '皮肤垫布料',
      description: '止血带下垫一层布料，不可直接勒在皮肤上',
      actionType: 'click',
      correctFeedback: '保护到位，避免皮肤损伤',
      wrongFeedback: '错误！绝不能用铁丝、电线、细绳，且要垫布料',
      hint: '垫一层布料，禁止铁丝/电线',
    },
    {
      id: 'tourniquet-time',
      title: '记录时间并定时松开',
      description: '记录绑扎时间，每 30-40 分钟松开 1-2 分钟，防止肢体坏死',
      actionType: 'click',
      correctFeedback: '记录正确！防止肢体坏死',
      wrongFeedback: '错误！长时间不松开会导致肢体坏死',
      hint: '30-40 分钟松开 1-2 分钟',
    },
  ],
};

/** 4. 鼻出血 */
export const noseBleedLevel: Level = {
  id: 'bleed-nose',
  chapter: 'bleeding',
  title: '鼻出血急救',
  subtitle: '日常最常见 / 误区破解',
  difficulty: 'easy',
  isMVP: true,
  knowledgeCards: ['bleed-nose'],
  steps: [
    {
      id: 'lean-forward',
      title: '身体微微前倾',
      description: '身体微微向前倾，不要仰头！',
      actionType: 'click',
      correctFeedback: '前倾正确，防止血液倒流',
      wrongFeedback: '致命误区！仰头会让血液倒流呛入气管引发窒息',
      hint: '前倾，绝不能仰头',
    },
    {
      id: 'pinch-nose',
      title: '捏住鼻翼软肉',
      description: '用拇指和食指捏住鼻翼软肉处，持续 10 分钟，嘴呼吸',
      actionType: 'rhythmic',
      duration: 10,
      correctFeedback: '捏压正确，血很快止住！',
      wrongFeedback: '不能塞纸巾，捏住软肉才能压住血管',
      hint: '捏鼻翼软肉，不是鼻骨；不要塞纸巾',
    },
    {
      id: 'cold-press',
      title: '冷敷鼻梁',
      description: '用冷毛巾或冰袋冷敷鼻梁，帮助血管收缩',
      actionType: 'click',
      correctFeedback: '冷敷到位，加速止血',
      wrongFeedback: '应该冷敷鼻梁，不是后颈',
      hint: '冷敷鼻梁',
    },
  ],
};

/** 5. 头部磕碰出血 */
export const headBleedLevel: Level = {
  id: 'bleed-head',
  chapter: 'bleeding',
  title: '头部磕碰出血',
  subtitle: '判断严重程度 / 紧急 120',
  difficulty: 'medium',
  isMVP: true,
  knowledgeCards: ['bleed-head'],
  steps: [
    {
      id: 'assess-injury',
      title: '判断伤情',
      description: '观察是否有持续呕吐、意识模糊、昏迷等危险信号',
      actionType: 'click',
      correctFeedback: '判断准确，准备相应处置',
      wrongFeedback: '需要先判断严重程度',
      hint: '观察意识、呕吐情况',
    },
    {
      id: 'press-bandage',
      title: '加压包扎（少量出血）',
      description: '少量出血时，用干净纱布加压包扎',
      actionType: 'drag',
      correctFeedback: '包扎得当，控制出血',
      wrongFeedback: '应先用纱布加压',
      hint: '厚纱布 + 加压',
    },
    {
      id: 'side-lying',
      title: '严重情况：平躺侧卧',
      description: '持续呕吐 / 意识模糊 / 昏迷时，禁止移动，平躺侧卧防呕吐窒息',
      actionType: 'drag',
      correctFeedback: '侧卧位安全，防止呕吐窒息',
      wrongFeedback: '错误！不能搬动伤者，要平躺侧卧',
      hint: '侧卧位 + 立即拨打 120',
    },
  ],
};

/* ================================================================ */
/* 第三篇章：烧烫伤急救                                                */
/* 标准五字口诀：冲、脱、泡、盖、送                                    */
/* ================================================================ */

/** 1. 小面积烫伤（冲脱泡盖送 五步法） */
export const burnSmallLevel: Level = {
  id: 'burn-small',
  chapter: 'burns',
  title: '小面积烫伤',
  subtitle: '五字口诀：冲脱泡盖送',
  difficulty: 'medium',
  isMVP: true,
  knowledgeCards: ['burn-five-steps'],
  steps: [
    {
      id: 'burn-rinse',
      title: '冲：流水冲洗',
      description: '用流动的常温清水冲洗创面 15-30 分钟，降温止痛',
      actionType: 'rhythmic',
      duration: 15,
      correctFeedback: '冲洗到位，温度降下来了',
      wrongFeedback: '错误！绝对禁止使用冰水，常温水即可',
      hint: '常温水，不是冰水；15-30 分钟',
    },
    {
      id: 'burn-strip',
      title: '脱：小心脱衣物',
      description: '小心脱掉烫伤处衣物，粘连皮肤不要硬撕，剪开周边布料',
      actionType: 'drag',
      correctFeedback: '处理细致，皮肤未受损',
      wrongFeedback: '错误！粘连皮肤不能硬撕，要剪开周边',
      hint: '粘连处不要硬撕，剪开',
    },
    {
      id: 'burn-soak',
      title: '泡：冷水浸泡',
      description: '大面积四肢烫伤，冷水浸泡 10 分钟（头面部、大面积烧伤不浸泡）',
      actionType: 'click',
      correctFeedback: '浸泡降温到位',
      wrongFeedback: '头面部、大面积烧伤不能浸泡',
      hint: '只对四肢小面积烫伤浸泡',
    },
    {
      id: 'burn-cover',
      title: '盖：覆盖创面',
      description: '用无菌纱布或干净保鲜膜轻轻覆盖创面',
      actionType: 'drag',
      correctFeedback: '覆盖到位，避免污染',
      wrongFeedback: '错误！绝对禁止涂牙膏、酱油、香油、面粉！',
      hint: '只用无菌纱布或保鲜膜',
    },
    {
      id: 'burn-send',
      title: '送：及时就医',
      description: '三度烫伤、大面积、面部手部烫伤、儿童老人烫伤立刻就医',
      actionType: 'click',
      correctFeedback: '判断正确，已联系送医',
      wrongFeedback: '严重烫伤必须立即就医',
      hint: '严重情况不能自行处理',
    },
  ],
};

/** 2. 烫伤误区挑战（错题库重点） */
export const burnMistakeLevel: Level = {
  id: 'burn-mistakes',
  chapter: 'burns',
  title: '烫伤误区挑战',
  subtitle: '识别危险民间偏方',
  difficulty: 'easy',
  isMVP: true,
  knowledgeCards: ['burn-myths'],
  steps: [
    {
      id: 'no-toothpaste',
      title: '禁涂牙膏',
      description: '判断：烫伤可以涂牙膏快速止痛吗？',
      actionType: 'choice',
      correctFeedback: '正确！牙膏会加重感染，影响医生处理',
      wrongFeedback: '错误！牙膏含化学成分，加重感染',
      hint: '任何偏方都不行',
    },
    {
      id: 'no-soysauce',
      title: '禁涂酱油/香油',
      description: '判断：涂酱油或香油能让伤口"愈合更快"吗？',
      actionType: 'choice',
      correctFeedback: '正确！这些都是错误偏方，会污染创面',
      wrongFeedback: '错误！酱油、香油、面粉都不能涂',
      hint: '只有清水和无菌纱布是安全的',
    },
    {
      id: 'no-popping',
      title: '不挑破水泡',
      description: '判断：烫伤起的水泡要不要挑破？',
      actionType: 'choice',
      correctFeedback: '正确！水泡皮是天然保护层，不能挑破',
      wrongFeedback: '错误！水泡皮是天然保护层，挑破易感染',
      hint: '水泡 = 天然保护膜',
    },
    {
      id: 'no-icewater',
      title: '不用冰水冲',
      description: '判断：烫伤后用冰水冲会更降温更好吗？',
      actionType: 'choice',
      correctFeedback: '正确！冰水会冻伤皮肤，加重损伤',
      wrongFeedback: '错误！冰水会冻伤，必须用常温水',
      hint: '常温水，不要冰水',
    },
  ],
};

/** 3. 严重烧伤紧急处置 */
export const burnSevereLevel: Level = {
  id: 'burn-severe',
  chapter: 'burns',
  title: '严重烧伤急救',
  subtitle: '大面积 / 明火烧伤',
  difficulty: 'hard',
  isMVP: true,
  knowledgeCards: ['burn-severe'],
  steps: [
    {
      id: 'stop-fire',
      title: '迅速隔离火源',
      description: '让伤者停止跑动，原地打滚或用棉被压住灭火',
      actionType: 'click',
      correctFeedback: '果断！火源已被隔离',
      wrongFeedback: '跑动会让火更旺，应停下打滚',
      hint: '停、躺、滚',
    },
    {
      id: 'cool-water',
      title: '常温清水冲洗',
      description: '用大量流动的常温清水持续冲洗（禁止冰水）',
      actionType: 'rhythmic',
      duration: 15,
      correctFeedback: '降温到位',
      wrongFeedback: '不能用冰水，常温水即可',
      hint: '常温水持续冲洗',
    },
    {
      id: 'cover-cling',
      title: '保鲜膜覆盖',
      description: '用干净的保鲜膜轻轻覆盖创面，不要包扎过紧',
      actionType: 'drag',
      correctFeedback: '覆盖得当，保护创面',
      wrongFeedback: '不能涂任何东西，只用保鲜膜或无菌纱布',
      hint: '保鲜膜 / 无菌纱布',
    },
    {
      id: 'call-120-burn',
      title: '立即送医',
      description: '大面积、面部、手部、儿童老人烧伤，立刻拨打 120',
      actionType: 'click',
      correctFeedback: '120 已联系，争分夺秒',
      wrongFeedback: '严重烧伤必须立即送医',
      hint: '立即 120',
    },
  ],
};

/**
 * 所有MVP关卡列表
 */
export const mvpLevels: Level[] = [
  // 第一篇章：生命基础
  cprAdultLevel,
  cprInfantLevel,
  heimlichAdultLevel,
  aedUsageLevel,
  // 第二篇章：出血止血
  minorAbrasionLevel,
  limbBleedLevel,
  arteryBleedLevel,
  noseBleedLevel,
  headBleedLevel,
  // 第三篇章：烧烫伤
  burnSmallLevel,
  burnMistakeLevel,
  burnSevereLevel,
];

/**
 * 根据ID查找关卡
 */
export function getLevelById(id: string): Level | undefined {
  return mvpLevels.find((level) => level.id === id);
}

/**
 * 获取指定篇章的关卡
 */
export function getLevelsByChapter(chapter: string): Level[] {
  return mvpLevels.filter((level) => level.chapter === chapter);
}
