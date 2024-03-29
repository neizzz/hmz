import { Ball } from '@in-game/entities/Ball';
import { Player } from '@in-game/entities/Player';
import { BallState, GameRoomState, PlayerState } from '@schema';
import {
  Direction,
  GameRoomAction,
  GameRoomActionType,
  GameRoomMessageType,
  HmzMapInfo,
} from '@shared/types';
import { Room } from 'colyseus.js';
import Phaser from 'phaser';
import { MapBuilder } from '@utils/map/builder';
import { Color } from '@constants';

// FIXME:
const testQ = [];
let testQSizes = {};
// const testEl = document.getElementById('test');
// testEl.style.position = 'absolute';
// testEl.style.top = '40%';
// testEl.style.left = '40%';
// testEl.style.zIndex = '999';

export type GameSceneInitParams = {
  observer?: boolean;
  map: HmzMapInfo;
  room: Room;
};

export class GameScene extends Phaser.Scene {
  observer?: boolean;
  room: Room;
  me: string; // session id
  mapBuilder: MapBuilder;
  ball: Ball;
  players: { [sessionId: string]: Player } = {};
  // playerSprites: { [sessionId: string]: MatterJS.BodyType } = {}; // FIXME: just for debug
  // ballSprite: MatterJS.BodyType; // FIXME: just for debug

  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('game-scene');
  }

  init({ room, map, observer }: GameSceneInitParams) {
    this.observer = observer; // TODO:
    this.room = room;
    this.me = room.sessionId;
    this.mapBuilder = new MapBuilder(this, map);
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  preload() {
    console.log('[GameScene] preload');

    this.load.audio('kick', '/assets/sounds/kick.mp3');
    this.load.audio('whistle', '/assets/sounds/whistle.wav');
    this.load.audio('crowd-score', '/assets/sounds/crowd-score.mp3');
    this.load.audio('hit-goalpost', '/assets/sounds/hit-goalpost.mp3');

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
    this.initEffectEvents();

    this.room.onMessage(GameRoomMessageType.DISPOSE, () => {
      this.game.destroy(true);
    });

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

  private elapsedTime = 0;
  // private fixedTimeStep = 1000 / 60;
  private fixedTimeStep = 1000 / 60;
  update(time: number, delta: number): void {
    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick(time, this.fixedTimeStep);
    }
  }

  private fixedTick(time: number, delta: number): void {
    this.room.send(GameRoomMessageType.ACTION, {
      type: GameRoomActionType.DIRECTION,
      payload: {
        direction: this.getDirectionFromInput(),
      },
    });

    Object.values(this.players).forEach(player => player.update());
    this.ball.update();

    //// test
    const testQSize = testQ.length;
    if (testQSizes[testQSize] === undefined) {
      testQSizes[testQSize] = 1;
    } else {
      testQSizes[testQSize]++;
    }
    // testEl.innerHTML = `${JSON.stringify(testQSizes)}`;
    const state = testQ.pop();
    if (!state) return;
    this.syncWithServer(state);
    testQ.length = 0;
    //////
  }

  private initEffectEvents(): void {
    const shootAudio = this.sound.add('kick');
    const whistleAudio = this.sound.add('whistle');
    const croudScoreAudio = this.sound.add('crowd-score');
    const hitGoalpost = this.sound.add('hit-goalpost'); // TODO:

    this.room.onMessage<GameRoomAction>(GameRoomMessageType.SHOOT, () => {
      shootAudio.play();
    });
    this.room.onMessage<GameRoomAction>(GameRoomMessageType.GOAL, () => {
      croudScoreAudio.play(undefined);
    });
    this.room.onMessage<GameRoomAction>(GameRoomMessageType.KICK_OFF, () => {
      whistleAudio.play();
      Object.values(this.players).forEach(player => {
        player.reset();
      });
      this.ball.reset();
    });
  }

  private initStateChangedEvents(): void {
    this.room.state.listen('ball', (state: BallState) => {
      // const { x, y, radius } = state;
      // this.ballSprite = this.matter.add.circle(x, y, radius);
      this.ball = new Ball(this, { state });
    });

    this.room.state.players.onAdd((state: PlayerState, id) => {
      // const { x, y, radius } = state;
      // this.playerSprites[id] = this.matter.add.circle(x, y, radius);
      this.players[id] = new Player(this, { state, me: id === this.me });
    });

    // TODO: player remove

    this.room.onStateChange((state: GameRoomState) => {
      testQ.push(state);
    });
  }

  private syncWithServer = (state: GameRoomState) => {
    state.players.forEach((playerServerState, id) => {
      this.players[id].syncWithServer(playerServerState, id === this.me);
    });

    this.ball.syncWithServer(state.ball);
  };

  private getDirectionFromInput(): Direction {
    const xdir = +this.cursorKeys.right.isDown - +this.cursorKeys.left.isDown;
    const ydir = +this.cursorKeys.down.isDown - +this.cursorKeys.up.isDown;

    return ((xdir ? (xdir === -1 ? 'left' : 'right') : '') +
      (ydir ? (ydir === -1 ? 'up' : 'down') : '')) as Direction;
  }
}
