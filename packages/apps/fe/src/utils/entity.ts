import { Position } from '@shared/types';

export class PositionManager {
  private _positionHistories: string[] = [];
  private _resultPosition?: Position;

  setKickoffPosition() {}

  setPositionHistories(positionHistories: string[]) {
    this._positionHistories = positionHistories;
  }

  nextPosition(): Position | undefined {
    const nextPositionHistory = this._positionHistories.shift();

    if (nextPositionHistory) {
      const { x, y } = this.parsePositionHistory(nextPositionHistory);

      if (this._resultPosition) {
        this._resultPosition = {
          x: Phaser.Math.Linear(this._resultPosition.x, x, 0.8),
          y: Phaser.Math.Linear(this._resultPosition.y, y, 0.8),
        };
      } else {
        this._resultPosition = { x, y };
      }

      return this._resultPosition;
    }
  }

  // FIXME: 임시처리
  private parsePositionHistory(positionHistory: string) {
    const [x, y] = positionHistory.split(',');
    return { x: +x, y: +y };
  }
}
