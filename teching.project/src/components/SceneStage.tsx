/**
 * 横版闯关场景舞台
 * 职责：
 *  1. 渲染背景 + 漂浮装饰 + 地面
 *  2. 渲染任务点（已完成的灰显，未完成的脉冲）
 *  3. 渲染出口（全部任务完成后激活）
 *  4. 渲染主角 Player + 监听键盘 / 屏幕按钮控制走动
 *  5. 摄像机跟随：根据 player x 反向平移内容层
 *  6. 检测最近的任务点 / 出口，距离够近时显示"按 E 互动"提示
 *  7. 触发回调：onTaskActivate(stepId) / onExit()
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react';
import { Player } from './Player';
import type { Scene, TaskPoint } from '@/data/scenes';

interface SceneStageProps {
  scene: Scene;
  /** 已完成的 stepId 集合，用于灰显任务点 */
  completedStepIds: string[];
  /** 玩家走到任务点并按 E（或点击互动键）时触发 */
  onTaskActivate: (point: TaskPoint) => void;
  /** 全部任务完成 + 玩家走到出口时触发 */
  onExit: () => void;
  /** 是否暂停玩家输入（玩法弹窗打开时） */
  paused?: boolean;
}

const INTERACT_RADIUS = 80;     // 互动检测半径（px）
const PLAYER_SPEED = 6;          // 每帧移动 px
const VIEW_HEIGHT = 360;         // 舞台高度

