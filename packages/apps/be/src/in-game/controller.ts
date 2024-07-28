import findFreePorts from 'find-free-ports';
import { GameInstance } from './instance';
import { GameOptions } from '.';

// TODO:
// function layoutKickoff() {}

export class InGameController {
  private readonly _host = 'localhost'; // FIXME: 일단 개발용으로만
  private _roomId2GameInstance: Record<string, GameInstance> = {};

  async startGame(options: GameOptions): Promise<string> {
    const { roomId, players, map } = options;
    const port = await this._findFreePort();
    const gameInstance = new GameInstance({
      roomId,
      host: this._host,
      port,
      players,
      map,
    });
    gameInstance.start();
    this._roomId2GameInstance[roomId] = gameInstance;
    return `ws://${this._host}:${port}`;
  }

  private async _findFreePort(): Promise<number> {
    const [port] = await findFreePorts(1, {
      startPort: 40000,
      endPort: 50000,
    });
    return port;
  }
}
