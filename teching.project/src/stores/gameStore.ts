import { create } from 'zustand';

interface GameState {
  currentLevelId: string | null;
  currentStepIndex: number;
  score: number;
  mistakes: number;
  hintsUsed: number;
  isPaused: boolean;
  startTime: number | null;

  // Actions
  startLevel: (levelId: string) => void;
  nextStep: () => void;
  addScore: (points: number) => void;
  recordMistake: () => void;
  useHint: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentLevelId: null,
  currentStepIndex: 0,
  score: 0,
  mistakes: 0,
  hintsUsed: 0,
  isPaused: false,
  startTime: null,

  startLevel: (levelId) =>
    set({
      currentLevelId: levelId,
      currentStepIndex: 0,
      score: 0,
      mistakes: 0,
      hintsUsed: 0,
      isPaused: false,
      startTime: Date.now(),
    }),

  nextStep: () =>
    set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),

  addScore: (points) =>
    set((state) => ({ score: state.score + points })),

  recordMistake: () =>
    set((state) => ({ mistakes: state.mistakes + 1 })),

  useHint: () =>
    set((state) => ({ hintsUsed: state.hintsUsed + 1 })),

  pauseGame: () => set({ isPaused: true }),

  resumeGame: () => set({ isPaused: false }),

  resetGame: () =>
    set({
      currentLevelId: null,
      currentStepIndex: 0,
      score: 0,
      mistakes: 0,
      hintsUsed: 0,
      isPaused: false,
      startTime: null,
    }),
}));
