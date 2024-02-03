import { Room, Client } from '@colyseus/core';
import { AwaiterState, WaitingRoomState } from './schema/WaitingRoomState.ts';
import { Team, WaitingRoomMessageType, WaitingRoomOption } from '@shared/types';

export class WaitingRoom extends Room<WaitingRoomState> {
  maxClients = 10;

  onCreate(option: WaitingRoomOption) {
    console.log('waiting room', this.roomId, 'creating...');
    this.setState(new WaitingRoomState());

    this.onMessage(WaitingRoomMessageType.CHANGE_ROOM, (client, message) => {
      console.log(
        `[${WaitingRoomMessageType.CHANGE_ROOM}]: ${client.sessionId}, ${JSON.stringify(message)}`
      );
      const awaiter = this.state.awaiters.get(client.sessionId);

      if (!awaiter) {
        throw new Error(
          `The client(sessionId: ${client.sessionId}) not found.`
        );
      }

      awaiter.team = message.to;
      this.state.awaiters.set(client.sessionId, awaiter);
      this.broadcast(WaitingRoomMessageType.CHANGE_ROOM, this.state.awaiters);
    });

    this.onMessage(
      WaitingRoomMessageType.START_GAME,
      (client, { gameRoomId }) => {
        console.log(
          `[${WaitingRoomMessageType.START_GAME}]: ${client.sessionId}`
        );
        this.broadcast(
          WaitingRoomMessageType.START_GAME,
          {
            gameRoomId,
          },
          { except: client }
        );
      }
    );
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');
    const awaiter = new AwaiterState();
    awaiter.name = options.name;
    awaiter.team = Team.OBSERVER;
    this.state.awaiters.set(client.sessionId, awaiter);

    if (!this.state.hostSessionId) {
      this.state.hostSessionId = client.sessionId;
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.state.awaiters.delete(client.sessionId);
  }

  onDispose() {
    console.log('waiting room', this.roomId, 'disposing...');
  }
}
