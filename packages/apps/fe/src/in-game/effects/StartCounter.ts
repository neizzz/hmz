export default class StartCounter {
  private scene: Phaser.Scene;
  private onEnd?: () => void;
  private currText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async startFrom(from: number, onEnd?: () => void): Promise<void> {
    this.onEnd = onEnd;

    for await (const count of this.countGenerator(from)) {
      this.renderCount(count);
    }
  }

  private async *countGenerator(
    from: number
  ): AsyncGenerator<number, void, number> {
    let i = from;
    while (i > 0) {
      yield new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(i--);
        }, 1000);
      });
    }

    setTimeout(() => {
      this.onEnd?.();
      this.currText.destroy();
    }, 1000);
  }

  private renderCount(count: number): void {
    if (!this.currText) {
      this.currText = this.createText();
    }
    this.currText.text = `${count}`;
  }

  private createText(): Phaser.GameObjects.Text {
    const width = 60;
    const height = 80;
    return this.scene.add.text(
      this.scene.sys.canvas.width / 2 - width / 2,
      this.scene.sys.canvas.height / 2 - height / 2,
      ``,
      {
        fixedWidth: width,
        fixedHeight: height,
        fontSize: 60,
        color: 'red',
        stroke: 'white',
        strokeThickness: 5,
      }
    );
  }
}
