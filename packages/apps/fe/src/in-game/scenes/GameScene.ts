import InGameConnection from '@in-game/InGameConnection';
import { Ball } from '@in-game/entities/Ball';
import { Player } from '@in-game/entities/Player';
import {
  BallState,
  Direction,
  GameSceneState,
  GameSystemMessageType,
  GameUserAction,
  GameUserActionType,
  HmzMapInfo,
  PlayerState,
} from '@shared/types';
import Phaser from 'phaser';
import { MapBuilder } from '@utils/map/builder';
import { Color } from '@constants';
import StartCounter from '@in-game/effects/StartCounter';

export type GameSceneInitParams = {
  myId: string;
  connection: InGameConnection;
  observer?: boolean;
  map: HmzMapInfo;
  // inGameHost: string;
};

export class GameScene extends Phaser.Scene {
  observer?: boolean;

  // me: string; // session id
  _myId: string;
  mapBuilder: MapBuilder;
  ball: Ball;
  players: { [sessionId: string]: Player } = {};
  // playerSprites: { [sessionId: string]: MatterJS.BodyType } = {}; // FIXME: just for debug
  // ballSprite: MatterJS.BodyType; // FIXME: just for debug

  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  // fixedUpdate = this._generateFixedUpdator();

  private _connection: InGameConnection;

  constructor() {
    super('game-scene');
  }

  init({ myId, connection, map, observer }: GameSceneInitParams) {
    this._myId = myId;
    this._connection = connection;
    this.observer = observer; // TODO:
    // this.room = room;
    // this.me = room.sessionId;
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
    // this._initStateChangedEvents();
    this._initEffectEvents();

    this.input.keyboard.on('keydown-SPACE', event => {
      this._connection.send(GameSystemMessageType.USER_ACTION, {
        type: GameUserActionType.SHOOT_START,
        payload: { id: this._myId },
      });
    });
    this.input.keyboard.on('keyup-SPACE', event => {
      this._connection.send(GameSystemMessageType.USER_ACTION, {
        type: GameUserActionType.SHOOT_END,
        payload: { id: this._myId },
      });
    });
    this.input.keyboard.on('keydown-RIGHT', this._handleMove);
    this.input.keyboard.on('keyup-RIGHT', this._handleMove);
    this.input.keyboard.on('keydown-LEFT', this._handleMove);
    this.input.keyboard.on('keyup-LEFT', this._handleMove);
    this.input.keyboard.on('keydown-UP', this._handleMove);
    this.input.keyboard.on('keyup-UP', this._handleMove);
    this.input.keyboard.on('keydown-DOWN', this._handleMove);
    this.input.keyboard.on('keyup-DOWN', this._handleMove);
  }

  update(delta: number): void {
    const state = this._connection.popGameSceneState();

    if (state) {
      this._syncTo(state);
    }

    // 30hz fixed user input 처리
    // this.fixedUpdate(delta);
  }

  // private _generateFixedUpdator() {
  //   let elapsedTime = 0;
  //   const FIXED_TIME_STEP = 1000 / 30; // ms/hz

  //   const fixedTick = () => {
  //     console.log('send!');
  //     this._connection.send(GameSystemMessageType.USER_ACTION, {
  //       type: GameUserActionType.DIRECTION,
  //       payload: {
  //         direction: this._getDirectionFromInput(),
  //       },
  //     });
  //   };

  //   return delta => {
  //     elapsedTime += delta;
  //     while (elapsedTime >= FIXED_TIME_STEP) {
  //       elapsedTime -= FIXED_TIME_STEP;
  //       console.log(delta);
  //       fixedTick();
  //     }
  //   };
  // }

  private _initEffectEvents(): void {
    const shootAudio = this.sound.add('kick');
    const whistleAudio = this.sound.add('whistle');
    const croudScoreAudio = this.sound.add('crowd-score');
    // TODO: const hitGoalpost = this.sound.add('hit-goalpost');

    // this.room.onMessage<GameSystemMessageType>(
    //   GameSystemMessageType.READY_TO_START,
    //   () => {
    //     new StartCounter(this).startFrom(3, () => {
    //       this.room.send(GameSystemMessageType.USER_READY_TO_KICKOFF);
    //     });
    //   }
    // );

    // this.room.onMessage<GameUserAction>(GameSystemMessageType.SHOOT, () => {
    //   shootAudio.play();
    // });
    // this.room.onMessage<GameUserAction>(GameSystemMessageType.GOAL, () => {
    //   croudScoreAudio.play(undefined);
    // });
    // this.room.onMessage<GameUserAction>(GameSystemMessageType.KICKOFF, () => {
    //   whistleAudio.play();
    // });
  }

  // private _initStateChangedEvents(): void {
  // this.room.state.listen('ball', (state: BallState) => {
  //   this.ball = new Ball(this, { state });
  // });
  // this.room.state.players.onAdd((state: PlayerState, id) => {
  //   this.players[id] = new Player(this, { state, me: id === this.me });
  // });
  // TODO: player remove
  // this.room.onStateChange((state: GameSceneState) => {
  //   const players: GameRenderState['players'] = [
  //     ...state.players.entries(),
  //   ].reduce((result, [id, playerServerState]) => {
  //     const {
  //       name,
  //       team,
  //       x,
  //       y,
  //       kickoffX,
  //       kickoffY,
  //       radius,
  //       entityState,
  //     }: PlayerState = playerServerState;
  //     result[id] = {
  //       name,
  //       team,
  //       x,
  //       y,
  //       kickoffX,
  //       kickoffY,
  //       radius,
  //       entityState,
  //     };
  //     return result;
  //   }, {});
  //   const { x, y, kickoffX, kickoffY, radius } = state.ball;
  //   const renderState: GameSceneState = {
  //     players,
  //     ball: { x, y, kickoffX, kickoffY, radius },
  //   };
  //   this.stateQueue.pushFromServer(renderState);
  // });
  // }

  private _syncTo = (state: GameSceneState) => {
    /**
     * FIXME:
     * 임시로 entity생성가지 여기서 하기는 함.
     * 따로 분리한다면 player join, exit 메시지를 추가해서 동기화해야할 것 같은데,
     * 더 복잡해질 수도 있음.
     */
    Object.entries(state.players).forEach(([id, playerState]) => {
      const me = id === this._myId;
      this.players[id]
        ? this.players[id].syncTo(playerState, me)
        : (this.players[id] = new Player(this, {
            state: playerState,
            me,
          }));
    });
    this.ball
      ? this.ball.syncTo(state.ball)
      : (this.ball = new Ball(this, {
          state: state.ball,
        }));
  };

  private _handleMove = () => {
    const direction = this._getDirectionFromInput();
    console.log(direction);
    this._connection.send(GameSystemMessageType.USER_ACTION, {
      type: GameUserActionType.CHANGE_DIRECTION,
      payload: { id: this._myId, direction },
    });
  };

  private _getDirectionFromInput(): Direction {
    const xdir = +this.cursorKeys.right.isDown - +this.cursorKeys.left.isDown;
    const ydir = +this.cursorKeys.down.isDown - +this.cursorKeys.up.isDown;

    return ((xdir ? (xdir === -1 ? 'left' : 'right') : '') +
      (ydir ? (ydir === -1 ? 'up' : 'down') : '')) as Direction;
  }
}
