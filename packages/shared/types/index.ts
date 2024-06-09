export const enum Team {
  OBSERVER = 'observer',
  RED = 'red',
  BLUE = 'blue',
}

export type Position = {
  x: number;
  y: number;
};

export type Direction =
  | ''
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'leftup'
  | 'leftdown'
  | 'rightup'
  | 'rightdown';

export const enum GameState {
  PREPARATION,
  KICKOFF,
  PROGRESS,
  GOAL,
  END,
}

export const enum PlayerEntityState {
  IDLE,
  SHOOTING,
}

export * from './map';
export * from './message';
export * from './action';
export * from './room';
