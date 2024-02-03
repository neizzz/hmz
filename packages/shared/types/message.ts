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
  // SHOOT = 'shoot',
}

export type GameRoomActionPayload = {
  [GameRoomActionType.DIRECTION]: {
    direction: Direction;
  };
  // [GameRoomActionType.SHOOT]: undefined;
};
