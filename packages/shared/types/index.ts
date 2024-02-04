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

export type MapInfo = {
  // ground: ...; TODO:
  width: number;
  height: number;
};

export * from './option.ts';
export * from './message.ts';
