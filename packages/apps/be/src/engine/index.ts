import {
  type GameRoomActionPayload,
  GameRoomActionType,
  type GameRoomAction,
  type HmzMapInfo,
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
} from '../rooms/schema/GameRoomState.js';

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
  PLAYER_GROUP,
  GOAL_POST_NET_MASK,
} from '@constants';
import { MapBuilder } from '@utils/map/builder.js';
import { GameRoom } from '../rooms/GameRoom.js';

// @ts-ignore
global.decomp = decomp; // for concave hull

export class GameEngine {
  engine: Matter.Engine;
  world: Matter.World;

  players: { [sessionId in string]: Matter.Body } = {};
  ball: Matter.Body;

  room: GameRoom;
  state: GameRoomState;
  mapBuilder: MapBuilder;

  redGoalLine: number;
  blueGoalLine: number;

  constructor(room: GameRoom) {
    this.room = room;
    this.state = room.state;

    this.engine = Matter.Engine.create({
      positionIterations: 8,
      velocityIterations: 6,
    });
    this.world = this.engine.world;
    this.init();
  }

  init() {
    this.engine.gravity = { x: 0, y: 0, scale: 1 };

    this.initUpdateEvents();
    this.initCollisionEvents();
  }

  buildMap(map: HmzMapInfo) {
    this.mapBuilder = new MapBuilder(this.world, map);
    this.mapBuilder.build();

    this.redGoalLine = map.ground.x;
    this.blueGoalLine = map.ground.x + map.ground.width;
  }

