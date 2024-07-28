import { GameSceneState } from '@shared/types';
import {
  GameSystemMessage,
  GameSystemMessagePayload,
  GameSystemMessageType,
} from '@shared/types/message/in-game';
import GameStateQueue from '@utils/GameStateQueue';
import cloneDeep from 'lodash.clonedeep';

type GameSystemMessageHandler<T extends GameSystemMessageType> = (
  payload: GameSystemMessagePayload[T]
) => void;

export type InGameConnectionOptions = {
  myId: string;
  url: string;
};

export default class InGameConnection {
  private _myId: string;
  private _url: string;
  private _ws?: WebSocket;
  private _stateQueue = new GameStateQueue({
    onLerp: (a: GameSceneState, b: GameSceneState): GameSceneState => {
      const result: GameSceneState = cloneDeep(b);

      Object.entries(a.players).forEach(([id, playerStateA]) => {
        const playerStateB = b.players[id];

        result.players[id].x = (playerStateA.x + playerStateB.x) / 2;
        result.players[id].y = (playerStateA.y + playerStateB.y) / 2;
      });

      result.ball.x = (a.ball.x + b.ball.x) / 2;
      result.ball.y = (a.ball.y + b.ball.y) / 2;

      return result;
    },
  });

  private _messageHandlers: Partial<
    Record<
      GameSystemMessageType,
      GameSystemMessageHandler<GameSystemMessageType>[]
    >
  > = {};

  constructor({ myId, url }: InGameConnectionOptions) {
    this._myId = myId;
    this._url = url;
    this.init();
  }

  init() {
    this._ws = new WebSocket(this._url);
    this._ws.onerror = e => {
      console.error(e);
      setTimeout(() => {
        console.log('ws error');
        this.init();
      }, 200);
    };
    this._ws.addEventListener('open', this._onOpen);
    this.addMessageHandler(GameSystemMessageType.SCENE_UPDATE, payload => {
      const { state } = payload;
      this._stateQueue.pushFromServer(state);
    });
  }

  popGameSceneState = (): GameSceneState | undefined => {
    return this._stateQueue.popForRender();
  };

  send = <T extends GameSystemMessageType>(
    type: T,
    payload: GameSystemMessagePayload[T]
  ) => {
    this._ws.send(
      JSON.stringify({
        type,
        payload,
      })
    );
  };

  addMessageHandler = <T extends GameSystemMessageType>(
    type: T,
    handler: GameSystemMessageHandler<T>
  ) => {
    this._messageHandlers[type] = (this._messageHandlers[type] ?? []).concat(
      handler
    );
  };

  removeMessageHandler = <T extends GameSystemMessageType>(
    type: T,
    handler: GameSystemMessageHandler<T>
  ) => {
    if (!this._messageHandlers[type]) {
      console.warn('Not exist the handler to remove.');
      return;
    }
    this._messageHandlers[type] = this._messageHandlers[type].filter(
      h => h !== handler
    );
  };

  getMessageHandlers = <T extends GameSystemMessageType>(
    type: T
  ): GameSystemMessageHandler<T>[] => {
    return this._messageHandlers[type];
  };

  private _onOpen = () => {
    // FIXME: 슛 넣을대마다 이 핸들러가 실행됨
    this._ws.addEventListener('message', this._onMessage);
    // this._ws.addEventListener('close', this.onClose);
    // this.send(GameSystemMessageType.USER_ENTRANCE, { id: this._myId });
  };

  private _onMessage = (e: MessageEvent) => {
    const { type, payload } = JSON.parse(e.data) as GameSystemMessage;

    if (type !== GameSystemMessageType.SCENE_UPDATE) {
      console.log('[InGameConnection] onMessage:', e.data);
    }

    this.getMessageHandlers(type)?.forEach(handler => handler(payload));
  };
  // private onClose = (e: Event) => {};
}
