import { Schema, type, MapSchema } from '@colyseus/schema';
import { Direction, GameState, PlayerEntityState, Team } from '@shared/types';

export class PlayerState extends Schema {
  static SPEED_LIMIT = 3.2; // pixel per step
  static SHOOTING_SPEED_LIMIT = 2.8; // pixel per step
  static ACCELERATION = 0.03; // speed per step
  static SHOOTING_ACCLERATION = 0.025; // speed per step
  static FRICTION = 0.004; // rate per step

  accelX: number = 0;
  accelY: number = 0;
  index: number;

  @type('string') name: string;
  @type('string') team: Team;
  @type('number') x = 0;
  @type('number') y = 0;
  @type('number') radius = 32;
  @type('number') entityState: PlayerEntityState = PlayerEntityState.IDLE;

  accelrate(direction: Direction): [number, number] {
    const acceleration =
      this.entityState === PlayerEntityState.SHOOTING
        ? PlayerState.SHOOTING_ACCLERATION
        : PlayerState.ACCELERATION;

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
  @type('number') radius: number = 19;
}

export class GameRoomState extends Schema {
  redTeamScore = 0;
  blueTeamScore = 0;

  @type('number') state: GameState = GameState.KICK_OFF;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type(BallState) ball: BallState;

  createPlayer(sessionId: string, state: PlayerState): void {
    this.players.set(sessionId, state);
  }

  removePlayer(sessionId: string): void {
    // TODO:
  }
}
