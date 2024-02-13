import {
  GameRoomActionPayload,
  GameRoomActionType,
  GameRoomAction,
  HmzMapInfo,
  Team,
  PlayerEntityState,
  GameRoomMessageType,
  GameState,
} from '@shared/types';
import Matter from 'matter-js';
import {
  BallState,
  GameRoomState,
  PlayerState,
} from '../rooms/schema/GameRoomState.ts';

import decomp from 'poly-decomp-es';
import {
  BALL_MASK,
  BLUE_PLAYER_MASK,
  GROUND_OUTLINE_MASK,
  COLLISION_WITH_BALL_GROUP,
  GOAL_POST_MASK,
  GROUND_CENTERLINE_MASK,
  PLAYER_MASK,
  RED_PLAYER_MASK,
  STADIUM_OUTLINE_MASK,
} from '@constants';
import { MapBuilder } from '@utils/map/builder.ts';
import { GameRoom } from '../rooms/GameRoom.ts';

// @ts-ignore
global.decomp = decomp; // for concave hull

export class GameEngine {
  engine: Matter.Engine;
  world: Matter.World;

  players: { [sessionId in string]: Matter.Body } = {};
  ball: Matter.Body;

  room: GameRoom;
  state: GameRoomState;

  redGoalLine: number;
  blueGoalLine: number;

  constructor(room: GameRoom) {
    this.room = room;
    this.state = room.state;

    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.init();
  }

  init() {
    this.engine.gravity = { x: 0, y: 0, scale: 1 };

    this.initUpdateEvents();
    this.initCollisionEvents();
  }

  buildMap(map: HmzMapInfo) {
    new MapBuilder(this.world, map).build();

    this.redGoalLine = map.ground.x;
    this.blueGoalLine = map.ground.x + map.ground.width;
  }

  initUpdateEvents() {
    Matter.Events.on(this.engine, 'afterUpdate', () => {
      switch (this.state.state) {
        case GameState.PROGRESS:
          if (
            this.state.ball.x < this.redGoalLine ||
            this.state.ball.x > this.blueGoalLine
          ) {
            this.state.state = GameState.GOAL;
            this.state.ball.x < this.redGoalLine
              ? this.room.broadcast(GameRoomMessageType.GOAL, {
                  team: Team.RED,
                })
              : this.room.broadcast(GameRoomMessageType.GOAL, {
                  team: Team.BLUE,
                });

            setTimeout(() => {
              this.layoutKickoff();
            }, 3500);
          }
          break;

        case GameState.KICK_OFF:
          if (
            this.state.ball.x !== this.ball.position.x ||
            this.state.ball.y !== this.ball.position.y
          ) {
            this.state.state = GameState.PROGRESS;
          }
          break;
      }

      this.state.ball.x = this.ball.position.x;
      this.state.ball.y = this.ball.position.y;

      for (const key in this.players) {
        const worldPlayer = this.players[key];
        const player = this.state.players.get(key);
        if (!worldPlayer || !player) {
          continue;
        }

        player.x = this.players[key].position.x;
        player.y = this.players[key].position.y;

        if (player.entityState === PlayerEntityState.SHOOTING) {
          this.processPlayerShoot(worldPlayer, player);
        }
      }
    });
  }

  initCollisionEvents() {
    // The collision events
    // Matter.Events.on(this.engine, 'collisionStart', event => {
    //   const pairs = event.pairs;
    // });
  }

  update(delta: number) {
    Matter.Engine.update(this.engine, delta);
  }

  addBall(state: BallState): void {
    const { x, y, radius } = state;
    this.ball = Matter.Bodies.circle(x, y, radius);
    this.ball.mass = 25.0;
    this.ball.friction = 0;
    this.ball.frictionStatic = 0;
    this.ball.frictionAir = 0.02;
    this.ball.inertia = Infinity;
    // this.ball.restitution = 0.9;
    this.ball.collisionFilter = {
      group: COLLISION_WITH_BALL_GROUP,
      category: BALL_MASK,
      mask: PLAYER_MASK,
    };
    Matter.Composite.add(this.world, [this.ball]);
    this.state.ball = state;
  }

  addPlayer(sessionId: string, state: PlayerState): void {
    const { x, y, radius, team } = state;
    const worldPlayer = Matter.Bodies.circle(x, y, radius);
    worldPlayer.mass = 40.0;
    worldPlayer.friction = 0;
    worldPlayer.frictionAir = 0;
    worldPlayer.inertia = Infinity;
    worldPlayer.collisionFilter = {
      category: team === Team.RED ? RED_PLAYER_MASK : BLUE_PLAYER_MASK,
      mask:
        STADIUM_OUTLINE_MASK |
        GROUND_OUTLINE_MASK |
        GROUND_CENTERLINE_MASK |
        GOAL_POST_MASK |
        BALL_MASK |
        PLAYER_MASK,
    };
    this.players[sessionId] = worldPlayer;
    Matter.Composite.add(this.world, [worldPlayer]);
    this.state.createPlayer(sessionId, state);
  }

