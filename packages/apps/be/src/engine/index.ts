import {
  GameRoomActionPayload,
  GameRoomActionType,
  GameRoomActionHandlers,
  GameRoomAction,
} from '@shared/types';
import Matter from 'matter-js';
import {
  BallState,
  GameRoomState,
  PlayerState,
} from '../rooms/schema/GameRoomState.ts';

export class GameEngine {
  // Matter.js engine
  engine: Matter.Engine;
  // Matter.js world
  world: Matter.World;
  // Colyseus room state. Need to update whenever there are updates in the world.

  // Some of the objects in the world we want to track/update
  players: { [sessionId in string]: Matter.Body } = {};
  ball: Matter.Body;

  state: GameRoomState;
  actionHandlers?: GameRoomActionHandlers;

  constructor(state: GameRoomState, actionHandlers?: GameRoomActionHandlers) {
    this.state = state;
    this.actionHandlers = actionHandlers;

    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.init();
  }

  init() {
    this.engine.gravity = { x: 0, y: 0, scale: 0 };

    // Add some boundary in our world
    // Matter.Composite.add(this.world, [
    //   Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    //   Matter.Bodies.circle(400, 0, 800, 50, { isStatic: true }),
    //   Matter.Bodies.circle(400, 600, 800, 50, { isStatic: true }),
    //   Matter.Bodies.circle(800, 300, 50, 600, { isStatic: true }),
    //   Matter.Bodies.circle(0, 300, 50, 600, { isStatic: true }),
    // ]);

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
        // player.angle = this.players[key].angle;
      }

      this.state.ball.x = this.ball.position.x;
      this.state.ball.y = this.ball.position.y;
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

  addBall(state: BallState): void {
    const { x, y, radius } = state;
    this.ball = Matter.Bodies.circle(x, y, radius, {
      isStatic: false,
    });
    this.ball.frictionAir = 0.02;
    Matter.Composite.add(this.world, [this.ball]);
    this.state.ball = state;
  }

  addPlayer(sessionId: string, state: PlayerState): void {
    const { x, y, radius } = state;
    const worldPlayer = Matter.Bodies.circle(x, y, radius, {
      isStatic: false,
    });
    worldPlayer.frictionAir = 0.02;
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

      case GameRoomActionType.SHOOT:
        /** TODO: */
        break;
    }
  }

  private processPlayerDirection(
    worldPlayer: Matter.Body,
    player: PlayerState,
    payload: GameRoomActionPayload[GameRoomActionType.DIRECTION]
  ): void {
    const speedLimit = PlayerState.SPEED_LIMIT;
    const currVelocity = worldPlayer.velocity;
    let newVx = currVelocity.x;
    let newVy = currVelocity.y;

    const [accelX, accelY] = player.accelrate(payload.direction);

    accelX && (newVx = Math.min(speedLimit, newVx + accelX));
    accelY && (newVy = Math.min(speedLimit, newVy + accelY));

    const speed = Math.sqrt(newVx * newVx + newVy * newVy);
    const overSpeedRatio = speed / speedLimit;
    if (overSpeedRatio > 1) {
      newVx /= overSpeedRatio;
      newVy /= overSpeedRatio;
    }

    // Update in the world
    Matter.Body.setVelocity(worldPlayer, { x: newVx, y: newVy });
  }
}
