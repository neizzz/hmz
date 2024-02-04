import { Ball } from '@in-game/entities/Ball';
import { Player } from '@in-game/entities/Player';
import { GameRoomState, PlayerState } from '@schema';
import {
  Direction,
  GameRoomActionType,
  GameRoomMessageType,
} from '@shared/types';
import { Room } from 'colyseus.js';
import Phaser from 'phaser';

export type GameSceneInitParams = {
  map: {
    width: number;
    height: number;
  };
  room: Room;
};

export class GameScene extends Phaser.Scene {
  room: Room;
  me: string; // session id
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

    this.drawGround();

    // const { width, height } = this.game.config;

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

    console.log(this.getDirectionFromInput());
  }

  private drawGround() {
    const map = this.make.tilemap({
      tileWidth: 120,
      tileHeight: 120,
      width: 12,
      height: 8,
    });
    const tiles = map.addTilesetImage('ground-tile');
    const layer = map.createBlankLayer('ground-layer', tiles);
    layer.fill(0, 0, 0, map.width, map.height); // Body of the water
  }

  private getDirectionFromInput(): Direction {
    const xdir = +this.cursorKeys.right.isDown - +this.cursorKeys.left.isDown;
    const ydir = +this.cursorKeys.down.isDown - +this.cursorKeys.up.isDown;

    return ((xdir ? (xdir === -1 ? 'left' : 'right') : '') +
      (ydir ? (ydir === -1 ? 'up' : 'down') : '')) as Direction;
  }
}
