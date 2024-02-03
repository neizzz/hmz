import { Schema, type, MapSchema } from '@colyseus/schema';
import {
  Direction,
  GameRoomActionPayload,
  GameRoomActionType,
  Team,
} from '@shared/types';

export class PlayerState extends Schema {
  static MAX_SPEED = 0.22; // pixel per millisec
  static ACCELERATION = 0.001; // speed per millisec
  static FRICTION = 0.001; // rate

  accelX: number = 0;
  accelY: number = 0;
  velocityX: number = 0;
  velocityY: number = 0;

  @type('string') name: string;
  @type('string') team: Team;
  @type('number') x: number = 0;
  @type('number') y: number = 0;

  accelrate(direction: Direction) {
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
  }

  update(delta: number) {
    const friction = PlayerState.FRICTION;
    this.accelX
      ? (this.velocityX = this.clampVelocity(
          this.velocityX + this.accelX * delta
        ))
      : (this.velocityX -= this.velocityX * friction * delta);
    this.accelY
      ? (this.velocityY = this.clampVelocity(
          this.velocityY + this.accelY * delta
        ))
      : (this.velocityY -= this.velocityY * friction * delta);

    const maxSpeed = PlayerState.MAX_SPEED;
    const speed = Math.sqrt(
      this.velocityX * this.velocityX + this.velocityY * this.velocityY
    );
    const overSpeedRatio = speed / maxSpeed;
    if (overSpeedRatio > 1) {
      const ajustmentRate = overSpeedRatio;
      this.velocityX /= ajustmentRate;
      this.velocityY /= ajustmentRate;
    }

    this.x += this.velocityX * delta;
    this.y += this.velocityY * delta;
  }

  private clampVelocity(velocity: number) {
    const maxSpeed = PlayerState.MAX_SPEED;
    return Math.sign(velocity) * Math.min(maxSpeed, Math.abs(velocity));
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
