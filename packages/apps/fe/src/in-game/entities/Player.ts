import { GameScene } from '@in-game/scenes/GameScene';

type InitParams = {
  scene: GameScene;
  sessionId: string;
  x: number;
  y: number;
  avatar?: string;
  name?: string;
};

export class Player {
  scene: GameScene;
  sessionId: string;
  x: number;
  y: number;
  avatar?: string;
  name?: string;

  constructor(params: InitParams) {
    this.scene = params.scene;
    this.sessionId = params.sessionId;
    this.x = params.x;
    this.y = params.y;
    this.avatar = params.avatar;
    this.name = params.name;
  }

  static generateTexture(scene: Phaser.Scene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x000000);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  update() {
    // TODO:
  }
}
