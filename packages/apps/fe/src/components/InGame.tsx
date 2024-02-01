import { GameScene } from '@in-game/scenes/GameScene.ts';
import { useEffect, useRef } from 'react';
import { useLoaderData } from 'react-router-dom';

const GAME_SCENE_PARENT_ID = 'in-game-container';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#b6d53c',
  parent: GAME_SCENE_PARENT_ID,
  physics: { default: 'arcade' },
  pixelArt: true,
  scene: [GameScene],
};

export type InGameLoaderData = {
  roomId: string;
};

const InGame = () => {
  const data = useLoaderData() as InGameLoaderData;
  const gameInstanceRef = useRef<Phaser.Game>();

  useEffect(() => {
    gameInstanceRef.current = new Phaser.Game(config);
  }, []);

  return <div id={GAME_SCENE_PARENT_ID} />;
};

export default InGame;
