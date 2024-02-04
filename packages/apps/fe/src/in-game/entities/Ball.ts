export class Ball {
  static generateTexture(scene: Phaser.Scene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(15, 15, 15);
    graphics.generateTexture('ball', 30, 30);
    graphics.destroy();
  }
}
