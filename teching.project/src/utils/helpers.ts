/**
 * 通用工具函数
 */

/**
 * 节流函数：限制函数调用频率
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 计算CPR按压节奏是否正确（100-120次/分钟）
 * @param compressionTimes 按压时间戳数组（毫秒）
 * @returns 是否符合标准频率
 */
export function isCPRRhythmCorrect(compressionTimes: number[]): boolean {
  if (compressionTimes.length < 2) return false;
  const intervals = [];
  for (let i = 1; i < compressionTimes.length; i++) {
    intervals.push(compressionTimes[i] - compressionTimes[i - 1]);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const bpm = 60000 / avgInterval;
  return bpm >= 100 && bpm <= 120;
}

/**
 * 格式化时间为 mm:ss
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * 计算关卡得分等级
 */
export function calculateGrade(score: number, mistakes: number, hintsUsed: number): 'S' | 'A' | 'B' | 'C' {
  const penalty = mistakes * 50 + hintsUsed * 20;
  const finalScore = score - penalty;
  if (finalScore >= 450 && mistakes === 0) return 'S';
  if (finalScore >= 350) return 'A';
  if (finalScore >= 250) return 'B';
  return 'C';
}
