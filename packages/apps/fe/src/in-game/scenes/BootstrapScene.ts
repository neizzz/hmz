import Phaser from 'phaser';

export class BootstrapScene extends Phaser.Scene {
  create() {
    console.log('[BootstrapScene] create');
    this.add.text(100, 100, 'bootstraping...', { color: 'white' });
  }
}
