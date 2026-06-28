import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ArrowUp } from 'lucide-react';
import { sfx } from '@/utils/sfx';

/**
 * 海姆立克急救法玩法
 *
 * 玩法：
 *   1) 长按按钮蓄力（圆环填满）
 *   2) 蓄满后向上滑动（推冲）→ 完成一次冲击
 *   3) 完成 5 次冲击通关
 */

interface HeimlichGameProps {
  onComplete: () => void;
  onWrong: () => void;
}

const TARGET_THRUSTS = 5;
const CHARGE_TIME = 800; // ms 长按蓄力时间
const SWIPE_THRESHOLD = 60; // px 向上滑动判定

export function HeimlichGame({ onComplete, onWrong }: HeimlichGameProps) {
  const [thrusts, setThrusts] = useState(0);
  const [charging, setCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'fail' | null>(null);
  const startYRef = useRef<number | null>(null);
  const chargeTimerRef = useRef<number | null>(null);

  const startCharge = (clientY: number) => {
    if (feedback) return;
    setCharging(true);
    setReady(false);
    setChargeProgress(0);
    startYRef.current = clientY;
    const startTime = Date.now();

    chargeTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(elapsed / CHARGE_TIME, 1);
      setChargeProgress(ratio);
      if (ratio >= 1) {
        window.clearInterval(chargeTimerRef.current!);
        setReady(true);
        sfx.tick();
      }
    }, 30);
  };

  const cancelCharge = () => {
    if (chargeTimerRef.current) window.clearInterval(chargeTimerRef.current);
    setCharging(false);
    setChargeProgress(0);
    setReady(false);
    startYRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startCharge(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!charging || startYRef.current === null) return;
    const dy = startYRef.current - e.clientY; // 向上为正
    if (ready && dy >= SWIPE_THRESHOLD) {
      // 完成一次冲击
      sfx.beat();
      sfx.success();
      const next = thrusts + 1;
      setThrusts(next);
      setFeedback('success');
      cancelCharge();
      setTimeout(() => setFeedback(null), 500);
      if (next >= TARGET_THRUSTS) {
        setTimeout(() => onComplete(), 600);
      }
    }
  };

  const handlePointerUp = () => {
    if (charging && !ready) {
      // 蓄力未完成就松手
      sfx.error();
      setFeedback('fail');
      onWrong();
      setTimeout(() => setFeedback(null), 600);
    }
    cancelCharge();
  };

  useEffect(() => {
    return () => {
      if (chargeTimerRef.current) window.clearInterval(chargeTimerRef.current);
    };
  }, []);

  const ringSize = 160;
  const stroke = 8;
  const r = (ringSize - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 计数 */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-extrabold text-ink">
          {thrusts} / {TARGET_THRUSTS}
        </span>
        <span className="text-xs text-ink/50">次冲击</span>
      </div>

      {/* 指引箭头 */}
      <div className="flex flex-col items-center text-warm">
        <ArrowUp
          className={`w-6 h-6 transition-all ${
            ready ? 'animate-bounce text-life' : 'opacity-50'
          }`}
          strokeWidth={3}
        />
        <div className="text-xs font-bold mt-1">
          {ready ? '向上推冲！' : charging ? '蓄力中...' : '长按蓄力'}
        </div>
      </div>

      {/* 按压按钮 + 蓄力环 */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative cursor-pointer touch-none select-none"
        style={{ width: ringSize, height: ringSize }}
      >
        {/* 蓄力进度环 */}
        <svg width={ringSize} height={ringSize} className="absolute inset-0 -rotate-90">
          <circle cx={ringSize / 2} cy={ringSize / 2} r={r}
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} />
          <circle cx={ringSize / 2} cy={ringSize / 2} r={r}
            fill="none"
            stroke={ready ? '#32CD32' : '#FFA500'}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - chargeProgress)}
            className="transition-all duration-75"
          />
        </svg>

        {/* 中央拳头按钮 */}
        <div
          className={`absolute inset-3 rounded-full
                      bg-gradient-to-b from-warm to-orange-600
                      shadow-game border-4 border-white
                      flex items-center justify-center
                      text-white font-extrabold transition-all
                      ${charging ? 'scale-95' : 'scale-100'}
                      ${ready ? 'ring-4 ring-life ring-offset-2 animate-pulse' : ''}`}
        >
          <div className="text-center">
            <div className="text-5xl">✊</div>
            <div className="text-xs mt-0.5">
              {ready ? '推冲!' : '长按'}
            </div>
          </div>
        </div>

        {/* 反馈 */}
        {feedback === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pop-in">
            <div className="bg-life text-white rounded-full px-3 py-1 font-extrabold shadow-game flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> +1
            </div>
          </div>
        )}
        {feedback === 'fail' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pop-in">
            <div className="bg-alert text-white rounded-full px-3 py-1 font-extrabold shadow-game">
              太快松手了
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-ink/60 text-center max-w-[240px]">
        长按按钮蓄力 → 蓄满后向上推 → 完成 5 次冲击<br />
        方向要 <b className="text-warm">向内上方</b>
      </div>
    </div>
  );
}

export default HeimlichGame;
