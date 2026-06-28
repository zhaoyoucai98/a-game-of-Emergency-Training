# 急救小先锋 - First Aid Hero

应急科普小游戏，通过游戏化学习让玩家掌握心肺复苏、海姆立克急救法等基本急救常识。

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式**：TailwindCSS
- **游戏引擎**：Phaser.js（后续扩展）
- **状态管理**：Zustand
- **路由**：React Router
- **图标**：Lucide React

## 项目结构

```
src/
├── components/         # 通用UI组件
├── pages/              # 页面组件
│   ├── HomePage.tsx           # 首页
│   ├── LevelMapPage.tsx       # 关卡地图
│   ├── GamePage.tsx           # 游戏关卡页
│   ├── QuizPage.tsx           # 知识问答页
│   └── AchievementPage.tsx    # 成就页
├── game/               # 游戏逻辑
│   └── engine/         # 游戏引擎封装
├── data/               # 急救知识数据
│   ├── levels.ts              # 关卡数据
│   ├── questions.ts           # 问答题库
│   └── achievements.ts        # 成就数据
├── stores/             # 状态管理
│   ├── playerStore.ts         # 玩家进度
│   └── gameStore.ts           # 游戏状态
├── types/              # TypeScript 类型
│   └── game.ts                # 游戏类型定义
├── utils/              # 工具函数
│   └── helpers.ts
├── App.tsx             # 应用入口
└── main.tsx            # 主入口

docs/
└── superpowers/specs/  # 设计文档
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## MVP 功能

### 第一篇章：生命基础急救

- ✅ 成人心肺复苏（CPR）
- ✅ 婴儿心肺复苏
- ✅ 海姆立克急救法
- ✅ AED 自动体外除颤仪使用

### 知识问答系统

- ✅ 选择题
- ✅ 判断题
- ✅ 答题解析

### 成就系统

- ✅ 8 种成就徽章
- ✅ 玩家等级和经验值
- ✅ 进度本地持久化

## 后续迭代计划

| 版本 | 内容 |
|------|------|
| v1.1 | 出血止血、烧烫伤、骨折扭伤 |
| v1.2 | 中毒急救、动物伤害、晕厥中暑 |
| v1.3 | 癫痫抽搐、溺水、电击伤、脑卒中 |
| v1.4 | 误区大挑战、急救物资收集、社交分享 |

## 免责声明

⚠️ 本游戏仅为教学，实际急救请遵循专业指导。
