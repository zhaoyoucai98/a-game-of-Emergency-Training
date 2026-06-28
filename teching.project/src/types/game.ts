/**
 * 急救步骤类型
 */
export type ActionType = 'click' | 'drag' | 'sequence' | 'rhythmic' | 'choice';

/**
 * 急救步骤
 */
export interface FirstAidStep {
  id: string;
  title: string;
  description: string;
  actionType: ActionType;
  targetArea?: string;
  duration?: number;
  correctFeedback: string;
  wrongFeedback: string;
  hint?: string;
}

/**
 * 难度等级
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * 关卡篇章
 */
export type Chapter =
  | 'life-basic'      // 生命基础急救
  | 'bleeding'        // 出血止血
  | 'burns'           // 烧烫伤
  | 'fracture'        // 骨折扭伤
  | 'poisoning'       // 中毒急救
  | 'animal'          // 动物伤害
  | 'syncope'         // 晕厥中暑
  | 'emergency'       // 紧急情况
  | 'misconception';  // 误区挑战

/**
 * 关卡定义
 */
export interface Level {
  id: string;
  chapter: Chapter;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  steps: FirstAidStep[];
  timeLimit?: number;
  knowledgeCards: string[];
  unlockCondition?: string;
  isMVP: boolean;
}

/**
 * 问答题目类型
 */
export type QuestionType = 'choice' | 'trueFalse' | 'order';

/**
 * 问答题目
 */
export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: number | boolean | number[];
  explanation: string;
  relatedTopic: Chapter;
  difficulty: Difficulty;
}

/**
 * 成就徽章
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

/**
 * 玩家进度
 */
export interface PlayerProgress {
  level: number;
  exp: number;
  completedLevels: string[];
  achievements: string[];
  totalScore: number;
}
