import { Room, Client } from '@colyseus/core';
import {
  BallState,
  GameRoomState,
  PlayerState,
} from './schema/GameRoomState.ts';
import {
  GameRoomAction,
  GameRoomMessageType,
  HmzMapInfo,
  Team,
} from '@shared/types';
import { GameEngine } from '../engine/index.ts';

type GameSetting = {
  map: HmzMapInfo;
  redTeamCount: number;
  blueTeamCount: number;
};
type GameRoomCreateInfo = {
  hostJoinInfo: PlayerJoinInfo;
  gameSetting: GameSetting;
};
type PlayerJoinInfo = { team: Team; number: number };

export class GameRoom extends Room<GameRoomState> {
  maxClients = 10;
  engine: GameEngine;

  playerCount: number;
  gameSetting: GameSetting;

  /** TODO:
   * data: 총 인원, order in team
   */
  onCreate(params: GameRoomCreateInfo) {
    console.log('game room', this.roomId, 'creating...');

    const { gameSetting } = params;
    this.gameSetting = gameSetting;
    this.setState(new GameRoomState());
    this.engine = new GameEngine(this.state);
    this.setPatchRate(16.6);
    this.setSimulationInterval(deltaTime => this.engine.update(deltaTime));

    const { map } = this.gameSetting;
    this.engine.applyMap(map);
    this.engine.addBall(new BallState({ x: map.width / 2, y: map.height / 2 }));

    this.initMessageHandlers();
  }

  onJoin(client: Client, params: PlayerJoinInfo | GameRoomCreateInfo) {
    console.log(client.sessionId, 'joined!', params);

    // @ts-expect-error
    const { team, number } = params.hostJoinInfo ?? params;
    this.layoutPlayer(client.sessionId, team, number);

    if (this.isReady()) {
      // TODO:
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
  }

  onDispose() {
    console.log('game room', this.roomId, 'disposing...');
  }

  private isReady(): boolean {
    return (
      this.gameSetting.redTeamCount + this.gameSetting.redTeamCount ===
      this.state.players.size
    );
  }

  private initMessageHandlers(): void {
    this.onMessage(
      GameRoomMessageType.ACTION,
      (client: Client, action: GameRoomAction) =>
        this.engine.processPlayerAction(client.sessionId, action)
    );
  }

  private layoutPlayer(sessionId: string, team: Team, number: number): void {
    const map = this.gameSetting.map;
    const halfX = map.width / 2;

    switch (team) {
      case Team.RED:
        this.engine.addPlayer(
          sessionId,
          new PlayerState({
            team,
            x: halfX / 2,
            y:
              (map.height * (number + 1)) / (this.gameSetting.redTeamCount + 1),
          })
        );
        break;

      case Team.BLUE:
        this.engine.addPlayer(
          sessionId,
          new PlayerState({
            team,
            x: halfX + halfX / 2,
            y:
              (map.height * (number + 1)) /
              (this.gameSetting.blueTeamCount + 1),
          })
        );
        break;
    }
  }
}
