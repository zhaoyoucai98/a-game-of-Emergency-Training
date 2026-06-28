/**
 * 横版闯关 - 小泉角色
 * - 父组件通过受控 props 传入 x（场景内横坐标 px）与 facing（朝向）
 * - 父组件负责监听键盘并更新 x（这样摄像机能跟随）
 * - 本组件只负责渲染：站立/走动/欢呼姿态 + 朝向翻转
 */

interface PlayerProps {
  /** 角色在场景内的 X 坐标（px，相对场景左侧） */
  x: number;
  /** 是否正在行走（用于切换走动动画） */
  walking?: boolean;
  /** 朝向：1=右 / -1=左 */
  facing?: 1 | -1;
  /** 当前情绪/动作：normal/cheer/busy */
  mood?: 'normal' | 'cheer' | 'busy';
  /** 角色尺寸（px） */
  size?: number;
  /** 头顶提示文案（如"按 E 互动"） */
  hint?: string;
}

export function Player({
  x,
  walking = false,
  facing = 1,
  mood = 'normal',
  size = 110,
  hint,
}: PlayerProps) {
  // 走动时通过 CSS 让身体上下小幅起伏；欢呼时整体跳
  const bodyAnim = mood === 'cheer'
    ? 'animate-bounce-slow'
    : walking
    ? 'animate-wiggle'
    : 'animate-float';

  return (
    <div
      className="absolute bottom-0 transition-transform duration-100 ease-linear"
      style={{
        left: `${x}px`,
        width: `${size}px`,
        height: `${size * 1.2}px`,
        transform: `translateX(-50%)`,
      }}
    >
      {/* 头顶提示 */}
      {hint && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-10
                     bg-white px-3 py-1 rounded-2xl text-xs font-bold text-ink
                     shadow-game-sm border-2 border-primary
                     whitespace-nowrap animate-pop-in"
        >
          {hint}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5
                          w-3 h-3 bg-white border-r-2 border-b-2 border-primary
                          rotate-45" />
        </div>
      )}

      {/* 角色立绘（朝向翻转） */}
      <div
        className={`absolute inset-0 ${bodyAnim}`}
        style={{ transform: `scaleX(${facing})` }}
      >
        <img
          src="/xiaoquan.png"
          alt="小泉"
          className="w-full h-full object-contain chroma-key select-none pointer-events-none"
          draggable={false}
          onError={(e) => {
            // 兜底：图片加载失败显示 emoji
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.player-fallback')) {
              const fallback = document.createElement('div');
              fallback.className =
                'player-fallback w-full h-full flex items-center justify-center text-7xl';
              fallback.textContent = '🧒';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>

      {/* 影子 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0
                   w-3/5 h-2 rounded-full bg-black/25 blur-[2px]"
      />
    </div>
  );
}
