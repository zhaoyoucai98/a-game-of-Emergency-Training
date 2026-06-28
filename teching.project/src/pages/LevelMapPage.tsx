import { Link } from 'react-router-dom';
import { Lock, Star, Play, Trophy, Heart, Droplet, Flame } from 'lucide-react';
import { mvpLevels } from '@/data/levels';
import type { Chapter, Level } from '@/types/game';
import { usePlayerStore } from '@/stores/playerStore';
import { GameHeader } from '@/components/GameHeader';
import { Character, getSceneForLevel } from '@/components/Character';

/** 难度对应配色 */
const difficultyColor = {
  easy: { bg: 'from-life-light to-life', text: 'text-life', label: '简单' },
  medium: { bg: 'from-primary-light to-primary', text: 'text-primary', label: '中等' },
  hard: { bg: 'from-alert-light to-alert', text: 'text-alert', label: '困难' },
};

/** 篇章配置（顺序、标题、配色、icon） */
interface ChapterConfig {
  chapter: Chapter;
  index: number;
  title: string;
  subtitle: string;
  Icon: typeof Heart;
  bgGradient: string;     // banner 背景渐变
  badgeGradient: string;  // 徽章背景渐变
}

const chapterConfigs: ChapterConfig[] = [
  {
    chapter: 'life-basic',
    index: 1,
    title: '生命基础急救',
    subtitle: '心肺复苏 / AED / 海姆立克',
    Icon: Heart,
    bgGradient: 'from-life-light to-life',
    badgeGradient: 'from-life-light to-life',
  },
  {
    chapter: 'bleeding',
    index: 2,
    title: '出血止血急救',
    subtitle: '擦伤 / 鼻血 / 动脉大出血',
    Icon: Droplet,
    bgGradient: 'from-rose-300 to-alert',
    badgeGradient: 'from-rose-300 to-alert',
  },
  {
    chapter: 'burns',
    index: 3,
    title: '烧烫伤急救',
    subtitle: '冲脱泡盖送 五字口诀',
    Icon: Flame,
    bgGradient: 'from-orange-300 to-warm',
    badgeGradient: 'from-orange-300 to-warm',
  },
];

