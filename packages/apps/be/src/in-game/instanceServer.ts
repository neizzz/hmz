import { GameSceneState } from '@shared/types';
import {
  GameSystemMessage,
  GameSystemMessageType,
} from '@shared/types/message/in-game';
import { WebSocketServer } from 'ws';
import { ActionQueue } from './actionQueue';

export class GameInstanceServer {
  private _connectionCount = 0;
  private _readyCount = 0;
  private _wss: WebSocketServer;
  private _actionQueue: ActionQueue;
  private _onPlayerReadyFirstKickoff: () => void;
  private _onPlayerConnection: (cumulativeConnectionCount: number) => void;

  constructor(params: {
    host: string;
    port: number;
    actionQueue: ActionQueue;
    onPlayerReadyFirstKickoff: () => void;
    onPlayerConnection: (cumulativeConnectionCount: number) => void;
  }) {
    const {
      host,
      port,
      actionQueue,
      onPlayerReadyFirstKickoff,
      onPlayerConnection,
    } = params;
    this._actionQueue = actionQueue;
    this._onPlayerReadyFirstKickoff = onPlayerReadyFirstKickoff;
    this._onPlayerConnection = onPlayerConnection;
    this._wss = new WebSocketServer({
      host,
      port,
      clientTracking: true,
    });
    this._wss.on('connection', ws => {
      this._onPlayerConnection(++this._connectionCount);

      ws.on('message', (data: string | Buffer) => {
        const { type, payload } = JSON.parse(
          data as string
        ) as GameSystemMessage;

        if (type !== GameSystemMessageType.USER_ACTION) {
          console.log('[GameInstanceServer] onMessage:', type, payload);
        }

        switch (type) {
          // case GameSystemMessageType.USER_ENTRANCE:
          //   console.log('User entrance', payload);
          //   // TODO: roomId에 맞는 GameInstance에 매핑
          //   break;

          case GameSystemMessageType.USER_READY_TO_KICKOFF:
            if (++this._readyCount === this._connectionCount) {
              this._onPlayerReadyFirstKickoff();
            }
            break;

          case GameSystemMessageType.USER_ACTION:
            this._actionQueue.push(payload);
            break;
        }
      });
    });
  }

  broadcastSceneState(sceneState: GameSceneState) {
    this._broadcast({
      type: GameSystemMessageType.SCENE_UPDATE,
      payload: {
        state: sceneState,
      },
    });
  }

  broadcastMessage(message: GameSystemMessage) {
    this._broadcast(message);
  }

  private _broadcast(message: GameSystemMessage) {
    this._wss.clients.forEach(ws => {
      ws.send(JSON.stringify(message));
    });
  }
}
