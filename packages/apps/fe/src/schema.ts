import { MapSchema } from '@colyseus/schema';
/** NOTE: sync to server schema */

export class GameRoomState {
  public players: MapSchema<PlayerState>;
  public ball: BallState;
}

export class WaitingRoomState {
  public hostSessionId!: string;
  public awaiters: MapSchema<AwaiterState>;
}

export class AwaiterState {
  public name!: string;
  public team!: string;
}

export class PlayerState {
  public name!: string;
  public team!: string;
  public x!: number;
  public y!: number;
  public radius!: number;
  public shooting!: boolean;
}

export class BallState {
  public x!: number;
  public y!: number;
  public radius!: number;
}
