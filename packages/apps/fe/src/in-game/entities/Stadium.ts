import { Player } from '@in-game/entities/Player.ts';

export class Stadium {
  scene: Phaser.Scene;
  players: Record<string, Player> = {};
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    if (!this.scene.input.keyboard) {
      throw new Error('no keyboard');
    }

    this.cursors = this.scene.input.keyboard.createCursorKeys();
  }

  start(scene: Phaser.Scene) {}

  create() {}

  preload() {}

  update(time: number, delta: number): void {}

  destroy() {}

  private listenKeys() {}
}
