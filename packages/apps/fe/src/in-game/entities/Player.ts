import { Color } from '@constants';
import { GameScene } from '@in-game/scenes/GameScene';
import Phaser from 'phaser';

type InitParams = {
  x: number;
  y: number;
  name?: string;
  me?: boolean;
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

  static generateShootAreaTexture(scene: GameScene): void {
    const lineWidth = 6;
    const shootAreaRadius = Player.radius + lineWidth * 3;
    scene.make
      .graphics({ x: 0, y: 0 })
      .lineStyle(lineWidth, 0xffffff, 0.2)
      .strokeCircle(
        shootAreaRadius,
        shootAreaRadius,
        shootAreaRadius - lineWidth / 2
      )
      .generateTexture(
        'player-shoot-area',
        shootAreaRadius * 2,
        shootAreaRadius * 2
      )
      .destroy();
  }

  bodySprite: Phaser.GameObjects.Sprite;
  avatarText: Phaser.GameObjects.Text;
  shootArea?: Phaser.GameObjects.Sprite;
  nameText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, params: InitParams) {
    const { x, y, name, me = false } = params;
    super(scene);

    this.bodySprite = scene.add.sprite(0, 0, 'player');
    this.avatarText = scene.add.text(0, 0, 'test');
    this.avatarText.setOrigin(0.5, 0.5);

    const children = [this.bodySprite, this.avatarText];
    if (me) {
      this.shootArea = scene.add.sprite(0, 0, 'player-shoot-area');
      this.shootArea.setDepth(-1);
      children.push(this.shootArea);
    }

    this.add(children);
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
