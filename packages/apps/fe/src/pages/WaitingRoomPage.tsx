import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  HmzMap,
  Team,
  WaitingRoomJoinInfo,
  WaitingRoomMessageType,
} from '@shared/types';
import { Room } from 'colyseus.js';
import { useLoaderData } from 'react-router-dom';
import { useHmzClient } from '@hooks/useHmzClient';
import InGameWrapper, { InGameParams } from '../components/InGameWrapper';
import cloneDeep from 'lodash.clonedeep';
import clsx from 'clsx';
import { WaitingRoomPlayerState } from '@schema';

export type WaitingRoomPageInitParams = {
  room: Room;
};

type PlayersByTeam = Record<Team, [string, WaitingRoomPlayerState][]>;

const buildPlayersByTeam = (
  players: Record<string, WaitingRoomPlayerState>
): PlayersByTeam => {
  return Object.entries(players).reduce(
    (result, [sessionId, player]) => {
      result[player.team].push([sessionId, player]);
      return result;
    },
    {
      [Team.RED]: [],
      [Team.BLUE]: [],
      [Team.OBSERVER]: [],
    }
  );
};

const WaitingRoomPage = () => {
  const client = useHmzClient();
  const { room } = useLoaderData() as WaitingRoomPageInitParams;
  const [hostSessionId, setHostSessionId] = useState();
  const [playersByTeam, setPlayersByTeam] = useState<PlayersByTeam>({
    [Team.RED]: [],
    [Team.BLUE]: [],
    [Team.OBSERVER]: [],
  });
  const playersByTeamRef = useRef<PlayersByTeam>(playersByTeam);
  const [inGameParams, setInGameParams] = useState<InGameParams>(undefined);

  useLayoutEffect(() => {
    playersByTeamRef.current = cloneDeep(playersByTeam);
  }, [playersByTeam]);

  const changeTeam = useCallback((to: Team) => {
    room.send(WaitingRoomMessageType.CHANGE_TEAM, { to });
  }, []);

  const getMyJoinInfo = useCallback((): WaitingRoomJoinInfo => {
    const copiedPlayersByTeam = playersByTeamRef.current;
    const flatten = [
      ...copiedPlayersByTeam.red,
      ...copiedPlayersByTeam.blue,
      ...copiedPlayersByTeam.observer,
    ];
    const [_, myState] = flatten.find(
      ([sessionId]) => sessionId === room.sessionId
    );
    const myIndexInTeam = copiedPlayersByTeam[myState.team].findIndex(
      ([sessionId]) => sessionId === room.sessionId
    );
    return {
      ...myState,
      index: myIndexInTeam,
    };
  }, []);

  useEffect(() => {
    room.state.players.onAdd(
      (player: WaitingRoomPlayerState, sessionId: string) => {
        console.log('player add', player, sessionId);
        setPlayersByTeam(prev => ({
          ...prev,
          [player.team]: prev[player.team].concat([[sessionId, player]]),
        }));
      }
    );

    room.state.players.onRemove(
      (player: WaitingRoomPlayerState, sessionId: string) => {
        console.log('player remove', player, sessionId);
        setPlayersByTeam(prev => ({
          ...prev,
          [player.team]: prev[player.team].filter(
            ([targetSessionId]) => targetSessionId !== sessionId
          ),
        }));
      }
    );

    room.state.listen('hostSessionId', newHostSessionId => {
      setHostSessionId(newHostSessionId);
    });

    room.onMessage(WaitingRoomMessageType.CHANGE_TEAM, ({ players }) => {
      setPlayersByTeam(buildPlayersByTeam(players));
    });
  }, [room.state]);

  useEffect(() => {
    // console.log(room.sessionId, hostSessionId);
    // room.sessionId === hostSessionId ||
    room.onMessage(WaitingRoomMessageType.START_GAME, ({ inGameUrl, map }) => {
      setInGameParams({
        myId: room.sessionId,
        inGameUrl,
        map,
      });
    });
  }, []);

  return (
    <>
      <div className={'centering-layer'}>
        <div className={'waiting-room-cont comm-cont'}>
          <ul className={'team-list'}>
            <li className={'team-item'}>
              <button // TODO: disable when active
                className={clsx('team-header-btn', 'team-red')}
                onClick={() => changeTeam(Team.RED)}
              >
                Red
              </button>
              <ul className={'member-list'}>
                {playersByTeam[Team.RED].map(([_, { name }]) => (
                  <li>{name}</li>
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
                {playersByTeam[Team.OBSERVER].map(([_, { name }]) => (
                  <li>{name}</li>
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
                {playersByTeam[Team.BLUE].map(([_, { name }]) => (
                  <li>{name}</li>
                ))}
              </ul>
            </li>
          </ul>
          <div className={'hori-centering'}>
            {room.sessionId === hostSessionId && (
              <button
                className={'start-btn'}
                onClick={() => {
                  const playerCount =
                    Object.keys(playersByTeam.blue).length +
                    Object.keys(playersByTeam.blue).length;
                  const map = playerCount > 6 ? HmzMap.MEDIUM : HmzMap.SMALL;
                  room.send(WaitingRoomMessageType.START_GAME, {
                    map,
                  });
                }}
              >
                START
              </button>
            )}
          </div>
        </div>
      </div>
      {inGameParams && (
        <InGameWrapper
          {...inGameParams}
          onEnd={() => setInGameParams(undefined)}
        />
      )}
    </>
  );
};

export default WaitingRoomPage;
