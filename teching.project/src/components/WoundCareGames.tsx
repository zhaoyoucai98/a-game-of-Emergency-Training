import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Droplets } from 'lucide-react';
import { sfx } from '@/utils/sfx';

/**
 * 第五关「轻微擦伤处理」专属玩法集
 *  - WashWoundGame：长按水龙头冲洗伤口，污渍随冲洗逐渐消失
 *  - DisinfectGame：用棉签从伤口中心向外画圈消毒
 *  - CoverWoundGame：将创可贴拖到伤口正中位置覆盖
 */

/* ================================================================ */
/* 共用：手臂 + 伤口 SVG                                             */
/* ================================================================ */
interface ArmWoundProps {
  /** 伤口中心 (% 相对容器) */
  cx: number;
  cy: number;
  /** 污渍残留度 0~1 */
  dirt?: number;
  /** 已消毒进度 0~1（变为亮色光晕） */
  cleaned?: number;
  /** 是否已被覆盖 */
  covered?: boolean;
}

function ArmWound({
  cx,
  cy,
  dirt = 1,
  cleaned = 0,
  covered = false,
}: ArmWoundProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
    >
      {/* 手臂底色 */}
      <defs>
        <linearGradient id="arm-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE0BD" />
          <stop offset="100%" stopColor="#F4C9A0" />
        </linearGradient>
        <radialGradient id="halo-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF59D" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFF59D" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 整条手臂 */}
      <path
        d="M 8 35 Q 15 20, 35 22 L 70 25 Q 92 30, 92 50 Q 92 70, 70 75 L 35 78 Q 15 80, 8 65 Z"
        fill="url(#arm-grad)"
        stroke="#C97"
        strokeWidth="0.6"
      />
      {/* 手腕褶皱 */}
      <path
        d="M 18 40 Q 22 50, 18 60"
        fill="none"
        stroke="#C97"
        strokeWidth="0.4"
        opacity="0.5"
      />

      {/* 消毒后的明亮光晕 */}
      {cleaned > 0 && !covered && (
        <circle
          cx={cx}
          cy={cy}
          r={10 + cleaned * 4}
          fill="url(#halo-grad)"
          opacity={cleaned}
        />
      )}

      {/* 伤口本体（红色擦伤） */}
      {!covered && (
        <g>
          <ellipse
            cx={cx}
            cy={cy}
            rx={6}
            ry={4}
            fill="#FFB3A6"
            stroke="#E74C3C"
            strokeWidth="0.5"
          />
          <path
            d={`M ${cx - 3} ${cy - 1} Q ${cx} ${cy + 1.5}, ${cx + 3} ${cy - 0.5}`}
            stroke="#C0392B"
            strokeWidth="0.6"
            fill="none"
          />
        </g>
      )}

      {/* 伤口周围污渍（dirt 逐渐降低） */}
      {!covered &&
        dirt > 0 &&
        [
          [-7, -3, 1.4],
          [6, -4, 1.1],
          [-5, 4, 1.2],
          [7, 3, 1.5],
          [0, -6, 1.0],
          [0, 6, 1.3],
          [-9, 1, 1.0],
          [9, 1, 1.1],
        ].map(([dx, dy, r], i) => (
          <circle
            key={i}
            cx={cx + (dx as number)}
            cy={cy + (dy as number)}
            r={r as number}
            fill="#6D4C41"
            opacity={0.55 * dirt}
          />
        ))}

      {/* 创可贴（覆盖后） */}
      {covered && (
        <g>
          <rect
            x={cx - 12}
            y={cy - 5}
            width={24}
            height={10}
            rx={2}
            fill="#FAD7A0"
            stroke="#B9770E"
            strokeWidth="0.5"
          />
          {/* 中央纱布 */}
          <rect
            x={cx - 5}
            y={cy - 3}
            width={10}
            height={6}
            rx={0.5}
            fill="#FFF8E7"
          />
          {/* 胶带网格 */}
          {Array.from({ length: 5 }).map((_, i) => (
            <circle
              key={`l-${i}`}
              cx={cx - 10 + i * 1.2}
              cy={cy}
              r="0.4"
              fill="#B9770E"
              opacity="0.5"
            />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <circle
              key={`r-${i}`}
              cx={cx + 6 + i * 1.2}
              cy={cy}
              r="0.4"
              fill="#B9770E"
              opacity="0.5"
            />
          ))}
        </g>
      )}
    </svg>
  );
}

/* ================================================================ */
/* 1. 流水冲洗：长按水龙头 → 进度条蓄满 → 污渍洗净                   */
/* ================================================================ */
interface WashWoundGameProps {
  onComplete: () => void;
  onWrong: () => void;
}

