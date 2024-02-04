import './App.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import WelcomePage from './pages/WelcomePage';
import LobbyPage from './pages/LobbyPage';
import InGame from '@components/InGame';
import { useHmzClient } from '@hooks/useHmzClient';
import { RoomType, Team } from '@shared/types';
import { GameSceneInitParams } from '@in-game/scenes/GameScene';

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
    path: '/test/:roomId?',
    loader: async ({ params }) => {
      const client = useHmzClient();
      if (params.roomId) {
        return {
          room: await client.joinById(params.roomId),
        } as GameSceneInitParams;
      } else {
        const map = {
          width: 800,
          height: 600,
        };
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
