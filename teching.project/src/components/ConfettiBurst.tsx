import { useEffect, useState, useMemo } from 'react';

/**
 * 通关粒子特效
 * - star：金色星星撒落
 * - paper：彩纸碎片
 * - heart：爱心飘升
 *
 * 用法：
 *   <ConfettiBurst active={isWin} type="star" count={40} />
 */

export type ConfettiType = 'star' | 'paper' | 'heart';

interface ConfettiBurstProps {
  active: boolean;
  type?: ConfettiType;
  count?: number;
  /** 持续时间（毫秒） */
  duration?: number;
}

interface Particle {
  id: number;
  x: number;          // 起始 X (vw)
  delay: number;      // 延迟 (s)
  duration: number;   // 飘落时长 (s)
  rotate: number;     // 起始旋转 (deg)
  rotateEnd: number;  // 结束旋转 (deg)
  drift: number;      // 横向漂移 (vw)
  size: number;       // 大小 (px)
  color: string;
  shape: string;      // emoji 或 形状
}

const colors = ['#FFD93D', '#FF6347', '#1E90FF', '#32CD32', '#FF69B4', '#9B59B6'];

function makeParticles(count: number, type: ConfettiType): Particle[] {
  const stars = ['⭐', '✨', '🌟', '💫'];
  const hearts = ['❤️', '💖', '💕', '💗'];
  const arr: Particle[] = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2.5,
      rotate: Math.random() * 360,
      rotateEnd: Math.random() * 720 - 360,
      drift: (Math.random() - 0.5) * 40,
      size: 14 + Math.random() * 18,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape:
        type === 'star'
          ? stars[Math.floor(Math.random() * stars.length)]
          : type === 'heart'
          ? hearts[Math.floor(Math.random() * hearts.length)]
          : '', // paper 用方块
    });
  }
  return arr;
}

export function ConfettiBurst({
  active,
  type = 'star',
  count = 40,
  duration = 4000,
}: ConfettiBurstProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    setShow(true);
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
  }, [active, duration]);

  const particles = useMemo(
    () => (show ? makeParticles(count, type) : []),
    [show, count, type]
  );

  if (!show) return null;

  return (
    <>
      {/* 注入 keyframes（一次性） */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate(0, -10vh) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            transform: translate(var(--drift), 110vh) rotate(var(--rotate-end));
            opacity: 0;
          }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute will-change-transform"
            style={{
              left: `${p.x}vw`,
              top: 0,
              fontSize: `${p.size}px`,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
              ['--drift' as any]: `${p.drift}vw`,
              ['--rotate-end' as any]: `${p.rotateEnd}deg`,
            }}
          >
            {type === 'paper' ? (
              <span
                style={{
                  display: 'inline-block',
                  width: p.size,
                  height: p.size * 0.5,
                  background: p.color,
                  borderRadius: 2,
                }}
              />
            ) : (
              p.shape
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default ConfettiBurst;
