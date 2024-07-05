import type { HmzMapInfo, Team } from '..';

export const enum WaitingRoomMessageType {
  CHANGE_TEAM = 'change-team',
  START_GAME = 'start-game',
}

/** client -> server */
export type WaitingRoomMessageUpstreamPayload = {
  [WaitingRoomMessageType.CHANGE_TEAM]: {
    to: Team;
  };
  /** host 전용 */
  [WaitingRoomMessageType.START_GAME]: {
    map: HmzMapInfo;
  };
};

/** server -> client */
export type WaitingRoomMessageDownstreamPayload = {
  [WaitingRoomMessageType.CHANGE_TEAM]: {
    players: Record<string, unknown>;
  };
  [WaitingRoomMessageType.START_GAME]: {
    map: HmzMapInfo;
    inGameUrl: string;
  };
};
