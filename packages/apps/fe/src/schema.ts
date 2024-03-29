import { MapSchema } from '@colyseus/schema';
import { PlayerEntityState, Position, Team } from '@shared/types';
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
  public team!: Team;
}

export class PlayerState {
  public name!: string;
  public team!: Team;
  public kickoffX: number;
  public kickoffY: number;
  public positionHistories: string[];
  public radius!: number;
  public entityState!: PlayerEntityState;
}

export class BallState {
  public kickoffX: number;
  public kickoffY: number;
  public positionHistories: string[];
  public radius!: number;
}
