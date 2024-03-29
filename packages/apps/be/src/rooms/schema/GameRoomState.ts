import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import {
  Direction,
  GameState,
  PlayerEntityState,
  Position,
  Team,
} from "@shared/types";

export class PlayerState extends Schema {
  static SPEED_LIMIT = 2.8; // pixel per step
  static SHOOTING_SPEED_LIMIT = 2.0; // pixel per step
  static ACCELERATION = 0.08; // speed per step
  static SHOOTING_ACCLERATION = 0.05; // speed per step
  static FRICTION = 0.004; // rate per step

  id: string;
  actionQueue: any[] = []; // input from the client

  accelX: number = 0;
  accelY: number = 0;
  index: number; /** like player's number */

  @type("string") name: string;
  @type("string") team: Team;
  @type("number") radius = 27;
  @type("number") entityState: PlayerEntityState = PlayerEntityState.IDLE;
  @type("number") kickoffX: number;
  @type("number") kickoffY: number;

  positionHistoriesBeforePatch: string /** `${x},{y}` format */[] = [];

  // FIXME: schema array가 안돼서 임시처리
  @type({ array: "string" }) positionHistories =
    new ArraySchema<string /** `${x},{y}` format */>();
  pushPosition(position: Position) {
    this.positionHistoriesBeforePatch.push(`${position.x},${position.y}`);
  }
  flushPosition() {
    this.positionHistories.clear();
    this.positionHistoriesBeforePatch.forEach((positionString) => {
      this.positionHistories.push(positionString);
    });
    this.positionHistoriesBeforePatch = [];
  }
  // FIXME:

  accelrate(direction: Direction): [number, number] {
    const acceleration =
      this.entityState === PlayerEntityState.SHOOTING
        ? PlayerState.SHOOTING_ACCLERATION
        : PlayerState.ACCELERATION;

    // // FIXME: 임시로 속력으로 사용
    // const acceleration = 3;

    switch (direction) {
      case "":
        this.accelX = 0;
        this.accelY = 0;
        break;
      case "left":
        this.accelX = -acceleration;
        this.accelY = 0;
        break;
      case "right":
        this.accelX = acceleration;
        this.accelY = 0;
        break;
      case "up":
        this.accelX = 0;
        this.accelY = -acceleration;
        break;
      case "down":
        this.accelX = 0;
        this.accelY = acceleration;
        break;
      case "leftup":
        this.accelX = -acceleration * Math.SQRT1_2;
        this.accelY = -acceleration * Math.SQRT1_2;
        break;
      case "leftdown":
        this.accelX = -acceleration * Math.SQRT1_2;
        this.accelY = acceleration * Math.SQRT1_2;
        break;
      case "rightup":
        this.accelX = acceleration * Math.SQRT1_2;
        this.accelY = -acceleration * Math.SQRT1_2;
        break;
      case "rightdown":
        this.accelX = acceleration * Math.SQRT1_2;
        this.accelY = acceleration * Math.SQRT1_2;
        break;
    }

    return [this.accelX, this.accelY];
  }
}

export class BallState extends Schema {
  @type("number") radius: number = 19;
  @type("number") kickoffX: number;
  @type("number") kickoffY: number;

  positionHistoriesBeforePatch: string /** `${x},{y}` format */[] = [];

  // FIXME: schema array가 안돼서 임시처리
  @type({ array: "string" }) positionHistories =
    new ArraySchema<string /** `${x},{y}` format */>();
  pushPosition(position: Position) {
    this.positionHistoriesBeforePatch.push(`${position.x},${position.y}`);
  }
  flushPosition() {
    this.positionHistories.clear();
    this.positionHistoriesBeforePatch.forEach((positionString) => {
      this.positionHistories.push(positionString);
    });
    this.positionHistoriesBeforePatch = [];
  }
  // FIXME:
}

export class GameRoomState extends Schema {
  redTeamScore = 0;
  blueTeamScore = 0;

  @type("number") state: GameState = GameState.KICK_OFF;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type(BallState) ball: BallState;

  createPlayer(sessionId: string, state: PlayerState): void {
    this.players.set(sessionId, state);
  }

  removePlayer(sessionId: string): void {
    // TODO:
  }
}
