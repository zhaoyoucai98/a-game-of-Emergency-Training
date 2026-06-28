/**
 * 横版闯关场景数据
 * - 一个关卡（Level）= 多个场景（Scene）串联
 * - 每个场景包含：背景、若干任务点（TaskPoint）、出口位置
 * - 小泉走到任务点上方按交互键 / 自动触发现有玩法弹窗
 * - 全部任务完成后走到右侧出口 → 进入下一场景
 */

import type { Level } from '@/types/game';
import { getLevelById } from './levels';

/** 任务点对应的玩法类型 */
export type TaskKind =
  | 'click'        // 通用点击（含 sequence/choice 这些列表型动作）
  | 'cpr'          // CPR 节拍按压
  | 'aed-pad'      // AED 电极片拖拽
  | 'heimlich'     // 海姆立克长按推冲
  | 'breath'       // 人工呼吸（用通用确认）
  | 'observe'      // 观察类（用通用确认）
  | 'wash-wound'   // 流水冲洗（长按水龙头）
  | 'disinfect'    // 棉签蘸碘伏由内向外画圈
  | 'cover-wound'  // 创可贴覆盖（拖拽到伤口）
  | 'press-hold'   // 持续加压止血（长按）
  | 'pinch-nose'   // 持续捏鼻翼软肉
  | 'raise-limb'   // 抬高患肢到心脏以上
  | 'tourniquet'   // 止血带绑扎位置选择
  | 'cut-cloth';   // 沿虚线剪开衣物

/** 任务点：场景中的可交互对象 */
export interface TaskPoint {
  /** 与 Level.steps[].id 对应，用于触发该步骤的玩法 */
  stepId: string;
  /** 任务点在场景中的水平位置（% 0~100） */
  x: number;
  /** 任务点距离地面的高度（px） */
  y?: number;
  /** 任务点标签 emoji */
  icon: string;
  /** 标题（浮于头顶提示） */
  label: string;
  /** 玩法类型，决定弹窗内容 */
  kind: TaskKind;
}

/** 单个场景 */
export interface Scene {
  id: string;
  /** 场景标题，过场显示 */
  title: string;
  /** 场景背景渐变 + emoji 装饰 */
  bg: {
    /** Tailwind 渐变（from-... to-... 完整 className） */
    gradient: string;
    /** 漂浮装饰 emoji（场景氛围） */
    decor: string[];
    /** 地面色 */
    ground: string;
  };
  /** 场景总宽度（px），决定可走范围 */
  width: number;
  /** 任务点列表 */
  taskPoints: TaskPoint[];
  /** 出口（右侧门/箭头），完成全部任务后激活 */
  exitX: number;
  /** 出口标签 */
  exitLabel: string;
}

/** 关卡场景集合 */
export interface LevelScenes {
  levelId: string;
  scenes: Scene[];
}

