import { Ball } from '@in-game/entities/Ball';
import { Player } from '@in-game/entities/Player';
import { GameRoomState, PlayerState } from '@schema';
import {
  Direction,
  GameRoomActionType,
  GameRoomMessageType,
  HmzMapInfo,
} from '@shared/types';
import { Room } from 'colyseus.js';
import Phaser from 'phaser';

export type GameSceneInitParams = {
  map: HmzMapInfo;
  room: Room;
};

export class GameScene extends Phaser.Scene {
  room: Room;
  me: string; // session id
  map: HmzMapInfo;
  players: { [sessionId: string]: Player } = {};
  playerSprites: { [sessionId: string]: Phaser.Physics.Matter.Sprite } = {};
  ballSprite: Phaser.Physics.Matter.Sprite;

  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('game-scene');
  }

  init({ map, room }: GameSceneInitParams) {
    this.room = room;
    this.me = room.sessionId;
    this.map = map;
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  preload() {
    console.log('[GameScene] preload');

    this.load.image('ground-tile', '/assets/bg.png');
    Player.generateTexture(this);
    Ball.generateTexture(this);
  }

  create() {
    console.log('[GameScene] create');

    this.drawStadium();

    this.room.state.listen('ball', ({ x, y, radius }) => {
      this.ballSprite = this.matter.add.sprite(x, y, 'ball').setBody({
        type: 'circle',
        radius,
      });
    });

    this.room.state.players.onAdd(({ x, y, radius }) => {
      this.playerSprites[this.me] = this.matter.add
        .sprite(x, y, 'player')
        .setBody({
          type: 'circle',
          radius,
        });
    });

    this.room.onStateChange((state: GameRoomState) => {
      state.players.forEach((player, id) => {
        const playerSprite = this.playerSprites[id];
        playerSprite.x = player.x;
        playerSprite.y = player.y;
      });

      this.ballSprite.x = state.ball.x;
      this.ballSprite.y = state.ball.y;
    });
  }

  update(time: number, delta: number): void {
    this.room.send(GameRoomMessageType.ACTION, {
      type: GameRoomActionType.DIRECTION,
      payload: {
        direction: this.getDirectionFromInput(),
      },
    });
  }

  private drawStadium() {
    // Matter.Composite.add(this.world, [
    //   Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    //   Matter.Bodies.circle(400, 0, 800, 50, { isStatic: true }),
    //   Matter.Bodies.circle(400, 600, 800, 50, { isStatic: true }),
    //   Matter.Bodies.circle(800, 300, 50, 600, { isStatic: true }),
    //   Matter.Bodies.circle(0, 300, 50, 600, { isStatic: true }),
    // ]);
    this.drawGround();

    const lineWidth = 4;
    const { ground } = this.map;
    ground.width += lineWidth;
    ground.height += lineWidth;

    const x = (this.map.width - ground.width) / 2;
    const y = (this.map.height - ground.height) / 2;

    this.add
      .graphics({ x, y })
      .lineStyle(lineWidth, 0xffffff)
      .strokeRect(0, 0, ground.width, ground.height)
      .strokeCircle(ground.width / 2, ground.height / 2, ground.height / 4.5)
      .lineBetween(ground.width / 2, 0, ground.width / 2, ground.height);
  }

  private drawGround() {
    const tilemap = this.make.tilemap({
      tileWidth: 120,
      tileHeight: 120,
      width: 16,
      height: 8,
    });
    const tiles = tilemap.addTilesetImage('ground-tile');
    const layer = tilemap.createBlankLayer('ground-layer', tiles);
    layer.fill(0, 0, 0, tilemap.width, tilemap.height); // Body of the water
  }

  private getDirectionFromInput(): Direction {
    const xdir = +this.cursorKeys.right.isDown - +this.cursorKeys.left.isDown;
    const ydir = +this.cursorKeys.down.isDown - +this.cursorKeys.up.isDown;

    return ((xdir ? (xdir === -1 ? 'left' : 'right') : '') +
      (ydir ? (ydir === -1 ? 'up' : 'down') : '')) as Direction;
  }
}
