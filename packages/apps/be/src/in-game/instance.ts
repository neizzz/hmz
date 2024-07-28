import {
  GameSceneState,
  GameState,
  HmzMapInfo,
  InitialPlayerState,
  PlayerEntityState,
  PlayerState,
  Team,
} from '@shared/types';
import {
  GameSystemMessage,
  GameSystemMessagePayload,
  GameSystemMessageType,
  GameUserAction,
} from '@shared/types/message/in-game';
import { GameOptions } from '.';
import { GameEngine } from './engine';
import { ActionQueue } from './actionQueue';
import { GameInstanceServer } from './instanceServer';

export class GameInstance {
  private readonly _roomId: string;
  private readonly _teamCount: Record<Team, number>;
  private _server: GameInstanceServer;
  private _engine: GameEngine;
  private _actionQueue: ActionQueue;

  constructor(options: {
    roomId: string;
    host: string;
    port: number;
    players: Record<string, InitialPlayerState>;
    map: HmzMapInfo;
  }) {
    const { roomId, host, port, players, map } = options;
    this._roomId = roomId;
    this._actionQueue = new ActionQueue();
    this._teamCount = this._calcTeamCounts(players);
    this._server = new GameInstanceServer({
      host,
      port,
      actionQueue: this._actionQueue,
      onPlayerReadyFirstKickoff: () => {
        this._engine.setupFirstKickoff();
        this._server.broadcastMessage({
          type: GameSystemMessageType.KICKOFF,
          payload: undefined,
        });
      },
      onPlayerConnection: (cumulativeConnectionCount: number) => {
        if (
          cumulativeConnectionCount ===
          this._teamCount[Team.RED] + this._teamCount[Team.BLUE]
        ) {
          setTimeout(() => {
            this._server.broadcastMessage({
              type: GameSystemMessageType.READY_TO_START,
              payload: undefined,
            });
          }, 500);
        }
      },
    });
    this._engine = new GameEngine({
      initialSceneState: {
        state: GameState.PREPARATION,
        score: {
          [Team.RED]: 0,
          [Team.BLUE]: 0,
        },
        players: this._initialPlayerStates(players, map),
        ball: {
          x: map.ground.x + map.ground.width / 2,
          y: map.ground.y + map.ground.height / 2,
          radius: 19,
        },
      },
      map,
      broadcastGameSystemMessage: (
        type: GameSystemMessageType,
        payload: GameSystemMessagePayload[typeof type]
      ) => {
        this._server.broadcastMessage({
          // @ts-ignore
          type,
          payload,
        });
      },
    });
  }

  async start() {
    this._run(this._engine.update, this._engine.getGameSceneState);
  }

  private _run(
    onUpdate: (delta: number, actions: GameUserAction[]) => void,
    getGameSceneState: () => GameSceneState
  ) {
    let prevTime = Date.now();
    return setInterval(() => {
      const now = Date.now();
      const actions = this._actionQueue.popAll();
      onUpdate(now - prevTime, actions);
      prevTime = now;

      const sceneState = getGameSceneState();
      this._server.broadcastSceneState(sceneState);
    }, 33.333);
  }

  private _calcTeamCounts(initialPlayers: GameOptions['players']) {
    return Object.values(initialPlayers).reduce(
      (teamCounts, initaialPlayerState) => {
        teamCounts[initaialPlayerState.team]++;
        return teamCounts;
      },
      { [Team.RED]: 0, [Team.BLUE]: 0, [Team.OBSERVER]: 0 }
    );
  }

  private _initialPlayerStates(
    initialPlayers: GameOptions['players'],
    map: HmzMapInfo
  ): Record<string, PlayerState> {
    const result: Record<string, PlayerState> = {};
    let currRedTeamPlayerIndex = 0;
    let currBlueTeamPlayerIndex = 0;

    Object.entries(initialPlayers).map(([id, initaialPlayerState]) => {
      const isRedTeam = initaialPlayerState.team === Team.RED;
      const index = isRedTeam
        ? currRedTeamPlayerIndex++
        : currBlueTeamPlayerIndex++;
      result[id] = {
        ...initaialPlayerState,
        index,
        direction: '',
        x: map.ground.x + ((isRedTeam ? 1 : 3) * map.ground.width) / 4,
        y:
          map.ground.y +
          (index + 1) *
            (map.ground.height /
              (this._teamCount[initaialPlayerState.team] + 1)),
        radius: 27,
        entityState: PlayerEntityState.IDLE,
      };
    });
    return result;
  }
}
