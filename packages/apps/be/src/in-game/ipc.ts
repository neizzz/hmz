export enum IpcMessageType {
  INIT_SERVER = 'init-server',
  END_GAME = 'end-game',
}

export type IpcMessage =
  | {
      type: IpcMessageType.INIT_SERVER;
      payload: {
        inGameUrl: string;
      };
    }
  | {
      type: IpcMessageType.END_GAME;
      payload: {
        /**
         * TODO:FIXME:
         * 승리팀, 골 정보, 어시스트 등..
         */
        test: 'test';
      };
    };