  removePlayer(sessionId: string): void {
    const player = this.players[sessionId];
    Matter.Composite.remove(this.world, [player]);
    this.state.removePlayer(sessionId);
  }

  processPlayerAction(sessionId: string, action: GameRoomAction): void {
    const worldPlayer = this.players[sessionId];
    const player = this.state.players.get(sessionId);
    if (!worldPlayer || !player) {
      return;
    }

    const { type, payload } = action;

    switch (type) {
      case GameRoomActionType.DIRECTION:
        this.processPlayerDirection(worldPlayer, player, payload);
        break;

      case GameRoomActionType.SHOOT_START:
        player.entityState = PlayerEntityState.SHOOTING;
        break;

      case GameRoomActionType.SHOOT_END:
        player.entityState = PlayerEntityState.IDLE;
        break;
    }
  }

  private layoutKickoff() {
    /** FIXME: duplicate logic */
    const height = this.room.setting.map.height;
    const centerLine = this.room.setting.map.width / 2;
    const redTeamCount = this.room.setting.redTeamCount;
    const blueTeamCount = this.room.setting.blueTeamCount;

    for (const key in this.players) {
      const worldPlayer = this.players[key];
      const player = this.state.players.get(key);

      if (!worldPlayer || !player) continue;

      const engagedTeamCount =
        player.team === Team.RED ? redTeamCount : blueTeamCount;
      const x =
        centerLine + ((player.team === Team.RED ? -1 : 1) * centerLine) / 2;
      const y = (height * (player.index + 1)) / (engagedTeamCount + 1);

      Matter.Body.setPosition(worldPlayer, { x, y });
      Matter.Body.setVelocity(worldPlayer, { x: 0, y: 0 });
    }

    const groundX = this.room.setting.map.ground.x;
    const groundY = this.room.setting.map.ground.y;
    const groundWidth = this.room.setting.map.ground.width;
    const groundHeight = this.room.setting.map.ground.height;
    Matter.Body.setPosition(this.ball, {
      x: groundX + groundWidth / 2,
      y: groundY + groundHeight / 2,
    });
    Matter.Body.setVelocity(this.ball, { x: 0, y: 0 });
    this.state.state = GameState.KICK_OFF;
    this.room.broadcast(GameRoomMessageType.KICK_OFF);
  }

  private processPlayerDirection(
    worldPlayer: Matter.Body,
    player: PlayerState,
    payload: GameRoomActionPayload[GameRoomActionType.DIRECTION]
  ): void {
    const speedLimit = PlayerState.SPEED_LIMIT;
    const friction = PlayerState.FRICTION;
    const currVelocity = worldPlayer.velocity;
    const [accelX, accelY] = player.accelrate(payload.direction);

    let newVx = currVelocity.x;
    let newVy = currVelocity.y;

    accelX
      ? (newVx =
          (Math.sign(newVx + accelX) || 1) *
          Math.min(speedLimit, Math.abs(newVx + accelX)))
      : (newVx -= newVx * (friction + accelY ? 0.02 : 0));
    accelY
      ? (newVy =
          (Math.sign(newVy + accelY) || 1) *
          Math.min(speedLimit, Math.abs(newVy + accelY)))
      : (newVy -= newVy * (friction + accelX ? 0.02 : 0));

    const speed = Math.sqrt(newVx * newVx + newVy * newVy);
    const overSpeedRatio = speed / speedLimit;
    if (overSpeedRatio > 1) {
      newVx /= overSpeedRatio;
      newVy /= overSpeedRatio;
    }

    Matter.Body.setVelocity(worldPlayer, { x: newVx, y: newVy });
  }

  private processPlayerShoot(worldPlayer: Matter.Body, player: PlayerState) {
    const contactThreshold = 1;
    const shootForce = 1.0;
    const worldBall = this.ball;

    // NOTE: vector 방향 중요
    const diffVectorX = worldBall.position.x - worldPlayer.position.x;
    const diffVectorY = worldBall.position.y - worldPlayer.position.y;
    const distBetweenCenter = Math.sqrt(
      diffVectorX * diffVectorX + diffVectorY * diffVectorY
    );
    const distBetweenBody =
      distBetweenCenter -
      (worldPlayer.circleRadius ?? 0) -
      (worldBall.circleRadius ?? 0);

    if (distBetweenBody > contactThreshold) {
      return;
    }

    const unitVectorX = diffVectorX / distBetweenCenter;
    const unitVectorY = diffVectorY / distBetweenCenter;

    // TODO: contactThreshold를 늘리고, 거리에 반비례하게 힘 적용
    Matter.Body.applyForce(worldBall, worldBall.position, {
      x: unitVectorX * Math.sqrt(shootForce),
      y: unitVectorY * Math.sqrt(shootForce),
    });

    player.entityState = PlayerEntityState.IDLE;
    this.room.broadcast(GameRoomMessageType.SHOOT);
  }
}
