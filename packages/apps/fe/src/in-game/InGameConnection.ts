import { GameSceneState } from '@shared/types';
import GameStateQueue from '@utils/GameStateQueue';
import cloneDeep from 'lodash.clonedeep';

export type InGameConnectionOptions = {
  url: string;
};

export default class InGameConnection {
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

  constructor({ url }: InGameConnectionOptions) {
    this._ws = new WebSocket(url);

    this._ws.addEventListener('open', this.onOpen);
  }

  private onOpen = (e: Event) => {
    console.log(e);
    this._ws.addEventListener('message', this.onMessage);
    this._ws.addEventListener('close', this.onClose);
  };

  private onMessage = (e: Event) => {
    console.log(e);
  };

  private onClose = (e: Event) => {
    console.log(e);
  };
}
