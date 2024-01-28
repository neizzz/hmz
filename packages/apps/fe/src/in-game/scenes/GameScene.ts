import { Player } from '@in-game/entities/Player.ts';
import { Client, Room } from 'colyseus.js';
import Phaser from 'phaser';

type InitParams = {
  serverUrl: string;
};

export class GameScene extends Phaser.Scene {
  client: Client;
  room: Room;

  playerSessions: { [sessionId: string]: any };

  init(params: InitParams) {
    const { serverUrl } = params;
    this.client = new Client(serverUrl);
  }

  preload() {
    // preload scene
  }

  async create() {
    console.log('Joining room...');

    try {
      this.room = await this.client.joinOrCreate('my_room');
      console.log('Joined successfully!');
    } catch (e) {
      console.error(e);
    }

    // listen for new players
    this.room?.state.players.onAdd((player: Player, sessionId: string) => {
      const entity = this.physics.add.image(player.x, player.y, 'ship_0001');

      // keep a reference of it on `playerEntities`
    });
  }

  update(time: number, delta: number): void {
    // game loop
  }
}
