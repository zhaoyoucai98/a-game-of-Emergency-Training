/**
 * 角色立绘组件
 * 统一管理小泉的各种状态图与配角图片资源
 *
 * 用法：
 *   <Character pose="idle" size="md" />
 *   <Character pose="cheer" size="lg" floating />
 */

type Pose =
  | 'idle'
  | 'run'
  | 'cpr'
  | 'bandage'
  | 'cheer'
  | 'sad'
  | 'think'
  | 'levelup'
  | 'aed'
  | 'hint'
  | 'syncope'
  | 'aed-shock'
  | 'comfort'
  | 'trophy'
  | 'upgrade';

type CompanionPose = 'xiaohei' | 'grandpa';

const ANIMATED_POSES: Pose[] = ['idle', 'run', 'cheer', 'levelup'];

const SIZE_MAP = {
  xs: 'w-16 h-16',
  sm: 'w-24 h-24',
  md: 'w-36 h-36',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
} as const;

interface CharacterProps {
  pose?: Pose;
  size?: keyof typeof SIZE_MAP;
  floating?: boolean;
  className?: string;
  alt?: string;
  /** 是否抠掉白底（默认 true，PNG 角色图都是白底） */
  cutout?: boolean;
}

/** 小泉角色立绘 */
export function Character({
  pose = 'idle',
  size = 'md',
  floating = false,
  className = '',
  alt,
  cutout = true,
}: CharacterProps) {
  // 优先使用 GIF（如果有动画版本）
  const ext = ANIMATED_POSES.includes(pose) ? 'gif' : 'png';
  const src = `/image/xiaoquan-${pose}.${ext}`;

  return (
    <img
      src={src}
      alt={alt ?? `小泉-${pose}`}
      className={`${SIZE_MAP[size]} object-contain
                  ${floating ? 'animate-float' : ''}
                  ${cutout ? 'chroma-key' : 'drop-shadow-lg'}
                  select-none pointer-events-none
                  ${className}`}
      draggable={false}
    />
  );
}

/** 配角立绘：小黑（小狗）/ 泉爷爷 */
export function Companion({
  who,
  size = 'sm',
  floating = false,
  className = '',
  cutout = true,
}: {
  who: CompanionPose;
  size?: keyof typeof SIZE_MAP;
  floating?: boolean;
  className?: string;
  cutout?: boolean;
}) {
  const src =
    who === 'xiaohei' ? '/image/xiaohei-idle.gif' : '/image/grandpa-quan.png';

  return (
    <img
      src={src}
      alt={who === 'xiaohei' ? '小黑' : '泉爷爷'}
      className={`${SIZE_MAP[size]} object-contain
                  ${floating ? 'animate-float' : ''}
                  ${cutout ? 'chroma-key' : 'drop-shadow-md'}
                  select-none pointer-events-none
                  ${className}`}
      draggable={false}
    />
  );
}

/**
 * 根据关卡 ID 匹配适合的小泉施救姿势
 */
export function getPoseForLevel(levelId: string): Pose {
  const id = levelId.toLowerCase();
  if (id.includes('cpr')) return 'cpr';
  if (id.includes('aed')) return 'aed';
  if (id.includes('bleed') || id.includes('bandage')) return 'bandage';
  if (id.includes('burn')) return 'bandage';
  if (id.includes('fracture')) return 'bandage';
  if (id.includes('syncope') || id.includes('heat')) return 'syncope';
  if (id.includes('comfort') || id.includes('child')) return 'comfort';
  if (id.includes('heimlich') || id.includes('choke')) return 'comfort';
  return 'think';
}

/**
 * 根据关卡 ID 匹配场景背景图
 */
export function getSceneForLevel(levelId: string): string {
  const id = levelId.toLowerCase();
  if (id.includes('cpr') || id.includes('aed')) return '/image/scene-cpr-room.png';
  if (id.includes('bleed') || id.includes('bandage')) return '/image/scene-bandage.png';
  if (id.includes('burn')) return '/image/scene-burns.png';
  if (id.includes('fracture')) return '/image/scene-fracture.png';
  if (id.includes('poison')) return '/image/scene-poisoning.png';
  if (id.includes('animal')) return '/image/scene-animal.png';
  if (id.includes('syncope') || id.includes('heat')) return '/image/scene-syncope.png';
  if (id.includes('emergency')) return '/image/scene-emergency.png';
  return '/image/scene-classroom.png';
}

