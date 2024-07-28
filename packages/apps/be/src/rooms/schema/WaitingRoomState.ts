import { Schema, MapSchema, type } from '@colyseus/schema';
import { Team } from '@shared/types';

export class WaitingRoomPlayerState extends Schema {
  @type('string') name: string;
  @type('string') team: Team;
}

export class WaitingRoomState extends Schema {
  @type('string') hostSessionId: string;
  @type({ map: WaitingRoomPlayerState }) players =
    new MapSchema<WaitingRoomPlayerState>();
}
