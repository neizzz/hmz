import { HmzMapInfo } from '@shared/types';

const groundLineWidth = 4;
const goalPostLineWidth = 3.5;
let groundX = NaN;
let groundY = NaN;
let groundWidth = NaN;
let groundHeight = NaN;
let goalPostWidth = NaN;
let goalPostRadius = NaN;
let goalPostTopPositionY = NaN;
let goalPostBottomPositionY = NaN;

export class MapBuilder {
  private scene: Phaser.Scene;
  private map: HmzMapInfo;

  constructor(scene: Phaser.Scene, map: HmzMapInfo) {
    this.scene = scene;
    this.map = map;

    const { ground } = map;

    groundX = (this.map.width - ground.width) / 2;
    groundY = (this.map.height - ground.height) / 2;
    groundWidth = this.map.ground.width;
    groundHeight = this.map.ground.height;
    goalPostWidth = this.map.ground.goalPostWidth;
    goalPostRadius = this.map.ground.goalPostRadius;
    goalPostTopPositionY = (groundHeight - goalPostWidth) / 2;
    goalPostBottomPositionY = (groundHeight + goalPostWidth) / 2;
  }

  loadAssets() {
    this.scene.load.image('ground-tile', '/assets/bg.png');
  }

  build() {
    this.drawGrass();
    this.drawGroundLine();
    this.drawGoalPostNet();
    this.drawGoalPost();
  }

  private drawGrass() {
    const tilemap = this.scene.make.tilemap({
      tileWidth: 120,
      tileHeight: 120,
      width: 16,
      height: 8,
    });
    const tiles = tilemap.addTilesetImage('ground-tile');
    const layer = tilemap.createBlankLayer('ground-layer', tiles);
    layer.fill(0, 0, 0, tilemap.width, tilemap.height); // Body of the water
  }

  private drawGroundLine() {
    const { ground } = this.map;
    this.scene.add
      .graphics({ x: groundX, y: groundY })
      .lineStyle(groundLineWidth, 0xffffff)
      .strokeRect(0, 0, ground.width, ground.height)
      .strokeCircle(ground.width / 2, ground.height / 2, ground.height / 4.5)
      .lineBetween(ground.width / 2, 0, ground.width / 2, ground.height);

    const path =
      ', 0 -126.44432, 19.780249556575765 -124.8875805984806, 39.07344372218405 -120.25569448450962, 57.40452002602717 -112.66271406656173, 74.32210653215022 -102.29560372218405, 89.40963611452179 -89.4096361145218, 102.29560372218405 -74.32210653215022, 112.66271406656172 -57.404520026027186, 120.25569448450962 -39.07344372218406, 124.8875805984806 -19.78024955657577, 126.44432 -7.742481587918183e-15, 124.8875805984806 19.780249556575757, 120.25569448450963 39.073443722184045, 112.66271406656173 57.40452002602717, 102.29560372218405 74.3221065321502, 89.4096361145218 89.40963611452179, 74.32210653215023 102.29560372218404, 57.404520026027186 112.66271406656172, 39.07344372218407 120.25569448450962, 19.78024955657578 124.88758059848058, 1.5484963175836367e-14 126.44432, 1.4995104456177426e-14 122.44432, 19.154511696414854 120.93682723610003, 37.83737574468427 116.451468419329, 55.58855802706899 109.09868796980825, 71.97096552298034 99.05953574468425, 86.58120898977562 86.5812089897756, 99.05953574468427 71.97096552298031, 109.09868796980827 55.588558027068984, 116.45146841932902 37.83737574468425, 120.93682723610004 19.154511696414836, 122.44432 -7.497552228088713e-15, 120.93682723610004 -19.15451169641485, 116.451468419329 -37.837375744684266, 109.09868796980825 -55.58855802706899, 99.05953574468427 -71.97096552298032, 86.5812089897756 -86.58120898977562, 71.97096552298032 -99.05953574468427, 55.588558027068984 -109.09868796980827, 37.83737574468426 -116.451468419329, 19.154511696414843 -120.93682723610004, 0 -122.44432';
    const vertices = this.scene.matter.vertices.fromPath(
      path,
      this.scene.matter.body.create({})
    );
    const cx = groundX + groundWidth * 0.5;
    const cy = groundY + groundHeight * 0.5;
    const gr = this.scene.add
      .graphics({
        x: cx,
        y: cy,
      })
      .fillStyle(0x000000)
      .beginPath();
    vertices.forEach(({ x, y }) => {
      gr.lineTo(x, y);
    });
    gr.fillPath();
  }

