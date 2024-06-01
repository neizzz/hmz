import './App.css';

import {
  // createBrowserRouter,
  redirect,
  RouterProvider,
} from 'react-router-dom';

import WelcomePage from './pages/WelcomePage';
import LobbyPage from './pages/LobbyPage';
import { useHmzClient } from '@hooks/useHmzClient';
import WaitingRoom, { WaitingRoomInitParams } from '@components/WaitingRoom';
import { getUserNickname } from '@utils/user';
import { initRouter } from '@utils/route';

const client = useHmzClient();

const router = initRouter([
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
    loader: async ({ params }): Promise<WaitingRoomInitParams | Response> => {
      if (getUserNickname()) {
        return {
          room: await client.joinById(params.roomId, {
            name: getUserNickname(),
          }),
        };
      } else {
        return redirect('/');
      }
    },
    Component: WaitingRoom,
  },
  // {
  //   path: '/room/create/neiz0000',
  //   loader: async (): Promise<WaitingRoomInitParams | Response> => {
  //     if (getUserNickname()) {
  //       return {
  //         room: await client
  //           .create(RoomType.WAITING_ROOM, {
  //             hostJoinInfo: { name: getUserNickname() },
  //             maxAwaiters: 12,
  //           })
  //           .then(room => {
  //             history.replaceState(null, null, `/room/${room.roomId}`);
  //             return room;
  //           }),
  //       };
  //     } else {
  //       return redirect('/');
  //     }
  //   },
  //   Component: WaitingRoom,
  // },
  // {
  //   path: '/test/:roomId?',
  //   loader: async ({ params }) => {
  //     if (params.roomId) {
  //       return {
  //         room: await client.joinById(params.roomId),
  //       } as GameSceneInitParams;
  //     } else {
  //       const map = HmzMap.SMALL;
  //       return client
  //         .create(RoomType.GAME_ROOM, {
  //           hostJoinInfo: {
  //             team: Team.RED,
  //             number: 0,
  //           },
  //           gameSetting: {
  //             map,
  //             redTeamCount: 1,
  //             blueTeamCount: 0,
  //           },
  //         })
  //         .then(room => {
  //           history.replaceState(null, null, `/test/${room.roomId}`);
  //           return { room, map } as GameSceneInitParams;
  //         });
  //     }
  //   },
  //   Component: InGame,
  // },
]);

function App() {
  return (
    <div className={'app'}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
