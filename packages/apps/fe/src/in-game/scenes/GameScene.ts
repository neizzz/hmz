import { Ball } from '@in-game/entities/Ball';
import { Player } from '@in-game/entities/Player';
import { BallState, GameRoomState, PlayerState } from '@schema';
import {
  Direction,
  GameRoomActionType,
  GameRoomMessageType,
  HmzMapInfo,
} from '@shared/types';
import { Room } from 'colyseus.js';
import Phaser from 'phaser';
import { MapBuilder } from '@utils/map/builder';
import { Color } from '@constants';

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

  init({ room, map }: GameSceneInitParams) {
    this.room = room;
    this.me = room.sessionId;
    this.mapBuilder = new MapBuilder(this, map);
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  preload() {
    console.log('[GameScene] preload');

    this.mapBuilder.loadAssets();
    Player.generateTexture(this, { key: 'red:player', color: Color.RED_TEAM });
    Player.generateTexture(this, {
      key: 'blue:player',
      color: Color.BLUE_TEAM,
    });
    Player.generateShootTexture(this, {
      key: 'red:player-shoot',
      color: Color.RED_TEAM,
    });
    Player.generateShootTexture(this, {
      key: 'blue:player-shoot',
      color: Color.BLUE_TEAM,
    });
    Player.generateShootAreaTexture(this);
    Ball.generateTexture(this);
  }

  create() {
    console.log('[GameScene] create');

    this.mapBuilder.build();
    this.initStateChangedEvents();

    this.input.keyboard.on('keydown-SPACE', event => {
      this.room.send(GameRoomMessageType.ACTION, {
        type: GameRoomActionType.SHOOT_START,
      });
    });
    this.input.keyboard.on('keyup-SPACE', event => {
      this.room.send(GameRoomMessageType.ACTION, {
        type: GameRoomActionType.SHOOT_END,
      });
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

  private initStateChangedEvents(): void {
    this.room.state.listen('ball', (state: BallState) => {
      const { x, y, radius } = state;
      this.ballSprite = this.matter.add.circle(x, y, radius);
      this.ball = new Ball(this, { state });
    });

    this.room.state.players.onAdd((state: PlayerState, id) => {
      const { x, y, radius } = state;
      this.playerSprites[id] = this.matter.add.circle(x, y, radius);
      this.players[id] = new Player(this, { state, me: id === this.me });
    });

    // TODO: player remove

    this.room.onStateChange(this.updateFromState);
  }

  private updateFromState = (state: GameRoomState) => {
    state.players.forEach((player, id) => {
      const playerSprite = this.playerSprites[id];
      playerSprite.position.x = player.x;
      playerSprite.position.y = player.y;

      const playerContainer = this.players[id];
      playerContainer.x = player.x;
      playerContainer.y = player.y;
      player.shooting ? playerContainer.shooting() : playerContainer.idle();
    });

    this.ballSprite.position.x = state.ball.x;
    this.ballSprite.position.y = state.ball.y;
    this.ball.x = state.ball.x;
    this.ball.y = state.ball.y;
  };

  private getDirectionFromInput(): Direction {
    const xdir = +this.cursorKeys.right.isDown - +this.cursorKeys.left.isDown;
    const ydir = +this.cursorKeys.down.isDown - +this.cursorKeys.up.isDown;

    return ((xdir ? (xdir === -1 ? 'left' : 'right') : '') +
      (ydir ? (ydir === -1 ? 'up' : 'down') : '')) as Direction;
  }
}
