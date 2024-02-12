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
    this.scene.load.image('ground-tile', '/assets/images/bg.png');

    // generate texture of the left goal post net
    const {
      goalPostNetThickness,
      goalPostDepth,
      goalPostWidth,
      goalPostNetCornerRadius,
    } = this.map.ground;
    this.scene.make
      .graphics({
        x: 0,
        y: 0,
      })
      .lineStyle(goalPostNetThickness, 0x000000)
      .beginPath()
      .arc(
        goalPostNetCornerRadius + goalPostNetThickness * 0.5,
        goalPostNetCornerRadius + goalPostNetThickness * 0.5,
        goalPostNetCornerRadius,
        -Math.PI * 0.5,
        -Math.PI,
        true
      )
      .lineTo(
        goalPostNetThickness * 0.5,
        goalPostNetThickness * 0.5 + goalPostWidth - goalPostNetCornerRadius
      )
      .arc(
        goalPostNetThickness * 0.5 + goalPostNetCornerRadius,
        goalPostNetThickness * 0.5 + goalPostWidth - goalPostNetCornerRadius,
        goalPostNetCornerRadius,
        -Math.PI,
        -Math.PI * 1.5,
        true
      )
      .strokePath()
      .generateTexture(
        'goalpost-net',
        goalPostDepth + goalPostNetThickness * 0.5,
        goalPostWidth + goalPostNetThickness
      )
      .destroy();
  }

  build() {
    this.drawGrass();
    this.drawGroundLines();
    this.drawGoalPostNets();
    this.drawGoalPosts();
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

  private drawGroundLines() {
    const { ground } = this.map;
    this.scene.add
      .graphics({ x: groundX, y: groundY })
      .lineStyle(groundLineWidth, 0xffffff)
      .strokeRect(0, 0, ground.width, ground.height)
      .strokeCircle(ground.width / 2, ground.height / 2, ground.height / 4.5)
      .lineBetween(ground.width / 2, 0, ground.width / 2, ground.height);
  }

  private drawGoalPostNets() {
    const { height, ground } = this.map;
    const { width: groundWidth, goalPostDepth, goalPostWidth } = ground;
    const goalPostTopPositionY = (height - goalPostWidth) / 2;

    // NOTE: for debug
    // const netPath = `37.49999999999999 -2.5, 31.242621398390753 -2.0075336238055073, 25.139320225002095 -0.5422606518061386, 19.340380010418123 1.859739032465285, 13.988589908301066 5.139320225002109, 9.21572875253809 9.215728752538105, 5.139320225002095 13.988589908301083, 1.8597390324652778 19.340380010418134, -0.5422606518061457 25.13932022500211, -2.0075336238055144 31.242621398390774, -2.5 37.50000000000001, -2.5 172.5, -2.0075336238055073 178.75737860160925, -0.5422606518061386 184.8606797749979, 1.859739032465285 190.65961998958187, 5.139320225002109 196.01141009169893, 9.215728752538102 200.7842712474619, 13.98858990830108 204.8606797749979, 19.340380010418134 208.14026096753472, 25.13932022500211 210.54226065180615, 31.24262139839077 212.0075336238055, 37.50000000000001 212.5, 37.50000000000001 205, 32.4158798861925 204.599871069342, 27.456947682814214 203.40933677959248, 22.74530875846473 201.45771203612196, 18.39697930049463 198.79305231718578, 14.519029611437208 195.4809703885628, 11.20694768281421 191.60302069950538, 8.542287963878046 187.25469124153528, 6.59066322040751 182.54305231718578, 5.400128930658028 177.5841201138075, 5 172.5, 5 37.50000000000001, 5.4001289306580205 32.4158798861925, 6.590663220407507 27.456947682814217, 8.542287963878039 22.745308758464734, 11.206947682814203 18.396979300494632, 14.519029611437201 14.519029611437212, 18.396979300494614 11.20694768281421, 22.745308758464724 8.542287963878046, 27.456947682814203 6.59066322040751, 32.415879886192485 5.400128930658028, 37.49999999999999 5`;
    // const netVertices = this.scene.matter.vertices.fromPath(
    //   netPath,
    //   this.scene.matter.body.create({})
    // );
    // const leftNetBody = this.scene.matter.bodies.fromVertices(
    //   groundX - goalPostDepth * 0.5 - 10,
    //   goalPostTopPositionY + goalPostWidth / 2,
    //   [netVertices],
    //   {
    //     isStatic: true,
    //   }
    // );
    // const rightNetBody = this.scene.matter.bodies.fromVertices(
    //   groundX + groundWidth + goalPostDepth * 0.5 + 10,
    //   goalPostTopPositionY + goalPostWidth / 2,
    //   [netVertices],
    //   {
    //     isStatic: true,
    //   }
    // );
    // this.scene.matter.body.rotate(rightNetBody, Math.PI);
    // this.scene.matter.world.add(leftNetBody);
    // this.scene.matter.world.add(rightNetBody);

    this.scene.add.sprite(
      groundX - goalPostDepth * 0.5,
      goalPostTopPositionY + goalPostWidth / 2,
      'goalpost-net'
    );
    this.scene.add
      .sprite(
        groundX + groundWidth + goalPostDepth * 0.5,
        goalPostTopPositionY + goalPostWidth / 2,
        'goalpost-net'
      )
      .setRotation(Math.PI);
  }

  private drawGoalPosts() {
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
        goalPostRadius - goalPostLineWidth / 2
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
