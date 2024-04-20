import { Action, GameRoomActionPayload, GameRoomActionType } from './action.ts';
import { HmzMapInfo, Team } from './index.ts';

export const enum RoomType {
  WAITING_ROOM = 'waiting-room',
  GAME_ROOM = 'game-room',
}

export const enum ToWaitingRoomMessageType {
  CHANGE_TEAM = 'to-change-team',
  START_GAME = 'to-start-game',
}
export type ToWaitingRoomMessagePayload = {
  CHANGE_TEAM: {
    to: Team;
  };
  /** host 전용 */
  START_GAME: {
    roomId: string; // game room id for broadcast to non-host clients
    map: HmzMapInfo;
  };
};

export const enum FromWaitingRoomMessageType {
  CHANGE_TEAM = 'from-change-team',
  START_GAME = 'from-start-game',
}

export type FromWaitingRoomMessagePayload = {
  CHANGE_TEAM: {
    awatiers: Record<string, unknown>;
  };
  START_GAME: {
    roomId: string;
    map: HmzMapInfo;
  };
};

export const enum GameRoomMessageType {
  USER_READY_TO_KICKOFF = 'user-ready-to-kickoff',
  USER_ACTION = 'user-action',
  GOAL = 'goal',
  READY_TO_START = 'ready-to-start',
  KICKOFF = 'kickoff',
  SHOOT = 'shoot',
  TIMESTAMP = 'timestamp',
  END = 'end',
  DISPOSE = 'dispose',
}

export type GameRoomMessagePayload = {
  [GameRoomMessageType.USER_READY_TO_KICKOFF]: undefined;
  [GameRoomMessageType.USER_ACTION]: Action<
    GameRoomActionType,
    GameRoomActionPayload
  >;
  [GameRoomMessageType.GOAL]: {
    team: Team;
    redTeamScore: number;
    blueTeamScore: number;
  };
  [GameRoomMessageType.SHOOT]: undefined;
  [GameRoomMessageType.KICKOFF]: undefined;
  [GameRoomMessageType.TIMESTAMP]: { timestamp: number };
  [GameRoomMessageType.END]: { victoryTeam: Team };
  [GameRoomMessageType.DISPOSE]: undefined;
};
