import {
  type HmzMapInfo,
  Team,
  PlayerEntityState,
  GameState,
  type GameSceneState,
  type BallState,
  type PlayerState,
} from '@shared/types';
import {
  type GameUserAction,
  GameUserActionType,
  GameSystemMessage,
  GameSystemMessageType,
  GameSystemMessagePayload,
} from '@shared/types/message/in-game';
import Matter from 'matter-js';

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
import cloneDeep from 'lodash.clonedeep';

type GameSystemMessageBroadcaster = <T extends GameSystemMessageType>(
  type: T,
  paylaod: GameSystemMessagePayload[T]
) => void;

// @ts-ignore
global.decomp = decomp; // for concave hull

const PLAYER_SPEED_LIMIT = 2.8; // pixel per step
const PLAYER_SHOOTING_SPEED_LIMIT = 2.0; // pixel per step
const PLAYER_ACCELERATION = 0.16; // speed per step
const PLAYER_SHOOTING_ACCLERATION = 0.1; // speed per step
const PLAYER_FRICTION = 0.004; // rate per step

export class GameEngine {
  private _engine: Matter.Engine;
  private _world: Matter.World;

  private _mapBuilder: MapBuilder;
  private _initialSceneState: GameSceneState;
  private _sceneState: GameSceneState;

  private _playerBodies: { [sessionId in string]: Matter.Body } = {};
  private _ballBody: Matter.Body;

  private _broadcastMessage: GameSystemMessageBroadcaster;

  redGoalLine: number;
  blueGoalLine: number;

  constructor(options: {
    initialSceneState: GameSceneState;
    map: HmzMapInfo;
    broadcastGameSystemMessage: GameSystemMessageBroadcaster;
  }) {
    this._initialSceneState = cloneDeep(options.initialSceneState);
    this._sceneState = options.initialSceneState;
    console.log(this._sceneState);
    this._engine = Matter.Engine.create({
      positionIterations: 3,
      velocityIterations: 2,
    });
    this._world = this._engine.world;
    this._engine.gravity = { x: 0, y: 0, scale: 1 };
    this._broadcastMessage = options.broadcastGameSystemMessage;

    this._buildMap(options.map);
    this._initBodies(options.initialSceneState);
    this._initUpdateEvents();
    this._blockAllLine();
    // this._initCollisionEvents();
  }

  update = (delta: number, actions: GameUserAction[]) => {
    actions.forEach(this._processPlayerAction);

    Object.entries(this._sceneState.players).forEach(([id, player]) => {
      this._processPlayerDirection(this._playerBodies[id], player);
    });

    Matter.Engine.update(this._engine, delta);
  };

  getGameSceneState = (): GameSceneState => {
    return this._sceneState;
  };

  private _initBodies(initialSceneState: GameSceneState) {
    Object.entries(initialSceneState.players).forEach(([id, player]) => {
      this._addPlayerBody(id, player);
    });
    this._addBallBody(initialSceneState.ball);
  }

  private _buildMap(map: HmzMapInfo) {
    this._mapBuilder = new MapBuilder(this._world, map);
    this._mapBuilder.build();

    this.redGoalLine = map.ground.x;
    this.blueGoalLine = map.ground.x + map.ground.width;
  }

  private _addBallBody(state: BallState): void {
    // const { index, x, y, radius } = state;
    const { x, y, radius } = state;
    this._ballBody = Matter.Bodies.circle(x, y, radius);
    this._ballBody.mass = 5.0;
    this._ballBody.friction = 0;
    this._ballBody.frictionStatic = 5;
    this._ballBody.frictionAir = 0.018;
    this._ballBody.inertia = Infinity;
    this._ballBody.collisionFilter = {
      group: COLLISION_WITH_BALL_GROUP,
      category: BALL_MASK,
      mask: PLAYER_MASK,
    };
    Matter.Composite.add(this._world, [this._ballBody]);
    this._sceneState.ball = state;
  }

  private _addPlayerBody(sessionId: string, state: PlayerState): void {
    // const { index, x, y, radius, team } = state;
    const { x, y, radius, team } = state;
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
    this._playerBodies[sessionId] = worldPlayer;
    Matter.Composite.add(this._world, [worldPlayer]);
    // this.sceneState.createPlayer(sessionId, state);
  }

