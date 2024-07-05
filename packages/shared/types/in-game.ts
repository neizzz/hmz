import type { PlayerEntityState, Team } from '.';

export type PlayerState = {
  name: string;
  team: Team;
  x: number;
  y: number;
  kickoffX: number;
  kickoffY: number;
  radius: number;
  entityState: PlayerEntityState;
};

export type BallState = {
  x: number;
  y: number;
  kickoffX: number;
  kickoffY: number;
  radius: number;
};

export type GameSceneState = {
  players: Record<string, PlayerState>;
  ball: BallState;
};
