import { BallState, PlayerState } from '@schema';

export type GameRenderState = {
  players: Record<string, PlayerState>;
  ball: BallState;
};
