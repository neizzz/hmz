import Phaser from 'phaser';

export class BootstrapScene extends Phaser.Scene {
  create() {
    const { width, height } = this.sys.game.canvas;
    console.log('[BootstrapScene] create');
    this.add
      .text(width / 2, height / 2, 'bootstraping...', {
        fontSize: 20,
        color: 'white',
      })
      .setOrigin(0.5, 0.5);
  }
}
