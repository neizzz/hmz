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

  setting: GameRoomSetting;

  onCreate(params: GameRoomCreateInfo) {
    console.log('game room', this.roomId, 'creating...');

    const { setting } = params;
    this.setting = setting;
    this.setState(new GameRoomState());
    this.engine = new GameEngine(this);
    this.setPatchRate(33.33);
    this.setSimulationInterval(delta => this.engine.update(delta));

    const { map } = this.setting;
    this.engine.buildMap(map);
    this.engine.addBall(
      new BallState({
        kickoffX: map.kickoff.ball.x,
        kickoffY: map.kickoff.ball.y,
      })
    );

    this.initMessageHandlers();
  }

  /** NOTE: host의 경우 create타고 바로 여기 탐 */
  onJoin(client: Client, params: GameRoomJoinInfo | GameRoomCreateInfo) {
    console.log(client.sessionId, 'joined!', params);

    // @ts-expect-error
    const { team, name, index } = params.hostJoinInfo ?? params;
    this.addPlayer(client.sessionId, { team, name, index });

    if (this.isReady()) {
      this.engine.setupKickoff(Team.RED);
      this.engine.mapBuilder.blockCenterLine('left');
      setTimeout(() => {
        console.log('ready_to_start');
        this.broadcast(GameRoomMessageType.READY_TO_START);
      }, 1000);
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
  }

  onDispose() {
    console.log('game room', this.roomId, 'disposing...');
  }

  getTotalPlayerCount(): number {
    return this.setting.redTeamCount + this.setting.blueTeamCount;
  }

  getActivePlayerCount(): number {
    return this.state.players.size;
  }

  private isReady(): boolean {
    return this.getTotalPlayerCount() === this.getActivePlayerCount();
  }

  private initMessageHandlers(): void {
    this.onMessage(
      GameRoomMessageType.USER_READY_TO_KICKOFF,
      (() => {
        // TODO: 최초 발생 유저 이후로 timeout 로직
        let count = 0;

        return (client: Client) => {
          if (++count === this.getTotalPlayerCount()) {
            this.engine.mapBuilder.openCenterLine();
            this.broadcast(GameRoomMessageType.KICKOFF);
          }
        };
      })()
    );

    this.onMessage(
      GameRoomMessageType.USER_ACTION,
      (client: Client, action: GameRoomAction) => {
        // handle player input
        const player = this.state.players.get(client.sessionId);
        // enqueue input to user input buffer.
        player?.actionQueue.push(action);

        // this.engine.processPlayerAction(client.sessionId, action)
      }
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
    const height = this.setting.map.height;
    const centerLine = this.setting.map.width / 2;
    const redTeamCount = this.setting.redTeamCount;
    const blueTeamCount = this.setting.blueTeamCount;
    const engagedTeamCount = team === Team.RED ? redTeamCount : blueTeamCount;

    const playerState = new PlayerState({
      id: sessionId,
      index,
      team,
      name,
      kickoffX: centerLine + ((team === Team.RED ? -1 : 1) * centerLine) / 2,
      kickoffY: (height * (index + 1)) / (engagedTeamCount + 1),
    });

    switch (team) {
      case Team.RED:
        this.engine.addPlayer(sessionId, playerState);
        break;

      case Team.BLUE:
        this.engine.addPlayer(sessionId, playerState);
        break;
    }
  }
}
