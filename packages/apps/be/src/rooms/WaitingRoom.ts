import { Room, type Client } from '@colyseus/core';
import {
  WaitingRoomPlayerState,
  WaitingRoomState,
} from './schema/WaitingRoomState';
import {
  Team,
  type WaitingRoomCreateInfo,
  type WaitingRoomJoinInfo,
  type WaitingRoomMessageUpstreamPayload,
  type WaitingRoomMessageDownstreamPayload,
  WaitingRoomMessageType,
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

    this.onMessage<
      WaitingRoomMessageUpstreamPayload[WaitingRoomMessageType.CHANGE_TEAM]
    >(WaitingRoomMessageType.CHANGE_TEAM, (client, message) => {
      console.log(
        `[${WaitingRoomMessageType.CHANGE_TEAM}]: ${client.sessionId}, ${JSON.stringify(message)}`
      );
      const player = this.state.players.get(client.sessionId);

      if (!player) {
        throw new Error(
          `The client(sessionId: ${client.sessionId}) not found.`
        );
      }

      player.team = message.to;
      this.state.players.set(client.sessionId, player);
      this.broadcast(WaitingRoomMessageType.CHANGE_TEAM, {
        players: this.state.players,
      });
    });

    this.onMessage<
      WaitingRoomMessageUpstreamPayload[WaitingRoomMessageType.START_GAME]
    >(WaitingRoomMessageType.START_GAME, (client, { map }) => {
      console.log(
        `[${WaitingRoomMessageType.START_GAME}]: ${client.sessionId}`
      );

      this._createInGameProcess();

      // this.broadcast(
      //   WaitingRoomMessageType.START_GAME,
      //   {
      //     inGameUrl,
      //     map,
      //   },
      //   { except: client }
      // );
    });
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

  private _createInGameProcess() {
    const proc = Bun.spawn(['bun', process.env.IN_GAME_PROCESS_PATH], {
      ipc(message, childProc) {
        console.log('im parent, receive', message);
        childProc.send('im parent');
      },
      // cwd: './path/to/subdir', // specify a working directory
      // env: { ...process.env, FOO: 'bar' }, // specify environment variables
      onExit(proc, exitCode, signalCode, error) {
        // exit handler
        console.log('process exit', exitCode, proc, error);
      },
    });
  }
}
