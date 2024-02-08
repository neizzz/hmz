import { Ball } from '@in-game/entities/Ball';
import { Player } from '@in-game/entities/Player';
import { GameRoomState, PlayerState } from '@schema';
import {
  Direction,
  GameRoomActionType,
  GameRoomMessageType,
  HmzMapInfo,
} from '@shared/types';
import { Room } from 'colyseus.js';
import Phaser from 'phaser';

const createRoundedPath = (params: {
  cx: number;
  cy: number;
  radius: number;
  fromRadian: number;
  toRadian: number;
  division: number;
  reverse?: boolean;
}): string => {
  const {
    cx,
    cy,
    radius,
    fromRadian,
    toRadian,
    division,
    reverse = false,
  } = params;
  const intervalRadian = (toRadian - fromRadian) / division;
  let targetRadians = [...Array.from({ length: division + 1 }).keys()].map(
    interval => fromRadian + intervalRadian * interval
  );

  reverse && (targetRadians = targetRadians.reverse());

  return targetRadians.reduce((path, targetRadian) => {
    return `${path}, ${cx + radius * Math.sin(targetRadian)} ${cy - radius * Math.cos(targetRadian)}`;
  }, '');
};

export type GameSceneInitParams = {
  map: HmzMapInfo;
  room: Room;
};

