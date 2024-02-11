import { useHmzClient } from '@hooks/useHmzClient';
import { BootstrapScene } from '@in-game/scenes/BootstrapScene';
import { GameScene } from '@in-game/scenes/GameScene.ts';
import { GameRoomJoinInfo, HmzMapInfo } from '@shared/types';
import { Room } from 'colyseus.js';
import { useEffect, useRef, useState } from 'react';

const GAME_SCENE_PARENT_ID = 'in-game-container';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#b6d53c',
  parent: GAME_SCENE_PARENT_ID,
  physics: { default: 'matter', matter: { debug: true, gravity: { y: 0 } } },
  pixelArt: false,
  scene: [BootstrapScene, GameScene],
} as const;

export type InGameParams = {
  host?: boolean;
  room?: Room; // for host
  roomId: string;
  map: HmzMapInfo;
  myJoinInfo: GameRoomJoinInfo;
};

const InGame = ({ host, room, roomId, map, myJoinInfo }: InGameParams) => {
  const client = useHmzClient();
  const gameInstanceRef = useRef<Phaser.Game>();
  const [gameRoom, setGameRoom] = useState<Room>(undefined);

  useEffect(() => {
    host
      ? setGameRoom(room)
      : client.joinById(roomId, myJoinInfo).then(setGameRoom);
  }, []);

  useEffect(() => {
    if (!gameRoom) return;

    const gameInstance = new Phaser.Game({
      ...config,
      width: map.width,
      height: map.height,
    });
    // FIXME: remove setTimeout
    setTimeout(() => {
      gameInstance.scene.start('game-scene', { room: gameRoom, map });
    }, 500);
    gameInstanceRef.current = gameInstance;
  }, [gameRoom]);

  return <div id={GAME_SCENE_PARENT_ID} />;
};

export default InGame;
