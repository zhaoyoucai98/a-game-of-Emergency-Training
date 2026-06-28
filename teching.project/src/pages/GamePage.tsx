import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Lightbulb,
  Heart,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { getLevelById } from '@/data/levels';
import { getStoryByLevelId } from '@/data/stories';
import { getOrBuildScenes, type TaskPoint } from '@/data/scenes';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { GameHeader } from '@/components/GameHeader';
import { LevelClearModal } from '@/components/LevelClearModal';
import { StoryDialog } from '@/components/StoryDialog';
import { AedPadGame } from '@/components/AedPadGame';
import { HeimlichGame } from '@/components/HeimlichGame';
import {
  WashWoundGame,
  DisinfectGame,
  CoverWoundGame,
} from '@/components/WoundCareGames';
import {
  PressHoldGame,
  PinchNoseGame,
  RaiseLimbGame,
  TourniquetGame,
  CutClothGame,
} from '@/components/BleedBurnGames';
import { SceneStage } from '@/components/SceneStage';
import { Character, getNpcForLevel } from '@/components/Character';
import { sfx } from '@/utils/sfx';

function GamePage() {
  const { levelId } = useParams<{ levelId: string }>();
  const level = levelId ? getLevelById(levelId) : null;
  const story = levelId ? getStoryByLevelId(levelId) : undefined;
  const levelScenes = useMemo(
    () => (levelId ? getOrBuildScenes(levelId) : { levelId: '', scenes: [] }),
    [levelId]
  );

  const {
    score,
    mistakes,
    startLevel,
    addScore,
    recordMistake,
    useHint,
  } = useGameStore();
  const { completeLevel, addExp } = usePlayerStore();

  // ============ 场景串联 ============
  const [sceneIndex, setSceneIndex] = useState(0);
  const currentScene = levelScenes.scenes[sceneIndex];

  // 已完成的 stepId 集合（跨场景累积）
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);

  // 当前激活的任务（弹窗）
  const [activeTask, setActiveTask] = useState<TaskPoint | null>(null);

  // 反馈 / 提示 / 结算
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [showStory, setShowStory] = useState(!!story);

  // 场景切换过场动画
  const [transitioning, setTransitioning] = useState(false);

  // CPR 节拍音
  const [pulseKey, setPulseKey] = useState(0);
  const beatTimerRef = useRef<number | null>(null);

  // ============ 初始化 ============
  useEffect(() => {
    if (levelId) startLevel(levelId);
    setSceneIndex(0);
    setCompletedStepIds([]);
    setActiveTask(null);
    setClearModalOpen(false);
    setFeedback(null);
    setShowHint(false);
    setShowStory(!!story);
  }, [levelId, startLevel, story]);

  // 当前任务对应的 step 详情
  const activeStep = useMemo(() => {
    if (!activeTask || !level) return null;
    return level.steps.find((s) => s.id === activeTask.stepId) ?? null;
  }, [activeTask, level]);

  // CPR 节拍（活动任务为 cpr 类型时）
  useEffect(() => {
    if (activeTask?.kind !== 'cpr') return;
    beatTimerRef.current = window.setInterval(() => {
      sfx.tick();
      setPulseKey((k) => k + 1);
    }, 600);
    return () => {
      if (beatTimerRef.current) window.clearInterval(beatTimerRef.current);
    };
  }, [activeTask]);

  if (!level || !currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h1 className="text-xl font-extrabold text-ink mb-4">关卡未找到</h1>
          <Link
            to="/levels"
            className="inline-block px-4 py-2 rounded-2xl bg-primary text-white font-bold shadow-game-sm"
          >
            返回关卡地图
          </Link>
        </div>
      </div>
    );
  }

  // ============ 互动 ============
  const handleTaskActivate = (point: TaskPoint) => {
    sfx.click();
    setActiveTask(point);
    setShowHint(false);
    setFeedback(null);
  };

  const closeTask = () => {
    setActiveTask(null);
    setShowHint(false);
  };

  const handleCorrect = () => {
    if (!activeTask) return;
    const stepId = activeTask.stepId;

    sfx.success();
    if (activeStep) {
      setFeedback({ ok: true, msg: activeStep.correctFeedback });
    }
    addScore(100);

    setTimeout(() => {
      setFeedback(null);
      setCompletedStepIds((prev) =>
        prev.includes(stepId) ? prev : [...prev, stepId]
      );
      setActiveTask(null);
    }, 1000);
  };

  const handleWrong = () => {
    sfx.error();
    if (activeStep) {
      setFeedback({ ok: false, msg: activeStep.wrongFeedback });
    }
    recordMistake();
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleHint = () => {
    sfx.click();
    setShowHint(true);
    useHint();
  };

  // ============ 场景出口 / 切换 ============
  const handleSceneExit = () => {
    sfx.click();
    const isLastScene = sceneIndex >= levelScenes.scenes.length - 1;

    if (isLastScene) {
      // 通关
      completeLevel(level.id, score);
      addExp(50);
      setClearModalOpen(true);
      sfx.complete();
    } else {
      // 切换到下一场景
      setTransitioning(true);
      setTimeout(() => {
        setSceneIndex((i) => i + 1);
        setTransitioning(false);
      }, 700);
    }
  };

  const handleRetry = () => {
    startLevel(level.id);
    setSceneIndex(0);
    setCompletedStepIds([]);
    setClearModalOpen(false);
  };

  // 总进度（所有场景累积）
  const totalTasks = levelScenes.scenes.reduce(
    (sum, s) => sum + s.taskPoints.length,
    0
  );
  const progressPercent =
    totalTasks === 0 ? 0 : (completedStepIds.length / totalTasks) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <GameHeader showBack title={level.title} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-3 py-3 flex flex-col">
        {/* HUD 行 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-extrabold text-ink/70 whitespace-nowrap">
            场景 {sceneIndex + 1}/{levelScenes.scenes.length}
          </span>
          <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary to-life rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="hud-pill bg-primary/10 text-primary">
            <Zap className="w-3.5 h-3.5" />
            <span>{score}</span>
          </div>
          <div className="hud-pill bg-alert/10 text-alert">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{mistakes}</span>
          </div>
        </div>

        {/* ========= 横版场景舞台 ========= */}
        <div
          className={`relative transition-all duration-500
                      ${transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        >
          <SceneStage
            scene={currentScene}
            completedStepIds={completedStepIds}
            onTaskActivate={handleTaskActivate}
            onExit={handleSceneExit}
            paused={!!activeTask || showStory || clearModalOpen}
          />
        </div>

        {/* 场景剧情/说明小卡 */}
        <div className="mt-3 bg-white rounded-2xl shadow-game-sm p-3 text-sm text-ink/80
                        flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span>
            走到任务点 <b className="text-warm">（橙色圆球）</b> 按
            <b className="text-primary"> E </b>
            或<b className="text-primary">互动按钮</b>开始小游戏。完成本场景所有任务后走到右侧门口进入下一关。
          </span>
        </div>
      </main>

      {/* ========= 任务弹窗（玩法面板） ========= */}
      {activeTask && activeStep && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm
                     flex items-end sm:items-center justify-center p-3 animate-pop-in"
        >
          <div className="bg-white rounded-3xl shadow-game w-full max-w-md
                          max-h-[90vh] overflow-y-auto p-5 relative">
            {/* 关闭按钮 */}
            <button
              onClick={closeTask}
              className="absolute top-3 right-3 w-9 h-9 rounded-full
                         bg-ink/10 hover:bg-ink/20 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-ink/70" />
            </button>

            {/* 任务标题 */}
            <div className="flex items-start gap-3 mb-4 pr-9">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-warm to-alert
                              text-white text-2xl
                              flex items-center justify-center flex-shrink-0 shadow-game-sm">
                {activeTask.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-extrabold text-ink mb-0.5">
                  {activeStep.title}
                </h2>
                <p className="text-sm text-ink/70 leading-relaxed">
                  {activeStep.description}
                </p>
              </div>
            </div>

            {/* === 玩法区域 === */}
            <div className="bg-gray-50 rounded-2xl p-4 min-h-[260px]
                            flex items-center justify-center relative overflow-hidden">
              {activeTask.kind === 'aed-pad' ? (
                <AedPadGame onComplete={handleCorrect} onWrong={handleWrong} />
              ) : activeTask.kind === 'heimlich' ? (
                <HeimlichGame onComplete={handleCorrect} onWrong={handleWrong} />
              ) : activeTask.kind === 'wash-wound' ? (
                <WashWoundGame onComplete={handleCorrect} onWrong={handleWrong} />
              ) : activeTask.kind === 'disinfect' ? (
                <DisinfectGame onComplete={handleCorrect} onWrong={handleWrong} />
              ) : activeTask.kind === 'cover-wound' ? (
                <CoverWoundGame onComplete={handleCorrect} onWrong={handleWrong} />
              ) : activeTask.kind === 'press-hold' ? (
                <PressHoldGame
                  onComplete={handleCorrect}
                  onWrong={handleWrong}
                  title={activeStep?.title ?? '持续加压'}
                  hint={
                    activeStep?.description ??
                    '持续按压伤口，中途松开会重新出血'
                  }
                />
              ) : activeTask.kind === 'pinch-nose' ? (
                <PinchNoseGame
                  onComplete={handleCorrect}
                  onWrong={handleWrong}
                />
              ) : activeTask.kind === 'raise-limb' ? (
                <RaiseLimbGame
                  onComplete={handleCorrect}
                  onWrong={handleWrong}
                />
              ) : activeTask.kind === 'tourniquet' ? (
                <TourniquetGame
                  onComplete={handleCorrect}
                  onWrong={handleWrong}
                />
              ) : activeTask.kind === 'cut-cloth' ? (
                <CutClothGame
                  onComplete={handleCorrect}
                  onWrong={handleWrong}
                />
              ) : activeTask.kind === 'cpr' ? (
                <CprPressZone
                  pulseKey={pulseKey}
                  onPress={handleCorrect}
                  onWrong={handleWrong}
                />
              ) : (
                // 通用：正确/错误按钮（含 click/observe/breath/sequence）
                <div className="text-center">
                  <div className="flex items-end justify-center gap-2 mb-2">
                    <Character pose="think" size="md" floating />
                    {level && (
                      <img
                        src={getNpcForLevel(level.id)}
                        alt="伤员"
                        className="w-24 h-24 object-contain chroma-key select-none pointer-events-none"
                        draggable={false}
                      />
                    )}
                  </div>
                  <div className="text-sm text-ink/50 mb-4">选择你的操作</div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleCorrect}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-b from-life-light to-life
                                 text-white font-extrabold shadow-game
                                 active:translate-y-1 transition-all
                                 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      正确操作
                    </button>
                    <button
                      onClick={handleWrong}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-b from-alert-light to-alert
                                 text-white font-extrabold shadow-game
                                 active:translate-y-1 transition-all
                                 flex items-center gap-1.5"
                    >
                      <XCircle className="w-5 h-5" />
                      错误操作
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 提示 */}
            {activeStep.hint && (
              <div className="mt-3">
                {!showHint ? (
                  <button
                    onClick={handleHint}
                    className="w-full py-2 rounded-2xl bg-warm/15 text-warm font-bold
                               border-2 border-warm/30 border-dashed
                               hover:bg-warm/20 transition-all
                               flex items-center justify-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    查看提示
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-gold-light border-l-4 border-warm
                                  flex items-start gap-2 animate-pop-in">
                    <Lightbulb className="w-5 h-5 text-warm flex-shrink-0" />
                    <span className="text-sm text-ink/80">{activeStep.hint}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 浮动反馈 */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                        pointer-events-none p-6">
          <div
            className={`bg-white rounded-3xl px-6 py-5 shadow-game border-4
                        animate-pop-in flex items-center gap-3 max-w-sm
                        ${feedback.ok ? 'border-life' : 'border-alert'}`}
          >
            <Character
              pose={feedback.ok ? 'cheer' : 'sad'}
              size="sm"
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <div className={`font-extrabold mb-0.5
                               ${feedback.ok ? 'text-life' : 'text-alert'}`}>
                {feedback.ok ? '操作正确！' : '操作错误'}
              </div>
              <div className="text-sm text-ink/70">{feedback.msg}</div>
            </div>
          </div>
        </div>
      )}

      {/* 场景切换过场遮罩 */}
      {transitioning && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm
                        flex items-center justify-center animate-pop-in">
          <div className="text-center text-white">
            <div className="text-6xl mb-3 animate-bounce-slow">🚶‍♂️💨</div>
            <div className="text-xl font-extrabold">前往下一场景...</div>
          </div>
        </div>
      )}

      {/* 关卡剧情对话 */}
      {showStory && story && (
        <StoryDialog
          lines={story}
          onComplete={() => setShowStory(false)}
        />
      )}

      {/* 通关结算 */}
      <LevelClearModal
        open={clearModalOpen}
        score={score}
        mistakes={mistakes}
        totalSteps={totalTasks}
        coinReward={50 + (mistakes === 0 ? 50 : 0)}
        expReward={50}
        onRetry={handleRetry}
      />
    </div>
  );
}

/** CPR 节拍按压区域 */
function CprPressZone({
  pulseKey,
  onPress,
  onWrong,
}: {
  pulseKey: number;
  onPress: () => void;
  onWrong: () => void;
}) {
  const [presses, setPresses] = useState(0);
  const [bumping, setBumping] = useState(false);
  const TARGET = 30;

  const handleTap = () => {
    sfx.beat();
    setBumping(true);
    setTimeout(() => setBumping(false), 100);

    setPresses((p) => {
      const next = p + 1;
      if (next >= TARGET) {
        setTimeout(() => onPress(), 200);
        return 0;
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-alert fill-alert animate-pulse" />
        <span className="text-xl font-extrabold text-ink">
          {presses} / {TARGET}
        </span>
        <span className="text-xs text-ink/50">按压次数</span>
      </div>

      <div className="relative">
        <div
          key={pulseKey}
          className="absolute inset-0 rounded-full border-4 border-alert/40
                     animate-pulse-ring pointer-events-none"
        />
        <button
          onClick={handleTap}
          className={`relative w-36 h-36 rounded-full
                      bg-gradient-to-b from-alert-light to-alert
                      shadow-game border-4 border-white
                      flex flex-col items-center justify-center
                      text-white font-extrabold
                      active:translate-y-2 transition-transform
                      ${bumping ? 'scale-95' : 'scale-100'}`}
        >
          <Heart className="w-12 h-12 fill-white animate-pulse" />
          <span className="text-sm mt-1">按压</span>
        </button>
      </div>

      <div className="text-xs text-ink/60 mt-3 text-center max-w-[240px]">
        跟随节拍按压（约 100 次/分钟）<br />
        《Stayin' Alive》就是这个节奏 🎵
      </div>

      <button
        onClick={onWrong}
        className="mt-3 text-xs text-ink/40 hover:text-alert underline"
      >
        模拟错误操作
      </button>
    </div>
  );
}

export default GamePage;