  private drawGoalPostNet() {
    // TODO: receive from server or shared/~
    const goalPostNetWidth = 8;
    const goalPostDepth = 60;
    const netPath = `60 0,52.999999999999986 0,44.70897335286775 0.6525179484577066,36.62209929812778 2.594004636356864,28.93850351380401 5.77665421801651,21.847381628498912 10.122099298127793,15.52334059711297 15.523340597112991,10.122099298127779 21.847381628498937,5.776654218016496 28.93850351380403,2.594004636356857 36.62209929812779,0.6525179484576995 44.70897335286777,0 53.00000000000001,0 173,0.6525179484577066 181.29102664713224,2.594004636356864 189.37790070187222,5.77665421801651 197.06149648619598,10.122099298127793 204.1526183715011,15.523340597112984 210.47665940288704,21.84738162849893 215.87790070187222,28.938503513804026 220.22334578198348,36.62209929812779 223.40599536364314,44.70897335286777 225.3474820515423,53.00000000000001 226,60 226,60 218,53.00000000000001 218,45.960449073189615 217.4459753267812,39.09423525312737 215.7975432332819,32.570427511720396 213.09529358847655,26.549663646838713 209.40576474687265,21.180194846605364 204.81980515339464,16.594235253127373 199.4503363531613,12.904706411523449 193.4295724882796,10.202456766718093 186.90576474687265,8.554024673218805 180.0395509268104,8 173,8 53.00000000000001,8.554024673218798 45.96044907318962,10.202456766718086 39.09423525312737,12.904706411523442 32.570427511720396,16.59423525312736 26.54966364683872,21.180194846605353 21.18019484660537,26.5496636468387 16.594235253127373,32.57042751172038 12.904706411523449,39.09423525312736 10.202456766718093,45.9604490731896 8.554024673218805,52.999999999999986 8,60 8`;
    const netVertices = this.scene.matter.vertices.fromPath(
      netPath,
      this.scene.matter.body.create({})
    );

    const leftNetGraphics = this.scene.add
      .graphics({
        x: groundX - goalPostDepth,
        y: groundY + goalPostTopPositionY - goalPostNetWidth,
      })
      .fillStyle(0x000000)
      .beginPath();
    netVertices.forEach(({ x, y }) => {
      leftNetGraphics.lineTo(x, y);
    });
    leftNetGraphics.fillPath();

    const rightNetGraphics = this.scene.add
      .graphics({
        x: groundX + groundWidth + goalPostDepth,
        y: groundY + goalPostTopPositionY + goalPostWidth + goalPostNetWidth,
      })
      .fillStyle(0x000000)
      .beginPath();
    netVertices.forEach(({ x, y }) => {
      rightNetGraphics.lineTo(x, y);
    });
    rightNetGraphics.fillPath();
    rightNetGraphics.rotation = Math.PI;
  }

  private drawGoalPost() {
    this.scene.add
      .graphics({
        x: groundX,
        y: groundY,
      })
      .lineStyle(goalPostLineWidth, 0x000000)
      .fillStyle(0xffffff)
      .fillCircle(
        0,
        goalPostTopPositionY,
        goalPostRadius - goalPostLineWidth / 2 // NOTE: line width 절반 만큼 뺴줘야 충돌경계와 딱 맞음.
      )
      .strokeCircle(
        0,
        goalPostTopPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .fillCircle(
        0,
        goalPostBottomPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .strokeCircle(
        0,
        goalPostBottomPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .fillCircle(
        groundWidth,
        goalPostTopPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .strokeCircle(
        groundWidth,
        goalPostTopPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .fillCircle(
        groundWidth,
        goalPostBottomPositionY,
        goalPostRadius - goalPostLineWidth / 2
      )
      .strokeCircle(
        groundWidth,
        goalPostBottomPositionY,
        goalPostRadius - goalPostLineWidth / 2
      );
  }
}
