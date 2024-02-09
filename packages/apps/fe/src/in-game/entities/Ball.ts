type InitParams = {
  x: number;
  y: number;
};

export class Ball extends Phaser.GameObjects.Sprite {
  static radius = 19;
  static lineWidth = 4;

  static generateTexture(scene: Phaser.Scene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x000000);
    graphics.fillCircle(Ball.radius, Ball.radius, Ball.radius);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(Ball.radius, Ball.radius, Ball.radius - Ball.lineWidth);
    graphics.generateTexture('ball', Ball.radius * 2, Ball.radius * 2);
    graphics.destroy();
  }

  constructor(scene: Phaser.Scene, params: InitParams) {
    const { x, y } = params;
    super(scene, x, y, 'ball');
    this.setPosition(x, y);
    scene.add.existing(this);
  }
}
