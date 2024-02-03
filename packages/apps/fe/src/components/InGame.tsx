import { BootstrapScene } from '@in-game/scenes/BootstrapScene';
import { GameScene } from '@in-game/scenes/GameScene.ts';
import { Room } from 'colyseus.js';
import { useEffect, useRef } from 'react';
import { useLoaderData } from 'react-router-dom';

const GAME_SCENE_PARENT_ID = 'in-game-container';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#b6d53c',
  parent: GAME_SCENE_PARENT_ID,
  physics: { default: 'arcade', arcade: { debug: true } },
  pixelArt: false,
  scene: [BootstrapScene, GameScene],
};

export type InGameLoaderData = {
  room: Room;
};

const InGame = () => {
  const data = useLoaderData() as InGameLoaderData;
  const gameInstanceRef = useRef<Phaser.Game>();

  useEffect(() => {
    const gameInstance = new Phaser.Game(config);
    setTimeout(() => {
      gameInstance.scene.start('game-scene', data);
    }, 1000);
    gameInstanceRef.current = gameInstance;
  }, []);

  return <div id={GAME_SCENE_PARENT_ID} />;
};

export default InGame;
