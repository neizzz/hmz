import './App.css';

import { redirect, RouterProvider } from 'react-router-dom';

import WelcomePage, {
  type WelcomeRoomPageInitParams,
} from './pages/WelcomePage';
import LobbyPage from './pages/LobbyPage';
import { useHmzClient } from '@hooks/useHmzClient';
import WaitingRoomPage, {
  WaitingRoomPageInitParams,
} from './pages/WaitingRoomPage';
import { getUserNickname } from '@utils/user';
import { initRouter } from '@utils/route';
import { LoadingProvider } from './contexts/LoadingContext';
import { RoomType } from '@shared/types';

const client = useHmzClient();

const router = initRouter([
  {
    path: '/',
    element: <WelcomePage />,
  },
  {
    path: '/welcome/*',
    loader: ({ params }): WelcomeRoomPageInitParams => {
      return {
        pathOnSubmit: params['*'],
      };
    },
    Component: WelcomePage,
  },
  {
    path: '/rooms',
    element: <LobbyPage />,
  },
  {
    path: '/room/:roomId',
    loader: async ({
      params,
    }): Promise<WaitingRoomPageInitParams | Response> => {
      if (getUserNickname()) {
        return {
          room: await client.joinById(params.roomId, {
            name: getUserNickname(),
          }),
        };
      } else {
        const pathOnSubmit = `/room/${params.roomId}`;
        return redirect(`/welcome/${pathOnSubmit}`);
      }
    },
    Component: WaitingRoomPage,
  },
  {
    path: '/room/create',
    loader: async (): Promise<WaitingRoomPageInitParams | Response> => {
      if (getUserNickname()) {
        return {
          room: await client
            .create(RoomType.WAITING_ROOM, {
              hostJoinInfo: { name: getUserNickname() },
              maxAwaiters: 12,
            })
            .then(room => {
              /** NOTE:
               * react router를 안태우기위해, history API를 직접적으로 사용.
               * */
              setTimeout(() => {
                history.replaceState(null, null, `/room/${room.roomId}`);
              });
              return room;
            }),
        };
      } else {
        return redirect('/');
      }
    },
    Component: WaitingRoomPage,
  },
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
    <LoadingProvider>
      <div className={'app'}>
        <RouterProvider router={router} />
      </div>
    </LoadingProvider>
  );
}

export default App;
