import Phaser from 'phaser';

/**
 * 游戏场景基类 - 用于后续扩展具体的急救场景
 * MVP阶段使用React组件实现交互，后续可逐步迁移到Phaser游戏引擎
 */
export class BaseGameScene extends Phaser.Scene {
  constructor(key: string) {
    super({ key });
  }

  preload() {
    // 加载资源
  }

  create() {
    // 初始化场景
  }

  update() {
    // 每帧更新
  }
}

/**
 * 创建Phaser游戏实例的配置
 */
export const createGameConfig = (parent: HTMLElement): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width: 800,
  height: 600,
  backgroundColor: '#e0f7ff',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [],
});