export function SceneStage({
  scene,
  completedStepIds,
  onTaskActivate,
  onExit,
  paused = false,
}: SceneStageProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(800);

  // 玩家状态
  const [playerX, setPlayerX] = useState(80); // 场景内坐标
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);

  // 按键状态
  const keysRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const rafRef = useRef<number | null>(null);

  // 监听 viewport 宽度，用于摄像机居中
  useEffect(() => {
    const update = () => {
      if (viewportRef.current) {
        setViewportWidth(viewportRef.current.clientWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // 进入新场景时重置玩家位置
  useEffect(() => {
    setPlayerX(80);
    setFacing(1);
  }, [scene.id]);

  // 检测最近的任务点 / 出口（用 useMemo 避免每帧重算）
  const allTasksDone = useMemo(
    () =>
      scene.taskPoints.every((p) => completedStepIds.includes(p.stepId)),
    [scene.taskPoints, completedStepIds]
  );

  const nearestInteractable = useMemo(() => {
    let nearest: { type: 'task'; point: TaskPoint } | { type: 'exit' } | null = null;
    let minDist = INTERACT_RADIUS;

    for (const p of scene.taskPoints) {
      if (completedStepIds.includes(p.stepId)) continue;
      const px = (p.x / 100) * scene.width;
      const d = Math.abs(px - playerX);
      if (d < minDist) {
        minDist = d;
        nearest = { type: 'task', point: p };
      }
    }
    if (allTasksDone) {
      const ex = (scene.exitX / 100) * scene.width;
      const d = Math.abs(ex - playerX);
      if (d < minDist) {
        nearest = { type: 'exit' };
      }
    }
    return nearest;
  }, [playerX, scene, completedStepIds, allTasksDone]);

  // 触发互动
  const interact = useCallback(() => {
    if (paused || !nearestInteractable) return;
    if (nearestInteractable.type === 'task') {
      onTaskActivate(nearestInteractable.point);
    } else {
      onExit();
    }
  }, [paused, nearestInteractable, onTaskActivate, onExit]);

  // 键盘监听
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (paused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      } else if (
        e.key === 'e' ||
        e.key === 'E' ||
        e.key === 'Enter' ||
        e.key === ' '
      ) {
        e.preventDefault();
        interact();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [interact, paused]);

  // 暂停时清空按键
  useEffect(() => {
    if (paused) {
      keysRef.current.left = false;
      keysRef.current.right = false;
      setWalking(false);
    }
  }, [paused]);

  // 主循环
  useEffect(() => {
    const loop = () => {
      const { left, right } = keysRef.current;
      if (!paused && (left || right)) {
        setPlayerX((prev) => {
          let next = prev;
          if (left) next -= PLAYER_SPEED;
          if (right) next += PLAYER_SPEED;
          next = Math.max(40, Math.min(scene.width - 40, next));
          return next;
        });
        if (left && !right) setFacing(-1);
        if (right && !left) setFacing(1);
        setWalking(true);
      } else {
        setWalking(false);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scene.width, paused]);

  // 摄像机偏移：让玩家始终接近视口中心，且不超出场景边界
  const camera = useMemo(() => {
    const half = viewportWidth / 2;
    let offset = playerX - half;
    offset = Math.max(0, Math.min(scene.width - viewportWidth, offset));
    return offset;
  }, [playerX, viewportWidth, scene.width]);

  // 屏幕按钮：按住/松开
  const pressLeft = (down: boolean) => {
    keysRef.current.left = down;
  };
  const pressRight = (down: boolean) => {
    keysRef.current.right = down;
  };

  return (
    <div
      ref={viewportRef}
      className={`relative w-full overflow-hidden rounded-3xl shadow-game border-4 border-white
                  bg-gradient-to-b ${scene.bg.gradient}`}
      style={{ height: `${VIEW_HEIGHT}px` }}
    >
      {/* 场景标题（左上角） */}
      <div className="absolute top-3 left-3 z-30 bg-white/90 backdrop-blur
                      px-3 py-1.5 rounded-2xl shadow-game-sm
                      text-sm font-extrabold text-ink">
        {scene.title}
      </div>

      {/* 进度（右上角） */}
      <div className="absolute top-3 right-3 z-30 bg-white/90 backdrop-blur
                      px-3 py-1.5 rounded-2xl shadow-game-sm
                      text-xs font-bold text-ink">
        任务 {completedStepIds.filter(id => scene.taskPoints.some(t => t.stepId === id)).length}
        /{scene.taskPoints.length}
      </div>

      {/* 滚动内容层（摄像机平移） */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          width: `${scene.width}px`,
          transform: `translateX(${-camera}px)`,
          transition: 'transform 80ms linear',
        }}
      >
        {/* 漂浮装饰（视差更弱：放在远景） */}
        <div className="absolute inset-0 pointer-events-none">
          {scene.bg.decor.map((emoji, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-80 animate-float"
              style={{
                left: `${(i * 23 + 8) % 95}%`,
                top: `${15 + ((i * 17) % 35)}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* 地面 */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-16 ${scene.bg.ground}
                      border-t-4 border-white/60`}
        >
          {/* 地砖纹理 */}
          <div className="absolute inset-0 opacity-30"
               style={{
                 backgroundImage:
                   'repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 60px)',
               }} />
        </div>

        {/* 任务点 */}
        {scene.taskPoints.map((p) => {
          const done = completedStepIds.includes(p.stepId);
          const pxLeft = (p.x / 100) * scene.width;
          const isNear =
            nearestInteractable?.type === 'task' &&
            nearestInteractable.point.stepId === p.stepId;
          return (
            <div
              key={p.stepId}
              className="absolute bottom-16"
              style={{
                left: `${pxLeft}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* 头顶标签 */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 -top-9
                            px-2.5 py-1 rounded-xl text-xs font-extrabold
                            shadow-game-sm whitespace-nowrap
                            ${
                              done
                                ? 'bg-life/90 text-white'
                                : isNear
                                ? 'bg-warm text-white animate-pop-in'
                                : 'bg-white text-ink'
                            }`}
              >
                {done ? '✓ 已完成' : p.label}
              </div>

              {/* 任务点本体 */}
              <div
                className={`relative w-20 h-20 rounded-full flex items-center justify-center
                            text-4xl shadow-game border-4 border-white
                            ${
                              done
                                ? 'bg-life/40 grayscale'
                                : 'bg-gradient-to-b from-warm to-alert'
                            }`}
              >
                {/* 脉冲圈（未完成且接近时显示） */}
                {!done && isNear && (
                  <div className="absolute inset-0 rounded-full border-4
                                  border-warm animate-pulse-ring" />
                )}
                <span className="relative">{p.icon}</span>
              </div>
            </div>
          );
        })}

        {/* 出口 */}
        <div
          className="absolute bottom-16"
          style={{
            left: `${(scene.exitX / 100) * scene.width}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className={`absolute left-1/2 -translate-x-1/2 -top-9
                        px-2.5 py-1 rounded-xl text-xs font-extrabold
                        shadow-game-sm whitespace-nowrap
                        ${
                          allTasksDone
                            ? 'bg-primary text-white animate-pop-in'
                            : 'bg-ink/60 text-white'
                        }`}
          >
            {allTasksDone ? `➡ ${scene.exitLabel}` : '🔒 完成所有任务'}
          </div>
          <div
            className={`w-24 h-32 rounded-t-3xl border-4 border-white
                        flex items-center justify-center text-5xl
                        shadow-game relative overflow-hidden
                        ${
                          allTasksDone
                            ? 'bg-gradient-to-b from-primary-light to-primary'
                            : 'bg-gradient-to-b from-slate-400 to-slate-600 grayscale'
                        }`}
          >
            {allTasksDone && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
            <span className="relative">{allTasksDone ? '🚪' : '🔒'}</span>
          </div>
        </div>

        {/* 主角小泉 */}
        <Player
          x={playerX}
          walking={walking}
          facing={facing}
          mood="normal"
          hint={
            nearestInteractable
              ? nearestInteractable.type === 'exit'
                ? '按 E 进入下一关'
                : '按 E 开始任务'
              : undefined
          }
        />
      </div>

      {/* 屏幕底部控制按钮（手机/触屏） */}
      <div className="absolute bottom-3 left-3 right-3 z-30
                      flex items-center justify-between pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button
            onPointerDown={() => pressLeft(true)}
            onPointerUp={() => pressLeft(false)}
            onPointerLeave={() => pressLeft(false)}
            onPointerCancel={() => pressLeft(false)}
            className="w-14 h-14 rounded-2xl bg-white/95 shadow-game
                       flex items-center justify-center text-ink
                       active:translate-y-1 active:bg-primary/20 transition-all
                       border-2 border-ink/10 select-none touch-none"
            aria-label="向左"
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={3} />
          </button>
          <button
            onPointerDown={() => pressRight(true)}
            onPointerUp={() => pressRight(false)}
            onPointerLeave={() => pressRight(false)}
            onPointerCancel={() => pressRight(false)}
            className="w-14 h-14 rounded-2xl bg-white/95 shadow-game
                       flex items-center justify-center text-ink
                       active:translate-y-1 active:bg-primary/20 transition-all
                       border-2 border-ink/10 select-none touch-none"
            aria-label="向右"
          >
            <ChevronRight className="w-7 h-7" strokeWidth={3} />
          </button>
        </div>

        <button
          onClick={interact}
          disabled={!nearestInteractable}
          className={`pointer-events-auto px-5 h-14 rounded-2xl shadow-game
                      flex items-center gap-2 font-extrabold
                      active:translate-y-1 transition-all border-2 select-none
                      ${
                        nearestInteractable
                          ? 'bg-gradient-to-b from-warm to-alert text-white border-white animate-bounce-slow'
                          : 'bg-white/60 text-ink/30 border-ink/10 cursor-not-allowed'
                      }`}
        >
          <Hand className="w-5 h-5" strokeWidth={3} />
          互动 (E)
        </button>
      </div>

      {/* 操作提示（首次进入时） */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20
                      bg-ink/70 text-white text-xs px-3 py-1 rounded-full
                      font-bold pointer-events-none animate-pop-in">
        ← → 移动 ·  E 互动
      </div>
    </div>
  );
}
