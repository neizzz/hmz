import { BallState } from '@schema';

type InitParams = {
  state: BallState;
};

export class Ball extends Phaser.GameObjects.Sprite {
  static radius = 19;
  static lineWidth = 3;

  static generateTexture(scene: Phaser.Scene): void {
    scene.make
      .graphics({ x: 0, y: 0 })
      .fillStyle(0x000000)
      .fillCircle(Ball.radius, Ball.radius, Ball.radius)
      .fillStyle(0xffffff)
      .fillCircle(Ball.radius, Ball.radius, Ball.radius - Ball.lineWidth)
      .generateTexture('ball', Ball.radius * 2, Ball.radius * 2)
      .destroy();
  }

  constructor(scene: Phaser.Scene, params: InitParams) {
    const { state } = params;
    const { x, y } = state;
    super(scene, x, y, 'ball');
    this.setPosition(x, y);
    scene.add.existing(this);
  }
}
