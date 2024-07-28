import { Team, type Direction, type GameSceneState } from '../index';

export type GameSystemMessage =
  // | {
  //     type: GameSystemMessageType.USER_ENTRANCE;
  //     payload: GameSystemMessagePayload[GameSystemMessageType.USER_ENTRANCE];
  //   }
  | {
      type: GameSystemMessageType.SCENE_UPDATE;
      payload: GameSystemMessagePayload[GameSystemMessageType.SCENE_UPDATE];
    }
  | {
      type: GameSystemMessageType.USER_ACTION;
      payload: GameSystemMessagePayload[GameSystemMessageType.USER_ACTION];
    }
  | {
      type: GameSystemMessageType.GOAL;
      payload: GameSystemMessagePayload[GameSystemMessageType.GOAL];
    }
  | {
      type: GameSystemMessageType.USER_READY_TO_KICKOFF;
      payload: GameSystemMessagePayload[GameSystemMessageType.USER_READY_TO_KICKOFF];
    }
  | {
      type: GameSystemMessageType.READY_TO_START;
      payload: GameSystemMessagePayload[GameSystemMessageType.READY_TO_START];
    }
  | {
      type: GameSystemMessageType.KICKOFF;
      payload: GameSystemMessagePayload[GameSystemMessageType.KICKOFF];
    }
  | {
      type: GameSystemMessageType.END;
      payload: GameSystemMessagePayload[GameSystemMessageType.END];
    };
export const enum GameSystemMessageType {
  USER_READY_TO_KICKOFF = 'user-ready-to-kickoff',
  // USER_EXIT
  SCENE_UPDATE = 'scene-update',
  // USER_ENTRANCE = 'user-entrance',
  USER_ACTION = 'user-action',
  SHOOT = 'shoot',
  GOAL = 'goal',
  READY_TO_START = 'ready-to-start',
  KICKOFF = 'kickoff',
  END = 'end',
}
export type GameSystemMessagePayload = {
  // [GameSystemMessageType.USER_ENTRANCE]: {
  //   /** same to waiting room id */
  //   // roomId: string;
  //   /** player's id */
  //   id: string;
  // };
  [GameSystemMessageType.SCENE_UPDATE]: {
    state: GameSceneState;
  };
  [GameSystemMessageType.USER_ACTION]: GameUserAction;
  [GameSystemMessageType.SHOOT]: undefined;
  [GameSystemMessageType.GOAL]: {
    // goalerId: string; // TODO:
    team: Team;
    redTeamScore: number;
    blueTeamScore: number;
  };
  [GameSystemMessageType.READY_TO_START]: undefined;
  [GameSystemMessageType.USER_READY_TO_KICKOFF]: undefined;
  [GameSystemMessageType.KICKOFF]: undefined;
  [GameSystemMessageType.END]: { victoryTeam: Team };
};

export type GameUserAction =
  | {
      type: GameUserActionType.CHANGE_DIRECTION;
      payload: GameUserActionPayload[GameUserActionType.CHANGE_DIRECTION];
    }
  | {
      type: GameUserActionType.SHOOT_START;
      payload: GameUserActionPayload[GameUserActionType.SHOOT_START];
    }
  | {
      type: GameUserActionType.SHOOT_END;
      payload: GameUserActionPayload[GameUserActionType.SHOOT_END];
    };

export const enum GameUserActionType {
  CHANGE_DIRECTION = 'change-direction',
  SHOOT_START = 'shoot-start',
  SHOOT_END = 'shoot-end',
}
export type GameUserActionPayload = {
  [GameUserActionType.CHANGE_DIRECTION]: {
    id: string;
    direction: Direction;
  };
  [GameUserActionType.SHOOT_START]: {
    id: string;
  };
  [GameUserActionType.SHOOT_END]: { id: string }; // bidirection
};
