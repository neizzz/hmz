import { useHmzClient } from '@hooks/useHmzClient';
import InGameConnection from '@in-game/InGameConnection';
import { BootstrapScene } from '@in-game/scenes/BootstrapScene';
import { GameScene } from '@in-game/scenes/GameScene.ts';
import {
  GameSystemMessageType,
  HmzMapInfo,
  WaitingRoomJoinInfo,
} from '@shared/types';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

const GAME_SCENE_PARENT_ID = 'in-game-container';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  antialias: true,
  transparent: true,
  parent: GAME_SCENE_PARENT_ID,
  physics: {
    default: 'matter',
    matter: {
      debug: true,
      gravity: { x: 0, y: 0 },
      runner: {
        fps: 60,
      },
    },
  },
  pixelArt: false,
  scene: [BootstrapScene, GameScene],
} as const;

export type InGameParams = {
  // host?: boolean;
  // room?: Room; // for host
  // roomId: string;
  myId: string;
  inGameUrl: string;
  map: HmzMapInfo;
  // myJoinInfo: WaitingRoomJoinInfo;
};

type Props = {
  onEnd?: () => void;
} & InGameParams;

const InGameWrapper = ({ inGameUrl, map, myId, myJoinInfo, onEnd }: Props) => {
  const client = useHmzClient();
  const inGameConnectionRef = useRef(
    new InGameConnection({ myId, url: inGameUrl })
  );
  const gameInstanceRef = useRef<Phaser.Game>();

  // DEBUG:
  useEffect(() => {
    console.log('inGameUrl:', inGameUrl);
  }, []);

  useEffect(() => {
    const gameInstance = new Phaser.Game({
      ...config,
      width: map.width,
      height: map.height,
    });
    gameInstance.scene.start('game-scene', {
      myId,
      connection: inGameConnectionRef.current,
      map,
    });
    gameInstanceRef.current = gameInstance;
  }, []);

  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);

  useEffect(() => {
    if (!inGameConnectionRef.current) return;

    inGameConnectionRef.current.addMessageHandler(
      GameSystemMessageType.GOAL,
      ({ team, redTeamScore, blueTeamScore }) => {
        setRedScore(redTeamScore);
        setBlueScore(blueTeamScore);
      }
    );
    // gameRoom.onMessage(GameRoomMessageType.DISPOSE, () => {
    //   onEnd?.();
    // });
  }, []);

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

export default InGameWrapper;
