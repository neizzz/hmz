import { Schema, type, MapSchema } from '@colyseus/schema';
import {
  Direction,
  GameRoomActionPayload,
  GameRoomActionType,
  Team,
} from '@shared/types';

export class PlayerState extends Schema {
  static SPEED_LIMIT = 2.8; // pixel per step
  static ACCELERATION = 0.12; // speed per step
  static FRICTION = 0.04; // rate per step

  accelX: number = 0;
  accelY: number = 0;

  @type('string') name: string;
  @type('string') team: Team;
  @type('number') x: number;
  @type('number') y: number;
  @type('number') radius: number = 26;

  accelrate(direction: Direction): [number, number] {
    const acceleration = PlayerState.ACCELERATION;

    switch (direction) {
      case '':
        this.accelX = 0;
        this.accelY = 0;
        break;
      case 'left':
        this.accelX = -acceleration;
        this.accelY = 0;
        break;
      case 'right':
        this.accelX = acceleration;
        this.accelY = 0;
        break;
      case 'up':
        this.accelX = 0;
        this.accelY = -acceleration;
        break;
      case 'down':
        this.accelX = 0;
        this.accelY = acceleration;
        break;
      case 'leftup':
        this.accelX = -acceleration * Math.SQRT1_2;
        this.accelY = -acceleration * Math.SQRT1_2;
        break;
      case 'leftdown':
        this.accelX = -acceleration * Math.SQRT1_2;
        this.accelY = acceleration * Math.SQRT1_2;
        break;
      case 'rightup':
        this.accelX = acceleration * Math.SQRT1_2;
        this.accelY = -acceleration * Math.SQRT1_2;
        break;
      case 'rightdown':
        this.accelX = acceleration * Math.SQRT1_2;
        this.accelY = acceleration * Math.SQRT1_2;
        break;
    }

    return [this.accelX, this.accelY];
  }
}

export class BallState extends Schema {
  @type('number') x: number;
  @type('number') y: number;
  @type('number') radius: number = 17;
}

export class GameRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type(BallState) ball: BallState;

  createPlayer(sessionId: string, state: PlayerState): void {
    this.players.set(sessionId, state);
  }

  removePlayer(sessionId: string): void {
    // TODO:
  }

  acceleratePlayer(
    sessionId: string,
    payload: GameRoomActionPayload[GameRoomActionType.DIRECTION]
  ) {
    this.players.get(sessionId)?.accelrate(payload.direction);
  }
}
