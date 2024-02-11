import { Room, Client } from '@colyseus/core';
import { AwaiterState, WaitingRoomState } from './schema/WaitingRoomState.ts';
import {
  Team,
  ToWaitingRoomMessageType,
  FromWaitingRoomMessageType,
  WaitingRoomCreateInfo,
  ToWaitingRoomMessagePayload,
} from '@shared/types';

export class WaitingRoom extends Room<WaitingRoomState> {
  maxClients = 10;

  onCreate(option: WaitingRoomCreateInfo) {
    console.log('waiting room', this.roomId, 'creating...');
    this.setState(new WaitingRoomState());

    this.onMessage<ToWaitingRoomMessagePayload['CHANGE_TEAM']>(
      ToWaitingRoomMessageType.CHANGE_TEAM,
      (client, message) => {
        console.log(
          `[${ToWaitingRoomMessageType.CHANGE_TEAM}]: ${client.sessionId}, ${JSON.stringify(message)}`
        );
        const awaiter = this.state.awaiters.get(client.sessionId);

        if (!awaiter) {
          throw new Error(
            `The client(sessionId: ${client.sessionId}) not found.`
          );
        }

        awaiter.team = message.to;
        this.state.awaiters.set(client.sessionId, awaiter);
        this.broadcast(FromWaitingRoomMessageType.CHANGE_TEAM, {
          awaiters: this.state.awaiters,
        });
      }
    );

    this.onMessage<ToWaitingRoomMessagePayload['START_GAME']>(
      ToWaitingRoomMessageType.START_GAME,
      (client, { roomId: gameRoomId, map }) => {
        console.log(
          `[${ToWaitingRoomMessageType.START_GAME}]: ${client.sessionId}`
        );
        this.broadcast(
          FromWaitingRoomMessageType.START_GAME,
          {
            roomId: gameRoomId,
            map,
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