export function WashWoundGame({ onComplete, onWrong }: WashWoundGameProps) {
  const HOLD_TARGET = 3000; // 需累计长按 3 秒
  const [progress, setProgress] = useState(0); // 0~1
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const tickRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  // 渐进刷新进度
  useEffect(() => {
    if (!holding) return;
    let raf = 0;
    const step = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      setProgress((p) => {
        const next = Math.min(1, p + dt / HOLD_TARGET);
        if (next >= 1 && !done) {
          setDone(true);
          sfx.complete();
          // 立即通知父组件，由父统一显示反馈并切场景
          onComplete();
        }
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // 节拍水声
    tickRef.current = window.setInterval(() => sfx.tick(), 280);
    return () => {
      cancelAnimationFrame(raf);
      lastTsRef.current = 0;
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [holding, done, onComplete]);

  const startHold = () => {
    if (done) return;
    setHolding(true);
  };
  const endHold = () => {
    setHolding(false);
  };

  const dirt = Math.max(0, 1 - progress * 1.1);

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <Droplets className="w-4 h-4 text-primary" />
        长按水龙头持续冲洗（{Math.round(progress * 100)}%）
      </div>

      {/* 手臂 + 伤口区域 */}
      <div className="relative w-full max-w-[300px] aspect-[2/1] bg-gradient-to-b from-sky-50 to-sky-100 rounded-3xl border-4 border-white shadow-game overflow-hidden">
        <ArmWound cx={50} cy={50} dirt={dirt} cleaned={0} />

        {/* 水流动画 */}
        {holding && !done && (
          <>
            {/* 龙头 */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 text-2xl select-none">
              🚿
            </div>
            {/* 水滴 */}
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute text-primary text-lg pointer-events-none"
                style={{
                  left: `${42 + (i % 4) * 4}%`,
                  top: `${10 + (i % 3) * 10}%`,
                  animation: `fallDrop 0.6s ${i * 0.07}s linear infinite`,
                }}
              >
                💧
              </span>
            ))}
            {/* 水花 */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[44%] w-20 h-3 rounded-full bg-primary/30 blur-sm animate-pulse" />
          </>
        )}

        {/* 完成态 */}
        {done && (
          <div className="absolute inset-0 bg-life/15 flex items-center justify-center animate-pop-in">
            <div className="bg-white rounded-2xl px-3 py-1.5 shadow-game-sm text-life font-extrabold flex items-center gap-1 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              冲洗干净
            </div>
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className="w-full max-w-[300px] h-3 rounded-full bg-white shadow-inner overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-light to-primary transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* 龙头按钮 */}
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
        className={`px-6 py-3 rounded-2xl font-extrabold text-white shadow-game
                    flex items-center gap-2 transition-all select-none touch-none
                    ${done
                      ? 'bg-life cursor-default'
                      : holding
                        ? 'bg-primary scale-95'
                        : 'bg-gradient-to-b from-primary-light to-primary active:scale-95'}`}
      >
        <Droplets className="w-5 h-5" />
        {done ? '冲洗完成' : holding ? '冲洗中...' : '长按打开水龙头'}
      </button>

      <button
        onClick={() => {
          sfx.error();
          onWrong();
        }}
        className="text-xs text-ink/40 hover:text-alert underline"
      >
        模拟错误操作（不冲直接包扎）
      </button>

      {/* 内联关键帧 */}
      <style>{`
        @keyframes fallDrop {
          0% { transform: translateY(-10px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ================================================================ */
/* 2. 碘伏消毒：从伤口中心向外画圈                                    */
/* ================================================================ */
interface DisinfectGameProps {
  onComplete: () => void;
  onWrong: () => void;
}

export function DisinfectGame({ onComplete, onWrong }: DisinfectGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0); // 累计画过的角度（弧度，可超过 2π）
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [done, setDone] = useState(false);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const lastAngleRef = useRef<number | null>(null);
  const startedFromCenterRef = useRef<boolean>(false);
  const maxRadiusRef = useRef<number>(0);
  const angleRef = useRef<number>(0); // 实时角度引用（避免 setState 异步问题）
  const completedRef = useRef<boolean>(false);
  // 保存 onComplete 最新引用，避免 effect 闭包陈旧
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 伤口中心（%）
  const CENTER = { x: 50, y: 50 };
  // 完成阈值：累计画 360°（一圈即可），半径必须有从内向外扩张
  const TARGET_ANGLE = Math.PI * 2;
  // 起笔判定半径（% 距离），越大越宽松
  const START_RADIUS = 18;
  // 完成所需的最小最大半径（% 距离）
  const MIN_OUTER_RADIUS = 10;
  // 半径回缩容差（% 距离），超过此容差才算"往回画"
  const SHRINK_TOLERANCE = 10;

  const getRel = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const distFromCenter = (p: { x: number; y: number }) =>
    Math.hypot(p.x - CENTER.x, p.y - CENTER.y);

  const onDown = (e: React.PointerEvent) => {
    if (done) return;
    const p = getRel(e);
    if (!p) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrawing(true);
    const r = distFromCenter(p);
    // 必须从靠近伤口中心起笔
    if (r > START_RADIUS) {
      setErrorFlash('要从伤口中心附近起笔');
      sfx.error();
      onWrong();
      setTimeout(() => setErrorFlash(null), 1200);
      setDrawing(false);
      return;
    }
    startedFromCenterRef.current = true;
    maxRadiusRef.current = r;
    setTrail([p]);
    lastAngleRef.current = Math.atan2(p.y - CENTER.y, p.x - CENTER.x);
    angleRef.current = 0;
    setAngle(0);
  };

  const tryFinish = () => {
    if (completedRef.current) return;
    if (
      startedFromCenterRef.current &&
      angleRef.current >= TARGET_ANGLE &&
      maxRadiusRef.current >= MIN_OUTER_RADIUS
    ) {
      completedRef.current = true;
      setDone(true);
      sfx.complete();
      onCompleteRef.current?.();
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing || done || completedRef.current) return;
    const p = getRel(e);
    if (!p) return;
    const r = distFromCenter(p);
    const a = Math.atan2(p.y - CENTER.y, p.x - CENTER.x);
    if (lastAngleRef.current !== null) {
      let da = a - lastAngleRef.current;
      // 处理 -π~π 边界
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      // 累计同向角度
      angleRef.current += Math.abs(da);
      setAngle(angleRef.current);
    }
    lastAngleRef.current = a;

    // 半径必须不能反复缩小（要从内向外）；保留一定容差，避免抖动误判
    if (r + SHRINK_TOLERANCE < maxRadiusRef.current) {
      setErrorFlash('要由内向外画圈，不要往回画');
      sfx.error();
      onWrong();
      setDrawing(false);
      setTrail([]);
      setTimeout(() => setErrorFlash(null), 1200);
      return;
    }
    maxRadiusRef.current = Math.max(maxRadiusRef.current, r);
    setTrail((t) => [...t.slice(-120), p]);

    // 同步尝试完成
    tryFinish();
  };

  const onUp = () => {
    setDrawing(false);
    lastAngleRef.current = null;
    // 松手时再尝试一次，避免最后一次 move 没及时触发
    tryFinish();
  };

  const cleaned = Math.min(1, angle / TARGET_ANGLE);

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <span className="text-base">🧴</span>
        从伤口中心向外画圈消毒（{Math.round(cleaned * 100)}%）
      </div>

      <div
        ref={containerRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative w-full max-w-[300px] aspect-[2/1]
                   bg-gradient-to-b from-orange-50 to-yellow-50
                   rounded-3xl border-4 border-white shadow-game
                   touch-none select-none overflow-hidden cursor-crosshair"
      >
        <ArmWound cx={50} cy={50} dirt={1 - cleaned * 0.7} cleaned={cleaned} />

        {/* 引导虚线圈 */}
        {!done && (
          <>
            <svg
              viewBox="0 0 100 50"
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              {[6, 12, 18].map((r) => (
                <ellipse
                  key={r}
                  cx={50}
                  cy={25}
                  rx={r}
                  ry={r / 2}
                  fill="none"
                  stroke="#FFA500"
                  strokeWidth="0.3"
                  strokeDasharray="1 1"
                  opacity="0.5"
                />
              ))}
            </svg>
          </>
        )}

        {/* 棉签轨迹（橙红色碘伏痕迹） */}
        <svg
          viewBox="0 0 100 50"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {trail.length > 1 && (
            <polyline
              points={trail
                .map((p) => `${p.x},${p.y / 2}`)
                .join(' ')}
              fill="none"
              stroke="#D2691E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
            />
          )}
        </svg>

        {/* 棉签头跟随光标 */}
        {drawing && trail.length > 0 && (
          <div
            className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-2xl"
            style={{
              left: `${trail[trail.length - 1].x}%`,
              top: `${trail[trail.length - 1].y}%`,
            }}
          >
            🧫
          </div>
        )}

        {/* 完成态 */}
        {done && (
          <div className="absolute inset-0 bg-warm/15 flex items-center justify-center animate-pop-in">
            <div className="bg-white rounded-2xl px-3 py-1.5 shadow-game-sm text-warm font-extrabold flex items-center gap-1 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              消毒到位
            </div>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {errorFlash && (
        <div className="px-3 py-1.5 rounded-full bg-alert text-white text-xs font-bold shadow-game-sm animate-pop-in">
          ❗ {errorFlash}
        </div>
      )}

      <div className="text-xs text-ink/60 text-center max-w-[260px]">
        用棉签从伤口 <b className="text-warm">中心起笔</b>，{' '}
        <b className="text-warm">由内向外画圈</b>，画一圈以上即可
      </div>

      <button
        onClick={() => {
          sfx.error();
          onWrong();
        }}
        className="text-xs text-ink/40 hover:text-alert underline"
      >
        模拟错误操作（用酒精涂抹）
      </button>
    </div>
  );
}

/* ================================================================ */
/* 3. 覆盖创可贴：拖拽到伤口正中位置                                  */
/* ================================================================ */
interface CoverWoundGameProps {
  onComplete: () => void;
  onWrong: () => void;
}

export function CoverWoundGame({ onComplete, onWrong }: CoverWoundGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const TARGET = { x: 50, y: 50 };
  const SNAP_DIST = 16; // 放宽吸附距离
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);
  const completedRef = useRef(false);

  const finishOnce = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setDone(true);
    sfx.complete();
    // 立即调用，由父组件统一弹"操作正确"反馈并切场景
    onComplete();
  };

  // 在 window 上挂 pointermove/up，避免 source 元素拥有 pointer-capture
  // 时容器收不到事件的问题
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    const handleUp = (e: PointerEvent) => {
      setDragging(false);
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      const d = Math.hypot(px - TARGET.x, (py - TARGET.y) * 2);
      if (d <= SNAP_DIST) {
        setPos(TARGET);
        finishOnce();
      } else {
        sfx.error();
        setErrorFlash('要正好盖在伤口上');
        onWrong();
        setPos(null);
        setTimeout(() => setErrorFlash(null), 1200);
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragging, onWrong]);

  const onSourceDown = (e: React.PointerEvent) => {
    if (done) return;
    e.preventDefault();
    setDragging(true);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <span className="text-base">🩹</span>
        把创可贴拖到伤口正中
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-[300px] aspect-[2/1]
                   bg-gradient-to-b from-rose-50 to-amber-50
                   rounded-3xl border-4 border-white shadow-game
                   touch-none select-none overflow-hidden"
      >
        <ArmWound cx={50} cy={50} dirt={0.1} cleaned={0.6} covered={done} />

        {/* 目标虚线框 */}
        {!done && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2
                       w-20 h-9 rounded-md border-2 border-dashed border-life/60
                       flex items-center justify-center text-[10px] text-life font-bold
                       pointer-events-none"
            style={{ left: `${TARGET.x}%`, top: `${TARGET.y}%` }}
          >
            创可贴位置
          </div>
        )}

        {/* 拖动中的创可贴 */}
        {pos && !done && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="w-20 h-9 rounded-md bg-amber-200 border-2 border-amber-600 shadow-game-sm flex items-center justify-center">
              <div className="w-8 h-5 rounded bg-amber-50" />
            </div>
          </div>
        )}

        {/* 完成 */}
        {done && (
          <div className="absolute inset-0 bg-life/15 flex items-center justify-center animate-pop-in">
            <div className="bg-white rounded-2xl px-3 py-1.5 shadow-game-sm text-life font-extrabold flex items-center gap-1 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              覆盖完成
            </div>
          </div>
        )}
      </div>

      {errorFlash && (
        <div className="px-3 py-1.5 rounded-full bg-alert text-white text-xs font-bold shadow-game-sm animate-pop-in">
          ❗ {errorFlash}
        </div>
      )}

      {/* 待拖拽的创可贴 */}
      {!done && (
        <div
          onPointerDown={onSourceDown}
          className="w-24 h-11 rounded-md bg-gradient-to-b from-amber-200 to-amber-300
                     border-2 border-amber-600 shadow-game cursor-grab active:cursor-grabbing
                     flex items-center justify-center select-none touch-none
                     hover:scale-105 transition-transform"
        >
          <div className="w-10 h-6 rounded bg-amber-50" />
        </div>
      )}

      <div className="text-xs text-ink/60 text-center max-w-[260px]">
        提示：只能用 <b className="text-warm">干净的创可贴/纱布</b>，
        不能涂牙膏、烟灰、草药
      </div>

      <button
        onClick={() => {
          sfx.error();
          onWrong();
        }}
        className="text-xs text-ink/40 hover:text-alert underline"
      >
        模拟错误操作（涂牙膏）
      </button>
    </div>
  );
}
