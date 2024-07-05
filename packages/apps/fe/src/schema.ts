import { MapSchema } from '@colyseus/schema';
import { Team } from '@shared/types';
/** NOTE: sync to server schema */

export class WaitingRoomState {
  public hostSessionId!: string;
  public players: MapSchema<WaitingRoomPlayerState>;
}

export class WaitingRoomPlayerState {
  public name: string;
  public team: Team;
}

// export class GameRoomState {
//   public players: MapSchema<PlayerState>;
//   public ball: BallState;
// }

// export class PlayerState {
//   public name!: string;
//   public team!: Team;
// }
