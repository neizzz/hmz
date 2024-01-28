import { Schema, MapSchema, type } from '@colyseus/schema';
import { Team } from '@shared/type';

export class AwaiterState extends Schema {
  @type('string') name: string;
  @type('string') team: Team;
}

export class WaitingRoomState extends Schema {
  @type('string') hostSessionId?: string;
  @type({ map: AwaiterState }) awaiters = new MapSchema<AwaiterState>();
}
