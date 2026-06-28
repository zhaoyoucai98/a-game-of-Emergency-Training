import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ArrowUp, Hand, Scissors } from 'lucide-react';
import { sfx } from '@/utils/sfx';

/**
 * 第二、三章后续关卡专属玩法集
 *  - PressHoldGame：持续按压伤口若干秒（用于加压止血）
 *  - PinchNoseGame：持续按住鼻翼（用于鼻出血）
 *  - RaiseLimbGame：向上拖动肢体到心脏以上
 *  - TourniquetGame：选择正确的止血带绑扎位置（近心端）
 *  - CutClothGame：沿虚线剪开衣物
 */

/* ================================================================ */
/* 工具：用于稳定持有 onComplete 引用                                  */
/* ================================================================ */
function useLatest<T>(v: T) {
  const r = useRef(v);
  useEffect(() => {
    r.current = v;
  }, [v]);
  return r;
}

/* ================================================================ */
/* 1. PressHoldGame：持续加压（长按蓄满进度条）                       */
/* ================================================================ */
interface HoldProps {
  onComplete: () => void;
  onWrong: () => void;
  /** 需要持续按压的时长（毫秒） */
  holdMs?: number;
  /** 标题与说明 */
  title?: string;
  hint?: string;
  /** 释放阈值（释放后多少毫秒视为"中途松开"） */
  releaseGraceMs?: number;
}

export function PressHoldGame({
  onComplete,
  onWrong,
  holdMs = 4000,
  title = '按住伤口持续加压',
  hint = '中途松开会重新出血，要稳稳按住',
  releaseGraceMs = 250,
}: HoldProps) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const [warned, setWarned] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useLatest(onComplete);
  const onWrongRef = useLatest(onWrong);
  const lastTsRef = useRef(0);
  const releaseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!holding || done) return;
    let raf = 0;
    const step = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      setProgress((p) => {
        const next = Math.min(1, p + dt / holdMs);
        if (next >= 1 && !completedRef.current) {
          completedRef.current = true;
          setDone(true);
          sfx.complete();
          onCompleteRef.current?.();
        }
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      lastTsRef.current = 0;
    };
  }, [holding, done, holdMs, onCompleteRef]);

  const startHold = () => {
    if (done) return;
    if (releaseTimerRef.current) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    setHolding(true);
  };
  const endHold = () => {
    setHolding(false);
    if (done || completedRef.current) return;
    // 给一个小宽限时间，避免轻微抖动
    releaseTimerRef.current = window.setTimeout(() => {
      if (!completedRef.current && !warned) {
        setWarned(true);
        sfx.error();
        onWrongRef.current?.();
        // 进度回退一半作为惩罚
        setProgress((p) => Math.max(0, p - 0.4));
        setTimeout(() => setWarned(false), 1200);
      }
    }, releaseGraceMs);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <Hand className="w-4 h-4 text-warm" />
        {title}（{Math.round(progress * 100)}%）
      </div>

      {/* 手臂 + 按压区 */}
      <div className="relative w-full max-w-[300px] aspect-[2/1] bg-gradient-to-b from-rose-50 to-amber-50 rounded-3xl border-4 border-white shadow-game overflow-hidden">
        <svg
          viewBox="0 0 100 50"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ph-arm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE0BD" />
              <stop offset="100%" stopColor="#F4C9A0" />
            </linearGradient>
          </defs>
          <path
            d="M 5 18 Q 12 8, 32 11 L 70 13 Q 92 16, 92 25 Q 92 35, 70 38 L 32 40 Q 12 42, 5 32 Z"
            fill="url(#ph-arm)"
            stroke="#C97"
            strokeWidth="0.4"
          />
          {/* 伤口 + 渗血（按压中减弱） */}
          <ellipse
            cx="50"
            cy="24"
            rx="6"
            ry="3"
            fill="#FFB3A6"
            stroke="#E74C3C"
            strokeWidth="0.4"
            opacity={done ? 0.4 : 1}
          />
          {!done &&
            Array.from({ length: 5 }).map((_, i) => (
              <circle
                key={i}
                cx={48 + i}
                cy={26 + (i % 2)}
                r="0.6"
                fill="#C0392B"
                opacity={Math.max(0.2, 0.9 - progress)}
              />
            ))}
        </svg>

        {/* 中央按压指示 */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            startHold();
          }}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
          disabled={done}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-24 h-24 rounded-full
                      ${done
                        ? 'bg-life'
                        : holding
                          ? 'bg-gradient-to-b from-warm-light to-warm scale-95'
                          : 'bg-gradient-to-b from-rose-300 to-rose-500'}
                      text-white font-extrabold shadow-game border-4 border-white
                      flex flex-col items-center justify-center
                      transition-all touch-none select-none`}
        >
          {done ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <>
              <Hand className="w-8 h-8" />
              <span className="text-[10px] mt-0.5">
                {holding ? '保持按住' : '长按这里'}
              </span>
            </>
          )}
        </button>

        {/* 完成态 */}
        {done && (
          <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none animate-pop-in">
            <div className="bg-white rounded-2xl px-3 py-1 shadow-game-sm text-life font-extrabold flex items-center gap-1 text-xs">
              <CheckCircle2 className="w-4 h-4" /> 止血成功
            </div>
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className="w-full max-w-[300px] h-3 rounded-full bg-white shadow-inner overflow-hidden">
        <div
          className={`h-full transition-all duration-100
                      ${done
                        ? 'bg-life'
                        : 'bg-gradient-to-r from-warm-light to-warm'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {warned && (
        <div className="px-3 py-1.5 rounded-full bg-alert text-white text-xs font-bold shadow-game-sm animate-pop-in">
          ❗ 中途松开了，再按一次！
        </div>
      )}

      <div className="text-xs text-ink/60 text-center max-w-[260px]">{hint}</div>
    </div>
  );
}

