import { BootstrapScene } from '@in-game/scenes/BootstrapScene';
import { GameScene, GameSceneInitParams } from '@in-game/scenes/GameScene.ts';
import { useEffect, useRef } from 'react';
import { useLoaderData } from 'react-router-dom';

const GAME_SCENE_PARENT_ID = 'in-game-container';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#b6d53c',
  parent: GAME_SCENE_PARENT_ID,
  physics: { default: 'matter', matter: { debug: true, gravity: { y: 0 } } },
  pixelArt: false,
  scene: [BootstrapScene, GameScene],
} as const;

const InGame = () => {
  const data = useLoaderData() as GameSceneInitParams;
  const gameInstanceRef = useRef<Phaser.Game>();

  useEffect(() => {
    const gameInstance = new Phaser.Game({ ...config, ...data.map });
    setTimeout(() => {
      gameInstance.scene.start('game-scene', data);
    }, 1000);
    gameInstanceRef.current = gameInstance;
  }, []);

  return <div id={GAME_SCENE_PARENT_ID} />;
};

export default InGame;
