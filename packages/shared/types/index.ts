export const enum Team {
  OBSERVER = 'observer',
  RED = 'red',
  BLUE = 'blue',
}

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

export * from './map.ts';
export * from './message.ts';
export * from './action.ts';
export * from './room.ts';
