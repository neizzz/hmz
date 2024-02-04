export class Ball {
  static generateTexture(scene: Phaser.Scene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(17, 17, 17);
    graphics.generateTexture('ball', 34, 34);
    graphics.destroy();
  }
}
