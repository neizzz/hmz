import { MapSchema } from '@colyseus/schema';
/** NOTE: sync to server schema */

export class GameRoomState {
  // public players: { [sessionId: string]: PlayerState };
  public players: MapSchema<PlayerState>;
}

export class WaitingRoomState {
  public hostSessionId!: string;
  // public awaiters: { [sessionId: string]: AwaiterState };
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
}
