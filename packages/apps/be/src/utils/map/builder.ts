import { type HmzMapInfo, Team } from '@shared/types';
import { createRoundedPath } from '@utils/path.js';
import {
  COLLISION_WITH_BALL_GROUP,
  DEFAULT_GROUP,
  GOAL_POST_MASK,
  GOAL_POST_NET_MASK,
  GROUND_CENTERLINE_MASK,
  GROUND_OUTLINE_MASK,
  PLAYER_MASK,
  STADIUM_OUTLINE_MASK,
} from '@constants';
import Matter from 'matter-js';

const WALL_THICK = 80;
const lineWidth = 4; // FIXME:

export class MapBuilder {
  private world: Matter.World;
  private map: HmzMapInfo;

  /** for block */
  private groundOutLines: Matter.Body[] = [];
  private leftSideCenterLines: Matter.Body[] = [];
  private rightSideCenterLines: Matter.Body[] = [];
  private goalPostNets: Matter.Body[] = [];

  constructor(world: Matter.World, map: HmzMapInfo) {
    this.world = world;
    this.map = map;
  }

  blockGroundOutLines() {
    this.groundOutLines.forEach(body => {
      body.collisionFilter.mask =
        (body.collisionFilter.mask ?? 0) | PLAYER_MASK;
    });
  }

