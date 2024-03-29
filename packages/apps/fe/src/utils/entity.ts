import { Position } from '@shared/types';

export class PositionManager {
  private _kickoffPosition: Position;
  private _positionHistories: string[] = [];
  private _resultPosition?: Position;

  setKickoffPosition(position: Position) {
    this._kickoffPosition = position;
  }

  setPositionHistories(positionHistories: string[]) {
    this._positionHistories = positionHistories;
  }

  kickoffPosition(): Position {
    this._positionHistories = [];
    this._resultPosition = this._kickoffPosition;
    return this._resultPosition;
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
