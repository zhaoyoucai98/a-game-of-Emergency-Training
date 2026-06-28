import { Link, useNavigate } from 'react-router-dom';
import { Star, Coins, Settings, ArrowLeft } from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { XiaoQuan } from './XiaoQuan';

interface GameHeaderProps {
  /** 显示返回按钮（替代头像） */
  showBack?: boolean;
  /** 自定义标题（中间显示） */
  title?: string;
}

/**
 * 通用顶部状态栏
 * 用法：
 *   <GameHeader />                  // 首页样式（头像 + 等级 + 经验 + 金币）
 *   <GameHeader showBack title="关卡地图" />  // 子页面样式（返回 + 标题 + 金币）
 */
export function GameHeader({ showBack = false, title }: GameHeaderProps) {
  const navigate = useNavigate();
  const { level, exp, totalScore } = usePlayerStore();
  const expIntoLevel = exp % 100;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* 左侧 */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white shadow-pill
                         flex items-center justify-center
                         active:translate-y-0.5 transition-all"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5 text-ink" strokeWidth={2.5} />
            </button>
          ) : (
            <Link to="/" className="relative block">
              <XiaoQuan size="small" />
              <div className="absolute -bottom-1 -right-1 min-w-[22px] h-[22px] px-1
                              rounded-full bg-gold text-ink text-xs font-extrabold
                              flex items-center justify-center border-2 border-white shadow">
                {level}
              </div>
            </Link>
          )}

          {/* 子页面标题 */}
          {title && (
            <h2 className="text-lg font-extrabold text-ink ml-1">{title}</h2>
          )}

          {/* 首页样式：经验条 */}
          {!showBack && !title && (
            <div className="hidden sm:flex flex-col gap-0.5 ml-1">
              <div className="flex items-center gap-1 text-xs font-bold text-ink/70">
                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                <span>{expIntoLevel}/100</span>
              </div>
              <div className="w-24 h-2 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-gold to-warm rounded-full transition-all"
                  style={{ width: `${expIntoLevel}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 右侧：金币 + 设置 */}
        <div className="flex items-center gap-2">
          <div className="hud-pill bg-gold-light text-ink">
            <Coins className="w-4 h-4 text-warm" />
            <span>{totalScore}</span>
          </div>
          <button
            className="w-9 h-9 rounded-full bg-white shadow-pill flex items-center justify-center
                       hover:rotate-90 transition-transform"
            aria-label="设置"
          >
            <Settings className="w-4 h-4 text-ink/70" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default GameHeader;
