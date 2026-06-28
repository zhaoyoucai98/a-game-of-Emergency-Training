import { Lock, Sparkles, Award, TrendingUp } from 'lucide-react';
import { achievements } from '@/data/achievements';
import { mvpLevels } from '@/data/levels';
import { usePlayerStore } from '@/stores/playerStore';
import { GameHeader } from '@/components/GameHeader';
import { XiaoQuan } from '@/components/XiaoQuan';
import { Badge } from '@/components/Character';

/** 徽章稀有度对应配色 */
const rarityStyles: Record<number, { bg: string; ring: string; label: string }> = {
  0: { bg: 'from-gray-300 to-gray-500', ring: 'ring-gray-300', label: '普通' },
  1: { bg: 'from-sky-300 to-primary', ring: 'ring-primary/40', label: '稀有' },
  2: { bg: 'from-purple-300 to-purple-600', ring: 'ring-purple-400/40', label: '史诗' },
  3: { bg: 'from-yellow-300 to-warm', ring: 'ring-gold/60', label: '传说' },
};

/** 给徽章分配稀有度（依据 id） */
const rarityMap: Record<string, number> = {
  'first-rescue': 0,
  'cpr-master': 2,
  'heimlich-expert': 1,
  'aed-pro': 1,
  'quiz-champion': 2,
  'no-mistake': 1,
  'speed-rescue': 1,
  'life-guardian': 3,
};

function AchievementPage() {
  const { level, exp, totalScore, completedLevels, achievements: unlockedIds } =
    usePlayerStore();

  const unlockedCount = unlockedIds.length;
  const totalCount = achievements.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);
  const completedPercent = Math.round((completedLevels.length / mvpLevels.length) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader showBack title="我的成就" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {/* ===== 顶部玩家荣耀卡 ===== */}
        <section className="relative bg-gradient-to-br from-primary via-primary-dark to-purple-700
                            rounded-3xl p-5 pl-32 mb-6 shadow-game text-white overflow-hidden">
          {/* 装饰光斑 */}
          <Sparkles className="absolute top-3 right-4 w-5 h-5 text-gold animate-pulse" />
          <Sparkles className="absolute bottom-4 right-20 w-4 h-4 text-white/60 animate-pulse"
                    style={{ animationDelay: '0.5s' }} />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full
                          bg-white/10 blur-2xl pointer-events-none" />

          {/* 小泉 */}
          <div className="absolute left-2 bottom-0">
            <XiaoQuan size="medium" className="drop-shadow-2xl" />
          </div>

          <div className="relative">
            <div className="text-xs font-bold opacity-80 mb-1">急救小先锋</div>
            <div className="text-2xl font-extrabold mb-2">Lv.{level}</div>

            {/* 经验进度 */}
            <div className="text-[10px] opacity-80 mb-1">
              经验 {exp % 100} / 100
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-gold to-warm rounded-full"
                style={{ width: `${exp % 100}%` }}
              />
            </div>

            <div className="flex gap-2">
              <MiniStat label="积分" value={totalScore} />
              <MiniStat label="通关" value={`${completedLevels.length}/${mvpLevels.length}`} />
              <MiniStat label="徽章" value={`${unlockedCount}/${totalCount}`} />
            </div>
          </div>
        </section>

        {/* ===== 进度统计 ===== */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          <ProgressCard
            icon={<Award className="w-5 h-5 text-gold" strokeWidth={2.5} />}
            label="徽章收集"
            value={`${unlockedCount} / ${totalCount}`}
            percent={progress}
            color="from-gold to-warm"
          />
          <ProgressCard
            icon={<TrendingUp className="w-5 h-5 text-life" strokeWidth={2.5} />}
            label="关卡通关"
            value={`${completedLevels.length} / ${mvpLevels.length}`}
            percent={completedPercent}
            color="from-life-light to-life"
          />
        </section>

        {/* ===== 徽章墙 ===== */}
        <h2 className="text-lg font-extrabold text-ink mb-3 flex items-center gap-2">
          <span className="inline-block w-1 h-5 bg-primary rounded-full" />
          徽章收藏
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {achievements.map((a) => {
            const isUnlocked = unlockedIds.includes(a.id);
            const rarity = rarityMap[a.id] ?? 0;
            const style = rarityStyles[rarity];

            return (
              <div
                key={a.id}
                className={`relative bg-white rounded-2xl p-3 text-center shadow-pill
                            transition-all hover:-translate-y-1 hover:shadow-game-sm
                            ${isUnlocked ? '' : 'opacity-70'}`}
              >
                {/* 徽章主体 */}
                <div className="relative mx-auto w-16 h-16 mb-2">
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br
                                ${isUnlocked ? style.bg : 'from-gray-200 to-gray-300'}
                                ${isUnlocked ? `ring-4 ${style.ring}` : ''}
                                flex items-center justify-center
                                shadow-game-sm`}
                  >
                    {isUnlocked ? (
                      <Badge achievementId={a.id} size="xs" className="w-14 h-14" />
                    ) : (
                      <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
                    )}
                  </div>

                  {/* 已解锁：右上角小星星 */}
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full
                                    flex items-center justify-center shadow border-2 border-white">
                      <Sparkles className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className={`text-xs font-extrabold mb-0.5
                                ${isUnlocked ? 'text-ink' : 'text-ink/40'}`}>
                  {a.title}
                </div>
                <div className="text-[10px] text-ink/50 leading-tight">
                  {a.description}
                </div>

                {/* 稀有度标签 */}
                {isUnlocked && (
                  <div className={`inline-block mt-1.5 px-1.5 py-0.5 rounded-full
                                  text-[9px] font-bold text-white
                                  bg-gradient-to-r ${style.bg}`}>
                    {style.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ===== 鼓励语 ===== */}
        <div className="mt-6 text-center text-sm text-ink/50 font-medium">
          {unlockedCount === 0
            ? '🌱 完成第一关即可解锁徽章'
            : unlockedCount === totalCount
            ? '👑 你已集齐全部徽章！'
            : `继续努力，还差 ${totalCount - unlockedCount} 枚徽章！`}
        </div>
      </main>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-xl px-2.5 py-1 text-center min-w-[60px]">
      <div className="text-sm font-extrabold">{value}</div>
      <div className="text-[9px] opacity-80">{label}</div>
    </div>
  );
}

function ProgressCard({
  icon,
  label,
  value,
  percent,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-pill">
      <div className="flex items-center gap-1.5 text-xs font-bold text-ink/60 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-lg font-extrabold text-ink mb-1.5">{value}</div>
      <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default AchievementPage;
