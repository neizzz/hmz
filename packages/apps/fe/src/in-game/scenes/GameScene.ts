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
  ball: Ball;
  players: { [sessionId: string]: Player } = {};
  playerSprites: { [sessionId: string]: MatterJS.BodyType } = {}; // FIXME: just for debug
  ballSprite: MatterJS.BodyType; // FIXME: just for debug

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
    Player.generateShootTexture(this);
    Player.generateShootAreaTexture(this);
    Ball.generateTexture(this);
  }

  create() {
    console.log('[GameScene] create');

    this.mapBuilder.build();

    this.room.state.listen('ball', ({ x, y, radius }) => {
      this.ballSprite = this.matter.add.circle(x, y, radius);
      this.ball = new Ball(this, { x, y });
    });

    this.room.state.players.onAdd(({ x, y, radius }, id) => {
      this.playerSprites[id] = this.matter.add.circle(x, y, radius);
      this.players[id] = new Player(this, { x, y, me: id === this.me });
    });

    this.room.onStateChange((state: GameRoomState) => {
      state.players.forEach((player, id) => {
        const playerSprite = this.playerSprites[id];
        playerSprite.position.x = player.x;
        playerSprite.position.y = player.y;

        const playerContainer = this.players[id];
        playerContainer.x = player.x;
        playerContainer.y = player.y;
      });

      this.ballSprite.position.x = state.ball.x;
      this.ballSprite.position.y = state.ball.y;
      this.ball.x = state.ball.x;
      this.ball.y = state.ball.y;
    });

    this.input.keyboard.on('keydown-SPACE', event => {
      this.players[this.me].shooting();
    });

    this.input.keyboard.on('keyup-SPACE', event => {
      this.players[this.me].idle();
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

  private getDirectionFromInput(): Direction {
    const xdir = +this.cursorKeys.right.isDown - +this.cursorKeys.left.isDown;
    const ydir = +this.cursorKeys.down.isDown - +this.cursorKeys.up.isDown;

    return ((xdir ? (xdir === -1 ? 'left' : 'right') : '') +
      (ydir ? (ydir === -1 ? 'up' : 'down') : '')) as Direction;
  }
}
