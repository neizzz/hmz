import { Direction } from './index.ts';

export const enum RoomType {
  WAITING_ROOM = 'waiting-room',
  GAME_ROOM = 'game-room',
}

/** TODO: to, from message type 구분 */
export const enum WaitingRoomMessageType {
  CHANGE_ROOM = 'change-room',
  START_GAME = 'start-game',
}

export const enum GameRoomMessageType {
  ACTION = 'action',
}

export type Action<T, P extends Record<keyof T, any>> = {
  type: keyof T;
  payload: P[keyof T];
};

export const enum GameRoomActionType {
  DIRECTION = 'direction',
  SHOOT_START = 'shoot-start',
  SHOOT_END = 'shoot-end',
}

export type GameRoomActionPayload = {
  [GameRoomActionType.DIRECTION]: {
    direction: Direction;
  };
  [GameRoomActionType.SHOOT_START]: undefined;
  [GameRoomActionType.SHOOT_END]: undefined; // bidirection
};

export type GameRoomActionHandlers = {
  [K in keyof typeof GameRoomActionType]?: (
    payload: GameRoomActionPayload[(typeof GameRoomActionType)[K]]
  ) => void;
};

export type GameRoomAction =
  | {
      type: GameRoomActionType.DIRECTION;
      payload: GameRoomActionPayload[GameRoomActionType.DIRECTION];
    }
  | {
      type: GameRoomActionType.SHOOT_START;
      payload: undefined;
    }
  | {
      type: GameRoomActionType.SHOOT_END;
      payload: undefined;
    };
