import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  Home,
} from 'lucide-react';
import { getRandomQuestions } from '@/data/questions';
import type { Question } from '@/types/game';
import { GameHeader } from '@/components/GameHeader';
import { XiaoQuan } from '@/components/XiaoQuan';
import { sfx } from '@/utils/sfx';

const QUESTION_TIME = 15; // 每题 15 秒
const TOTAL_QUESTIONS = 5;

/** Kahoot 风格四彩配色 */
const optionColors = [
  { bg: 'from-[#FF5252] to-[#D32F2F]', shape: '▲' },
  { bg: 'from-[#2196F3] to-[#1565C0]', shape: '◆' },
  { bg: 'from-[#FFC107] to-[#F57F17]', shape: '●' },
  { bg: 'from-[#4CAF50] to-[#2E7D32]', shape: '■' },
];

function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0); // 连击
  const [selected, setSelected] = useState<number | boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setQuestions(getRandomQuestions(TOTAL_QUESTIONS));
  }, []);

  // 倒计时
  useEffect(() => {
    if (revealed || isFinished || questions.length === 0) return;
    setTimeLeft(QUESTION_TIME);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, revealed, isFinished, questions.length]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/60">
        加载中...
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleAnswer = (answer: number | boolean) => {
    if (revealed) return;
    if (timerRef.current) window.clearInterval(timerRef.current);

    setSelected(answer);
    setRevealed(true);

    const correct = answer === currentQ.correctAnswer;
    if (correct) {
      // 答对：分数 + 时间奖励
      const bonus = Math.floor(timeLeft * 10);
      setScore((s) => s + 100 + bonus);
      setStreak((s) => s + 1);
      sfx.success();
    } else {
      setStreak(0);
      sfx.error();
    }
  };

  const handleTimeout = () => {
    setRevealed(true);
    setStreak(0);
    sfx.error();
  };

  const handleNext = () => {
    sfx.click();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setIsFinished(true);
      sfx.complete();
    }
  };

  const handleRestart = () => {
    sfx.click();
    setQuestions(getRandomQuestions(TOTAL_QUESTIONS));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setRevealed(false);
    setIsFinished(false);
  };

  // ============ 结算页 ============
  if (isFinished) {
    const accuracy = Math.round((score / (TOTAL_QUESTIONS * 250)) * 100);
    const tier =
      accuracy >= 80
        ? { label: '急救专家', icon: '🏆', color: 'from-gold to-warm' }
        : accuracy >= 50
        ? { label: '准急救员', icon: '🥈', color: 'from-primary-light to-primary' }
        : { label: '继续努力', icon: '📚', color: 'from-life-light to-life' };

    return (
      <div className="min-h-screen flex flex-col">
        <GameHeader showBack title="挑战结果" />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 pt-20 text-center
                          shadow-game border-4 border-white relative animate-pop-in">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 animate-bounce-slow">
              <XiaoQuan size="medium" className="drop-shadow-2xl" />
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                            bg-gradient-to-r ${tier.color} text-white font-bold shadow-game-sm`}>
              <span className="text-lg">{tier.icon}</span>
              {tier.label}
            </div>

            <div className="text-5xl font-extrabold my-4 bg-gradient-to-r
                            from-primary to-alert bg-clip-text text-transparent">
              {score}
            </div>
            <div className="text-sm text-ink/60 mb-6">
              正确率 {accuracy}% · 答对 {Math.round(score / 100)} 题
            </div>

            <div className="flex gap-2">
              <button onClick={handleRestart}
                className="flex-1 py-3 rounded-2xl bg-white border-2 border-ink/10
                           font-bold text-ink/70 shadow-game-sm
                           active:translate-y-0.5 transition-all
                           flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                再来一轮
              </button>
              <Link to="/"
                onClick={() => sfx.click()}
                className="flex-1 py-3 rounded-2xl
                           bg-gradient-to-b from-primary-light to-primary
                           text-white font-extrabold shadow-game
                           active:translate-y-0.5 transition-all
                           flex items-center justify-center gap-1.5">
                <Home className="w-4 h-4" />
                返回首页
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isCorrect = selected === currentQ.correctAnswer;
  const timeRatio = timeLeft / QUESTION_TIME;

  // ============ 答题中 ============
  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader showBack title="知识问答" />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-4 flex flex-col">
        {/* 进度条 + 题号 + 连击 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-extrabold text-ink/70">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex-1 h-2 bg-white rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-primary to-life rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>
          {streak >= 2 && (
            <div className="hud-pill bg-alert text-white animate-pop-in">
              🔥 {streak} 连击
            </div>
          )}
        </div>

        {/* 倒计时圆环 + 题目卡 */}
        <div className="relative bg-white rounded-3xl shadow-game p-6 mb-4 animate-pop-in">
          {/* 倒计时圆环（右上角） */}
          <div className="absolute -top-4 -right-4">
            <CountdownRing seconds={timeLeft} total={QUESTION_TIME} />
          </div>

          {/* 题目类型徽章 */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                          bg-primary/10 text-primary text-xs font-bold mb-3">
            <Award className="w-3.5 h-3.5" />
            {currentQ.type === 'choice' ? '选择题' : '判断题'}
            <span className="text-ink/40">·</span>
            <span>{currentQ.difficulty === 'easy' ? '简单'
              : currentQ.difficulty === 'medium' ? '中等' : '困难'}</span>
          </div>

          <h2 className="text-xl font-bold text-ink leading-snug">
            {currentQ.content}
          </h2>

          {/* 时间剩余条 */}
          <div className="mt-4 h-1.5 bg-ink/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                timeRatio > 0.5 ? 'bg-life' : timeRatio > 0.25 ? 'bg-warm' : 'bg-alert'
              }`}
              style={{ width: `${timeRatio * 100}%` }}
            />
          </div>
        </div>

        {/* 选项 */}
        {currentQ.type === 'choice' && currentQ.options && (
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((option, idx) => {
              const isThis = selected === idx;
              const isAnswer = idx === currentQ.correctAnswer;

              let stateClass = '';
              if (revealed) {
                if (isAnswer) stateClass = 'ring-4 ring-life ring-offset-2 scale-105';
                else if (isThis) stateClass = 'opacity-60 saturate-50 scale-95';
                else stateClass = 'opacity-50';
              }

              const color = optionColors[idx % 4];

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={revealed}
                  className={`relative p-4 rounded-2xl shadow-game
                              bg-gradient-to-b ${color.bg}
                              text-white font-bold text-left
                              active:translate-y-1 active:shadow-game-sm
                              transition-all min-h-[80px] ${stateClass}`}
                >
                  <div className="text-2xl opacity-90 mb-1">{color.shape}</div>
                  <div className="text-sm leading-tight">{option}</div>
                  {revealed && isAnswer && (
                    <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 fill-white text-life" />
                  )}
                  {revealed && isThis && !isAnswer && (
                    <XCircle className="absolute top-2 right-2 w-5 h-5 fill-white text-alert" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === 'trueFalse' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAnswer(true)}
              disabled={revealed}
              className={`p-6 rounded-2xl shadow-game text-white font-extrabold text-xl
                          bg-gradient-to-b from-life-light to-life
                          active:translate-y-1 transition-all
                          ${revealed && currentQ.correctAnswer === true
                            ? 'ring-4 ring-life ring-offset-2'
                            : revealed && selected === true ? 'opacity-50' : ''}`}
            >
              ✓ 正确
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={revealed}
              className={`p-6 rounded-2xl shadow-game text-white font-extrabold text-xl
                          bg-gradient-to-b from-alert-light to-alert
                          active:translate-y-1 transition-all
                          ${revealed && currentQ.correctAnswer === false
                            ? 'ring-4 ring-life ring-offset-2'
                            : revealed && selected === false ? 'opacity-50' : ''}`}
            >
              ✗ 错误
            </button>
          </div>
        )}

        {/* 解析（揭晓后） */}
        {revealed && (
          <div className={`mt-4 p-4 rounded-2xl shadow-game-sm animate-pop-in
                          ${isCorrect ? 'bg-life/10 border-2 border-life/30'
                                      : 'bg-alert/10 border-2 border-alert/30'}`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-life flex-shrink-0" />
              ) : (
                <XCircle className="w-7 h-7 text-alert flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-extrabold mb-1">
                  {isCorrect
                    ? `回答正确！+${100 + Math.floor(timeLeft * 10)} 分`
                    : timeLeft === 0
                    ? '⏰ 时间到了！'
                    : '答错了，再接再厉'}
                </div>
                <div className="text-sm text-ink/70 leading-relaxed">
                  {currentQ.explanation}
                </div>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="mt-3 w-full py-2.5 rounded-2xl
                         bg-gradient-to-b from-primary-light to-primary
                         text-white font-extrabold shadow-game
                         active:translate-y-0.5 transition-all"
            >
              {currentIndex < questions.length - 1 ? '下一题 →' : '查看结果'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/** 倒计时圆环 */
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - seconds / total);
  const color =
    seconds > total * 0.5 ? '#32CD32' : seconds > total * 0.25 ? '#FFA500' : '#FF6347';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 drop-shadow-lg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="white"
          stroke="#E5E7EB"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center
                      font-extrabold text-lg" style={{ color }}>
        <Clock className="w-3 h-3 mr-0.5" />
        {seconds}
      </div>
    </div>
  );
}

export default QuizPage;
