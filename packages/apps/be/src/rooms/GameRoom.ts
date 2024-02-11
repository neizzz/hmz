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

  /** TODO:
   * data: 총 인원, order in team
   */
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
    this.engine.addBall(new BallState({ x: map.width / 2, y: map.height / 2 }));

    this.initMessageHandlers();
  }

  /** NOTE: host의 경우 create타고 바로 여기 탐 */
  onJoin(client: Client, params: GameRoomJoinInfo | GameRoomCreateInfo) {
    console.log(client.sessionId, 'joined!', params);

    // @ts-expect-error
    const { team, index } = params.hostJoinInfo ?? params;
    this.layoutPlayer(client.sessionId, team, index);

    if (this.isReady()) {
      // TODO: broadcast start
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

  private layoutPlayer(sessionId: string, team: Team, index: number): void {
    const map = this.setting.map;
    const halfX = map.width / 2;

    switch (team) {
      case Team.RED:
        this.engine.addPlayer(
          sessionId,
          new PlayerState({
            team,
            x: halfX / 2,
            y: (map.height * (index + 1)) / (this.setting.redTeamCount + 1),
          })
        );
        break;

      case Team.BLUE:
        this.engine.addPlayer(
          sessionId,
          new PlayerState({
            team,
            x: halfX + halfX / 2,
            y: (map.height * (index + 1)) / (this.setting.blueTeamCount + 1),
          })
        );
        break;
    }
  }
}
