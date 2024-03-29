import { Room, Client } from '@colyseus/core';
import {
  BallState,
  GameRoomState,
  PlayerState,
} from './schema/GameRoomState.ts';
import {
  GameRoomAction,
  GameRoomCreateInfo,
  GameRoomJoinInfo,
  GameRoomMessageType,
  GameRoomSetting,
  Team,
} from '@shared/types';
import { GameEngine } from '../engine/index.ts';

export class GameRoom extends Room<GameRoomState> {
  maxClients = 10;
  engine: GameEngine;

  playerCount: number;
  setting: GameRoomSetting;

  onCreate(params: GameRoomCreateInfo) {
    console.log('game room', this.roomId, 'creating...');

    const { setting } = params;
    this.setting = setting;
    this.setState(new GameRoomState());
    this.engine = new GameEngine(this);
    this.setPatchRate(16.6);
    this.setSimulationInterval(deltaTime => this.engine.update(deltaTime));

    const { map } = this.setting;
    this.engine.buildMap(map);
    this.engine.addBall(new BallState(map.kickoff.ball));

    this.initMessageHandlers();
  }

  /** NOTE: host의 경우 create타고 바로 여기 탐 */
  onJoin(client: Client, params: GameRoomJoinInfo | GameRoomCreateInfo) {
    console.log(client.sessionId, 'joined!', params);

    // @ts-expect-error
    const { team, name, index } = params.hostJoinInfo ?? params;
    this.addPlayer(client.sessionId, { team, name, index });

    if (this.isReady()) {
      this.engine.kickoff(Team.RED);
      this.broadcast(GameRoomMessageType.KICK_OFF);
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
      this.setting.redTeamCount + this.setting.blueTeamCount ===
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

  private addPlayer(
    sessionId: string,
    params: {
      team: Team;
      name: string;
      index: number;
    }
  ): void {
    const { team, name, index } = params;
    switch (team) {
      case Team.RED:
        this.engine.addPlayer(
          sessionId,
          new PlayerState({
            index,
            team,
            name,
          })
        );
        break;

      case Team.BLUE:
        this.engine.addPlayer(
          sessionId,
          new PlayerState({
            index,
            team,
            name,
          })
        );
        break;
    }
  }
}
