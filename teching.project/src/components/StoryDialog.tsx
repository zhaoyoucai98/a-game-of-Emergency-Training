import { useEffect, useState, useRef } from 'react';
import { ChevronRight, FastForward } from 'lucide-react';
import { Mascot } from './Mascot';
import type { DialogueLine } from '@/data/stories';
import { sfx } from '@/utils/sfx';

interface StoryDialogProps {
  lines: DialogueLine[];
  /** 完成所有对话时触发 */
  onComplete: () => void;
  /** 跳过按钮 */
  onSkip?: () => void;
}

const speakerDisplayName: Record<string, string> = {
  xiaoquan: '小泉',
  grandpa: '松爷爷',
  xiaohei: '小黑',
};

/**
 * NPC 剧情对话框
 * - 顶部全屏遮罩
 * - NPC 立绘从左/右淡入（小泉=右，其他=左）
 * - 对话框逐字打字
 * - 点击 / 空格继续；按 "跳过" 直接结束
 */
export function StoryDialog({ lines, onComplete, onSkip }: StoryDialogProps) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef<number | null>(null);

  const current = lines[index];

  // 打字机效果
  useEffect(() => {
    if (!current) return;
    setTyped('');
    setIsTyping(true);
    let i = 0;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      i++;
      setTyped(current.text.slice(0, i));
      if (i % 3 === 0) sfx.tick();
      if (i >= current.text.length) {
        window.clearInterval(timerRef.current!);
        setIsTyping(false);
      }
    }, 35);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [index, current]);

  const handleNext = () => {
    sfx.click();
    if (isTyping) {
      // 正在打字 → 立即显示全文
      if (timerRef.current) window.clearInterval(timerRef.current);
      setTyped(current.text);
      setIsTyping(false);
      return;
    }
    if (index < lines.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    sfx.click();
    if (timerRef.current) window.clearInterval(timerRef.current);
    (onSkip ?? onComplete)();
  };

  // 空格 / 回车继续
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, index]);

  if (!current) return null;

  // 小泉默认显示在右侧，其他角色显示在左侧
  const isMain = current.speaker === 'xiaoquan';
  const displayName = current.name ?? speakerDisplayName[current.speaker];

  return (
    <div
      className="fixed inset-0 z-[150] flex flex-col justify-end
                 bg-gradient-to-b from-black/30 via-black/40 to-black/60
                 backdrop-blur-sm cursor-pointer"
      onClick={handleNext}
    >
      {/* 顶部跳过 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute top-4 right-4 px-3 py-1.5 rounded-full
                   bg-white/90 text-ink/70 text-sm font-bold shadow-pill
                   hover:bg-white flex items-center gap-1"
      >
        <FastForward className="w-3.5 h-3.5" />
        跳过剧情
      </button>

      {/* 角色立绘 */}
      <div
        key={`speaker-${index}-${current.speaker}`}
        className={`flex-1 flex items-end px-4 pb-4 animate-pop-in
                    ${isMain ? 'justify-end' : 'justify-start'}`}
      >
        <Mascot
          character={current.speaker}
          mood={current.mood ?? 'normal'}
          size="large"
          className="drop-shadow-2xl"
        />
      </div>

      {/* 对话框（贴底） */}
      <div className="relative bg-white rounded-t-[2rem] border-t-4 border-primary
                      shadow-game p-5 pb-8 max-w-2xl mx-auto w-full">
        {/* 角色名标签 */}
        <div className={`absolute -top-4 ${isMain ? 'right-6' : 'left-6'}
                        px-3 py-1 rounded-full text-white text-sm font-extrabold
                        shadow-game-sm
                        ${current.speaker === 'xiaoquan' ? 'bg-primary'
                          : current.speaker === 'grandpa' ? 'bg-warm'
                          : 'bg-ink'}`}>
          {displayName}
        </div>

        {/* 文字 */}
        <div className="min-h-[80px] text-lg leading-relaxed text-ink pr-12">
          {typed}
          {isTyping && (
            <span className="inline-block w-2 h-5 bg-ink/40 ml-1 align-text-bottom animate-pulse" />
          )}
        </div>

        {/* 进度 + 下一句指示 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {lines.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-primary' : i < index ? 'w-3 bg-primary/40' : 'w-3 bg-ink/15'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm text-ink/50 font-medium">
            {isTyping ? '点击立即显示' : (index < lines.length - 1 ? '继续' : '开始游戏')}
            <ChevronRight className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryDialog;
