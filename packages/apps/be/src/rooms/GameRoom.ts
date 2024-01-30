import { Room, Client } from '@colyseus/core';
import { WaitingRoomState } from './schema/WaitingRoomState.ts';
import { WaitingRoomOption } from '@shared/type';
import { GameRoomState } from './schema/GameRoomState.ts';

export class GameRoom extends Room<GameRoomState> {
  maxClients = 10;

  onCreate(option: WaitingRoomOption) {
    console.log('game room', this.roomId, 'creating...');
    this.setState(new WaitingRoomState());
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
  }

  onDispose() {
    console.log('game room', this.roomId, 'disposing...');
  }
}
