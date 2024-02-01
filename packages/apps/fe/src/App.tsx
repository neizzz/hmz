import './App.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import WelcomePage from './pages/WelcomePage';
import LobbyPage from './pages/LobbyPage';
import InGame, { InGameLoaderData } from '@components/InGame';
import { useHmzClient } from '@hooks/useHmzClient';
import { RoomType } from '@shared/types';

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
    loader: ({ params }) => {
      const client = useHmzClient();
      if (params.roomId) {
        client.joinById(params.roomId);
        return { roomId: params.roomId } as InGameLoaderData;
      } else {
        return client.create(RoomType.GAME_ROOM).then(room => {
          history.replaceState(null, null, `/test/${room.roomId}`);
          return { roomId: room.roomId } as InGameLoaderData;
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