/* ================================================================ */
/* 2. PinchNoseGame：持续捏住鼻翼软肉                                */
/* ================================================================ */
export function PinchNoseGame({ onComplete, onWrong }: HoldProps) {
  // 复用 PressHoldGame 的 hold 逻辑，但视觉换成头部+鼻子
  const holdMs = 4500;
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const [warned, setWarned] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useLatest(onComplete);
  const onWrongRef = useLatest(onWrong);
  const lastTsRef = useRef(0);
  const releaseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!holding || done) return;
    let raf = 0;
    const step = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      setProgress((p) => {
        const next = Math.min(1, p + dt / holdMs);
        if (next >= 1 && !completedRef.current) {
          completedRef.current = true;
          setDone(true);
          sfx.complete();
          onCompleteRef.current?.();
        }
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      lastTsRef.current = 0;
    };
  }, [holding, done, onCompleteRef]);

  const startHold = () => {
    if (done) return;
    if (releaseTimerRef.current) window.clearTimeout(releaseTimerRef.current);
    setHolding(true);
  };
  const endHold = () => {
    setHolding(false);
    if (done || completedRef.current) return;
    releaseTimerRef.current = window.setTimeout(() => {
      if (!completedRef.current && !warned) {
        setWarned(true);
        sfx.error();
        onWrongRef.current?.();
        setProgress((p) => Math.max(0, p - 0.4));
        setTimeout(() => setWarned(false), 1200);
      }
    }, 250);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <span className="text-base">👃</span>
        持续捏住鼻翼软肉（{Math.round(progress * 100)}%）
      </div>

      <div className="relative w-full max-w-[260px] aspect-square bg-gradient-to-b from-sky-50 to-blue-50 rounded-3xl border-4 border-white shadow-game overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* 头 */}
          <ellipse cx="50" cy="50" rx="30" ry="34" fill="#FFE0BD" stroke="#C97" strokeWidth="0.6" />
          {/* 头发 */}
          <path d="M 22 35 Q 30 16, 50 18 Q 70 16, 78 35 Q 76 30, 50 28 Q 24 30, 22 35 Z" fill="#3E2723" />
          {/* 眼睛（前倾，半闭） */}
          <path d="M 38 50 Q 40 49, 42 50" stroke="#1F2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M 58 50 Q 60 49, 62 50" stroke="#1F2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* 鼻子 */}
          <path d="M 50 52 Q 48 60, 50 64 Q 52 60, 50 52 Z" fill="#F4C9A0" stroke="#C97" strokeWidth="0.4" />
          {/* 嘴（张开喘气） */}
          <ellipse cx="50" cy="72" rx="3" ry={holding ? 2 : 1.3} fill="#C0392B" opacity="0.7" />
          {/* 鼻血滴 */}
          {!done && progress < 1 &&
            Array.from({ length: 3 }).map((_, i) => (
              <circle
                key={i}
                cx={48 + i * 2}
                cy={68 + i * 2}
                r="0.8"
                fill="#C0392B"
                opacity={Math.max(0.1, 0.8 - progress * 0.8)}
              />
            ))}
        </svg>

        {/* 捏鼻按钮（位于鼻翼区域） */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            startHold();
          }}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
          disabled={done}
          className={`absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2
                      w-16 h-16 rounded-full border-4 border-white shadow-game
                      flex items-center justify-center text-2xl
                      ${done
                        ? 'bg-life'
                        : holding
                          ? 'bg-warm scale-95'
                          : 'bg-gradient-to-b from-rose-200 to-rose-400'}
                      transition-all touch-none select-none`}
        >
          {done ? <CheckCircle2 className="w-8 h-8 text-white" /> : '🤏'}
        </button>
      </div>

      <div className="w-full max-w-[260px] h-3 rounded-full bg-white shadow-inner overflow-hidden">
        <div
          className={`h-full transition-all duration-100
                      ${done ? 'bg-life' : 'bg-gradient-to-r from-rose-300 to-rose-500'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {warned && (
        <div className="px-3 py-1.5 rounded-full bg-alert text-white text-xs font-bold shadow-game-sm animate-pop-in">
          ❗ 松手会重新出血，要持续捏住
        </div>
      )}

      <div className="text-xs text-ink/60 text-center max-w-[260px]">
        捏 <b className="text-warm">鼻翼软肉</b>（不是鼻骨），持续约 10 分钟，
        <b className="text-warm">不要塞纸巾</b>，<b className="text-alert">不要仰头</b>
      </div>
    </div>
  );
}

/* ================================================================ */
/* 3. RaiseLimbGame：将受伤肢体向上拖到心脏以上                       */
/* ================================================================ */
interface RaiseLimbProps {
  onComplete: () => void;
  onWrong: () => void;
}

export function RaiseLimbGame({ onComplete, onWrong }: RaiseLimbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(75); // 初始在底部 75%
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useLatest(onComplete);
  const onWrongRef = useLatest(onWrong);

  // 心脏水平线 = 35%；肢体抬到 35% 以上算成功
  const HEART_Y = 35;
  const TARGET_Y = 30;

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ny = ((e.clientY - rect.top) / rect.height) * 100;
      setY(Math.max(5, Math.min(85, ny)));
    };
    const handleUp = () => {
      setDragging(false);
      if (completedRef.current) return;
      // 松手判定
      setY((cur) => {
        if (cur <= TARGET_Y) {
          completedRef.current = true;
          setDone(true);
          sfx.complete();
          onCompleteRef.current?.();
          return cur;
        }
        sfx.error();
        onWrongRef.current?.();
        return 75; // 没到位掉回去
      });
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragging, onCompleteRef, onWrongRef]);

  const reachTarget = y <= TARGET_Y;

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <ArrowUp className="w-4 h-4 text-warm" />
        把受伤的手向上拖到 <b className="text-alert">心脏以上</b>
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-[260px] aspect-[3/4] bg-gradient-to-b from-sky-100 to-rose-50
                   rounded-3xl border-4 border-white shadow-game overflow-hidden touch-none select-none"
      >
        {/* 身体（半透明轮廓） */}
        <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full pointer-events-none">
          <ellipse cx="50" cy="22" rx="13" ry="14" fill="#FFE0BD" stroke="#C97" strokeWidth="0.5" />
          <path d="M 32 38 Q 28 80, 38 110 L 62 110 Q 72 80, 68 38 Z" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="0.6" />
          {/* 心脏 */}
          <path d="M 47 50 Q 44 47, 41 50 Q 41 54, 47 58 Q 53 54, 53 50 Q 50 47, 47 50 Z" fill="#FF6347" />
        </svg>

        {/* 心脏水平参考线 */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-alert/60"
          style={{ top: `${HEART_Y}%` }}
        >
          <span className="absolute -top-4 right-2 text-[10px] text-alert font-bold">
            心脏线
          </span>
        </div>

        {/* 受伤的手（可拖拽） */}
        <div
          onPointerDown={(e) => {
            if (done) return;
            e.preventDefault();
            setDragging(true);
          }}
          className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-20 h-12 rounded-full
                      ${reachTarget
                        ? 'bg-gradient-to-b from-life-light to-life ring-4 ring-life/40'
                        : 'bg-gradient-to-b from-amber-200 to-amber-400'}
                      border-4 border-white shadow-game
                      flex items-center justify-center text-2xl cursor-grab active:cursor-grabbing
                      touch-none select-none transition-colors`}
          style={{ top: `${y}%` }}
        >
          🩹🤚
        </div>

        {done && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none animate-pop-in">
            <div className="bg-white rounded-2xl px-3 py-1 shadow-game-sm text-life font-extrabold flex items-center gap-1 text-xs">
              <CheckCircle2 className="w-4 h-4" /> 抬高到位
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-ink/60 text-center max-w-[260px]">
        让伤口 <b className="text-warm">高于心脏</b>，可以减少出血
      </div>
    </div>
  );
}

