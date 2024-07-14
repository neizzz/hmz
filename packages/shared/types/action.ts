import { Direction } from './index';

export type Action<T extends string, P extends Record<T, any>> = {
  type: T;
  payload: P[T];
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

// export type GameRoomActionHandlers = {
//   [K in keyof typeof GameRoomActionType]?: (
//     payload: GameRoomActionPayload[(typeof GameRoomActionType)[K]]
//   ) => void;
// };

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
