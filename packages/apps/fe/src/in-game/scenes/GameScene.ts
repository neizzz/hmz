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
import { MapBuilder } from '@utils/map/builder';

export type GameSceneInitParams = {
  map: HmzMapInfo;
  room: Room;
};

export class GameScene extends Phaser.Scene {
  room: Room;
  me: string; // session id
  mapBuilder: MapBuilder;
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
    this.mapBuilder = new MapBuilder(this, map);
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  preload() {
    console.log('[GameScene] preload');

    this.mapBuilder.loadAssets();
    Player.generateTexture(this);
    Ball.generateTexture(this);
  }

  create() {
    console.log('[GameScene] create');

    this.mapBuilder.build();

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

    if (this.cursorKeys.space.isDown) {
      this.room.send(GameRoomMessageType.ACTION, {
        type: GameRoomActionType.SHOOT,
      });
    }
  }

  private getDirectionFromInput(): Direction {
    const xdir = +this.cursorKeys.right.isDown - +this.cursorKeys.left.isDown;
    const ydir = +this.cursorKeys.down.isDown - +this.cursorKeys.up.isDown;

    return ((xdir ? (xdir === -1 ? 'left' : 'right') : '') +
      (ydir ? (ydir === -1 ? 'up' : 'down') : '')) as Direction;
  }
}