  openGroundLines() {
    this.groundOutLines.forEach(body => {
      body.collisionFilter.mask =
        (body.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
  }

  blockCenterLine(side: 'left' | 'right') {
    if (side === 'right') {
      this.rightSideCenterLines.forEach(lineBody => {
        lineBody.collisionFilter.mask =
          (lineBody.collisionFilter.mask ?? 0) | PLAYER_MASK;
      });
    } else {
      this.leftSideCenterLines.forEach(lineBody => {
        lineBody.collisionFilter.mask =
          (lineBody.collisionFilter.mask ?? 0) | PLAYER_MASK;
      });
    }
  }

  openCenterLine() {
    this.rightSideCenterLines.forEach(lineBody => {
      lineBody.collisionFilter.mask =
        (lineBody.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
    this.leftSideCenterLines.forEach(lineBody => {
      lineBody.collisionFilter.mask =
        (lineBody.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
  }

  blockGoalPostNets() {
    this.goalPostNets.forEach(netBody => {
      netBody.collisionFilter.mask =
        (netBody.collisionFilter.mask ?? 0) | PLAYER_MASK;
    });
  }

  openGoalPostNets() {
    this.goalPostNets.forEach(netBody => {
      netBody.collisionFilter.mask =
        (netBody.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
  }

  build() {
    const width = this.map.width;
    const height = this.map.height;

    Matter.Composite.add(
      this.world,
      [
        // top
        Matter.Bodies.rectangle(width / 2, 0, width, WALL_THICK),
        // bottom
        Matter.Bodies.rectangle(width / 2, height, width, WALL_THICK),
        // left
        Matter.Bodies.rectangle(
          -WALL_THICK / 2,
          height / 2,
          WALL_THICK,
          height
        ),
        // right
        Matter.Bodies.rectangle(
          width + WALL_THICK / 2,
          height / 2,
          WALL_THICK,
          height
        ),
      ].map(body => {
        body.isStatic = true;
        body.collisionFilter = {
          group: DEFAULT_GROUP,
          category: STADIUM_OUTLINE_MASK,
          mask: PLAYER_MASK,
        };
        return body;
      })
    );

    this.groundOutLines = this.drawGroundOutLines();
    const centerLines = this.drawCenterLines();
    const leftHalfCircle = this.drawCenterLeftHalfCircle();
    const rightHalfCircle = this.drawCenterRightHalfCircle();
    this.leftSideCenterLines = [...centerLines, leftHalfCircle];
    this.rightSideCenterLines = [...centerLines, rightHalfCircle];

    this.goalPostNets = this.drawGoalPostNets();
    this.drawGoalPosts();
  }

  private drawGoalPosts() {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundX = (width - groundWidth) / 2;
    const goalPostWidth = this.map.ground.goalPostWidth;
    const goalPostTopPositionY = (height - goalPostWidth) / 2;
    const goalPostBottomPositionY = (height + goalPostWidth) / 2;
    const goalPostRadius = this.map.ground.goalPostRadius;

    // goal posts
    Matter.Composite.add(
      this.world,
      [
        // left
        Matter.Bodies.circle(groundX, goalPostTopPositionY, goalPostRadius),
        Matter.Bodies.circle(groundX, goalPostBottomPositionY, goalPostRadius),
        // right
        Matter.Bodies.circle(
          groundX + groundWidth,
          goalPostTopPositionY,
          goalPostRadius
        ),
        Matter.Bodies.circle(
          groundX + groundWidth,
          goalPostBottomPositionY,
          goalPostRadius
        ),
      ].map(body => {
        body.isStatic = true;
        body.restitution = 0.8;
        body.collisionFilter = {
          group: COLLISION_WITH_BALL_GROUP,
          category: GOAL_POST_MASK,
          mask: PLAYER_MASK,
        };
        return body;
      })
    );
  }

  private drawGroundOutLines(mask = 0) {
    const width = this.map.width;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = this.map.ground.x;
    const groundY = this.map.ground.y;
    const { goalPostTopPositionY, goalPostBottomPositionY } = this.map.ground;

    const groundOutLines = [
      // top
      Matter.Bodies.rectangle(
        width / 2,
        groundY - WALL_THICK / 2,
        groundWidth,
        WALL_THICK
      ),
      // bottom
      Matter.Bodies.rectangle(
        width / 2,
        groundY + groundHeight + WALL_THICK / 2,
        groundWidth,
        WALL_THICK
      ),
      // left
      Matter.Bodies.rectangle(
        groundX - WALL_THICK / 2,
        groundY + (goalPostTopPositionY - groundY) / 2,
        WALL_THICK,
        goalPostTopPositionY - groundY
      ),
      Matter.Bodies.rectangle(
        groundX - WALL_THICK / 2,
        goalPostBottomPositionY + (goalPostTopPositionY - groundY) / 2,
        WALL_THICK,
        goalPostTopPositionY - groundY
      ),
      // right
      Matter.Bodies.rectangle(
        groundX + groundWidth + WALL_THICK / 2,
        groundY + (goalPostTopPositionY - groundY) / 2,
        WALL_THICK,
        goalPostTopPositionY - groundY
      ),
      Matter.Bodies.rectangle(
        groundX + groundWidth + WALL_THICK / 2,
        goalPostBottomPositionY + (goalPostTopPositionY - groundY) / 2,
        WALL_THICK,
        goalPostTopPositionY - groundY
      ),
    ].map(body => {
      body.isStatic = true;
      body.restitution = 0.6;
      body.collisionFilter = {
        group: COLLISION_WITH_BALL_GROUP,
        category: GROUND_OUTLINE_MASK,
        mask,
      };
      return body;
    });

    Matter.Composite.add(this.world, groundOutLines);
    return groundOutLines;
  }

  private drawGoalPostNets() {
    const { width, height, ground } = this.map;
    const {
      width: groundWidth,
      goalPostNetThickness,
      goalPostDepth,
      goalPostWidth,
      goalPostNetCornerRadius,
    } = ground;
    const groundX = (width - groundWidth) / 2;
    const goalPostTopPositionY = (height - goalPostWidth) / 2;
    const cornerRoundDivision = 10;

    const path =
      createRoundedPath({
        cx: goalPostNetCornerRadius,
        cy: goalPostNetCornerRadius,
        radius: goalPostNetCornerRadius + goalPostNetThickness * 0.5,
        fromRadian: 1.5 * Math.PI,
        toRadian: 2.0 * Math.PI,
        division: cornerRoundDivision,
        reverse: true,
      }) +
      createRoundedPath({
        cx: goalPostNetCornerRadius,
        cy: goalPostWidth - goalPostNetCornerRadius,
        radius: goalPostNetCornerRadius + goalPostNetThickness * 0.5,
        fromRadian: 1.0 * Math.PI,
        toRadian: 1.5 * Math.PI,
        division: cornerRoundDivision,
        reverse: true,
      }) +
      createRoundedPath({
        cx: goalPostNetCornerRadius,
        cy: goalPostWidth - goalPostNetCornerRadius,
        radius: goalPostNetCornerRadius - goalPostNetThickness,
        fromRadian: 1.0 * Math.PI,
        toRadian: 1.5 * Math.PI,
        division: cornerRoundDivision,
      }) +
      createRoundedPath({
        cx: goalPostNetCornerRadius,
        cy: goalPostNetCornerRadius,
        radius: goalPostNetCornerRadius - goalPostNetThickness,
        fromRadian: 1.5 * Math.PI,
        toRadian: 2.0 * Math.PI,
        division: cornerRoundDivision,
      });

    const netVertices = Matter.Vertices.fromPath(path, Matter.Body.create({}));
    const leftNetBody = Matter.Bodies.fromVertices(
      groundX - goalPostDepth * 0.5 - 14,
      goalPostTopPositionY + goalPostWidth / 2,
      [netVertices],
      {
        isStatic: true,
      }
    );
    const rightNetBody = Matter.Bodies.fromVertices(
      groundX + groundWidth + goalPostDepth * 0.5 + 14,
      goalPostTopPositionY + goalPostWidth / 2,
      [netVertices],
      {
        isStatic: true,
      }
    );
    Matter.Body.rotate(rightNetBody, Math.PI);
    Matter.Composite.add(
      this.world,
      [leftNetBody, rightNetBody].map(body => {
        body.collisionFilter = {
          group: COLLISION_WITH_BALL_GROUP,
          category: GOAL_POST_NET_MASK,
        };
        return body;
      })
    );

    return [leftNetBody, rightNetBody];
  }

  private drawCenterLeftHalfCircle(mask = 0): Matter.Body {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = (width - groundWidth) * 0.5;
    const groundY = (height - groundHeight) * 0.5;
    const cx = groundX + groundWidth * 0.5;
    const cy = groundY + groundHeight * 0.5;
    const radius = groundHeight * 0.222222;
    const rightHalfCircleVertices = this.createRightHalfCircleVertices();
    const leftHalfCircleBody = Matter.Bodies.fromVertices(
      cx - (radius / 2 + lineWidth * 4 + 2),
      cy,
      [rightHalfCircleVertices],
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK,
        },
      }
    );
    Matter.Body.rotate(leftHalfCircleBody, Math.PI);
    leftHalfCircleBody.collisionFilter.mask = mask;
    Matter.Composite.add(this.world, [leftHalfCircleBody]);
    return leftHalfCircleBody;
  }
  private drawCenterRightHalfCircle(mask = 0): Matter.Body {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = (width - groundWidth) * 0.5;
    const groundY = (height - groundHeight) * 0.5;
    const cx = groundX + groundWidth * 0.5;
    const cy = groundY + groundHeight * 0.5;
    const radius = groundHeight * 0.222222;
    const rightHalfCircleVertices = this.createRightHalfCircleVertices();
    const rightHalfCircleBody = Matter.Bodies.fromVertices(
      cx + radius / 2 + lineWidth * 4 + 2,
      cy,
      [rightHalfCircleVertices],
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK,
        },
      }
    );
    rightHalfCircleBody.collisionFilter.mask = mask;
    Matter.Composite.add(this.world, [rightHalfCircleBody]);
    return rightHalfCircleBody;
  }

  private createRightHalfCircleVertices(): Matter.Vector[] {
    const groundHeight = this.map.ground.height;
    const radius = groundHeight * 0.222222;
    const division = 20;
    const rightHalfCirclePath =
      createRoundedPath({
        cx: 0,
        cy: 0,
        radius: radius + lineWidth * 0.5,
        fromRadian: 0,
        toRadian: Math.PI,
        division,
      }) +
      createRoundedPath({
        cx: 0,
        cy: 0,
        radius: radius - lineWidth * 0.5,
        fromRadian: 0,
        toRadian: Math.PI,
        division,
        reverse: true,
      });
    return Matter.Vertices.fromPath(
      rightHalfCirclePath,
      Matter.Body.create({})
    );
  }

  /** NOTE: center circle기준으로 위, 아래 라인만 */
  private drawCenterLines(mask = 0): Matter.Body[] {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = (width - groundWidth) / 2;
    const groundY = (height - groundHeight) / 2;
    const cx = groundX + groundWidth * 0.5;
    const centerCircleRadius = groundHeight * 0.222222;
    const upperHalfLineHeight = (groundHeight - centerCircleRadius * 2) * 0.5;
    const lineWidth = 4;

    const upperCenterLineBody = Matter.Bodies.rectangle(
      cx,
      groundY + upperHalfLineHeight * 0.5,
      lineWidth,
      upperHalfLineHeight,
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK,
          mask,
        },
      }
    );
    const lowerCenterLineBody = Matter.Bodies.rectangle(
      cx,
      groundY + groundHeight - upperHalfLineHeight * 0.5,
      lineWidth,
      upperHalfLineHeight,
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK,
          mask,
        },
      }
    );

    const lineBodies = [upperCenterLineBody, lowerCenterLineBody];
    Matter.Composite.add(this.world, lineBodies);
    return lineBodies;
  }
}
