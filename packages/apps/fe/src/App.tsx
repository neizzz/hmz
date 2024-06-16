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
import { decode } from '@utils/data';

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
    path: '/room/create/:encodedOptions',
    loader: async ({
      params,
    }): Promise<WaitingRoomPageInitParams | Response> => {
      const options = decode(params.encodedOptions);
      return {
        room: await client.create(RoomType.WAITING_ROOM, options).then(room => {
          /** NOTE:
           * react router를 안태우기위해, history API를 직접적으로 사용.
           * */
          setTimeout(() => {
            history.replaceState(null, null, `/room/${room.roomId}`);
          });
          return room;
        }),
      };
    },
    Component: WaitingRoomPage,
  },
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
