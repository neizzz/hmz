import { HmzMapInfo, Team } from '@shared/types';
import { createRoundedPath } from '@utils/path.ts';
import {
  COLLISION_WITH_BALL_GROUP,
  DEFAULT_GROUP,
  GOAL_POST_MASK,
  GROUND_CENTERLINE_MASK,
  GROUND_OUTLINE_MASK,
  PLAYER_MASK,
  STADIUM_OUTLINE_MASK,
} from '@constants';
import Matter from 'matter-js';

const WALL_THICK = 20;

export class MapBuilder {
  private world: Matter.World;
  private map: HmzMapInfo;
  private leftSideCenterLines: Matter.Body[] = [];
  private rightSideCenterLines: Matter.Body[] = [];

  constructor(world: Matter.World, map: HmzMapInfo) {
    this.world = world;
    this.map = map;
  }

  centerBall(team: Team) {
    if (team === Team.RED) {
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

  onStart() {
    this.rightSideCenterLines.forEach(lineBody => {
      lineBody.collisionFilter.mask =
        (lineBody.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
    this.leftSideCenterLines.forEach(lineBody => {
      lineBody.collisionFilter.mask =
        (lineBody.collisionFilter.mask ?? 0) & ~PLAYER_MASK;
    });
  }

  build() {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = (width - groundWidth) / 2;
    const groundY = (height - groundHeight) / 2;
    const goalPostWidth = this.map.ground.goalPostWidth;
    const goalPostTopPositionY = (height - goalPostWidth) / 2;
    const goalPostBottomPositionY = (height + goalPostWidth) / 2;

    Matter.Composite.add(
      this.world,
      [
        // top
        Matter.Bodies.rectangle(width / 2, -WALL_THICK / 2, width, WALL_THICK, {
          isStatic: true,
        }),
        // bottom
        Matter.Bodies.rectangle(
          width / 2,
          height + WALL_THICK / 2,
          width,
          WALL_THICK,
          {
            isStatic: true,
          }
        ),
        // left
        Matter.Bodies.rectangle(
          -WALL_THICK / 2,
          height / 2,
          WALL_THICK,
          height,
          {
            isStatic: true,
          }
        ),
        // right
        Matter.Bodies.rectangle(
          width + WALL_THICK / 2,
          height / 2,
          WALL_THICK,
          height,
          {
            isStatic: true,
          }
        ),
      ].map(body => {
        body.collisionFilter = {
          group: DEFAULT_GROUP,
          category: STADIUM_OUTLINE_MASK,
          mask: PLAYER_MASK,
        };
        return body;
      })
    );

    // ground outlines
    Matter.Composite.add(
      this.world,
      [
        // top
        Matter.Bodies.rectangle(
          width / 2,
          groundY - WALL_THICK / 2,
          groundWidth,
          WALL_THICK,
          {
            isStatic: true,
          }
        ),
        // bottom
        Matter.Bodies.rectangle(
          width / 2,
          groundY + groundHeight + WALL_THICK / 2,
          groundWidth,
          WALL_THICK,
          {
            isStatic: true,
          }
        ),
        // left
        Matter.Bodies.rectangle(
          groundX - WALL_THICK / 2,
          groundY + (goalPostTopPositionY - groundY) / 2,
          WALL_THICK,
          goalPostTopPositionY - groundY,
          {
            isStatic: true,
          }
        ),
        Matter.Bodies.rectangle(
          groundX - WALL_THICK / 2,
          goalPostBottomPositionY + (goalPostTopPositionY - groundY) / 2,
          WALL_THICK,
          goalPostTopPositionY - groundY,
          {
            isStatic: true,
          }
        ),
        // right
        Matter.Bodies.rectangle(
          groundX + groundWidth + WALL_THICK / 2,
          groundY + (goalPostTopPositionY - groundY) / 2,
          WALL_THICK,
          goalPostTopPositionY - groundY,
          {
            isStatic: true,
          }
        ),
        Matter.Bodies.rectangle(
          groundX + groundWidth + WALL_THICK / 2,
          goalPostBottomPositionY + (goalPostTopPositionY - groundY) / 2,
          WALL_THICK,
          goalPostTopPositionY - groundY,
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

    this.drawGoalPostNets();
    this.drawGoalPosts();
    this.drawCenterHalfCircles();
    this.drawCenterLines();
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
        Matter.Bodies.circle(groundX, goalPostTopPositionY, goalPostRadius, {
          isStatic: true,
        }),
        Matter.Bodies.circle(groundX, goalPostBottomPositionY, goalPostRadius, {
          isStatic: true,
        }),
        // right
        Matter.Bodies.circle(
          groundX + groundWidth,
          goalPostTopPositionY,
          goalPostRadius,
          { isStatic: true }
        ),
        Matter.Bodies.circle(
          groundX + groundWidth,
          goalPostBottomPositionY,
          goalPostRadius,
          { isStatic: true }
        ),
      ].map(body => {
        body.collisionFilter = {
          group: COLLISION_WITH_BALL_GROUP,
          category: GOAL_POST_MASK,
          mask: PLAYER_MASK,
        };
        return body;
      })
    );
  }

  private drawGoalPostNets() {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundX = (width - groundWidth) / 2;
    const goalPostNetWidth = 8;
    const goalPostDepth = 60;
    const goalPostWidth = this.map.ground.goalPostWidth;
    const goalPostTopPositionY = (height - goalPostWidth) / 2;
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

    const netVertices = Matter.Vertices.fromPath(path, Matter.Body.create({}));
    const leftNetBody = Matter.Bodies.fromVertices(
      groundX - goalPostDepth * 0.5 - goalPostNetWidth,
      goalPostTopPositionY + goalPostWidth / 2,
      [netVertices],
      {
        isStatic: true,
      }
    );
    const rightNetBody = Matter.Bodies.fromVertices(
      groundX + groundWidth + goalPostDepth * 0.5 + goalPostNetWidth,
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
        };
        return body;
      })
    );
  }

  private drawCenterHalfCircles() {
    const width = this.map.width;
    const height = this.map.height;
    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = (width - groundWidth) * 0.5;
    const groundY = (height - groundHeight) * 0.5;
    const cx = groundX + groundWidth * 0.5;
    const cy = groundY + groundHeight * 0.5;
    const radius = groundHeight * 0.222222;
    const lineWidth = 4;
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

    const rightHalfCircleVertices = Matter.Vertices.fromPath(
      rightHalfCirclePath,
      Matter.Body.create({})
    );
    const rightHalfCircleBody = Matter.Bodies.fromVertices(
      cx + radius / 2 + lineWidth * 4,
      cy,
      [rightHalfCircleVertices],
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK,
          mask: 0,
        },
      }
    );

    const leftHalfCircleBody = Matter.Bodies.fromVertices(
      cx - (radius / 2 + lineWidth * 4),
      cy,
      [rightHalfCircleVertices],
      {
        isStatic: true,
        collisionFilter: {
          category: GROUND_CENTERLINE_MASK,
          mask: 0,
        },
      }
    );
    Matter.Body.rotate(leftHalfCircleBody, Math.PI);
    Matter.Composite.add(this.world, [leftHalfCircleBody, rightHalfCircleBody]);

    this.leftSideCenterLines.push(leftHalfCircleBody);
    this.rightSideCenterLines.push(rightHalfCircleBody);
  }

  /** NOTE: center circle기준으로 위, 아래 라인만 */
  private drawCenterLines() {
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
          mask: 0,
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
          mask: 0,
        },
      }
    );

    Matter.Composite.add(this.world, [
      upperCenterLineBody,
      lowerCenterLineBody,
    ]);

    this.leftSideCenterLines.push(upperCenterLineBody, lowerCenterLineBody);
    this.rightSideCenterLines.push(upperCenterLineBody, lowerCenterLineBody);
  }
}
