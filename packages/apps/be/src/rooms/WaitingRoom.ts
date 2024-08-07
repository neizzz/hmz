import { Room, type Client } from '@colyseus/core';
import {
  WaitingRoomPlayerState,
  WaitingRoomState,
} from './schema/WaitingRoomState';
import {
  Team,
  type WaitingRoomCreateInfo,
  type WaitingRoomJoinInfo,
} from '@shared/types';

import {
  type WaitingRoomMessageUpstreamPayload,
  type WaitingRoomMessageDownstreamPayload,
  WaitingRoomMessageType,
} from '@shared/types/message/client';
import InGameProcessManageService from '../services/InGameProcessManageService';

export class WaitingRoom extends Room<WaitingRoomState, { title: string }> {
  maxClients = 10;

  onCreate(options: WaitingRoomCreateInfo) {
    console.log('waiting room', this.roomId, 'creating...');
    this.maxClients = options.maxPlayers;
    this.setMetadata({
      title: options.title,
    });
    this.setState(new WaitingRoomState());

    this.onMessage<
      WaitingRoomMessageUpstreamPayload[WaitingRoomMessageType.CHANGE_TEAM]
    >(WaitingRoomMessageType.CHANGE_TEAM, this._handleMessageChangeTeam);
    this.onMessage<
      WaitingRoomMessageUpstreamPayload[WaitingRoomMessageType.START_GAME]
    >(WaitingRoomMessageType.START_GAME, this._handleMessageStartGame);
  }

  onJoin(client: Client, options: WaitingRoomCreateInfo | WaitingRoomJoinInfo) {
    console.log(client.sessionId, 'joined!');

    // @ts-ignore
    const info = options.hostJoinInfo ?? options;
    const player = new WaitingRoomPlayerState();
    player.name = info.name;
    player.team = Team.OBSERVER;
    this.state.players.set(client.sessionId, player);

    if (!this.state.hostSessionId) {
      this.state.hostSessionId = client.sessionId;
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.state.players.delete(client.sessionId);

    if (this.state.hostSessionId === client.sessionId) {
      this.state.hostSessionId = [...this.state.players.keys()][0];
    }
  }

  onDispose() {
    console.log('waiting room', this.roomId, 'disposing...');
  }

  private _handleMessageChangeTeam = (
    client: Client,
    message: WaitingRoomMessageUpstreamPayload[WaitingRoomMessageType.CHANGE_TEAM]
  ) => {
    console.log(
      `[${WaitingRoomMessageType.CHANGE_TEAM}]: ${client.sessionId}, ${JSON.stringify(message)}`
    );
    const player = this.state.players.get(client.sessionId);

    if (!player) {
      throw new Error(`The client(sessionId: ${client.sessionId}) not found.`);
    }

    player.team = message.to;
    this.state.players.set(client.sessionId, player);
    this.broadcast(WaitingRoomMessageType.CHANGE_TEAM, {
      players: this.state.players,
    });
  };

  private _handleMessageStartGame = (
    client: Client,
    {
      map,
    }: WaitingRoomMessageUpstreamPayload[WaitingRoomMessageType.START_GAME]
  ) => {
    console.log(`[${WaitingRoomMessageType.START_GAME}]: ${client.sessionId}`);

    InGameProcessManageService.startGame(this.roomId, {
      players: this.state.players.toJSON(),
      map,
      onInitGame: (inGameUrl: string) => {
        this.broadcast(WaitingRoomMessageType.START_GAME, {
          map,
          inGameUrl,
        });
      },
    });

    // this.broadcast(
    //   WaitingRoomMessageType.START_GAME,
    //   {
    //     inGameUrl,
    //     map,
    //   },
    // );
  };
}
