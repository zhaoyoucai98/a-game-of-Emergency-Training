import type { Achievement } from '@/types/game';

export const achievements: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first-rescue',
    title: '初出茅庐',
    description: '完成第一个急救关卡',
    icon: '🎯',
  },
  {
    id: 'cpr-master',
    title: 'CPR达人',
    description: '完成所有心肺复苏关卡',
    icon: '❤️',
  },
  {
    id: 'heimlich-expert',
    title: '海姆立克专家',
    description: '完成所有海姆立克急救关卡',
    icon: '🤲',
  },
  {
    id: 'aed-pro',
    title: 'AED操作高手',
    description: '完美使用AED设备',
    icon: '⚡',
  },
  {
    id: 'quiz-champion',
    title: '答题冠军',
    description: '连续答对10道题',
    icon: '🏆',
  },
  {
    id: 'no-mistake',
    title: '零失误',
    description: '一次性完成关卡且无任何错误',
    icon: '⭐',
  },
  {
    id: 'speed-rescue',
    title: '神速急救',
    description: '在限时内完成关卡',
    icon: '⚡',
  },
  {
    id: 'life-guardian',
    title: '生命守护者',
    description: '完成所有MVP关卡',
    icon: '🛡️',
  },
];

export function getAchievementById(id: string) {
  return achievements.find((a) => a.id === id);
}
