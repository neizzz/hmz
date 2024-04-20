import { PlayerEntityState } from '@shared/types';
import { Color } from '@constants';
import { GameScene } from '@in-game/scenes/GameScene';
import { PlayerState } from '@schema';
import Phaser from 'phaser';
import { PositionManager } from '@utils/entity';

type InitParams = {
  state: PlayerState;
  me?: boolean;
};

export class Player extends Phaser.GameObjects.Container {
  static radius = 27; // FIXME: use thing from server
  static lineWidth = 3; // FIXME:

  static generateTexture(
    scene: GameScene,
    params: { key: string; color: Color }
  ): void {
    const { key, color } = params;
    scene.make
      .graphics({ x: 0, y: 0 })
      .lineStyle(Player.lineWidth, 0x000000)
      .fillStyle(color)
      .fillCircle(
        Player.radius,
        Player.radius,
        Player.radius - Player.lineWidth
      )
      .strokeCircle(
        Player.radius,
        Player.radius,
        Player.radius - Player.lineWidth * 0.5
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
      .lineStyle(Player.lineWidth, 0xffffff)
      .fillStyle(color)
      .fillCircle(
        Player.radius,
        Player.radius,
        Player.radius - Player.lineWidth
      )
      .strokeCircle(
        Player.radius,
        Player.radius,
        Player.radius - Player.lineWidth * 0.5
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
  avatarText: Phaser.GameObjects.Sprite;
  shootArea?: Phaser.GameObjects.Sprite;
  nameText: Phaser.GameObjects.Text;

  positionManager = new PositionManager();

  constructor(scene: Phaser.Scene, params: InitParams) {
    const { state, me } = params;
    super(scene);

    this.schema = state;
    this.entityState = state.entityState;

    this.bodySprite = scene.add.sprite(0, 0, `${this.schema.team}:player`);

    const slicedName = this.schema.name.slice(0, 2);
    const avatarTextureKey = `avatar:${slicedName}`;

    if (!scene.textures.exists(avatarTextureKey)) {
      const text = scene.make.text({
        add: false,
        x: 0,
        y: 0,
        text: this.schema.name.slice(0, 2),
        style: {
          fontFamily: 'Sans-serif',
          fontSize: 20,
          strokeThickness: 2.0,
          fixedWidth: 30,
          fixedHeight: 24,
          align: 'center',
        },
      });
      scene.textures.addCanvas(avatarTextureKey, text.canvas);
    }

    this.avatarText = scene.add.sprite(
      0,
      0,
      scene.textures.get(avatarTextureKey)
    );
    this.avatarText.setOrigin(0.5, 0.5);

    const children = [this.bodySprite, this.avatarText];

    if (me) {
      this.shootArea = scene.add.sprite(0, 0, 'player-shoot-area');
      this.shootArea.setDepth(-1);
      children.push(this.shootArea);
    }

    const { kickoffX: x, kickoffY: y } = state;

    this.add(children);
    this.setSize(state.radius * 2, state.radius * 2);
    this.setPosition(x, y);
    this.positionManager.setKickoffPosition({ x, y });

    scene.add.existing(this);
  }

  // reset() {
  //   const { x, y } = this.positionManager.kickoffPosition();
  //   this.setPosition(x, y);
  // }

  update() {
    const newPosition = this.positionManager.nextPosition();
    newPosition && this.setPosition(newPosition.x, newPosition.y);
  }

  syncWithServer(serverState: PlayerState, me = false) {
    const { entityState, positionHistories } = serverState;
    this.positionManager.setPositionHistories(positionHistories);
    this.entityState = entityState;

    if (me) {
      switch (entityState) {
        case PlayerEntityState.IDLE:
          this.idle();
          break;

        case PlayerEntityState.SHOOTING:
          this.shooting();
          break;
      }
    }
  }

  shooting() {
    this.bodySprite.setTexture(`${this.schema.team}:player-shoot`);
  }

  idle() {
    this.bodySprite.setTexture(`${this.schema.team}:player`);
  }
}
