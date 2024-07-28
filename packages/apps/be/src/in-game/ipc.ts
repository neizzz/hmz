// main-sever <-> in-game-server

import { GameOptions } from '.';

export enum IpcMessageType {
  REQUEST_INIT_GAME_INSTANCE = 'request-init-game-instance',
  COMPLETE_INIT_GAME_INSTANCE = 'complete-init-game-instance',
  END_GAME = 'end-game',
}

export type IpcMessage =
  | {
      type: IpcMessageType.REQUEST_INIT_GAME_INSTANCE;
      payload: GameOptions;
    }
  | {
      type: IpcMessageType.COMPLETE_INIT_GAME_INSTANCE;
      payload: {
        roomId: string;
        inGameUrl: string;
      };
    }
  | {
      type: IpcMessageType.END_GAME;
      payload: {
        roomId: string;
        /**
         * TODO:FIXME:
         * 승리팀, 골 정보, 어시스트 등..
         */
      };
    };
