import type { HmzMapInfo, InitialPlayerState } from '@shared/types';

import { IpcMessageType, type IpcMessage } from '@in-game/ipc';
import { getPidsExceptMe, sendMessage } from '@utils/ipc';

type InGameConnectionInfo = {
  pid: number;
  inGameUrl?: string;
  onInitGame: (inGameUrl: string) => void;
  // TODO:
  // state?:
  // onEndEnd:
};

class InGameProcessManageService {
  private _pids: number[];
  private _roomId2inGameConnInfo: Record<
    string /** WaitingRoomId */,
    InGameConnectionInfo
  > = {};

  constructor() {
    getPidsExceptMe().then(pids => {
      this._pids = pids;
      console.log('pids:', pids);
    });
    process.on('message', this._onMessage);
  }

  startGame(
    waitingRoomId: string,
    options: {
      players: Record<string, InitialPlayerState>;
      map: HmzMapInfo;
      onInitGame: (inGameUrl: string) => void;
      // TODO:
      // onEndGame
      // onExitGame?: () => void;
    }
  ) {
    const { players, map, onInitGame } = options;
    const pid = this._pids[0]; //TODO:FIXME: load balancing
    sendMessage(pid, {
      type: IpcMessageType.REQUEST_INIT_GAME_INSTANCE,
      payload: {
        roomId: waitingRoomId,
        players,
        map,
      },
    });

    this._roomId2inGameConnInfo[waitingRoomId] = {
      pid,
      inGameUrl: undefined,
      onInitGame,
    };
  }

  // from in-game
  private _onMessage = ({ data }: { data: IpcMessage }) => {
    const { type, payload } = data;
    const gameConnInfo = this._roomId2inGameConnInfo[payload.roomId];
    switch (type) {
      case IpcMessageType.COMPLETE_INIT_GAME_INSTANCE:
        gameConnInfo.inGameUrl = payload.inGameUrl;
        gameConnInfo.onInitGame(payload.inGameUrl);
        break;
      case IpcMessageType.END_GAME:
        // TODO:
        break;
    }
  };

  // getPid(waitingRoomId: string): number {
  //   return this._waitingRoom2Pid[waitingRoomId];
  // }
  // killProcess(waitingRoomId: string) {
  //   this._waitingRoom2PmId[waitingRoomId].kill();
  //   delete this._waitingRoom2PmId[waitingRoomId];
  // }
}

export default new InGameProcessManageService();
