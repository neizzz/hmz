import { HmzMapInfo } from '@shared/types';
import { createRoundedPath } from '@utils/vertices.ts';
import {
  COLLISION_WITH_BALL_GROUP,
  DEFAULT_GROUP,
  GOAL_POST_MASK,
  GROUND_OUTLINE_MASK,
  PLAYER_MASK,
  STADIUM_OUTLINE_MASK,
} from '@constants';
import Matter from 'matter-js';

export class MapBuilder {
  private world: Matter.World;
  private map: HmzMapInfo;

  constructor(world: Matter.World, map: HmzMapInfo) {
    this.world = world;
    this.map = map;
  }

  build() {
    const thick = 20;
    const width = this.map.width;
    const height = this.map.height;

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

    const groundWidth = this.map.ground.width;
    const groundHeight = this.map.ground.height;
    const groundX = (width - groundWidth) / 2;
    const groundY = (height - groundHeight) / 2;
    const goalPostWidth = this.map.ground.goalPostWidth;
    const goalPostTopPositionY = (height - goalPostWidth) / 2;
    const goalPostBottomPositionY = (height + goalPostWidth) / 2;

    // ground outlines
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
          groundY + (goalPostTopPositionY - groundY) / 2,
          thick,
          goalPostTopPositionY - groundY,
          {
            isStatic: true,
          }
        ),
        Matter.Bodies.rectangle(
          groundX - thick / 2,
          goalPostBottomPositionY + (goalPostTopPositionY - groundY) / 2,
          thick,
          goalPostTopPositionY - groundY,
          {
            isStatic: true,
          }
        ),
        // right
        Matter.Bodies.rectangle(
          groundX + groundWidth + thick / 2,
          groundY + (goalPostTopPositionY - groundY) / 2,
          thick,
          goalPostTopPositionY - groundY,
          {
            isStatic: true,
          }
        ),
        Matter.Bodies.rectangle(
          groundX + groundWidth + thick / 2,
          goalPostBottomPositionY + (goalPostTopPositionY - groundY) / 2,
          thick,
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
}
