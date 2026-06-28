import { useState, useEffect } from 'react';

/**
 * 「小泉」与朋友们 —— 角色立绘组件
 *
 * 三个角色：
 *   - xiaoquan：小泉（主角，戴红十字帽的小男孩）
 *   - grandpa：松爷爷（向导/导师角色）
 *   - xiaohei：小黑（伙伴/被救者角色）
 *
 * 表情/状态：
 *   - normal：默认
 *   - happy：开心欢呼（通关用）
 *   - hurt：受伤（NPC 等待救援）
 *   - idle：思考/待机
 *   - cheer：庆祝（结算用）
 *
 * 不同表情共用一张图，但叠加滤镜/动画/装饰差异化呈现
 *  - happy：明亮 + 闪烁星光
 *  - hurt：灰度 + 头顶 X_X
 *  - idle：轻微透明
 *  - cheer：金光 + 上下跳跃
 */

export type CharacterId = 'xiaoquan' | 'grandpa' | 'xiaohei';
export type CharacterMood = 'normal' | 'happy' | 'hurt' | 'idle' | 'cheer';
export type CharacterSize = 'small' | 'medium' | 'large';

interface MascotProps {
  /** 角色（默认 xiaoquan） */
  character?: CharacterId;
  /** 表情/状态（默认 normal） */
  mood?: CharacterMood;
  /** 尺寸（默认 large） */
  size?: CharacterSize;
  className?: string;
}

const characterImages: Record<CharacterId, string> = {
  xiaoquan: '/xiaoquan.png',
  grandpa: '/grandpa-quan.png',
  xiaohei: '/xiaohei.png',
};

const characterNames: Record<CharacterId, string> = {
  xiaoquan: '小泉',
  grandpa: '松爷爷',
  xiaohei: '小黑',
};

const characterFallback: Record<CharacterId, string> = {
  xiaoquan: '🧒',
  grandpa: '👴',
  xiaohei: '🧑',
};

const sizeClass: Record<CharacterSize, string> = {
  small: 'w-12 h-12',
  medium: 'w-32 h-32',
  large: 'w-56 h-56',
};

/** 表情对应的视觉效果 */
const moodEffect: Record<CharacterMood, {
  imgFilter: string;
  containerAnim: string;
  decoration?: 'star' | 'x' | 'glow';
}> = {
  normal: { imgFilter: '', containerAnim: '' },
  happy: { imgFilter: 'brightness-110 saturate-125', containerAnim: 'animate-bounce-slow', decoration: 'star' },
  hurt: { imgFilter: 'grayscale brightness-90', containerAnim: '', decoration: 'x' },
  idle: { imgFilter: 'opacity-90', containerAnim: 'animate-float' },
  cheer: { imgFilter: 'brightness-110 saturate-125', containerAnim: 'animate-bounce-slow', decoration: 'glow' },
};

export function Mascot({
  character = 'xiaoquan',
  mood = 'normal',
  size = 'large',
  className = '',
}: MascotProps) {
  const [failed, setFailed] = useState(false);
  const src = characterImages[character];
  const effect = moodEffect[mood];

  // 当 character 变化时重置失败状态
  useEffect(() => setFailed(false), [character]);

  // 失败兜底：渐变圆 + emoji
  if (failed) {
    if (size === 'small') {
      return (
        <div
          className={`${sizeClass.small} rounded-full bg-gradient-to-br from-primary-light to-primary
                      border-2 border-white shadow-game-sm flex items-center justify-center
                      text-2xl ${className}`}
          aria-label={characterNames[character]}
        >
          {characterFallback[character]}
        </div>
      );
    }
    return (
      <div
        className={`${sizeClass[size]} rounded-3xl bg-gradient-to-br from-primary-light to-primary
                    flex items-center justify-center shadow-game ${className}`}
        aria-label={characterNames[character]}
      >
        <span className="text-7xl">{characterFallback[character]}</span>
      </div>
    );
  }

  // 小尺寸：圆形头像（HUD/对话用）
  if (size === 'small') {
    return (
      <div
        className={`relative ${sizeClass.small} rounded-full overflow-hidden bg-white
                    border-2 border-white shadow-game-sm ${effect.containerAnim} ${className}`}
      >
        <img
          src={src}
          alt={characterNames[character]}
          onError={() => setFailed(true)}
          className={`w-full h-full object-cover object-top scale-[1.8] origin-top -translate-y-1
                      ${effect.imgFilter}`}
          draggable={false}
        />
        {effect.decoration === 'x' && (
          <div className="absolute -top-1 right-0 text-sm">❌</div>
        )}
      </div>
    );
  }

  // 中/大尺寸：全身立绘 + 装饰
  return (
    <div className={`relative inline-block ${effect.containerAnim} ${className}`}>
      <img
        src={src}
        alt={characterNames[character]}
        onError={() => setFailed(true)}
        className={`${sizeClass[size]} object-contain select-none chroma-key ${effect.imgFilter}`}
        draggable={false}
      />

      {/* 装饰：开心 */}
      {effect.decoration === 'star' && (
        <>
          <div className="absolute -top-2 -right-2 text-2xl animate-pulse">⭐</div>
          <div className="absolute top-2 -left-3 text-xl animate-pulse"
               style={{ animationDelay: '0.5s' }}>✨</div>
        </>
      )}

      {/* 装饰：受伤 */}
      {effect.decoration === 'x' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl animate-pulse">
          😵‍💫
        </div>
      )}

      {/* 装饰：庆祝（金光辐射） */}
      {effect.decoration === 'glow' && (
        <>
          <div className="absolute inset-0 -z-10 rounded-full
                          bg-gradient-radial from-gold/40 via-warm/20 to-transparent
                          blur-2xl animate-pulse" />
          <div className="absolute -top-3 -right-3 text-3xl animate-bounce">🎉</div>
          <div className="absolute -top-1 -left-3 text-2xl animate-bounce"
               style={{ animationDelay: '0.2s' }}>✨</div>
        </>
      )}
    </div>
  );
}

/** 旧组件别名（向后兼容） */
export function XiaoQuan(props: Omit<MascotProps, 'character'>) {
  return <Mascot {...props} character="xiaoquan" />;
}

export default Mascot;
