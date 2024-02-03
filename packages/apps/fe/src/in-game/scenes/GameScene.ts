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

    Player.generateTexture(this);
  }

  create() {
    console.log('[GameScene] create');

    const { width, height } = this.game.config;

    this.players[this.me] = this.physics.add.sprite(
      +width / 2,
      +height / 2,
      'player'
    );
  }

  update(time: number, delta: number): void {
    // game loop
  }
}
