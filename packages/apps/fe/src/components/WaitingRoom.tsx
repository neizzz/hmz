import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  FromWaitingRoomMessageType,
  GameRoomJoinInfo,
  HmzMap,
  HmzMapInfo,
  RoomType,
  Team,
  ToWaitingRoomMessageType,
} from '@shared/types';
import { Room } from 'colyseus.js';
import { AwaiterState } from '@schema';
import { useLoaderData } from 'react-router-dom';
import { useHmzClient } from '@hooks/useHmzClient';
import InGame, { InGameParams } from './InGame';
import cloneDeep from 'lodash.clonedeep';
import { Color } from '@constants';
import clsx from 'clsx';

export type WaitingRoomInitParams = {
  room: Room;
  host?: boolean;
};

type AwaitersByTeam = Record<Team, [string, AwaiterState][]>;

const buildAwaitersByTeam = (
  awaiters: Record<string, AwaiterState>
): AwaitersByTeam => {
  return Object.entries(awaiters).reduce(
    (result, [sessionId, awaiter]) => {
      result[awaiter.team].push([sessionId, awaiter]);
      return result;
    },
    {
      [Team.RED]: [],
      [Team.BLUE]: [],
      [Team.OBSERVER]: [],
    }
  );
};

const WaitingRoom = () => {
  const client = useHmzClient();
  const { room, host = false } = useLoaderData() as WaitingRoomInitParams;
  const [awaitersByTeam, setAwaitersByTeam] = useState<AwaitersByTeam>({
    [Team.RED]: [],
    [Team.BLUE]: [],
    [Team.OBSERVER]: [],
  });
  const awaitersByTeamRef = useRef<AwaitersByTeam>(awaitersByTeam);
  const [inGameParams, setInGameParams] = useState<InGameParams>(undefined);

  useLayoutEffect(() => {
    awaitersByTeamRef.current = cloneDeep(awaitersByTeam);
  }, [awaitersByTeam]);

  const changeTeam = useCallback((to: Team) => {
    room.send(ToWaitingRoomMessageType.CHANGE_TEAM, { to });
  }, []);

  const getMyJoinInfo = useCallback((): GameRoomJoinInfo => {
    const copiedAwaitersByTeam = awaitersByTeamRef.current;
    const flatten = [
      ...copiedAwaitersByTeam.red,
      ...copiedAwaitersByTeam.blue,
      ...copiedAwaitersByTeam.observer,
    ];
    const [_, myState] = flatten.find(
      ([sessionId]) => sessionId === room.sessionId
    );
    const myIndexInTeam = copiedAwaitersByTeam[myState.team].findIndex(
      ([sessionId]) => sessionId === room.sessionId
    );
    return {
      ...myState,
      index: myIndexInTeam,
    };
  }, []);

  useEffect(() => {
    room.state.awaiters.onAdd((awaiter: AwaiterState, sessionId: string) => {
      console.log('awaiter add', awaiter, sessionId);
      setAwaitersByTeam(prev => ({
        ...prev,
        [awaiter.team]: prev[awaiter.team].concat([[sessionId, awaiter]]),
      }));
    });

    room.state.awaiters.onRemove((awaiter: AwaiterState, sessionId: string) => {
      console.log('awaiter remove', awaiter, sessionId);
      setAwaitersByTeam(prev => ({
        ...prev,
        [awaiter.team]: prev[awaiter.team].filter(
          ([targetSessionId]) => targetSessionId !== sessionId
        ),
      }));
    });

    room.onMessage(FromWaitingRoomMessageType.CHANGE_TEAM, ({ awaiters }) => {
      setAwaitersByTeam(buildAwaitersByTeam(awaiters));
    });

    host ||
      room.onMessage(
        FromWaitingRoomMessageType.START_GAME,
        ({ roomId: gameRoomId, map }) => {
          setInGameParams({
            roomId: gameRoomId,
            map,
            myJoinInfo: getMyJoinInfo(),
          });
        }
      );
  }, []);

  return (
    <>
      <div className={'centering-layer'}>
        <div className={'waiting-room-cont'}>
          <ul className={'team-list'}>
            <li className={'team-item'}>
              <button // TODO: disable when active
                className={clsx('team-header-btn', 'team-red')}
                onClick={() => changeTeam(Team.RED)}
              >
                Red
              </button>
              <ul className={'member-list'}>
                {awaitersByTeam[Team.RED].map(([sessionId]) => (
                  <li>{sessionId}</li>
                ))}
              </ul>
            </li>
            <li className={'team-item'}>
              <button
                className={'team-header-btn'}
                onClick={() => changeTeam(Team.OBSERVER)}
              >
                Observer
              </button>
              <ul className={'member-list'}>
                {awaitersByTeam[Team.OBSERVER].map(([sessionId]) => (
                  <li>{sessionId}</li>
                ))}
              </ul>
            </li>
            <li className={'team-item'}>
              <button
                className={clsx('team-header-btn', 'team-blue')}
                onClick={() => changeTeam(Team.BLUE)}
              >
                Blue
              </button>
              <ul className={'member-list'}>
                {awaitersByTeam[Team.BLUE].map(([sessionId]) => (
                  <li>{sessionId}</li>
                ))}
              </ul>
            </li>
          </ul>
          <div className={'hori-centering'}>
            {host && (
              <button
                className={'start-btn'}
                onClick={() => {
                  const map = HmzMap.SMALL;
                  client
                    .create(RoomType.GAME_ROOM, {
                      hostJoinInfo: getMyJoinInfo(),
                      setting: {
                        map,
                        redTeamCount: awaitersByTeam.red.length,
                        blueTeamCount: awaitersByTeam.blue.length,
                      },
                    })
                    .then(gameRoom => {
                      const inGameInfo = {
                        host,
                        room: gameRoom,
                        roomId: gameRoom.roomId,
                        map,
                        myJoinInfo: getMyJoinInfo(),
                      };
                      setInGameParams(inGameInfo);
                      room.send(ToWaitingRoomMessageType.START_GAME, {
                        roomId: inGameInfo.roomId,
                        map: inGameInfo.map,
                      });
                    });
                }}
              >
                START
              </button>
            )}
          </div>
        </div>
      </div>
      {inGameParams && <InGame {...inGameParams} />}
    </>
  );
};

export default WaitingRoom;