  // TODO:
  // removePlayer(sessionId: string): void {
  //   const player = this._players[sessionId];
  //   Matter.Composite.remove(this.world, [player]);
  //   // this.sceneState.removePlayer(sessionId);
  // }

  private _processPlayerAction = (action: GameUserAction) => {
    const id = action.payload.id;
    const player = this._sceneState.players[id];
    if (!player) {
      console.log(`_processPlayerAction: player undefined (id: ${id})`);
      return;
    }

    const { type, payload } = action;

    switch (type) {
      case GameUserActionType.CHANGE_DIRECTION:
        player.direction = payload.direction;
        break;

      case GameUserActionType.SHOOT_START:
        player.entityState = PlayerEntityState.SHOOTING;
        break;

      case GameUserActionType.SHOOT_END:
        player.entityState = PlayerEntityState.IDLE;
        break;
    }
  };

  destroy() {
    Matter.World.clear(this._world, false);
    Matter.Engine.clear(this._engine);
  }

  setupFirstKickoff() {
    this._sceneState.state = GameState.KICKOFF;

    this._mapBuilder.openCenterLine();
    this._mapBuilder.blockCenterLine('right');

    this._onceDetectBallTouch(() => {
      this._sceneState.state = GameState.PROGRESS;
      this._mapBuilder.openCenterLine();
      this._mapBuilder.openGroundLines();
      this._mapBuilder.openGoalPostNets();
    });
  }

  private _blockAllLine() {
    this._mapBuilder.blockGroundOutLines();
    this._mapBuilder.blockCenterLine('right');
    this._mapBuilder.blockCenterLine('left');
    this._mapBuilder.blockGoalPostNets();
  }

  private _blockLine(kickoffTeam: Team) {
    this._mapBuilder.blockGroundOutLines();
    this._mapBuilder.blockCenterLine(
      kickoffTeam === Team.RED ? 'right' : 'left'
    );
    this._mapBuilder.blockGoalPostNets();

    this._onceDetectBallTouch(() => {
      this._sceneState.state = GameState.PROGRESS;
      this._mapBuilder.openCenterLine();
      this._mapBuilder.openGroundLines();
      this._mapBuilder.openGoalPostNets();
    });
  }

  private _setupKickoff(kickoffTeam: Team) {
    this._blockLine(kickoffTeam);

    for (const key in this._playerBodies) {
      const worldPlayer = this._playerBodies[key];
      const player = this._sceneState.players[key];

      if (!worldPlayer || !player) continue;

      const { x, y } = this._initialSceneState.players[key];

      Matter.Body.setPosition(worldPlayer, {
        x,
        y,
      });
      Matter.Body.setVelocity(worldPlayer, { x: 0, y: 0 });
    }

    Matter.Body.setPosition(this._ballBody, {
      x: this._initialSceneState.ball.x,
      y: this._initialSceneState.ball.y,
    });
    Matter.Body.setVelocity(this._ballBody, { x: 0, y: 0 });
    this._sceneState.state = GameState.KICKOFF;
    setTimeout(() => {
      this._broadcastMessage(GameSystemMessageType.KICKOFF, undefined);
    }, 100);
  }