  initUpdateEvents() {
    Matter.Events.on(this.engine, 'afterUpdate', () => {
      const { x: ballX } = this.ball.position;
      switch (this.state.state) {
        case GameState.PROGRESS:
          if (ballX < this.redGoalLine || ballX > this.blueGoalLine) {
            this.state.state = GameState.GOAL;
            const isRedTeamGoal = ballX > this.blueGoalLine;

            if (isRedTeamGoal) {
              this.state.redTeamScore += 1;
              this.room.broadcast(GameRoomMessageType.GOAL, {
                team: Team.RED,
                redTeamScore: this.state.redTeamScore,
                blueTeamScore: this.state.blueTeamScore,
              });
            } else {
              this.state.blueTeamScore += 1;
              this.room.broadcast(GameRoomMessageType.GOAL, {
                team: Team.BLUE,
                redTeamScore: this.state.redTeamScore,
                blueTeamScore: this.state.blueTeamScore,
              });
            }

            const endScore = this.room.setting.endScore;

            if (
              this.state.redTeamScore === endScore ||
              this.state.blueTeamScore === endScore
            ) {
              const isRedTeamVictory = this.state.redTeamScore === endScore;

              isRedTeamVictory
                ? this.room.broadcast(GameRoomMessageType.END, {
                    victoryTeam: Team.RED,
                  })
                : this.room.broadcast(GameRoomMessageType.END, {
                    victoryTeam: Team.BLUE,
                  });

              setTimeout(() => {
                this.destroy();
              }, 3000);
            } else {
              setTimeout(() => {
                // TODO: 리플레이
                this.setupKickoff(isRedTeamGoal ? Team.BLUE : Team.RED);
              }, 3000);
            }
          }
          break;

        case GameState.KICKOFF:
          break;
      }

      const { x, y } = this.ball.position;
      this.state.ball.x = x;
      this.state.ball.y = y;

      for (const key in this.players) {
        const worldPlayer = this.players[key];
        const player = this.state.players.get(key);
        if (!worldPlayer || !player) {
          continue;
        }

        const { x, y } = worldPlayer.position;
        player.x = x;
        player.y = y;

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
    this.state.players.forEach(player => {
      let action: any;

      // dequeue player inputs
      while ((action = player.actionQueue.shift())) {
        this.processPlayerAction(player.id, action);
      }
    });

    Matter.Engine.update(this.engine, delta);
  }

  addBall(state: BallState): void {
    const { kickoffX: x, kickoffY: y, radius } = state;
    this.ball = Matter.Bodies.circle(x, y, radius);
    this.ball.mass = 5.0;
    this.ball.friction = 0;
    this.ball.frictionStatic = 5;
    this.ball.frictionAir = 0.018;
    this.ball.inertia = Infinity;
    this.ball.collisionFilter = {
      group: COLLISION_WITH_BALL_GROUP,
      category: BALL_MASK,
      mask: PLAYER_MASK,
    };
    Matter.Composite.add(this.world, [this.ball]);
    this.state.ball = state;
  }

  addPlayer(sessionId: string, state: PlayerState): void {
    const { kickoffX: x, kickoffY: y, radius, team } = state;
    const worldPlayer = Matter.Bodies.circle(x, y, radius);
    worldPlayer.mass = 40.0;
    worldPlayer.friction = 0;
    worldPlayer.frictionStatic = 0;
    worldPlayer.frictionAir = 0;
    worldPlayer.inertia = Infinity;
    worldPlayer.collisionFilter = {
      group: PLAYER_GROUP,
      category: team === Team.RED ? RED_PLAYER_MASK : BLUE_PLAYER_MASK,
      mask:
        STADIUM_OUTLINE_MASK |
        GROUND_OUTLINE_MASK |
        GROUND_CENTERLINE_MASK |
        GOAL_POST_MASK |
        GOAL_POST_NET_MASK |
        BALL_MASK,
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

  destroy() {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
    this.room.broadcast(GameRoomMessageType.DISPOSE);
    this.room.disconnect();
  }

  /** FIXME: duplicate logic */
  // TODO: layout 로직 분리
  setupKickoff(team: Team) {
    this.mapBuilder.blockGroundOutLines();
    this.mapBuilder.blockCenterLine(team === Team.RED ? 'right' : 'left');
    this.mapBuilder.blockGoalPostNets();

    for (const key in this.players) {
      const worldPlayer = this.players[key];
      const player = this.state.players.get(key);

      if (!worldPlayer || !player) continue;

      Matter.Body.setPosition(worldPlayer, {
        x: player.kickoffX,
        y: player.kickoffY,
      });
      Matter.Body.setVelocity(worldPlayer, { x: 0, y: 0 });
    }

    Matter.Body.setPosition(this.ball, {
      x: this.state.ball.kickoffX,
      y: this.state.ball.kickoffY,
    });
    Matter.Body.setVelocity(this.ball, { x: 0, y: 0 });
    this.onceDetectBallTouch(() => {
      this.state.state = GameState.PROGRESS;
      this.mapBuilder.openCenterLine();
      this.mapBuilder.openGroundLines();
      this.mapBuilder.openGoalPostNets();
    });
    this.state.state = GameState.KICKOFF;
    setTimeout(() => {
      this.room.broadcast(GameRoomMessageType.KICKOFF);
    }, 100);
  }

  private processPlayerDirection(
    worldPlayer: Matter.Body,
    player: PlayerState,
    payload: GameRoomActionPayload[GameRoomActionType.DIRECTION]
  ): void {
    const speedLimit =
      player.entityState === PlayerEntityState.SHOOTING
        ? PlayerState.SHOOTING_SPEED_LIMIT
        : PlayerState.SPEED_LIMIT;
    const friction = PlayerState.FRICTION;
    const currVelocity = worldPlayer.velocity;
    const [accelX, accelY] = player.accelrate(payload.direction);

    let newVx = currVelocity.x;
    let newVy = currVelocity.y;

    accelX
      ? (newVx =
          (Math.sign(newVx + accelX) || 1) *
          Math.min(speedLimit, Math.abs(newVx + accelX)))
      : (newVx -= newVx * (friction + accelY ? 0.01 : 0));
    accelY
      ? (newVy =
          (Math.sign(newVy + accelY) || 1) *
          Math.min(speedLimit, Math.abs(newVy + accelY)))
      : (newVy -= newVy * (friction + accelX ? 0.01 : 0));

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
    const shootForce = 0.04;
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

  private onceDetectBallTouch(onBallTouch: () => void) {
    const cb = (event: Matter.IEventCollision<Matter.Engine>) => {
      for (const { bodyA, bodyB } of event.pairs) {
        if (bodyA === this.ball || bodyB === this.ball) {
          Matter.Events.off(this.engine, 'collisionStart', cb);
          onBallTouch();
        }
      }
    };

    Matter.Events.on(this.engine, 'collisionStart', cb);
  }
}
