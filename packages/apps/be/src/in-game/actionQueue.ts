import { GameUserAction } from '@shared/types/message/in-game';

export class ActionQueue {
  private _queue: GameUserAction[] = [];

  push = (action: GameUserAction) => {
    this._queue.push(action);
  };

  popAll = (): GameUserAction[] => {
    const result = this._queue;
    this._queue = [];
    return result;
  };
}
