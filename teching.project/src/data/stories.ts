import type { CharacterId, CharacterMood } from '@/components/Mascot';

/**
 * 关卡剧情对话
 * 每条对话指定说话人（角色 + 表情）和台词
 * 关卡开始前会逐句播放
 */

export interface DialogueLine {
  speaker: CharacterId;
  mood?: CharacterMood;
  /** 显示名称（不传则使用角色默认名） */
  name?: string;
  text: string;
}

/**
 * 各关卡的开场剧情
 * key 是 level.id
 */
export const levelStories: Record<string, DialogueLine[]> = {
  // ============ 成人 CPR ============
  'cpr-adult': [
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '小泉！前面有人倒下了，看起来没有反应！',
    },
    {
      speaker: 'xiaoquan',
      mood: 'normal',
      text: '松爷爷，我们要怎么办？',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '别慌！这是心脏骤停的征兆，黄金 4 分钟非常关键。',
    },
    {
      speaker: 'grandpa',
      mood: 'happy',
      text: '记住口诀：判断意识 → 呼救 → 判断呼吸 → 胸外按压 → 人工呼吸。',
    },
    {
      speaker: 'xiaoquan',
      mood: 'happy',
      text: '明白！我这就开始救人！💪',
    },
  ],

  // ============ 婴儿 CPR ============
  'cpr-infant': [
    {
      speaker: 'xiaohei',
      mood: 'hurt',
      text: '哥哥救救我妹妹！她突然没有反应了……',
    },
    {
      speaker: 'xiaoquan',
      mood: 'normal',
      text: '别担心小黑，婴儿的急救方法和大人不一样。',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '没错！婴儿要 拍足底判断意识、用两根手指按压、深度只要 4cm。',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '动作要轻柔但坚定。准备好了吗？',
    },
  ],

  // ============ 海姆立克 ============
  'heimlich-adult': [
    {
      speaker: 'xiaohei',
      mood: 'hurt',
      text: '咳咳……我噎到了……喘不上气……',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '小泉快！这是气道异物梗阻，要用海姆立克急救法！',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '站到他身后，双臂环抱腰腹，一手握拳抵住肚脐上方两横指处。',
    },
    {
      speaker: 'grandpa',
      mood: 'happy',
      text: '然后用力向内上方冲击，把异物挤出来！',
    },
    {
      speaker: 'xiaoquan',
      mood: 'normal',
      text: '收到，小黑挺住！',
    },
  ],

  // ============ AED ============
  'aed-usage': [
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '心脏骤停光按压还不够，最好结合 AED 一起用。',
    },
    {
      speaker: 'xiaoquan',
      mood: 'idle',
      text: 'AED 不是只有医生才会用吗？',
    },
    {
      speaker: 'grandpa',
      mood: 'happy',
      text: '不！AED 设计成普通人也能用，只要跟着语音操作就行。',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '步骤：开机 → 贴电极片 → 等待分析 → 按下电击按钮。',
    },
    {
      speaker: 'xiaoquan',
      mood: 'happy',
      text: '我学会了！让我来试试！⚡',
    },
  ],

  // ============ 第二篇章：出血止血 ============

  // 1. 轻微擦伤
  'bleed-minor': [
    {
      speaker: 'xiaohei',
      mood: 'hurt',
      text: '小泉哥哥！我刚才摔了一跤，膝盖擦破了……',
    },
    {
      speaker: 'xiaoquan',
      mood: 'normal',
      text: '别怕小黑，擦伤虽然小，但处理不好也会感染哦。',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '记住三步：流水冲洗 → 碘伏消毒 → 纱布或创可贴覆盖。',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '千万不要涂牙膏、烟灰、草药！这些土方法极易引起感染。',
    },
    {
      speaker: 'xiaoquan',
      mood: 'happy',
      text: '收到！让我来给小黑处理伤口！',
    },
  ],

  // 2. 四肢渗血
  'bleed-limb': [
    {
      speaker: 'xiaohei',
      mood: 'hurt',
      text: '哎呀，我手臂划了一道口子，一直在流血……',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '这种渗血用加压止血法，按压伤口 5-10 分钟不要松开。',
    },
    {
      speaker: 'grandpa',
      mood: 'happy',
      text: '同时把受伤的肢体抬高，高于心脏，可以减少出血量。',
    },
    {
      speaker: 'xiaoquan',
      mood: 'normal',
      text: '记住了！按压 + 抬高，双管齐下！',
    },
  ],

  // 3. 动脉大出血
  'bleed-artery': [
    {
      speaker: 'grandpa',
      mood: 'hurt',
      text: '紧急情况！这位伤者动脉破了，血像喷泉一样涌出！',
    },
    {
      speaker: 'xiaoquan',
      mood: 'idle',
      text: '这……这怎么办？',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '先用厚纱布持续重压。不行就上止血带，绑在伤口靠近心脏的一侧！',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '记得垫一层布料，禁止用铁丝电线！每 30-40 分钟松开 1-2 分钟。',
    },
    {
      speaker: 'xiaoquan',
      mood: 'happy',
      text: '近心端、垫布料、记时间！我冲了！',
    },
  ],

  // 4. 鼻出血
  'bleed-nose': [
    {
      speaker: 'xiaohei',
      mood: 'hurt',
      text: '小泉哥哥，我又流鼻血了……我妈妈让我仰头！',
    },
    {
      speaker: 'xiaoquan',
      mood: 'idle',
      text: '不行！仰头是错的！会让血液倒流呛进气管！',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '正确做法：身体微微前倾，捏住鼻翼软肉 10 分钟，用嘴呼吸。',
    },
    {
      speaker: 'grandpa',
      mood: 'happy',
      text: '再用冷毛巾敷鼻梁，血管收缩，很快就能止血。',
    },
    {
      speaker: 'xiaoquan',
      mood: 'normal',
      text: '前倾、捏鼻翼、冷敷！我来教小黑正确方法！',
    },
  ],

  // 5. 头部磕碰出血
  'bleed-head': [
    {
      speaker: 'xiaohei',
      mood: 'hurt',
      text: '哥哥……我刚才滑梯撞到头了，有点晕……',
    },
    {
      speaker: 'xiaoquan',
      mood: 'idle',
      text: '小黑你看着我！能听到我说话吗？',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '头部出血要先判断伤情，看意识是否清醒、有没有持续呕吐。',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '少量出血加压包扎；如果意识模糊或昏迷，禁止移动，平躺侧卧防呕吐窒息！',
    },
    {
      speaker: 'xiaoquan',
      mood: 'happy',
      text: '同时立即拨打 120！',
    },
  ],

  // ============ 第三篇章：烧烫伤 ============

  // 1. 小面积烫伤
  'burn-small': [
    {
      speaker: 'xiaohei',
      mood: 'hurt',
      text: '哥哥救命！我打翻了热水杯，手被烫了！',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '马上记住五字口诀：冲、脱、泡、盖、送！',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '冲流水、脱衣物、泡冷水、盖纱布、送医院。每一步都很关键！',
    },
    {
      speaker: 'xiaoquan',
      mood: 'normal',
      text: '注意是常温水，不能用冰水！冰水会冻伤皮肤。',
    },
    {
      speaker: 'xiaohei',
      mood: 'happy',
      text: '好的，我跟着哥哥做！',
    },
  ],

  // 2. 烫伤误区
  'burn-mistakes': [
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '小泉，今天考考你民间偏方哪些不能用！',
    },
    {
      speaker: 'xiaoquan',
      mood: 'idle',
      text: '我听说有人涂牙膏、酱油、香油……',
    },
    {
      speaker: 'grandpa',
      mood: 'hurt',
      text: '这些全是错误偏方！会加重感染，影响医生处理！',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '水泡也不要挑破，那是天然的保护膜。',
    },
    {
      speaker: 'xiaoquan',
      mood: 'happy',
      text: '让我来识别这些危险偏方！',
    },
  ],

  // 3. 严重烧伤
  'burn-severe': [
    {
      speaker: 'grandpa',
      mood: 'hurt',
      text: '小泉！前面着火了，有人身上的衣服烧起来了！',
    },
    {
      speaker: 'xiaoquan',
      mood: 'idle',
      text: '怎么办？要追上去吗？',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '记住"停、躺、滚"！让伤者停下来原地打滚或用棉被压灭。',
    },
    {
      speaker: 'grandpa',
      mood: 'normal',
      text: '然后大量常温清水冲洗，保鲜膜覆盖创面，立即拨打 120！',
    },
    {
      speaker: 'xiaoquan',
      mood: 'happy',
      text: '收到！火大火急但我不慌！',
    },
  ],
};

export function getStoryByLevelId(id: string): DialogueLine[] | undefined {
  return levelStories[id];
}
