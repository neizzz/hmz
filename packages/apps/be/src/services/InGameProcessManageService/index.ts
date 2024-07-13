import type {
  HmzMapInfo,
  InitialPlayerState,
  PlayerState,
  Team,
} from '@shared/types';
import type { Subprocess } from 'bun';
import findFreePorts from 'find-free-ports';
import type { WaitingRoomPlayerState } from '../../rooms/schema/WaitingRoomState';
import { IpcMessageType, type IpcMessage } from '../../in-game/ipc';

const START_PORT = 40000;
const END_PORT = 50000;

class InGameProcessManageService {
  private _processMap: Record<
    string /** WaitingRoomId */,
    Subprocess<'ignore', 'pipe', 'inherit'>
  > = {};

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
  ): Promise<Subprocess> {
    const [port] = await findFreePorts(1, {
      startPort: START_PORT,
      endPort: END_PORT,
    });

    const ipc = (message: IpcMessage) => {
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
    };

    const proc = Bun.spawn(['bun', process.env.IN_GAME_PROCESS_PATH], {
      ipc,
      // cwd: './path/to/subdir', // specify a working directory
      env: {
        PORT: port.toString(),
        INITIAL_PLAYERS_SERIALIZED: JSON.stringify(options.players),
        MAP: JSON.stringify(options.map),
      },
      onExit: (proc, exitCode, signalCode, error) => {
        // exit handler
        console.log('process exit', exitCode, proc, error);
        delete this._processMap[waitingRoomId];
        options.onExit?.();
      },
    });
    this._processMap[waitingRoomId] = proc;
    return proc;
  }

  getProcess(waitingRoomId: string): Subprocess | undefined {
    return this._processMap[waitingRoomId];
  }

  killProcess(waitingRoomId: string) {
    this._processMap[waitingRoomId].kill();
    delete this._processMap[waitingRoomId];
  }
}

export default new InGameProcessManageService();
