import { GameRenderState } from '@in-game/types';

type ConstructorParams<T> = {
  onLerp?: (a: T, b: T) => T;
};

export default class GameStateQueue<T = GameRenderState> {
  private statesFromServer: T[] = []; // 게임 진행중에는 항상 2개를 유지
  private statesForRender: T[] = []; //

  private onLerp?: (a: T, b: T) => T;

  constructor({ onLerp }: ConstructorParams<T>) {
    this.onLerp = onLerp;
  }

  // target: 30hz
  pushFromServer(state: T) {
    this.statesFromServer.push(state); // NOTE: 이때 잠깐 3개될 수 있음.

    if (this.statesFromServer.length < 3) return;

    const firstState = this.statesFromServer.shift(); // length: 3 → 2;
    const secondState = this.statesFromServer[0];
    this.statesForRender.push(firstState);
    this.onLerp &&
      this.statesForRender.push(this.onLerp(firstState, secondState));
  }

  // target: 60hz
  popForRender(): T | undefined {
    if (this.statesForRender.length > 4) {
      this.statesForRender.length = 4;
    }

    return this.statesForRender.shift();
  }
}
