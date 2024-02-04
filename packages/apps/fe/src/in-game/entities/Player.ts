export class Player {
  static generateTexture(scene: Phaser.Scene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x000000);
    graphics.fillCircle(26, 26, 26);
    graphics.generateTexture('player', 52, 52);
    graphics.destroy();
  }
}