export class GameScene extends Phaser.Scene {
  room: Room;
  me: string; // session id
  map: HmzMapInfo;
  players: { [sessionId: string]: Player } = {};
  playerSprites: { [sessionId: string]: Phaser.Physics.Matter.Sprite } = {};
  ballSprite: Phaser.Physics.Matter.Sprite;

  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('game-scene');
  }

  init({ map, room }: GameSceneInitParams) {
    this.room = room;
    this.me = room.sessionId;
    this.map = map;
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  preload() {
    console.log('[GameScene] preload');

    this.load.image('ground-tile', '/assets/bg.png');
    Player.generateTexture(this);
    Ball.generateTexture(this);
  }

  create() {
    console.log('[GameScene] create');

    this.drawStadium();

    this.room.state.listen('ball', ({ x, y, radius }) => {
      this.ballSprite = this.matter.add.sprite(x, y, 'ball').setBody({
        type: 'circle',
        radius,
      });
    });

    this.room.state.players.onAdd(({ x, y, radius }) => {
      this.playerSprites[this.me] = this.matter.add
        .sprite(x, y, 'player')
        .setBody({
          type: 'circle',
          radius,
        });
    });

    this.room.onStateChange((state: GameRoomState) => {
      state.players.forEach((player, id) => {
        const playerSprite = this.playerSprites[id];
        playerSprite.x = player.x;
        playerSprite.y = player.y;
      });

      this.ballSprite.x = state.ball.x;
      this.ballSprite.y = state.ball.y;
    });
  }

  update(time: number, delta: number): void {
    this.room.send(GameRoomMessageType.ACTION, {
      type: GameRoomActionType.DIRECTION,
      payload: {
        direction: this.getDirectionFromInput(),
      },
    });

    if (this.cursorKeys.space.isDown) {
      this.room.send(GameRoomMessageType.ACTION, {
        type: GameRoomActionType.SHOOT,
      });
    }
  }

  private drawStadium() {
    this.drawGround();

    const lineWidth = 4;
    const { ground } = this.map;
    ground.width += lineWidth;
    ground.height += lineWidth;

    const goalPostLineWidth = 3;
    const groundX = (this.map.width - ground.width) / 2;
    const groundY = (this.map.height - ground.height) / 2;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const goalPostWidth = this.map.ground.goalPostWidth;
    const goalPostRadius = this.map.ground.goalPostRadius;
    const goalPostTopPositionY = (groundHeight - goalPostWidth) / 2;
    const goalPostBottomPositionY = (groundHeight + goalPostWidth) / 2;

    this.add
      .graphics({ x: groundX, y: groundY })
      .lineStyle(lineWidth, 0xffffff)
      .strokeRect(0, 0, ground.width, ground.height)
      .strokeCircle(ground.width / 2, ground.height / 2, ground.height / 4.5)
      .lineBetween(ground.width / 2, 0, ground.width / 2, ground.height)
      .lineStyle(goalPostLineWidth, 0x000000)
      .fillStyle(0xffffff)
      .fillCircle(
        0,
        goalPostTopPositionY,
        goalPostRadius - goalPostLineWidth / 2 // NOTE: line width 절반 만큼 뺴줘야 충돌경계와 딱 맞음.
      )
      .strokeCircle(
        0,
        goalPostTopPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .fillCircle(
        0,
        goalPostBottomPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .strokeCircle(
        0,
        goalPostBottomPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .fillCircle(
        groundWidth,
        goalPostTopPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .strokeCircle(
        groundWidth,
        goalPostTopPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .fillCircle(
        groundWidth,
        goalPostBottomPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .strokeCircle(
        groundWidth,
        goalPostBottomPositionY,
        goalPostRadius - goalPostLineWidth / 2
      );

    const goalPostNetWidth = 8;
    const goalPostDepth = 60;
    const goalPostCornerRadius = goalPostDepth * 0.75;

    const cornerRoundDivision = 10;
    const path =
      `${goalPostDepth} 0` +
      createRoundedPath({
        cx: goalPostCornerRadius + goalPostNetWidth,
        cy: goalPostCornerRadius + goalPostNetWidth,
        radius: goalPostCornerRadius + goalPostNetWidth,
        fromRadian: 1.5 * Math.PI,
        toRadian: 2.0 * Math.PI,
        division: cornerRoundDivision,
        reverse: true,
      }) +
      createRoundedPath({
        cx: goalPostCornerRadius + goalPostNetWidth,
        cy: goalPostWidth - goalPostCornerRadius + goalPostNetWidth,
        radius: goalPostCornerRadius + goalPostNetWidth,
        fromRadian: 1.0 * Math.PI,
        toRadian: 1.5 * Math.PI,
        division: cornerRoundDivision,
        reverse: true,
      }) +
      `,${goalPostDepth} ${goalPostWidth + 2 * goalPostNetWidth}` +
      `,${goalPostDepth} ${goalPostWidth + goalPostNetWidth}` +
      createRoundedPath({
        cx: goalPostCornerRadius + goalPostNetWidth,
        cy: goalPostWidth - goalPostCornerRadius + goalPostNetWidth,
        radius: goalPostCornerRadius,
        fromRadian: 1.0 * Math.PI,
        toRadian: 1.5 * Math.PI,
        division: cornerRoundDivision,
      }) +
      createRoundedPath({
        cx: goalPostCornerRadius + goalPostNetWidth,
        cy: goalPostCornerRadius + goalPostNetWidth,
        radius: goalPostCornerRadius,
        fromRadian: 1.5 * Math.PI,
        toRadian: 2.0 * Math.PI,
        division: cornerRoundDivision,
      }) +
      `,${goalPostDepth} ${goalPostNetWidth}`;

    const netBody = this.matter.body.create({});
    const netPath = this.matter.vertices.fromPath(path, netBody);
    this.matter.add.fromVertices(
      groundX - goalPostDepth + 2 * goalPostNetWidth,
      groundY + goalPostTopPositionY + goalPostWidth / 2,
      netPath,
      {
        isStatic: true,
      }
    );
  }

  private drawGround() {
    const tilemap = this.make.tilemap({
      tileWidth: 120,
      tileHeight: 120,
      width: 16,
      height: 8,
    });
    const tiles = tilemap.addTilesetImage('ground-tile');
    const layer = tilemap.createBlankLayer('ground-layer', tiles);
    layer.fill(0, 0, 0, tilemap.width, tilemap.height); // Body of the water
  }

  private getDirectionFromInput(): Direction {
    const xdir = +this.cursorKeys.right.isDown - +this.cursorKeys.left.isDown;
    const ydir = +this.cursorKeys.down.isDown - +this.cursorKeys.up.isDown;

    return ((xdir ? (xdir === -1 ? 'left' : 'right') : '') +
      (ydir ? (ydir === -1 ? 'up' : 'down') : '')) as Direction;
  }
}
