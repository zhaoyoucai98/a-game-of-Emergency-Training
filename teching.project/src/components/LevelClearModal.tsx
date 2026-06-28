import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Coins, Sparkles } from 'lucide-react';
import { Mascot } from './Mascot';
import { ConfettiBurst } from './ConfettiBurst';
import { UiBtn } from './Character';
import { sfx } from '@/utils/sfx';

interface LevelClearModalProps {
  open: boolean;
  /** 关卡获得的总分 */
  score: number;
  /** 失误次数 */
  mistakes: number;
  /** 步骤总数（用于计算星级） */
  totalSteps: number;
  /** 获得的金币 */
  coinReward?: number;
  /** 获得的经验 */
  expReward?: number;
  /** 下一关链接（没有就显示"返回地图"） */
  nextLevelPath?: string;
  /** 重玩回调 */
  onRetry: () => void;
}

/**
 * 通关结算弹窗
 * - 三星根据失误次数评定
 * - 小泉欢呼动画
 * - 星星依次弹出
 */
export function LevelClearModal({
  open,
  score,
  mistakes,
  totalSteps,
  coinReward = 50,
  expReward = 50,
  nextLevelPath,
  onRetry,
}: LevelClearModalProps) {
  const [starsShown, setStarsShown] = useState(0);

  // 星级算法：0 失误=3星，1=2星，2+=1星
  const stars = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;

  useEffect(() => {
    if (!open) {
      setStarsShown(0);
      return;
    }
    sfx.complete();

    // 依次弹出星星
    const timers: number[] = [];
    for (let i = 1; i <= stars; i++) {
      timers.push(
        window.setTimeout(() => {
          setStarsShown(i);
          sfx.star();
        }, 500 + i * 400)
      );
    }
    // 最后金币音
    timers.push(
      window.setTimeout(() => sfx.coin(), 500 + stars * 400 + 200)
    );

    return () => timers.forEach(clearTimeout);
  }, [open, stars]);

  if (!open) return null;

  const isPerfect = stars === 3;
  // 通关表情：完美→cheer庆祝，一般→happy开心
  const mood = isPerfect ? 'cheer' : 'happy';
  // 通关粒子：完美撒星星，一般撒纸片
  const confettiType = isPerfect ? 'star' : 'paper';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center
                    bg-black/40 backdrop-blur-sm p-6 animate-pop-in">
      {/* 通关粒子特效 */}
      <ConfettiBurst active={open} type={confettiType} count={isPerfect ? 60 : 35} />

      {/* 弹窗主体 */}
      <div className="relative w-full max-w-sm bg-gradient-to-b from-white to-sky-50
                      rounded-[2rem] p-6 pt-20 shadow-game text-center
                      border-4 border-white">

        {/* 顶部小泉头顶弹出（表情根据通关情况切换） */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2">
          <Mascot character="xiaoquan" mood={mood} size="medium" className="drop-shadow-2xl" />
        </div>

        {/* 装饰星光 */}
        <Sparkles className="absolute top-4 left-4 w-6 h-6 text-gold animate-pulse" />
        <Sparkles className="absolute top-8 right-6 w-5 h-5 text-gold animate-pulse"
                  style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute bottom-20 left-6 w-4 h-4 text-warm animate-pulse"
                  style={{ animationDelay: '1s' }} />

        {/* 标题 */}
        <h2 className="text-3xl font-extrabold mb-1
                       bg-gradient-to-r from-primary to-alert
                       bg-clip-text text-transparent">
          {isPerfect ? '完美通关！' : '关卡完成！'}
        </h2>
        <p className="text-sm text-ink/60 mb-4">
          {isPerfect ? '小泉为你点赞 👍' : '继续挑战，争取满星！'}
        </p>

        {/* 三星 */}
        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`transition-all duration-300 ${
                starsShown >= i
                  ? 'scale-100 opacity-100 rotate-0'
                  : 'scale-50 opacity-30 -rotate-45'
              }`}
            >
              <Star
                className={`w-14 h-14 ${
                  starsShown >= i
                    ? 'text-gold fill-gold drop-shadow-lg'
                    : 'text-ink/20 fill-ink/10'
                }`}
                strokeWidth={2}
              />
            </div>
          ))}
        </div>

        {/* 数据卡 */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <StatPill label="得分" value={score} color="text-primary" />
          <StatPill label="失误" value={mistakes} color="text-alert" />
          <StatPill label="步骤" value={totalSteps} color="text-life" />
        </div>

        {/* 奖励 */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="hud-pill bg-gold-light">
            <Coins className="w-4 h-4 text-warm" />
            <span>+{coinReward}</span>
          </div>
          <div className="hud-pill bg-primary/10 text-primary">
            <Star className="w-4 h-4 fill-primary" />
            <span>+{expReward} EXP</span>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              sfx.click();
              onRetry();
            }}
            className="flex-1 py-3 rounded-2xl bg-white border-2 border-ink/10
                       font-bold text-ink/70 shadow-game-sm
                       active:translate-y-0.5 transition-all
                       flex items-center justify-center gap-1.5"
          >
            <UiBtn kind="retry" size="xs" className="w-6 h-6" />
            重玩
          </button>
          <Link
            to={nextLevelPath || '/levels'}
            onClick={() => sfx.click()}
            className="flex-[1.5] py-3 rounded-2xl
                       bg-gradient-to-b from-life-light to-life
                       text-white font-extrabold shadow-game
                       active:translate-y-0.5 transition-all
                       flex items-center justify-center gap-1.5"
          >
            {nextLevelPath ? '下一关' : '返回地图'}
            <UiBtn kind="next" size="xs" className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl py-2 shadow-pill">
      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] text-ink/50 font-bold">{label}</div>
    </div>
  );
}

export default LevelClearModal;
