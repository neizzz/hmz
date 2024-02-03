import { Player } from '@in-game/entities/Player';
import { Room } from 'colyseus.js';
import Phaser from 'phaser';

type InitParams = {
  room: Room;
};

export class GameScene extends Phaser.Scene {
  room: Room;
  me: string; // session id
  players: { [sessionId: string]: any } = {};

  constructor() {
    super('game-scene');
  }

  init({ room }: InitParams) {
    this.room = room;
    this.me = room.sessionId;
  }

  preload() {
    console.log('[GameScene] preload');

    this.load.image('ground-tile', '/assets/bg.png');
    Player.generateTexture(this);
  }

  create() {
    console.log('[GameScene] create');

    this.drawGround();

    const { width, height } = this.game.config;

    this.players[this.me] = this.physics.add.sprite(
      +width / 2,
      +height / 2,
      'player'
    );
  }

  update(time: number, delta: number): void {
    // this.players[this.me].x += 2;
  }

  private drawGround() {
    const map = this.make.tilemap({
      tileWidth: 120,
      tileHeight: 120,
      width: 12,
      height: 8,
    });
    const tiles = map.addTilesetImage('ground-tile');
    const layer = map.createBlankLayer('ground-layer', tiles);
    layer.fill(0, 0, 0, map.width, map.height); // Body of the water
  }
}
