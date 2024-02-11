import { PlayerEntityState } from '@shared/types';
import { Color } from '@constants';
import { GameScene } from '@in-game/scenes/GameScene';
import { PlayerState } from '@schema';
import Phaser from 'phaser';

type InitParams = {
  state: PlayerState;
  me?: boolean;
};

export class Player extends Phaser.GameObjects.Container {
  static radius = 26;
  static lineWidth = 4;

  static generateTexture(
    scene: GameScene,
    params: { key: string; color: Color }
  ): void {
    const { key, color } = params;
    scene.make
      .graphics({ x: 0, y: 0 })
      .fillStyle(0x000000)
      .fillCircle(Player.radius, Player.radius, Player.radius)
      .fillStyle(color)
      .fillCircle(
        Player.radius,
        Player.radius,
        Player.radius - Player.lineWidth
      )
      .generateTexture(key, Player.radius * 2, Player.radius * 2)
      .destroy();
  }

  static generateShootTexture(
    scene: GameScene,
    params: { key: string; color: Color }
  ): void {
    const { key, color } = params;
    scene.make
      .graphics({ x: 0, y: 0 })
      .fillStyle(0xffffff)
      .fillCircle(Player.radius, Player.radius, Player.radius)
      .fillStyle(color)
      .fillCircle(
        Player.radius,
        Player.radius,
        Player.radius - Player.lineWidth
      )
      .generateTexture(key, Player.radius * 2, Player.radius * 2)
      .destroy();
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

  schema: PlayerState;
  entityState: PlayerEntityState;

  bodySprite: Phaser.GameObjects.Sprite;
  avatarText: Phaser.GameObjects.Text;
  shootArea?: Phaser.GameObjects.Sprite;
  nameText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, params: InitParams) {
    const { state, me } = params;
    super(scene);

    this.schema = state;
    this.state = state.entityState;

    this.bodySprite = scene.add.sprite(0, 0, `${this.schema.team}:player`);
    this.avatarText = scene.add.text(0, 0, 'test');
    this.avatarText.setOrigin(0.5, 0.5);

    const children = [this.bodySprite, this.avatarText];
    if (me) {
      this.shootArea = scene.add.sprite(0, 0, 'player-shoot-area');
      this.shootArea.setDepth(-1);
      children.push(this.shootArea);
    }

    this.add(children);
    this.setSize(state.radius * 2, state.radius * 2);
    this.setPosition(state.x, state.y);

    scene.add.existing(this);
  }

  update(serverState: PlayerState) {
    const { x, y, entityState } = serverState;

    this.x = x;
    this.y = y;

    if (this.entityState === entityState) return;

    // entity state mutation logic
    switch (entityState) {
      case PlayerEntityState.IDLE:
        this.idle();
        break;

      case PlayerEntityState.SHOOTING:
        this.shooting();
        break;
    }
    this.entityState = entityState;
  }

  shooting() {
    this.bodySprite.setTexture(`${this.schema.team}:player-shoot`);
  }

  idle() {
    this.bodySprite.setTexture(`${this.schema.team}:player`);
  }
}