/* ================================================================ */
/* 4. TourniquetGame：选择正确的止血带绑扎位置（近心端）              */
/* ================================================================ */
interface TourniquetProps {
  onComplete: () => void;
  onWrong: () => void;
}

type LimbZone = 'far' | 'near' | 'wrong-side';

export function TourniquetGame({ onComplete, onWrong }: TourniquetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bandX, setBandX] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useLatest(onComplete);
  const onWrongRef = useLatest(onWrong);

  // 横向手臂：身体在左（x=10），手指在右（x=95）
  // 伤口位置 x=70，近心端 = 伤口左侧（x<70），远心端 = 伤口右侧（x>70）
  const WOUND_X = 70;
  // 正确区间：近心端，离伤口 8-25 之间
  const NEAR_MIN = WOUND_X - 25;
  const NEAR_MAX = WOUND_X - 8;

  const classifyZone = (x: number): LimbZone => {
    if (x > WOUND_X) return 'far';
    if (x >= NEAR_MIN && x <= NEAR_MAX) return 'near';
    return 'wrong-side';
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setBandX(((e.clientX - rect.left) / rect.width) * 100);
    };
    const handleUp = () => {
      setDragging(false);
      if (completedRef.current) return;
      setBandX((cur) => {
        if (cur === null) return cur;
        const zone = classifyZone(cur);
        if (zone === 'near') {
          completedRef.current = true;
          setDone(true);
          sfx.complete();
          onCompleteRef.current?.();
          return (NEAR_MIN + NEAR_MAX) / 2;
        }
        sfx.error();
        onWrongRef.current?.();
        setErrorFlash(
          zone === 'far'
            ? '错误！止血带要绑在伤口"近心端"，靠近心脏一侧'
            : '位置太靠近肩膀，离伤口 5-10cm 即可'
        );
        setTimeout(() => setErrorFlash(null), 1500);
        return null; // 弹回
      });
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragging, onCompleteRef, onWrongRef]);

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <span className="text-base">🎗️</span>
        把止血带绑在 <b className="text-warm">伤口近心端</b>
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-[320px] aspect-[2/1] bg-gradient-to-b from-rose-50 to-amber-50
                   rounded-3xl border-4 border-white shadow-game overflow-hidden touch-none select-none"
      >
        {/* 手臂（连身体）+ 心脏图标 */}
        <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="t-arm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE0BD" />
              <stop offset="100%" stopColor="#F4C9A0" />
            </linearGradient>
          </defs>
          {/* 身体一角 */}
          <rect x="0" y="8" width="14" height="34" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="0.4" />
          {/* 心脏 */}
          <path d="M 6 18 Q 4 16, 2 18 Q 2 20, 6 23 Q 10 20, 10 18 Q 8 16, 6 18 Z" fill="#FF6347" />
          <text x="6" y="30" textAnchor="middle" fontSize="3" fill="#C0392B" fontWeight="bold">
            心脏
          </text>
          {/* 手臂 */}
          <path
            d="M 14 18 L 92 22 Q 96 25, 92 28 L 14 32 Z"
            fill="url(#t-arm)"
            stroke="#C97"
            strokeWidth="0.4"
          />
          {/* 手指 */}
          <circle cx="94" cy="22" r="1.4" fill="#FFE0BD" stroke="#C97" strokeWidth="0.3" />
          <circle cx="94" cy="25" r="1.4" fill="#FFE0BD" stroke="#C97" strokeWidth="0.3" />
          <circle cx="94" cy="28" r="1.4" fill="#FFE0BD" stroke="#C97" strokeWidth="0.3" />
          {/* 伤口（喷射状） */}
          <ellipse cx={WOUND_X} cy="25" rx="2.5" ry="2" fill="#E74C3C" />
          {!done &&
            Array.from({ length: 6 }).map((_, i) => (
              <circle
                key={i}
                cx={WOUND_X + 2 + i * 0.8}
                cy={25 - 2 + i * 0.4}
                r="0.5"
                fill="#C0392B"
                opacity="0.7"
              />
            ))}
          {/* 正确区域提示（仅未完成时） */}
          {!done && (
            <rect
              x={NEAR_MIN}
              y="14"
              width={NEAR_MAX - NEAR_MIN}
              height="22"
              fill="none"
              stroke="#32CD32"
              strokeDasharray="1 1"
              strokeWidth="0.4"
              opacity="0.7"
            />
          )}
          {/* 远心端标注 */}
          {!done && (
            <text x={WOUND_X + 12} y="13" fontSize="2.5" fill="#FF6347" fontWeight="bold">
              ✗ 远心端
            </text>
          )}
        </svg>

        {/* 拖动中的止血带 */}
        {bandX !== null && !done && (
          <div
            className="absolute -translate-x-1/2 pointer-events-none"
            style={{ left: `${bandX}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-3 h-16 rounded bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-amber-800 shadow-game-sm" />
          </div>
        )}

        {/* 完成态：止血带固定在近心端 */}
        {done && bandX !== null && (
          <div
            className="absolute -translate-x-1/2 pointer-events-none"
            style={{ left: `${bandX}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-3 h-16 rounded bg-gradient-to-b from-life-light to-life border-2 border-green-700 shadow-game-sm" />
          </div>
        )}

        {done && (
          <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none animate-pop-in">
            <div className="bg-white rounded-2xl px-3 py-1 shadow-game-sm text-life font-extrabold flex items-center gap-1 text-xs">
              <CheckCircle2 className="w-4 h-4" /> 位置正确
            </div>
          </div>
        )}
      </div>

      {errorFlash && (
        <div className="px-3 py-1.5 rounded-full bg-alert text-white text-xs font-bold shadow-game-sm animate-pop-in max-w-[280px] text-center">
          ❗ {errorFlash}
        </div>
      )}

      {/* 待拖拽止血带 */}
      {!done && (
        <div
          onPointerDown={(e) => {
            e.preventDefault();
            setDragging(true);
            // 拖起时给一个起始位置，免得首帧 null
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setBandX(((e.clientX - rect.left) / rect.width) * 100);
            }
          }}
          className="w-4 h-20 rounded bg-gradient-to-b from-amber-300 to-amber-500
                     border-2 border-amber-700 shadow-game cursor-grab active:cursor-grabbing
                     touch-none select-none hover:scale-110 transition-transform"
        />
      )}

      <div className="text-xs text-ink/60 text-center max-w-[280px]">
        止血带要在 <b className="text-life">伤口靠近心脏一侧</b>，距离伤口 5-10cm
      </div>
    </div>
  );
}