/* -------------------------------------------------------------- */
/* CPR 成人：3 个场景串联（公园 → 救护通道 → 抢救室）             */
/* -------------------------------------------------------------- */
const cprAdultScenes: LevelScenes = {
  levelId: 'cpr-adult',
  scenes: [
    {
      id: 'park',
      title: '🌳 公园广场',
      bg: {
        gradient: 'from-sky-300 via-sky-200 to-emerald-200',
        decor: ['☁️', '🌳', '🌸', '🦋', '🌿'],
        ground: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
      },
      width: 1600,
      taskPoints: [
        {
          stepId: 'check-consciousness',
          x: 35,
          icon: '🧓',
          label: '判断意识',
          kind: 'click',
        },
        {
          stepId: 'call-help',
          x: 65,
          icon: '📞',
          label: '呼救120',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '前往救护通道',
    },
    {
      id: 'corridor',
      title: '🚨 救护通道',
      bg: {
        gradient: 'from-orange-200 via-amber-100 to-yellow-100',
        decor: ['🚑', '⚠️', '🪧', '💡'],
        ground: 'bg-gradient-to-b from-stone-400 to-stone-600',
      },
      width: 1400,
      taskPoints: [
        {
          stepId: 'check-breathing',
          x: 50,
          icon: '👀',
          label: '判断呼吸',
          kind: 'observe',
        },
      ],
      exitX: 92,
      exitLabel: '进入抢救室',
    },
    {
      id: 'er',
      title: '🏥 抢救室',
      bg: {
        gradient: 'from-blue-200 via-cyan-100 to-white',
        decor: ['💊', '🩺', '🏥', '💉', '🧪'],
        ground: 'bg-gradient-to-b from-slate-300 to-slate-500',
      },
      width: 1500,
      taskPoints: [
        {
          stepId: 'chest-compression',
          x: 45,
          icon: '💗',
          label: '胸外按压',
          kind: 'cpr',
        },
        {
          stepId: 'rescue-breath',
          x: 70,
          icon: '🫁',
          label: '人工呼吸',
          kind: 'breath',
        },
      ],
      exitX: 92,
      exitLabel: '完成救援',
    },
  ],
};

/* -------------------------------------------------------------- */
/* CPR 婴儿：2 个场景（婴儿房 → 抢救）                            */
/* -------------------------------------------------------------- */
const cprInfantScenes: LevelScenes = {
  levelId: 'cpr-infant',
  scenes: [
    {
      id: 'nursery',
      title: '🍼 婴儿房',
      bg: {
        gradient: 'from-pink-200 via-rose-100 to-amber-100',
        decor: ['🧸', '🍼', '🎈', '⭐', '🌙'],
        ground: 'bg-gradient-to-b from-rose-300 to-rose-500',
      },
      width: 1400,
      taskPoints: [
        {
          stepId: 'check-consciousness-infant',
          x: 50,
          icon: '👶',
          label: '拍足底判断',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '开始急救',
    },
    {
      id: 'rescue',
      title: '⚡ 紧急施救',
      bg: {
        gradient: 'from-rose-200 via-pink-200 to-purple-100',
        decor: ['💗', '✨', '🩺', '⚠️'],
        ground: 'bg-gradient-to-b from-pink-300 to-rose-500',
      },
      width: 1300,
      taskPoints: [
        {
          stepId: 'compression-infant',
          x: 50,
          icon: '💞',
          label: '两指按压',
          kind: 'cpr',
        },
      ],
      exitX: 92,
      exitLabel: '完成施救',
    },
  ],
};

/* -------------------------------------------------------------- */
/* 海姆立克：2 个场景（餐厅 → 急救点）                            */
/* -------------------------------------------------------------- */
const heimlichScenes: LevelScenes = {
  levelId: 'heimlich-adult',
  scenes: [
    {
      id: 'restaurant',
      title: '🍽️ 餐厅',
      bg: {
        gradient: 'from-amber-200 via-orange-100 to-rose-100',
        decor: ['🍜', '🍱', '🥢', '🍷', '🪑'],
        ground: 'bg-gradient-to-b from-amber-600 to-yellow-800',
      },
      width: 1400,
      taskPoints: [
        {
          stepId: 'position',
          x: 35,
          icon: '🚶',
          label: '站位环抱',
          kind: 'click',
        },
        {
          stepId: 'fist-position',
          x: 65,
          icon: '✊',
          label: '握拳定位',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '准备施救',
    },
    {
      id: 'lobby',
      title: '🆘 救援区',
      bg: {
        gradient: 'from-yellow-200 via-orange-200 to-red-100',
        decor: ['⚡', '💨', '⚠️', '🆘'],
        ground: 'bg-gradient-to-b from-orange-400 to-red-500',
      },
      width: 1200,
      taskPoints: [
        {
          stepId: 'thrust',
          x: 55,
          icon: '💥',
          label: '冲击腹部',
          kind: 'heimlich',
        },
      ],
      exitX: 92,
      exitLabel: '救援成功',
    },
  ],
};

/* -------------------------------------------------------------- */
/* AED：3 个场景（商场 → AED 柜 → 抢救）                          */
/* -------------------------------------------------------------- */
const aedScenes: LevelScenes = {
  levelId: 'aed-usage',
  scenes: [
    {
      id: 'mall',
      title: '🛍️ 商场大厅',
      bg: {
        gradient: 'from-indigo-200 via-blue-100 to-cyan-100',
        decor: ['🛒', '🛍️', '💡', '🎵', '✨'],
        ground: 'bg-gradient-to-b from-indigo-300 to-indigo-500',
      },
      width: 1500,
      taskPoints: [
        {
          stepId: 'power-on',
          x: 55,
          icon: '🔌',
          label: '取出 AED 开机',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '靠近患者',
    },
    {
      id: 'rescue',
      title: '⚡ 急救现场',
      bg: {
        gradient: 'from-cyan-200 via-blue-200 to-indigo-200',
        decor: ['⚡', '💗', '🩺', '✨'],
        ground: 'bg-gradient-to-b from-cyan-300 to-blue-500',
      },
      width: 1500,
      taskPoints: [
        {
          stepId: 'attach-pads',
          x: 40,
          icon: '🩹',
          label: '贴电极片',
          kind: 'aed-pad',
        },
        {
          stepId: 'analyze',
          x: 65,
          icon: '🧠',
          label: '心律分析',
          kind: 'observe',
        },
      ],
      exitX: 92,
      exitLabel: '准备电击',
    },
    {
      id: 'shock-room',
      title: '⚡ 除颤！',
      bg: {
        gradient: 'from-yellow-200 via-orange-200 to-red-200',
        decor: ['⚡', '💥', '✨', '💗'],
        ground: 'bg-gradient-to-b from-orange-400 to-red-500',
      },
      width: 1200,
      taskPoints: [
        {
          stepId: 'shock',
          x: 55,
          icon: '⚡',
          label: '按下放电键',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '抢救成功',
    },
  ],
};

/* -------------------------------------------------------------- */
/* 第二篇章：出血止血                                              */
/* -------------------------------------------------------------- */
const bleedMinorScenes: LevelScenes = {
  levelId: 'bleed-minor',
  scenes: [
    {
      id: 'home',
      title: '🏠 家中小伤',
      bg: {
        gradient: 'from-amber-100 via-rose-100 to-pink-100',
        decor: ['🏠', '🪴', '🧻', '💧'],
        ground: 'bg-gradient-to-b from-amber-300 to-amber-500',
      },
      width: 1500,
      taskPoints: [
        {
          stepId: 'wash-wound',
          x: 25,
          icon: '💧',
          label: '冲洗伤口',
          kind: 'wash-wound',
        },
        {
          stepId: 'disinfect',
          x: 50,
          icon: '🧴',
          label: '碘伏消毒',
          kind: 'disinfect',
        },
        {
          stepId: 'cover-wound',
          x: 75,
          icon: '🩹',
          label: '覆盖创可贴',
          kind: 'cover-wound',
        },
      ],
      exitX: 92,
      exitLabel: '完成处理',
    },
  ],
};

const bleedLimbScenes: LevelScenes = {
  levelId: 'bleed-limb',
  scenes: [
    {
      id: 'street',
      title: '🚧 街边受伤',
      bg: {
        gradient: 'from-orange-200 via-amber-100 to-rose-100',
        decor: ['🚧', '⚠️', '🩹', '💧'],
        ground: 'bg-gradient-to-b from-stone-400 to-stone-600',
      },
      width: 1400,
      taskPoints: [
        {
          stepId: 'press-wound',
          x: 40,
          icon: '✋',
          label: '加压止血',
          kind: 'press-hold',
        },
        {
          stepId: 'raise-limb',
          x: 70,
          icon: '⬆️',
          label: '抬高患肢',
          kind: 'raise-limb',
        },
      ],
      exitX: 92,
      exitLabel: '送医处理',
    },
  ],
};

const bleedArteryScenes: LevelScenes = {
  levelId: 'bleed-artery',
  scenes: [
    {
      id: 'accident',
      title: '🆘 动脉出血',
      bg: {
        gradient: 'from-red-200 via-rose-200 to-orange-200',
        decor: ['🆘', '⚠️', '💉', '⚡'],
        ground: 'bg-gradient-to-b from-red-400 to-red-600',
      },
      width: 1500,
      taskPoints: [
        {
          stepId: 'heavy-press',
          x: 30,
          icon: '🩸',
          label: '直接加压',
          kind: 'press-hold',
        },
        {
          stepId: 'tourniquet-position',
          x: 65,
          icon: '🎗️',
          label: '止血带位置',
          kind: 'tourniquet',
        },
      ],
      exitX: 92,
      exitLabel: '前往救护点',
    },
    {
      id: 'rescue-station',
      title: '🚑 急救点',
      bg: {
        gradient: 'from-yellow-200 via-orange-100 to-rose-100',
        decor: ['🚑', '⚠️', '⏱️', '🩹'],
        ground: 'bg-gradient-to-b from-orange-300 to-red-500',
      },
      width: 1300,
      taskPoints: [
        {
          stepId: 'tourniquet-cushion',
          x: 35,
          icon: '🧣',
          label: '垫布料',
          kind: 'click',
        },
        {
          stepId: 'tourniquet-time',
          x: 65,
          icon: '⏱️',
          label: '记录时间',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '紧急送医',
    },
  ],
};

const bleedNoseScenes: LevelScenes = {
  levelId: 'bleed-nose',
  scenes: [
    {
      id: 'classroom',
      title: '🏫 教室鼻血',
      bg: {
        gradient: 'from-sky-200 via-blue-100 to-cyan-100',
        decor: ['📚', '✏️', '🪑', '🧻'],
        ground: 'bg-gradient-to-b from-sky-300 to-sky-500',
      },
      width: 1300,
      taskPoints: [
        {
          stepId: 'lean-forward',
          x: 30,
          icon: '🙇',
          label: '身体前倾',
          kind: 'click',
        },
        {
          stepId: 'pinch-nose',
          x: 55,
          icon: '👃',
          label: '捏鼻翼',
          kind: 'pinch-nose',
        },
        {
          stepId: 'cold-press',
          x: 78,
          icon: '🧊',
          label: '冷敷鼻梁',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '止血完成',
    },
  ],
};

const bleedHeadScenes: LevelScenes = {
  levelId: 'bleed-head',
  scenes: [
    {
      id: 'playground',
      title: '🛝 头部撞伤',
      bg: {
        gradient: 'from-emerald-200 via-lime-100 to-yellow-100',
        decor: ['🛝', '🌳', '⚠️', '🩹'],
        ground: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
      },
      width: 1400,
      taskPoints: [
        {
          stepId: 'assess-injury',
          x: 30,
          icon: '🧠',
          label: '判断伤情',
          kind: 'observe',
        },
        {
          stepId: 'press-bandage',
          x: 55,
          icon: '🩹',
          label: '加压包扎',
          kind: 'press-hold',
        },
        {
          stepId: 'side-lying',
          x: 75,
          icon: '🛌',
          label: '平躺侧卧',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '等待 120',
    },
  ],
};

/* -------------------------------------------------------------- */
/* 第三篇章：烧烫伤急救（冲脱泡盖送）                             */
/* -------------------------------------------------------------- */
const burnSmallScenes: LevelScenes = {
  levelId: 'burn-small',
  scenes: [
    {
      id: 'kitchen',
      title: '🍳 厨房烫伤',
      bg: {
        gradient: 'from-orange-200 via-amber-100 to-yellow-100',
        decor: ['🍳', '🔥', '☕', '🥘', '💧'],
        ground: 'bg-gradient-to-b from-amber-400 to-orange-500',
      },
      width: 1500,
      taskPoints: [
        {
          stepId: 'burn-rinse',
          x: 30,
          icon: '🚿',
          label: '冲：流水',
          kind: 'wash-wound',
        },
        {
          stepId: 'burn-strip',
          x: 60,
          icon: '👕',
          label: '脱：剪开',
          kind: 'cut-cloth',
        },
      ],
      exitX: 92,
      exitLabel: '前往处置区',
    },
    {
      id: 'care',
      title: '🏥 处置区',
      bg: {
        gradient: 'from-blue-200 via-cyan-100 to-white',
        decor: ['🏥', '💧', '🩹', '🧊'],
        ground: 'bg-gradient-to-b from-cyan-300 to-cyan-500',
      },
      width: 1400,
      taskPoints: [
        {
          stepId: 'burn-soak',
          x: 30,
          icon: '🛁',
          label: '泡：浸泡',
          kind: 'click',
        },
        {
          stepId: 'burn-cover',
          x: 55,
          icon: '🩹',
          label: '盖：覆盖',
          kind: 'cover-wound',
        },
        {
          stepId: 'burn-send',
          x: 78,
          icon: '🚑',
          label: '送：就医',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '完成救治',
    },
  ],
};

const burnMistakeScenes: LevelScenes = {
  levelId: 'burn-mistakes',
  scenes: [
    {
      id: 'myth-room',
      title: '🚫 误区挑战',
      bg: {
        gradient: 'from-rose-200 via-red-100 to-orange-100',
        decor: ['🚫', '⚠️', '❌', '❓'],
        ground: 'bg-gradient-to-b from-rose-300 to-rose-500',
      },
      width: 1500,
      taskPoints: [
        {
          stepId: 'no-toothpaste',
          x: 22,
          icon: '🪥',
          label: '牙膏？',
          kind: 'click',
        },
        {
          stepId: 'no-soysauce',
          x: 42,
          icon: '🥢',
          label: '酱油？',
          kind: 'click',
        },
        {
          stepId: 'no-popping',
          x: 62,
          icon: '💧',
          label: '水泡？',
          kind: 'click',
        },
        {
          stepId: 'no-icewater',
          x: 82,
          icon: '🧊',
          label: '冰水？',
          kind: 'click',
        },
      ],
      exitX: 95,
      exitLabel: '识别完成',
    },
  ],
};

const burnSevereScenes: LevelScenes = {
  levelId: 'burn-severe',
  scenes: [
    {
      id: 'fire-scene',
      title: '🔥 火灾现场',
      bg: {
        gradient: 'from-red-300 via-orange-200 to-yellow-200',
        decor: ['🔥', '💨', '⚠️', '🆘'],
        ground: 'bg-gradient-to-b from-red-500 to-orange-700',
      },
      width: 1500,
      taskPoints: [
        {
          stepId: 'stop-fire',
          x: 35,
          icon: '🛑',
          label: '停躺滚',
          kind: 'click',
        },
        {
          stepId: 'cool-water',
          x: 65,
          icon: '🚿',
          label: '常温冲洗',
          kind: 'wash-wound',
        },
      ],
      exitX: 92,
      exitLabel: '送往救护车',
    },
    {
      id: 'ambulance',
      title: '🚑 急救通道',
      bg: {
        gradient: 'from-blue-200 via-sky-100 to-cyan-100',
        decor: ['🚑', '⚡', '🩺', '💉'],
        ground: 'bg-gradient-to-b from-blue-300 to-blue-500',
      },
      width: 1300,
      taskPoints: [
        {
          stepId: 'cover-cling',
          x: 40,
          icon: '🎁',
          label: '保鲜膜覆盖',
          kind: 'cover-wound',
        },
        {
          stepId: 'call-120-burn',
          x: 70,
          icon: '📞',
          label: '拨打 120',
          kind: 'click',
        },
      ],
      exitX: 92,
      exitLabel: '送达医院',
    },
  ],
};

const ALL_SCENES: LevelScenes[] = [
  cprAdultScenes,
  cprInfantScenes,
  heimlichScenes,
  aedScenes,
  bleedMinorScenes,
  bleedLimbScenes,
  bleedArteryScenes,
  bleedNoseScenes,
  bleedHeadScenes,
  burnSmallScenes,
  burnMistakeScenes,
  burnSevereScenes,
];

/** 根据 levelId 获取场景集合 */
export function getScenesByLevelId(levelId: string): LevelScenes | undefined {
  return ALL_SCENES.find((s) => s.levelId === levelId);
}

/**
 * 兜底：若关卡未在 scenes 中显式定义，根据 Level.steps 自动构造单场景
 * 让所有关卡都能无缝以闯关模式呈现
 */
export function getOrBuildScenes(levelId: string): LevelScenes {
  const exist = getScenesByLevelId(levelId);
  if (exist) return exist;

  const level: Level | undefined = getLevelById(levelId);
  if (!level) {
    return { levelId, scenes: [] };
  }

  // 自动把 steps 平均分布在一个场景里
  const steps = level.steps;
  const points: TaskPoint[] = steps.map((s, i) => ({
    stepId: s.id,
    x: 25 + (i * 55) / Math.max(1, steps.length - 1),
    icon: '❗',
    label: s.title,
    kind: 'click',
  }));

  return {
    levelId,
    scenes: [
      {
        id: 'auto',
        title: level.title,
        bg: {
          gradient: 'from-sky-200 via-cyan-100 to-emerald-100',
          decor: ['☁️', '🌳', '✨'],
          ground: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
        },
        width: 1400,
        taskPoints: points,
        exitX: 92,
        exitLabel: '完成关卡',
      },
    ],
  };
}
