import { Room, Client } from '@colyseus/core';
import { GameRoomState, PlayerState } from './schema/GameRoomState.ts';
import {
  GameRoomActionPayload,
  GameRoomActionType,
  GameRoomMessageType,
  Team,
} from '@shared/types';

export class GameRoom extends Room<GameRoomState> {
  maxClients = 10;

  onCreate(option: {}) {
    console.log('game room', this.roomId, 'creating...');
    this.setState(new GameRoomState());
    this.setSimulationInterval(deltaTime => this.state.update(deltaTime));
    this.setPatchRate(16.6);

    this.onMessage(
      GameRoomMessageType.ACTION,
      (client: Client, { type, payload }) => {
        switch (type) {
          case GameRoomActionType.DIRECTION:
            this.state.acceleratePlayer(
              client.sessionId,
              payload as GameRoomActionPayload[GameRoomActionType.DIRECTION]
            );
            break;
        }
      }
    );
  }

  /** TODO:
   * 1. 각자 WaitingRoom에서의 상태 들고있기
   * 2. join시 data로 같이 상태를 보냄
   * 3. 각 상태를 통해 player초기화
   */
  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');
    const player = new PlayerState();
    /** TODO: */
    // player.name = options.name;
    // player.team = Team.OBSERVER;
    player.x = 300;
    player.y = 400;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
  }

  onDispose() {
    console.log('game room', this.roomId, 'disposing...');
  }
}
