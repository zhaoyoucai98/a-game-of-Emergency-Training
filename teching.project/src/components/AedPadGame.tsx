import { useState, useRef } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { sfx } from '@/utils/sfx';

/**
 * AED 电极片拖拽玩法
 *
 * 玩法：
 *   - 屏幕底部两个电极片（白色圆贴片）
 *   - 中间显示人体上半身轮廓
 *   - 玩家拖拽电极片到正确位置（右上胸 + 左下腹）
 *   - 贴对位置后亮起 + 完成
 */

interface AedPadGameProps {
  onComplete: () => void;
  onWrong: () => void;
}

interface PadPosition {
  /** 已放置的位置 [x%, y%] 相对人体框 */
  placed?: { x: number; y: number };
}

/** 正确目标位置（百分比相对人体容器） */
const TARGETS = {
  pad1: { x: 30, y: 25, label: '右上胸' },  // 右上胸
  pad2: { x: 70, y: 60, label: '左下侧' },  // 左侧肋下
};

/** 距离阈值（% 距离） */
const SNAP_DIST = 12;

export function AedPadGame({ onComplete, onWrong }: AedPadGameProps) {
  const [pads, setPads] = useState<Record<'pad1' | 'pad2', PadPosition>>({
    pad1: {},
    pad2: {},
  });
  const [dragging, setDragging] = useState<'pad1' | 'pad2' | null>(null);
  const [hintFlash, setHintFlash] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const placedCount = Object.values(pads).filter((p) => p.placed).length;
  const isDone = placedCount === 2;

  const handlePointerDown = (
    pad: 'pad1' | 'pad2',
    e: React.PointerEvent
  ) => {
    if (pads[pad].placed) return;
    e.preventDefault();
    setDragging(pad);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // 临时位置（拖拽中）
    setPads((prev) => ({
      ...prev,
      [dragging]: { placed: { x, y } },
    }));
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    const pad = dragging;
    const target = TARGETS[pad];
    const placed = pads[pad].placed;
    setDragging(null);

    if (!placed) return;

    const dist = Math.hypot(placed.x - target.x, placed.y - target.y);
    if (dist <= SNAP_DIST) {
      // 吸附到精确位置
      setPads((prev) => ({
        ...prev,
        [pad]: { placed: { x: target.x, y: target.y } },
      }));
      sfx.success();
      // 检查是否两片都贴好
      const otherKey = pad === 'pad1' ? 'pad2' : 'pad1';
      if (pads[otherKey].placed) {
        setTimeout(() => {
          sfx.complete();
          onComplete();
        }, 600);
      }
    } else {
      // 错位：弹回 + 提示
      setPads((prev) => ({ ...prev, [pad]: {} }));
      setHintFlash(`电极片应贴在${target.label}`);
      sfx.error();
      onWrong();
      setTimeout(() => setHintFlash(null), 1500);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 py-2">
      {/* 进度提示 */}
      <div className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <Zap className="w-4 h-4 text-warm" />
        将 2 张电极片拖到正确位置（{placedCount}/2）
      </div>

      {/* 人体框 */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full max-w-[260px] aspect-[1/1.4]
                   bg-gradient-to-b from-sky-50 to-sky-100
                   rounded-3xl border-4 border-white shadow-game
                   touch-none select-none overflow-hidden"
      >
        {/* 人体轮廓（简笔画） */}
        <svg
          viewBox="0 0 100 140"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* 头 */}
          <circle cx="50" cy="22" r="14" fill="#FFE0BD" stroke="#C97" strokeWidth="1" />
          {/* 脖子 */}
          <rect x="46" y="34" width="8" height="6" fill="#FFE0BD" />
          {/* 身体 */}
          <path
            d="M28 42 Q26 80, 32 110 L 68 110 Q 74 80, 72 42 Q 50 38, 28 42 Z"
            fill="#E3F2FD"
            stroke="#90CAF9"
            strokeWidth="1.5"
          />
          {/* 左乳头标记（参考） */}
          <circle cx="40" cy="58" r="1.5" fill="#90CAF9" />
          <circle cx="60" cy="58" r="1.5" fill="#90CAF9" />
          {/* 中线 */}
          <line x1="50" y1="40" x2="50" y2="105" stroke="#BBDEFB" strokeWidth="0.5" strokeDasharray="2 2" />
        </svg>

        {/* 目标位置（虚线圈） */}
        {(['pad1', 'pad2'] as const).map((k) => {
          const t = TARGETS[k];
          const placed = pads[k].placed;
          const snapped =
            placed && Math.hypot(placed.x - t.x, placed.y - t.y) <= 0.5;
          if (snapped) return null;
          return (
            <div
              key={`target-${k}`}
              className="absolute w-12 h-12 rounded-full border-2 border-dashed
                         border-life/50 -translate-x-1/2 -translate-y-1/2
                         flex items-center justify-center text-[10px]
                         text-life font-bold pointer-events-none"
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
            >
              {t.label}
            </div>
          );
        })}

        {/* 电极片（已放置的） */}
        {(['pad1', 'pad2'] as const).map((k) => {
          const placed = pads[k].placed;
          if (!placed) return null;
          const t = TARGETS[k];
          const snapped =
            Math.hypot(placed.x - t.x, placed.y - t.y) <= 0.5;
          return (
            <div
              key={`pad-${k}`}
              onPointerDown={(e) => !snapped && handlePointerDown(k, e)}
              className={`absolute w-12 h-12 rounded-full -translate-x-1/2 -translate-y-1/2
                          flex items-center justify-center font-extrabold
                          shadow-game cursor-grab active:cursor-grabbing
                          ${snapped
                            ? 'bg-gradient-to-br from-life-light to-life text-white ring-4 ring-life/30 animate-pulse'
                            : 'bg-white text-warm border-2 border-warm'}`}
              style={{
                left: `${placed.x}%`,
                top: `${placed.y}%`,
                touchAction: 'none',
              }}
            >
              {snapped ? <CheckCircle2 className="w-6 h-6" /> : '⚡'}
            </div>
          );
        })}

        {/* 完成态 */}
        {isDone && (
          <div className="absolute inset-0 bg-life/10 flex items-center justify-center">
            <div className="bg-white rounded-2xl px-4 py-2 shadow-game text-life font-extrabold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              电极片就位
            </div>
          </div>
        )}
      </div>

      {/* 提示 flash */}
      {hintFlash && (
        <div className="px-3 py-1.5 rounded-full bg-alert text-white text-sm font-bold shadow-game-sm animate-pop-in">
          ❗ {hintFlash}
        </div>
      )}

      {/* 待拖拽的电极片 */}
      <div className="flex gap-4 items-center">
        {(['pad1', 'pad2'] as const).map((k) => {
          const isPlaced = !!pads[k].placed;
          if (isPlaced) return null;
          return (
            <div
              key={`source-${k}`}
              onPointerDown={(e) => handlePointerDown(k, e)}
              className="w-14 h-14 rounded-full
                         bg-gradient-to-br from-white to-sky-100
                         border-4 border-warm shadow-game
                         flex items-center justify-center text-2xl
                         cursor-grab active:cursor-grabbing active:scale-110
                         transition-transform"
              style={{ touchAction: 'none' }}
            >
              ⚡
            </div>
          );
        })}
      </div>

      <div className="text-xs text-ink/50 text-center max-w-[260px]">
        提示：电极片要贴 <b className="text-warm">右上胸</b> 和{' '}
        <b className="text-warm">左下侧肋骨外</b>
      </div>
    </div>
  );
}

export default AedPadGame;
