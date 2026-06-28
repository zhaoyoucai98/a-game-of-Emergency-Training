import type { Question } from '@/types/game';

export const questions: Question[] = [
  {
    id: 'q-001',
    type: 'choice',
    content: '成人胸外按压的正确深度是多少？',
    options: ['2-3cm', '3-4cm', '5-6cm', '7-8cm'],
    correctAnswer: 2,
    explanation: '成人胸外按压的标准深度为5-6cm，过浅无效，过深可能造成伤害。',
    relatedTopic: 'life-basic',
    difficulty: 'easy',
  },
  {
    id: 'q-002',
    type: 'choice',
    content: '心肺复苏中按压与人工呼吸的比例是？',
    options: ['15:1', '20:2', '30:2', '30:5'],
    correctAnswer: 2,
    explanation: '单人施救时，按压与人工呼吸的标准比例为30:2。',
    relatedTopic: 'life-basic',
    difficulty: 'easy',
  },
  {
    id: 'q-003',
    type: 'trueFalse',
    content: '鼻出血时应该仰头止血。',
    correctAnswer: false,
    explanation: '错误！仰头会让血液倒流入气管，引发窒息。正确做法是身体微微前倾，捏住鼻翼软肉10分钟。',
    relatedTopic: 'bleeding',
    difficulty: 'easy',
  },
  {
    id: 'q-004',
    type: 'trueFalse',
    content: '烫伤后应立即涂抹牙膏或酱油。',
    correctAnswer: false,
    explanation: '错误！牙膏、酱油会加重感染、影响医生处理。正确做法是"冲、脱、泡、盖、送"五字口诀。',
    relatedTopic: 'burns',
    difficulty: 'easy',
  },
  {
    id: 'q-005',
    type: 'choice',
    content: '溺水救援后应该先做什么？',
    options: ['立即控水', '立即心肺复苏', '等待救援', '喂水保暖'],
    correctAnswer: 1,
    explanation: '溺水救援无需控水，控水会耽误心肺复苏，立即进行CPR才是关键。',
    relatedTopic: 'emergency',
    difficulty: 'medium',
  },
  {
    id: 'q-006',
    type: 'choice',
    content: '癫痫发作时正确的处理方法是？',
    options: [
      '往嘴里塞毛巾防止咬舌',
      '强行按压四肢',
      '让患者侧卧，移开周边硬物',
      '掐人中唤醒',
    ],
    correctAnswer: 2,
    explanation: '癫痫发作正确处理：侧躺、解开衣领、移开硬物。绝对禁止往嘴里塞东西、按压四肢、掐人中。',
    relatedTopic: 'emergency',
    difficulty: 'medium',
  },
  {
    id: 'q-007',
    type: 'choice',
    content: '海姆立克急救法适用于1岁以下婴儿吗？',
    options: ['完全适用', '不适用，需用拍背+胸部冲击', '部分适用', '只能由医生操作'],
    correctAnswer: 1,
    explanation: '婴儿不能做腹部冲击（会损伤内脏），应该俯卧拍背5次+翻身两指胸部冲击5次循环。',
    relatedTopic: 'life-basic',
    difficulty: 'medium',
  },
  {
    id: 'q-008',
    type: 'choice',
    content: '识别脑卒中的FAST口诀中"T"代表什么？',
    options: ['Treatment 治疗', 'Time 时间', 'Test 测试', 'Temperature 体温'],
    correctAnswer: 1,
    explanation: 'T=Time时间，脑卒中黄金溶栓时间窗很短，立刻拨打120！',
    relatedTopic: 'emergency',
    difficulty: 'medium',
  },
];

export function getQuestionsByTopic(topic: string): Question[] {
  return questions.filter((q) => q.relatedTopic === topic);
}

export function getRandomQuestions(count: number): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