function LevelMapPage() {
  const completedLevels = usePlayerStore((state) => state.completedLevels);

  // 把关卡按篇章分组
  const groupedLevels = chapterConfigs
    .map((cfg) => ({
      ...cfg,
      levels: mvpLevels.filter((l) => l.chapter === cfg.chapter),
    }))
    .filter((g) => g.levels.length > 0);

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: "url('/image/scene-map.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1">
        <GameHeader showBack title="关卡地图" />

        {/* 总进度 */}
        <div className="text-center pt-4 pb-2 px-4">
          <h1 className="text-2xl font-extrabold text-ink">急救闯关之旅</h1>
          <p className="text-sm text-ink/60 mt-1">
            已通关 {completedLevels.length} / {mvpLevels.length} 关
          </p>
          <div className="mt-2 flex justify-center">
            <Character
              pose={completedLevels.length === mvpLevels.length ? 'trophy' : 'run'}
              size="md"
            />
          </div>
        </div>

        {/* 分篇章关卡列表 */}
        <main className="flex-1 max-w-md mx-auto w-full px-6 pb-12 relative">
          {/* 装饰云朵 */}
          <div className="absolute top-10 left-2 text-4xl opacity-40 animate-float">☁️</div>
          <div className="absolute top-40 right-2 text-3xl opacity-40 animate-float"
               style={{ animationDelay: '1s' }}>☁️</div>
          <div className="absolute bottom-40 left-4 text-3xl opacity-40 animate-float"
               style={{ animationDelay: '2s' }}>☁️</div>

          <div className="relative z-10 flex flex-col gap-4">
            {groupedLevels.map((group, gIdx) => (
              <ChapterSection
                key={group.chapter}
                config={group}
                levels={group.levels}
                completedLevels={completedLevels}
                allLevels={mvpLevels}
                isLast={gIdx === groupedLevels.length - 1}
              />
            ))}

            {/* 终点旗帜 */}
            <div className="self-center mt-4 text-center animate-bounce-slow">
              <div className="text-5xl">🏁</div>
              <div className="text-xs font-bold text-ink/60 mt-1">
                更多篇章敬请期待
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/** 单个篇章区块 */
function ChapterSection({
  config,
  levels,
  completedLevels,
  allLevels,
  isLast,
}: {
  config: ChapterConfig;
  levels: Level[];
  completedLevels: string[];
  allLevels: Level[];
  isLast: boolean;
}) {
  const { Icon, title, subtitle, bgGradient, index } = config;
  const completedInChapter = levels.filter((l) =>
    completedLevels.includes(l.id)
  ).length;
  const allDone = completedInChapter === levels.length;

  return (
    <div className="relative">
      {/* 篇章 banner */}
      <div
        className={`relative rounded-3xl bg-gradient-to-r ${bgGradient}
                    text-white shadow-game px-4 py-3 mb-3
                    flex items-center gap-3 border-4 border-white`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur
                        flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white drop-shadow" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold opacity-80">第 {index} 篇章</div>
          <div className="text-base font-extrabold truncate">{title}</div>
          <div className="text-xs opacity-90 truncate">{subtitle}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-extrabold leading-none">
            {completedInChapter}/{levels.length}
          </div>
          {allDone && (
            <div className="text-[10px] mt-1 px-1.5 py-0.5 rounded-full
                            bg-white/30 backdrop-blur font-bold">
              ⭐ 通关
            </div>
          )}
        </div>
      </div>

      {/* 篇章下的关卡列表 */}
      <div className="flex flex-col gap-3">
        {levels.map((level, index) => {
          const isCompleted = completedLevels.includes(level.id);
          // 解锁条件：自己已通关 / 或全局上一关已通关（保持原有顺序解锁）
          const globalIdx = allLevels.findIndex((l) => l.id === level.id);
          const isLocked =
            globalIdx > 0 &&
            !completedLevels.includes(allLevels[globalIdx - 1].id) &&
            !isCompleted;
          const isCurrent = !isCompleted && !isLocked;
          const offsetClass =
            index % 2 === 0 ? 'self-start ml-2' : 'self-end mr-2';

          return (
            <div key={level.id} className="contents">
              <LevelNode
                level={level}
                index={globalIdx}
                isCompleted={isCompleted}
                isLocked={isLocked}
                isCurrent={isCurrent}
                className={offsetClass}
              />
              {index < levels.length - 1 && (
                <div className="self-center my-1">
                  <PathDots completed={isCompleted} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 篇章之间的分隔（除最后一个） */}
      {!isLast && (
        <div className="flex items-center justify-center my-4 gap-2">
          <div className="h-0.5 flex-1 bg-ink/10 rounded-full" />
          <div className="text-xs text-ink/40 font-bold">下一篇章</div>
          <div className="h-0.5 flex-1 bg-ink/10 rounded-full" />
        </div>
      )}
    </div>
  );
}

/** 单个关卡节点 */
function LevelNode({
  level,
  index,
  isCompleted,
  isLocked,
  isCurrent,
  className = '',
}: {
  level: Level;
  index: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  className?: string;
}) {
  const diff = difficultyColor[level.difficulty];

  // —— 锁定态 ——
  if (isLocked) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-20 h-20 rounded-full bg-gray-300 shadow-game-sm
                        flex items-center justify-center">
          <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <div className="bg-white/80 rounded-2xl px-3 py-2 shadow-pill">
          <div className="text-sm font-bold text-ink/60">{level.title}</div>
          <div className="text-xs text-ink/40">未解锁</div>
        </div>
      </div>
    );
  }

  // —— 已通关 / 当前可玩 ——
  return (
    <Link
      to={`/game/${level.id}`}
      className={`group flex items-center gap-3 ${className}
                  active:translate-y-0.5 transition-all`}
    >
      {/* 圆形大节点 */}
      <div className="relative">
        {isCurrent && (
          <div className="absolute inset-0 rounded-full border-4 border-alert/60 animate-pulse-ring" />
        )}

        <div
          className={`w-20 h-20 rounded-full bg-gradient-to-b ${diff.bg}
                      shadow-game flex items-center justify-center
                      border-4 border-white
                      group-hover:scale-110 transition-transform`}
        >
          {isCompleted ? (
            <Trophy className="w-9 h-9 text-white drop-shadow" strokeWidth={2.5} />
          ) : (
            <Play className="w-9 h-9 text-white fill-white drop-shadow" strokeWidth={2.5} />
          )}
        </div>

        {/* 关卡编号徽章 */}
        <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-white
                        shadow border-2 border-current text-xs font-extrabold
                        flex items-center justify-center text-ink">
          {index + 1}
        </div>

        {/* 通关星级（最多3星） */}
        {isCompleted && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5
                          bg-white rounded-full px-1.5 py-0.5 shadow-pill">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className="w-3 h-3 text-gold fill-gold"
              />
            ))}
          </div>
        )}
      </div>

      {/* 标签卡 */}
      <div className="bg-white rounded-2xl px-3 py-2 shadow-pill
                      group-hover:shadow-game-sm transition-shadow
                      flex items-center gap-2">
        <img
          src={getSceneForLevel(level.id)}
          alt={`${level.title}-场景`}
          className="w-12 h-12 rounded-xl object-cover shadow-inner
                     border border-white/60 select-none pointer-events-none"
          draggable={false}
          onError={(e) => {
            // 兜底：图片加载失败显示渐变占位
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div>
          <div className={`text-sm font-extrabold ${diff.text}`}>
            {level.title}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full
                              bg-gradient-to-r ${diff.bg} text-white font-bold`}>
              {diff.label}
            </span>
            <span className="text-[10px] text-ink/50">
              {level.steps.length} 步
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** 关卡之间的连接点 */
function PathDots({ completed }: { completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            completed ? 'bg-life' : 'bg-ink/15'
          }`}
        />
      ))}
    </div>
  );
}

export default LevelMapPage;
