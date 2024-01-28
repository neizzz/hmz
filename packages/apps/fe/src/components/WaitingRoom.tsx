import { useCallback, useEffect, useState } from 'react';
import { Team, WaitingRoomMessageType } from '@shared/types';
import { Room } from 'colyseus.js';

type Props = {
  room: Room;
};

// FIXME: be state 사용
type Awaiter = {
  name: string;
  team: Team;
};

type AwaitersByTeam = Record<Team, [string, Awaiter][]>;

const buildAwaitersByTeam = (
  awaiters: Record<string, Awaiter>
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
    } as AwaitersByTeam
  );
};

const WaitingRoom = ({ room }: Props) => {
  const [awaitersByTeam, setAwaitersByTeam] = useState<AwaitersByTeam>({
    [Team.RED]: [],
    [Team.BLUE]: [],
    [Team.OBSERVER]: [],
  });

  useEffect(() => {
    room.state.awaiters.onAdd((awaiter: Awaiter, sessionId: string) => {
      console.log('awaiter add', awaiter, sessionId);
      setAwaitersByTeam(prev => ({
        ...prev,
        [awaiter.team]: prev[awaiter.team].concat([[sessionId, awaiter]]),
      }));
    });

    room.state.awaiters.onRemove((awaiter: Awaiter, sessionId: string) => {
      console.log('awaiter remove', awaiter, sessionId);
      setAwaitersByTeam(prev => ({
        ...prev,
        [awaiter.team]: prev[awaiter.team].filter(
          ([targetSessionId]) => targetSessionId !== sessionId
        ),
      }));
    });

    room.onMessage(WaitingRoomMessageType.CHANGE_ROOM, awaiters => {
      setAwaitersByTeam(buildAwaitersByTeam(awaiters));
    });
  }, []);

  const changeTeam = useCallback((to: Team) => {
    room.send(WaitingRoomMessageType.CHANGE_ROOM, { to });
  }, []);

  useEffect(() => {
    console.log(awaitersByTeam);
  }, [awaitersByTeam]);

  return (
    <div className={'centering-layer'}>
      <div className={'waiting-room-cont'}>
        <ul className={'team-list'}>
          <li className={'team-item'}>
            <button // TODO: disable when active
              className={'team-header-btn'}
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
              className={'team-header-btn'}
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
      </div>
    </div>
  );
};

export default WaitingRoom;
