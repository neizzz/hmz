import { BallState } from '@schema';
import { PositionManager } from '@utils/entity';

type InitParams = {
  state: BallState;
};

export class Ball extends Phaser.GameObjects.Sprite {
  static radius = 19;
  static lineWidth = 3;

  static generateTexture(scene: Phaser.Scene): void {
    scene.make
      .graphics({ x: 0, y: 0 })
      .fillStyle(0x000000)
      .fillCircle(Ball.radius, Ball.radius, Ball.radius)
      .fillStyle(0xffffff)
      .fillCircle(Ball.radius, Ball.radius, Ball.radius - Ball.lineWidth)
      .generateTexture('ball', Ball.radius * 2, Ball.radius * 2)
      .destroy();
  }

  positionManager = new PositionManager();

  constructor(scene: Phaser.Scene, params: InitParams) {
    const { state } = params;
    const { kickoffX: x, kickoffY: y } = state;
    super(scene, x, y, 'ball');
    this.setPosition(x, y);
    this.positionManager.setKickoffPosition({ x, y });
    scene.add.existing(this);
  }

  reset() {
    const { x, y } = this.positionManager.kickoffPosition();
    this.setPosition(x, y);
  }

  update() {
    const newPosition = this.positionManager.nextPosition();
    newPosition && this.setPosition(newPosition.x, newPosition.y);
  }

  syncWithServer(serverState: BallState) {
    const { positionHistories } = serverState;
    this.positionManager.setPositionHistories(positionHistories);
  }
}
