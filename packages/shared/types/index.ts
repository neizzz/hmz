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

export const enum PlayerEntityState {
  IDLE,
  SHOOTING,
}

export * from './map';
export * from './room';
export * from './in-game';