/**
 * 根据关卡 ID 匹配 NPC 伤员立绘
 */
export function getNpcForLevel(levelId: string): string {
  const id = levelId.toLowerCase();
  if (id.includes('cpr') || id.includes('aed') || id.includes('syncope') || id.includes('heat'))
    return '/image/npc-fainted.png';
  if (id.includes('bleed') || id.includes('bandage')) return '/image/npc-injured-arm.png';
  if (id.includes('burn')) return '/image/npc-burned.png';
  if (id.includes('fracture') || id.includes('fall')) return '/image/npc-fallen.png';
  if (id.includes('heimlich') || id.includes('choke')) return '/image/npc-fainted.png';
  return '/image/npc-fainted.png';
}

/** 徽章 ID → 图片路径 */
const BADGE_MAP: Record<string, string> = {
  'first-rescue': '/image/badge-hero.png',
  'cpr-master': '/image/badge-cpr.png',
  'heimlich-expert': '/image/badge-hero.png',
  'aed-pro': '/image/badge-cpr.png',
  'quiz-champion': '/image/badge-streak.png',
  'no-mistake': '/image/badge-streak.png',
  'speed-rescue': '/image/badge-streak.png',
  'life-guardian': '/image/badge-hero.png',
  'bleeding': '/image/badge-bleeding.png',
  'burns': '/image/badge-burns.png',
  'fracture': '/image/badge-fracture.png',
  'poisoning': '/image/badge-poisoning.png',
  'syncope': '/image/badge-syncope.png',
};

export function getBadgeImg(achievementId: string): string {
  return BADGE_MAP[achievementId] ?? '/image/badge-hero.png';
}

/** 成就徽章组件 */
export function Badge({
  achievementId,
  unlocked = true,
  size = 'sm',
  className = '',
}: {
  achievementId: string;
  unlocked?: boolean;
  size?: keyof typeof SIZE_MAP;
  className?: string;
}) {
  return (
    <img
      src={getBadgeImg(achievementId)}
      alt={`徽章-${achievementId}`}
      className={`${SIZE_MAP[size]} object-contain
                  ${unlocked ? '' : 'grayscale opacity-50'}
                  drop-shadow-lg select-none pointer-events-none
                  ${className}`}
      draggable={false}
    />
  );
}

/** NPC 伤员组件 */
export function Npc({
  type,
  size = 'md',
  floating = false,
  className = '',
  cutout = true,
}: {
  type: 'fainted' | 'fallen' | 'burned' | 'injured-arm';
  size?: keyof typeof SIZE_MAP;
  floating?: boolean;
  className?: string;
  cutout?: boolean;
}) {
  return (
    <img
      src={`/image/npc-${type}.png`}
      alt={`伤员-${type}`}
      className={`${SIZE_MAP[size]} object-contain
                  ${floating ? 'animate-float' : ''}
                  ${cutout ? 'chroma-key' : 'drop-shadow-md'}
                  select-none pointer-events-none
                  ${className}`}
      draggable={false}
    />
  );
}

/** 道具图标组件 */
export function Item({
  type,
  size = 'xs',
  className = '',
}: {
  type:
    | 'aed'
    | 'bandage'
    | 'firstaid-kit'
    | 'phone-call'
    | 'pills'
    | 'stethoscope'
    | 'thermometer'
    | 'water-bottle';
  size?: keyof typeof SIZE_MAP;
  className?: string;
}) {
  return (
    <img
      src={`/image/item-${type}.png`}
      alt={`道具-${type}`}
      className={`${SIZE_MAP[size]} object-contain
                  drop-shadow select-none pointer-events-none
                  ${className}`}
      draggable={false}
    />
  );
}

/** UI 按钮图片组件 */
export function UiBtn({
  kind,
  className = '',
  size = 'xs',
}: {
  kind: 'home' | 'next' | 'retry' | 'start';
  className?: string;
  size?: keyof typeof SIZE_MAP;
}) {
  return (
    <img
      src={`/image/ui-btn-${kind}.png`}
      alt={`按钮-${kind}`}
      className={`${SIZE_MAP[size]} object-contain select-none pointer-events-none ${className}`}
      draggable={false}
    />
  );
}
