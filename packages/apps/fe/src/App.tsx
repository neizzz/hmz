import './App.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import WelcomePage from './pages/WelcomePage';
import LobbyPage from './pages/LobbyPage';
import InGame from '@components/InGame';
import { useHmzClient } from '@hooks/useHmzClient';
import { RoomType, Team, HmzMap } from '@shared/types';
import { GameSceneInitParams } from '@in-game/scenes/GameScene';
import WaitingRoom, { WaitingRoomInitParams } from '@components/WaitingRoom';

const client = useHmzClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomePage />,
  },
  {
    path: '/rooms',
    element: <LobbyPage />,
  },
  {
    path: '/room/:roomId',
    loader: async ({ params }): Promise<WaitingRoomInitParams> => {
      return {
        room: await client.joinById(params.roomId),
      };
    },
    Component: WaitingRoom,
  },
  {
    path: '/room/create/neiz0000',
    loader: async (): Promise<WaitingRoomInitParams> => {
      return {
        room: await client
          .create(RoomType.WAITING_ROOM, {
            maxAwaiters: 12,
          })
          .then(room => {
            history.replaceState(null, null, `/room/${room.roomId}`);
            return room;
          }),
        host: true,
      };
    },
    Component: WaitingRoom,
  },
  {
    path: '/test/:roomId?',
    loader: async ({ params }) => {
      if (params.roomId) {
        return {
          room: await client.joinById(params.roomId),
        } as GameSceneInitParams;
      } else {
        const map = HmzMap.SMALL;
        return client
          .create(RoomType.GAME_ROOM, {
            hostJoinInfo: {
              team: Team.RED,
              number: 0,
            },
            gameSetting: {
              map,
              redTeamCount: 1,
              blueTeamCount: 0,
            },
          })
          .then(room => {
            history.replaceState(null, null, `/test/${room.roomId}`);
            return { room, map } as GameSceneInitParams;
          });
      }
    },
    Component: InGame,
  },
]);

function App() {
  return (
    <div className={'app'}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