  private _processPlayerDirection(
    worldPlayer: Matter.Body,
    player: PlayerState
  ): void {
    const speedLimit =
      player.entityState === PlayerEntityState.SHOOTING
        ? PLAYER_SHOOTING_SPEED_LIMIT
        : PLAYER_SPEED_LIMIT;
    const acceleration =
      player.entityState === PlayerEntityState.SHOOTING
        ? PLAYER_SHOOTING_ACCLERATION
        : PLAYER_ACCELERATION;
    const friction = PLAYER_FRICTION;
    const currVelocity = worldPlayer.velocity;

    let [accelX, accelY] = [0, 0];

    switch (player.direction) {
      case '':
        accelX = 0;
        accelY = 0;
        break;
      case 'left':
        accelX = -acceleration;
        accelY = 0;
        break;
      case 'right':
        accelX = acceleration;
        accelY = 0;
        break;
      case 'up':
        accelX = 0;
        accelY = -acceleration;
        break;
      case 'down':
        accelX = 0;
        accelY = acceleration;
        break;
      case 'leftup':
        accelX = -acceleration * Math.SQRT1_2;
        accelY = -acceleration * Math.SQRT1_2;
        break;
      case 'leftdown':
        accelX = -acceleration * Math.SQRT1_2;
        accelY = acceleration * Math.SQRT1_2;
        break;
      case 'rightup':
        accelX = acceleration * Math.SQRT1_2;
        accelY = -acceleration * Math.SQRT1_2;
        break;
      case 'rightdown':
        accelX = acceleration * Math.SQRT1_2;
        accelY = acceleration * Math.SQRT1_2;
        break;
    }

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

  private _processPlayerShoot(worldPlayer: Matter.Body, player: PlayerState) {
    const contactThreshold = 1;
    const shootForce = 0.01;
    const worldBall = this._ballBody;

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
    this._broadcastMessage(GameSystemMessageType.SHOOT, undefined);
  }

  private _onceDetectBallTouch(onBallTouch: () => void) {
    const cb = (event: Matter.IEventCollision<Matter.Engine>) => {
      for (const { bodyA, bodyB } of event.pairs) {
        if (bodyA === this._ballBody || bodyB === this._ballBody) {
          Matter.Events.off(this._engine, 'collisionStart', cb);
          onBallTouch();
        }
      }
    };

    Matter.Events.on(this._engine, 'collisionStart', cb);
  }

  private _initUpdateEvents() {
    Matter.Events.on(this._engine, 'afterUpdate', () => {
      const { x: ballX } = this._ballBody.position;
      switch (this._sceneState.state) {
        case GameState.PROGRESS:
          if (ballX < this.redGoalLine || ballX > this.blueGoalLine) {
            this._sceneState.state = GameState.GOAL;
            const isRedTeamGoal = ballX > this.blueGoalLine;

            if (isRedTeamGoal) {
              this._broadcastMessage(GameSystemMessageType.GOAL, {
                team: Team.RED,
                redTeamScore: ++this._sceneState.score[Team.RED],
                blueTeamScore: this._sceneState.score[Team.BLUE],
              });
            } else {
              this._broadcastMessage(GameSystemMessageType.GOAL, {
                team: Team.BLUE,
                redTeamScore: this._sceneState.score[Team.RED],
                blueTeamScore: ++this._sceneState.score[Team.BLUE],
              });
            }

            // FIXME:
            const endScore = 3;

            if (
              this._sceneState.score[Team.RED] === endScore ||
              this._sceneState.score[Team.BLUE] === endScore
            ) {
              const isRedTeamVictory =
                this._sceneState.score[Team.RED] === endScore;

              setTimeout(() => {
                this.destroy();

                isRedTeamVictory
                  ? this._broadcastMessage(GameSystemMessageType.END, {
                      victoryTeam: Team.RED,
                    })
                  : this._broadcastMessage(GameSystemMessageType.END, {
                      victoryTeam: Team.BLUE,
                    });
              }, 3000);
            } else {
              setTimeout(() => {
                // TODO: 리플레이
                this._setupKickoff(isRedTeamGoal ? Team.BLUE : Team.RED);
              }, 3000);
            }
          }
          break;

        case GameState.KICKOFF:
          break;
      }

      const { x, y } = this._ballBody.position;
      this._sceneState.ball.x = x;
      this._sceneState.ball.y = y;

      for (const key in this._playerBodies) {
        const worldPlayer = this._playerBodies[key];
        const player = this._sceneState.players[key];
        if (!worldPlayer || !player) {
          continue;
        }

        const { x, y } = worldPlayer.position;
        player.x = x;
        player.y = y;

        if (player.entityState === PlayerEntityState.SHOOTING) {
          this._processPlayerShoot(worldPlayer, player);
        }
      }
    });
  }

  // private _initCollisionEvents() {
  // The collision events
  // Matter.Events.on(this.engine, 'collisionStart', event => {
  //   const pairs = event.pairs;
  // });
  // }
}
