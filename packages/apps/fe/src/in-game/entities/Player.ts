import { Color } from '@constants';
import { GameScene } from '@in-game/scenes/GameScene';
import Phaser from 'phaser';

type InitParams = {
  x: number;
  y: number;
  name?: string;
};

export class Player extends Phaser.GameObjects.Container {
  static radius = 26;
  static lineWidth = 4;

  static generateTexture(scene: GameScene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x000000);
    graphics.fillCircle(Player.radius, Player.radius, Player.radius);
    graphics.fillStyle(Color.RED_TEAM);
    graphics.fillCircle(
      Player.radius,
      Player.radius,
      Player.radius - Player.lineWidth
    );
    graphics.generateTexture('player', Player.radius * 2, Player.radius * 2);
    graphics.destroy();
  }

  static generateShootTexture(scene: GameScene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(Player.radius, Player.radius, Player.radius);
    graphics.fillStyle(Color.RED_TEAM);
    graphics.fillCircle(
      Player.radius,
      Player.radius,
      Player.radius - Player.lineWidth
    );
    graphics.generateTexture(
      'player-shoot',
      Player.radius * 2,
      Player.radius * 2
    );
    graphics.destroy();
  }

  bodySprite: Phaser.GameObjects.Sprite;
  avatarText: Phaser.GameObjects.Text;
  nameText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, params: InitParams) {
    const { x, y, name } = params;
    super(scene);

    this.bodySprite = scene.add.sprite(0, 0, 'player');
    this.avatarText = scene.add.text(0, 0, 'test');
    this.avatarText.setOrigin(0.5, 0.5);
    this.add([this.bodySprite, this.avatarText]);
    this.setSize(Player.radius * 2, Player.radius * 2);
    this.setPosition(x, y);

    scene.add.existing(this);
  }

  shooting() {
    this.bodySprite.setTexture('player-shoot');
  }

  idle() {
    this.bodySprite.setTexture('player');
  }
}
