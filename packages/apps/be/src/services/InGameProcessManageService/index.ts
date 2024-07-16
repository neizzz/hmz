import type { HmzMapInfo, InitialPlayerState } from '@shared/types';
import { ChildProcess, fork, spawnSync } from 'node:child_process';

import findFreePorts from 'find-free-ports';
import { IpcMessageType, type IpcMessage } from '@in-game/ipc';

const START_PORT = 40000;
const END_PORT = 50000;

class InGameProcessManageService {
  private _processMap: Record<string /** WaitingRoomId */, ChildProcess> = {};

  async spawnProcess(
    waitingRoomId: string,
    options: {
      players: Record<string, InitialPlayerState>;
      map: HmzMapInfo;
      onInit?: (inGameUrl: string) => void;
      onExit?: () => void;
      // onGameStart?: (proc: Subprocess) => {};
      // onGameEnd?: (proc: Subprocess) => {};
    }
  ): Promise<ChildProcess> {
    const [port] = await findFreePorts(1, {
      startPort: START_PORT,
      endPort: END_PORT,
    });

    const proc = fork('', {
      execArgv: [
        '--import',
        'tsx/esm',
        `${process.env.PWD}/${process.env.IN_GAME_PROCESS_PATH}`,
      ],
      // stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      // onExit: (proc, exitCode, signalCode, error) => {
      //   // exit handler
      //   console.log('process exit', exitCode, proc, error);
      //   delete this._processMap[waitingRoomId];
      //   options.onExit?.();
      // },
    }) as ChildProcess;

    proc.send(
      {
        PORT: port,
        INITIAL_PLAYERS: options.players,
        MAP: options.map,
      } /** typeof GAME_ENV (in InGameProcess.ts) */
    );
    proc.on('message', (message: IpcMessage) => {
      //FIXME:
      console.log('IPC:', message);

      switch (message.type) {
        case IpcMessageType.INIT_SERVER:
          options.onInit?.(message.payload.inGameUrl);
          break;
        case IpcMessageType.END_GAME:
          // TODO:
          break;
      }
    });

    this._processMap[waitingRoomId] = proc;
    return proc;
  }

  getProcess(waitingRoomId: string): ChildProcess | undefined {
    return this._processMap[waitingRoomId];
  }

  killProcess(waitingRoomId: string) {
    this._processMap[waitingRoomId].kill();
    delete this._processMap[waitingRoomId];
  }
}

export default new InGameProcessManageService();
