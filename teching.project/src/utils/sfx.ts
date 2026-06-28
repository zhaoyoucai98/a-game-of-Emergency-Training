/**
 * 轻量音效系统
 * 使用 Web Audio API 合成音效，无需任何素材文件
 *
 * 使用：
 *   import { sfx } from '@/utils/sfx';
 *   sfx.click();        // 点击
 *   sfx.success();      // 成功
 *   sfx.error();        // 错误
 *   sfx.complete();     // 通关
 *   sfx.tick();         // 节拍
 *   sfx.coin();         // 金币
 */

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  return ctx;
}

interface ToneOptions {
  freq: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
  /** 延迟（秒） */
  delay?: number;
  /** 频率终点（实现滑音） */
  endFreq?: number;
}

/** 播放单音 */
function tone({
  freq,
  duration = 0.12,
  type = 'sine',
  volume = 0.2,
  delay = 0,
  endFreq,
}: ToneOptions) {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;

  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
  }

  // ADSR 包络
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** 播放和弦/序列 */
function chord(notes: ToneOptions[]) {
  notes.forEach(tone);
}

export const sfx = {
  /** UI 点击 */
  click() {
    tone({ freq: 800, duration: 0.06, type: 'square', volume: 0.1 });
  },
  /** 成功反馈：上扬两音 */
  success() {
    chord([
      { freq: 523, duration: 0.12, type: 'triangle', volume: 0.18 },
      { freq: 784, duration: 0.18, type: 'triangle', volume: 0.18, delay: 0.1 },
    ]);
  },
  /** 错误反馈：下行 */
  error() {
    tone({ freq: 300, endFreq: 150, duration: 0.25, type: 'sawtooth', volume: 0.15 });
  },
  /** 通关：完整小调上行 */
  complete() {
    chord([
      { freq: 523, duration: 0.14, type: 'triangle', volume: 0.2 },
      { freq: 659, duration: 0.14, type: 'triangle', volume: 0.2, delay: 0.12 },
      { freq: 784, duration: 0.14, type: 'triangle', volume: 0.2, delay: 0.24 },
      { freq: 1047, duration: 0.3, type: 'triangle', volume: 0.22, delay: 0.36 },
    ]);
  },
  /** 节拍器 tick（CPR 按压） */
  tick() {
    tone({ freq: 1200, duration: 0.03, type: 'square', volume: 0.08 });
  },
  /** 心跳按压 */
  beat() {
    tone({ freq: 80, endFreq: 50, duration: 0.12, type: 'sine', volume: 0.3 });
  },
  /** 金币奖励 */
  coin() {
    chord([
      { freq: 988, duration: 0.06, type: 'square', volume: 0.15 },
      { freq: 1319, duration: 0.1, type: 'square', volume: 0.15, delay: 0.05 },
    ]);
  },
  /** 星级出现 */
  star() {
    tone({ freq: 1500, endFreq: 2200, duration: 0.15, type: 'triangle', volume: 0.18 });
  },
  /** 切换静音 */
  toggleMute() {
    muted = !muted;
    return muted;
  },
  isMuted() {
    return muted;
  },
};
