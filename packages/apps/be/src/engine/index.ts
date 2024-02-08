import {
  GameRoomActionPayload,
  GameRoomActionType,
  GameRoomAction,
  HmzMapInfo,
  Team,
} from '@shared/types';
import Matter from 'matter-js';
import {
  BallState,
  GameRoomState,
  PlayerState,
} from '../rooms/schema/GameRoomState.ts';

const DEFAULT_GROUP = 0;
const COLLISION_WITH_BALL_GROUP = 1;

const DEFAULT_MASK = 0xffffffff;
const STADIUM_OUTLINE_MASK = 1 << 0;
const GOAL_POST_MASK = 1 << 1;
const GROUND_CENTERLINE_MASK = 1 << 2;
const GROUND_OUTLINE_MASK = 1 << 3;

const BALL_MASK = 1 << 4;
const RED_PLAYER_MASK = 1 << 5;
const BLUE_PLAYER_MASK = 1 << 6;
const PLAYER_MASK = RED_PLAYER_MASK | BLUE_PLAYER_MASK;

export class GameEngine {
  engine: Matter.Engine;
  world: Matter.World;

  players: { [sessionId in string]: Matter.Body } = {};
  ball: Matter.Body;

  state: GameRoomState;

  constructor(state: GameRoomState) {
    this.state = state;

    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.init();
  }

  init() {
    this.engine.gravity = { x: 0, y: 0, scale: 1 };
    this.initUpdateEvents();
    this.initCollisionEvents();
  }

  initUpdateEvents() {
    // Update events to sync bodies in the world to the state.
    Matter.Events.on(this.engine, 'afterUpdate', () => {
      for (const key in this.players) {
        // Make sure we still have the player in the world or state.
        const worldPlayer = this.players[key];
        const player = this.state.players.get(key);
        if (!worldPlayer || !player) {
          continue;
        }

        player.x = this.players[key].position.x;
        player.y = this.players[key].position.y;
      }

      this.state.ball.x = this.ball.position.x;
      this.state.ball.y = this.ball.position.y;

      console.log(this.ball.position);
    });
  }

  initCollisionEvents() {
    // The collision events
    Matter.Events.on(this.engine, 'collisionStart', event => {
      // const pairs = event.pairs;
    });
  }

  update(delta: number) {
    Matter.Engine.update(this.engine, delta);
  }

  applyMap(map: HmzMapInfo): void {
    const thick = 20;
    const width = map.width;
    const height = map.height;

    Matter.Composite.add(
      this.world,
      [
        // top
        Matter.Bodies.rectangle(width / 2, -thick / 2, width, thick, {
          isStatic: true,
        }),
        // bottom
        Matter.Bodies.rectangle(width / 2, height + thick / 2, width, thick, {
          isStatic: true,
        }),
        // left
        Matter.Bodies.rectangle(-thick / 2, height / 2, thick, height, {
          isStatic: true,
        }),
        // right
        Matter.Bodies.rectangle(width + thick / 2, height / 2, thick, height, {
          isStatic: true,
        }),
      ].map(body => {
        body.collisionFilter = {
          group: DEFAULT_GROUP,
          category: STADIUM_OUTLINE_MASK,
          mask: PLAYER_MASK,
        };
        return body;
      })
    );

    const groundWidth = map.ground.width;
    const groundHeight = map.ground.height;
    const groundX = (width - groundWidth) / 2;
    const groundY = (height - groundHeight) / 2;
    const goalPostWidth = 350;
    const goalPostTopPositionY = (height - goalPostWidth) / 2;
    const goalPostBottomPositionY = (height + goalPostWidth) / 2;

    Matter.Composite.add(
      this.world,
      [
        // top
        Matter.Bodies.rectangle(
          width / 2,
          groundY - thick / 2,
          groundWidth,
          thick,
          {
            isStatic: true,
          }
        ),
        // bottom
        Matter.Bodies.rectangle(
          width / 2,
          groundY + groundHeight + thick / 2,
          groundWidth,
          thick,
          {
            isStatic: true,
          }
        ),
        // left
        Matter.Bodies.rectangle(
          groundX - thick / 2,
          height / 2,
          thick,
          groundHeight,
          {
            isStatic: true,
          }
        ),
        // right
        Matter.Bodies.rectangle(
          groundX + groundWidth + thick / 2,
          height / 2,
          thick,
          groundHeight,
          {
            isStatic: true,
          }
        ),
      ].map(body => {
        body.collisionFilter = {
          group: COLLISION_WITH_BALL_GROUP,
          category: GROUND_OUTLINE_MASK,
        };
        return body;
      })
    );
  }

  addBall(state: BallState): void {
    const { x, y, radius } = state;
    this.ball = Matter.Bodies.circle(x, y, radius);
    this.ball.mass = 20.0;
    this.ball.friction = 0;
    this.ball.frictionAir = 0.02;
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
    worldPlayer.collisionFilter = {
      group: DEFAULT_GROUP,
      category: team === Team.RED ? RED_PLAYER_MASK : BLUE_PLAYER_MASK,
      mask: STADIUM_OUTLINE_MASK | BALL_MASK | PLAYER_MASK,
    };
    this.players[sessionId] = worldPlayer;
    Matter.Composite.add(this.world, [worldPlayer]);
    this.state.createPlayer(sessionId, state);
    console.log(worldPlayer.collisionFilter);
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

      case GameRoomActionType.SHOOT:
        this.processPlayerShoot(worldPlayer);
        break;
    }
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

  private processPlayerShoot(worldPlayer: Matter.Body) {
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

    const unitVectorX = diffVectorX / distBetweenCenter;
    const unitVectorY = diffVectorY / distBetweenCenter;

    // TODO: contactThreshold를 늘리고, 거리에 반비례하게 힘 적용
    if (distBetweenBody < contactThreshold) {
      Matter.Body.applyForce(worldBall, worldBall.position, {
        x: unitVectorX * Math.sqrt(shootForce),
        y: unitVectorY * Math.sqrt(shootForce),
      });
    }
  }
}
