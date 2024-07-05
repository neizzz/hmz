import type { Message } from './common';
import { Team, type Direction } from '../index';

export const enum GameSystemMessageType {
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
export type GameSystemMessagePayload = {
  [GameSystemMessageType.USER_READY_TO_KICKOFF]: undefined;
  [GameSystemMessageType.USER_ACTION]: GameUserAction;
  [GameSystemMessageType.GOAL]: {
    team: Team;
    redTeamScore: number;
    blueTeamScore: number;
  };
  [GameSystemMessageType.SHOOT]: undefined;
  [GameSystemMessageType.KICKOFF]: undefined;
  [GameSystemMessageType.TIMESTAMP]: { timestamp: number };
  [GameSystemMessageType.END]: { victoryTeam: Team };
  [GameSystemMessageType.DISPOSE]: undefined;
};

export const enum GameUserActionType {
  DIRECTION = 'direction',
  SHOOT_START = 'shoot-start',
  SHOOT_END = 'shoot-end',
}
export type GameUserActionPayload = {
  [GameUserActionType.DIRECTION]: {
    direction: Direction;
  };
  [GameUserActionType.SHOOT_START]: undefined;
  [GameUserActionType.SHOOT_END]: undefined; // bidirection
};
export type GameUserAction = Message<GameUserActionType, GameUserActionPayload>;
// export type GameActionHandlers = {
//   [K in keyof typeof GameActionMessageType]?: (
//     payload: GameActionPayload[(typeof GameActionMessageType)[K]]
//   ) => void;
// };

// | {
//     type: GameActionMessageType.DIRECTION;
//     payload: GameActionMessagePayload[GameActionMessageType.DIRECTION];
//   }
// | {
//     type: GameActionMessageType.SHOOT_START;
//     payload: undefined;
//   }
// | {
//     type: GameActionMessageType.SHOOT_END;
//     payload: undefined;
//   };
