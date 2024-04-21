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
import StartCounter from '@in-game/effects/StartCounter';
import GameStateQueue from '@utils/GameStateQueue';

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

  stateQueue = new GameStateQueue({
    onLerp: (a: GameRoomState, b: GameRoomState): GameRoomState => {
      // TODO:
    },
  });
  fixedUpdate = this.generateFixedUpdator();

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
      this.room.send(GameRoomMessageType.USER_ACTION, {
        type: GameRoomActionType.SHOOT_START,
      });
    });
    this.input.keyboard.on('keyup-SPACE', event => {
      this.room.send(GameRoomMessageType.USER_ACTION, {
        type: GameRoomActionType.SHOOT_END,
      });
    });
  }

  update(time: number, delta: number): void {
    const state = this.stateQueue.popForRender();

    if (state) {
      Object.values(this.players).forEach(player => player.update());
      this.ball.update();
      this.syncTo(state);
    }

    // 30hz
    this.fixedUpdate(time, delta);
  }

  private generateFixedUpdator() {
    let elapsedTime = 0;
    const FIXED_TIME_STEP = 1000 / 30; // ms/hz

    const fixedTick = () => {
      this.room.send(GameRoomMessageType.USER_ACTION, {
        type: GameRoomActionType.DIRECTION,
        payload: {
          direction: this.getDirectionFromInput(),
        },
      });
    };

    return (time, delta) => {
      elapsedTime += delta;
      while (elapsedTime >= FIXED_TIME_STEP) {
        elapsedTime -= FIXED_TIME_STEP;
        fixedTick();
      }
    };
  }

  private initEffectEvents(): void {
    const shootAudio = this.sound.add('kick');
    const whistleAudio = this.sound.add('whistle');
    const croudScoreAudio = this.sound.add('crowd-score');
    // TODO: const hitGoalpost = this.sound.add('hit-goalpost');

    this.room.onMessage<GameRoomMessageType>(
      GameRoomMessageType.READY_TO_START,
      () => {
        new StartCounter(this).startFrom(3, () => {
          this.room.send(GameRoomMessageType.USER_READY_TO_KICKOFF);
        });
      }
    );

    this.room.onMessage<GameRoomAction>(GameRoomMessageType.SHOOT, () => {
      shootAudio.play();
    });
    this.room.onMessage<GameRoomAction>(GameRoomMessageType.GOAL, () => {
      croudScoreAudio.play(undefined);
    });
    this.room.onMessage<GameRoomAction>(GameRoomMessageType.KICKOFF, () => {
      whistleAudio.play();
    });
  }

  private initStateChangedEvents(): void {
    this.room.state.listen('ball', (state: BallState) => {
      this.ball = new Ball(this, { state });
    });

    this.room.state.players.onAdd((state: PlayerState, id) => {
      this.players[id] = new Player(this, { state, me: id === this.me });
    });

    // TODO: player remove

    this.room.onStateChange((state: GameRoomState) => {
      this.stateQueue.pushFromServer(state);
    });
  }

  private syncTo = (state: GameRoomState) => {
    state.players.forEach((playerServerState, id) => {
      this.players[id].syncTo(playerServerState, id === this.me);
    });

    this.ball.syncTo(state.ball);
  };

  private getDirectionFromInput(): Direction {
    const xdir = +this.cursorKeys.right.isDown - +this.cursorKeys.left.isDown;
    const ydir = +this.cursorKeys.down.isDown - +this.cursorKeys.up.isDown;

    return ((xdir ? (xdir === -1 ? 'left' : 'right') : '') +
      (ydir ? (ydir === -1 ? 'up' : 'down') : '')) as Direction;
  }
}
