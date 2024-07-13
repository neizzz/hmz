import type { PlayerEntityState, Team } from '.';

export type InitialPlayerState = {
  name: string;
  team: Team;
};

export type PlayerState = InitialPlayerState & {
  // id: string; // TODO: fe에서는 굳이 필요 없음. 가지고 있으면 be에서 데이터처리하기는 편함.
  index: number;
  direction: string; // FIXME: fe에서는 필요 없는 정보, 추후에 분리
  x: number;
  y: number;
  radius: number;
  entityState: PlayerEntityState;
};

export type BallState = {
  x: number;
  y: number;
  radius: number;
};

export const enum GameState {
  PREPARATION,
  KICKOFF,
  PROGRESS,
  GOAL,
  END,
}

export type GameSceneState = {
  state: GameState;
  score: {
    [Team.RED]: number;
    [Team.BLUE]: number;
  };
  players: Record<string, PlayerState>;
  ball: BallState;
};
