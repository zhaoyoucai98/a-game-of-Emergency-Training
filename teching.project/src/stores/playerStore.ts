import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerProgress } from '@/types/game';

interface PlayerState extends PlayerProgress {
  // Actions
  addExp: (amount: number) => void;
  completeLevel: (levelId: string, score: number) => void;
  unlockAchievement: (achievementId: string) => void;
  resetProgress: () => void;
}

const initialState: PlayerProgress = {
  level: 1,
  exp: 0,
  completedLevels: [],
  achievements: [],
  totalScore: 0,
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      ...initialState,

      addExp: (amount) =>
        set((state) => {
          const newExp = state.exp + amount;
          const newLevel = Math.floor(newExp / 100) + 1;
          return { exp: newExp, level: newLevel };
        }),

      completeLevel: (levelId, score) =>
        set((state) => {
          if (state.completedLevels.includes(levelId)) {
            return { totalScore: state.totalScore + score };
          }
          return {
            completedLevels: [...state.completedLevels, levelId],
            totalScore: state.totalScore + score,
          };
        }),

      unlockAchievement: (achievementId) =>
        set((state) => {
          if (state.achievements.includes(achievementId)) return state;
          return { achievements: [...state.achievements, achievementId] };
        }),

      resetProgress: () => set(initialState),
    }),
    {
      name: 'first-aid-hero-progress',
    }
  )
);
