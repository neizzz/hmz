import { useHmzClient } from '@hooks/useHmzClient';
import { BootstrapScene } from '@in-game/scenes/BootstrapScene';
import { GameScene } from '@in-game/scenes/GameScene.ts';
import {
  GameRoomJoinInfo,
  GameRoomMessageType,
  HmzMapInfo,
} from '@shared/types';
import clsx from 'clsx';
import { Room } from 'colyseus.js';
import { useEffect, useRef, useState } from 'react';

const GAME_SCENE_PARENT_ID = 'in-game-container';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  antialias: true,
  transparent: true,
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

type Props = {
  onEnd?: () => void;
} & InGameParams;

const InGame = ({ host, room, roomId, map, myJoinInfo, onEnd }: Props) => {
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
    gameInstance.scene.start('game-scene', { room: gameRoom, map });
    gameInstanceRef.current = gameInstance;
  }, [gameRoom]);

  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);

  useEffect(() => {
    if (!gameRoom) return;

    gameRoom.onMessage(
      GameRoomMessageType.GOAL,
      ({ team, redTeamScore, blueTeamScore }) => {
        setRedScore(redTeamScore);
        setBlueScore(blueTeamScore);
      }
    );
    gameRoom.onMessage(GameRoomMessageType.DISPOSE, () => {
      onEnd?.();
    });
  }, [gameRoom]);

  return (
    <div
      className={clsx('glb-bg-color', 'centering-layer')}
      style={{ position: 'absolute', width: '100%', height: '100%' }}
    >
      <div className={clsx('score-board')}>
        <span className={'red-team-avatar'} />
        {`${redScore} : ${blueScore}`}
        <span className={'blue-team-avatar'} />
      </div>
      <div id={GAME_SCENE_PARENT_ID} />
    </div>
  );
};

export default InGame;
