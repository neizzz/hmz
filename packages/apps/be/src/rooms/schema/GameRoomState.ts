import { Schema, type, MapSchema } from '@colyseus/schema';
import {
  Direction,
  GameRoomActionPayload,
  GameRoomActionType,
  Team,
} from '@shared/types';

export class PlayerState extends Schema {
  static MAX_SPEED = 0.1; // pixel per millisec
  static ACCELERATION = 0.08; // speed per millisec
  static FRICTION = -0.08; // speed per millisec

  accelX: number = 0;
  accelY: number = 0;
  velocityX: number = 0;
  velocityY: number = 0;

  @type('string') name: string;
  @type('string') team: Team;
  @type('number') x: number = 0;
  @type('number') y: number = 0;

  accelrate(direction: Direction) {
    switch (direction) {
      case 'left':
        this.accelX = -PlayerState.ACCELERATION;
        this.accelY = 0;
        break;
      case 'right':
        this.accelX = PlayerState.ACCELERATION;
        this.accelY = 0;
        break;
      case 'up':
        this.accelX = 0;
        this.accelY = -PlayerState.ACCELERATION;
        break;
      case 'down':
        this.accelX = 0;
        this.accelY = PlayerState.ACCELERATION;
        break;
      case 'leftup':
        this.accelX = -Math.sqrt(PlayerState.ACCELERATION / 2);
        this.accelY = -Math.sqrt(PlayerState.ACCELERATION / 2);
        break;
      case 'leftdown':
        this.accelX = -Math.sqrt(PlayerState.ACCELERATION / 2);
        this.accelY = Math.sqrt(PlayerState.ACCELERATION / 2);
        break;
      case 'rightup':
        this.accelX = Math.sqrt(PlayerState.ACCELERATION / 2);
        this.accelY = -Math.sqrt(PlayerState.ACCELERATION / 2);
        break;
      case 'rightdown':
        this.accelX = Math.sqrt(PlayerState.ACCELERATION / 2);
        this.accelY = Math.sqrt(PlayerState.ACCELERATION / 2);
        break;
    }
  }

  update(delta: number) {
    console.log(delta);
    this.velocityX = this.clampVelocity(this.velocityX + this.accelX * delta);
    this.velocityY = this.clampVelocity(this.velocityY + this.accelY * delta);
    this.x += this.velocityX * delta;
    this.y += this.velocityY * delta;
  }

  private clampVelocity(velocity: number) {
    return (
      Math.sign(velocity) * Math.min(PlayerState.MAX_SPEED, Math.abs(velocity))
    );
  }
}

export class GameRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();

  acceleratePlayer(
    sessionId: string,
    payload: GameRoomActionPayload[GameRoomActionType.DIRECTION]
  ) {
    this.players.get(sessionId)?.accelrate(payload.direction);
  }

  update(delta: number) {
    this.players.forEach(player => {
      player.update(delta);
    });
  }
}
