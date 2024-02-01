import { Schema, type, MapSchema } from '@colyseus/schema';
import { Team } from '@shared/types';

export class PlayerState extends Schema {
  @type('string') name: string;
  @type('string') team: Team;
}

export class GameRoomState extends Schema {
  @type('string') hostSessionId?: string;
  @type({ map: PlayerState }) awaiters = new MapSchema<PlayerState>();
}
