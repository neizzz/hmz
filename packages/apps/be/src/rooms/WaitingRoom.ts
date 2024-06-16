import { Room, type Client } from '@colyseus/core';
import { AwaiterState, WaitingRoomState } from './schema/WaitingRoomState';
import {
  Team,
  ToWaitingRoomMessageType,
  FromWaitingRoomMessageType,
  type WaitingRoomCreateInfo,
  type ToWaitingRoomMessagePayload,
  type WaitingRoomJoinInfo,
} from '@shared/types';

export class WaitingRoom extends Room<WaitingRoomState, { title: string }> {
  maxClients = 10;

  onCreate(options: WaitingRoomCreateInfo) {
    console.log('waiting room', this.roomId, 'creating...');
    this.maxClients = options.maxPlayers;
    this.setMetadata({
      title: options.title,
    });
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

  onJoin(client: Client, options: WaitingRoomCreateInfo | WaitingRoomJoinInfo) {
    console.log(client.sessionId, 'joined!');

    // @ts-ignore
    const info = options.hostJoinInfo ?? options;
    const awaiter = new AwaiterState();
    awaiter.name = info.name;
    awaiter.team = Team.OBSERVER;
    this.state.awaiters.set(client.sessionId, awaiter);

    if (!this.state.hostSessionId) {
      this.state.hostSessionId = client.sessionId;
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.state.awaiters.delete(client.sessionId);

    if (this.state.hostSessionId === client.sessionId) {
      this.state.hostSessionId = [...this.state.awaiters.keys()][0];
    }
  }

  onDispose() {
    console.log('waiting room', this.roomId, 'disposing...');
  }
}