/* ================================================================ */
/* 5. CutClothGame：用剪刀沿虚线剪开衣物                              */
/* ================================================================ */
interface CutClothProps {
  onComplete: () => void;
  onWrong: () => void;
}

export function CutClothGame({ onComplete, onWrong }: CutClothProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // 沿垂直虚线 (x≈50) 从上到下剪
  const LINE_X = 50;
  const TOLERANCE = 12; // 剪刀偏离虚线超过此值算偏离
  const [progress, setProgress] = useState(0); // 0~1：从上往下进度
  const [drawing, setDrawing] = useState(false);
  const [done, setDone] = useState(false);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useLatest(onComplete);
  const onWrongRef = useLatest(onWrong);
  const startedAtTopRef = useRef(false);

  const tryFinish = (p: number) => {
    if (completedRef.current) return;
    if (p >= 0.95) {
      completedRef.current = true;
      setDone(true);
      sfx.complete();
      onCompleteRef.current?.();
    }
  };

  const onDown = (e: React.PointerEvent) => {
    if (done) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    // 必须从顶部起笔，且接近虚线
    if (py > 20 || Math.abs(px - LINE_X) > TOLERANCE) {
      setErrorFlash('要从衣领顶部沿虚线开始剪');
      sfx.error();
      onWrongRef.current?.();
      setTimeout(() => setErrorFlash(null), 1200);
      return;
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startedAtTopRef.current = true;
    setDrawing(true);
    setProgress(py / 100);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing || done || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    if (Math.abs(px - LINE_X) > TOLERANCE) {
      // 偏离虚线
      setErrorFlash('剪偏了！要沿着虚线剪');
      sfx.error();
      onWrongRef.current?.();
      setDrawing(false);
      setProgress(0);
      startedAtTopRef.current = false;
      setTimeout(() => setErrorFlash(null), 1200);
      return;
    }
    const next = Math.max(progress, py / 100);
    setProgress(next);
    tryFinish(next);
  };

  const onUp = () => {
    setDrawing(false);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <Scissors className="w-4 h-4 text-warm" />
        沿虚线把衣物剪开（{Math.round(progress * 100)}%）
      </div>

      <div
        ref={containerRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative w-full max-w-[260px] aspect-[3/4]
                   bg-gradient-to-b from-amber-50 to-orange-50
                   rounded-3xl border-4 border-white shadow-game
                   touch-none select-none overflow-hidden cursor-crosshair"
      >
        {/* 衣物 */}
        <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full pointer-events-none">
          {/* 衣服底色 */}
          <path
            d="M 18 25 L 38 12 Q 50 8, 62 12 L 82 25 L 78 40 L 70 36 L 70 110 L 30 110 L 30 36 L 22 40 Z"
            fill="#90CAF9"
            stroke="#1565C0"
            strokeWidth="0.6"
          />
          {/* 烫伤皮肤透出（衣服中央以下） */}
          <ellipse cx="50" cy="80" rx="12" ry="6" fill="#FFB3A6" opacity="0.6" />
          {/* 已剪开的缝隙 */}
          {progress > 0 && (
            <rect
              x={LINE_X - 1}
              y="10"
              width="2"
              height={Math.min(110, 10 + progress * 100)}
              fill="#1F2937"
            />
          )}
          {/* 虚线引导 */}
          <line
            x1={LINE_X}
            y1="10"
            x2={LINE_X}
            y2="115"
            stroke="#FFA500"
            strokeDasharray="2 2"
            strokeWidth="0.6"
            opacity={done ? 0 : 0.9}
          />
        </svg>

        {/* 剪刀跟随光标 */}
        {drawing && (
          <div
            className="absolute pointer-events-none text-2xl"
            style={{
              left: `${LINE_X}%`,
              top: `${progress * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            ✂️
          </div>
        )}

        {/* 起笔提示 */}
        {!drawing && progress === 0 && !done && (
          <div className="absolute left-1/2 top-2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-warm text-white text-[10px] font-bold animate-bounce-slow">
            从这里起笔 ↓
          </div>
        )}

        {done && (
          <div className="absolute inset-0 bg-life/15 flex items-center justify-center animate-pop-in">
            <div className="bg-white rounded-2xl px-3 py-1.5 shadow-game-sm text-life font-extrabold flex items-center gap-1 text-sm">
              <CheckCircle2 className="w-4 h-4" /> 衣物剪开
            </div>
          </div>
        )}
      </div>

      {errorFlash && (
        <div className="px-3 py-1.5 rounded-full bg-alert text-white text-xs font-bold shadow-game-sm animate-pop-in">
          ❗ {errorFlash}
        </div>
      )}

      <div className="text-xs text-ink/60 text-center max-w-[260px]">
        粘连皮肤的衣物 <b className="text-alert">不能硬撕</b>，要沿周围
        <b className="text-warm"> 剪开</b>
      </div>
    </div>
  );
}
