import './App.css';
import { Client, Room } from 'colyseus.js';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import WelcomePage from './pages/WelcomePage';
import LobbyPage from './pages/LobbyPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomePage />,
  },
  {
    path: '/rooms',
    element: <LobbyPage />,
  },
]);

function App() {
  // const [room, setRoom] = useState<Room>();
  // const [game, setGame] = useState<Room>();

  // useEffect(() => {
  //   console.log(client);
  //   client.create(RoomType.WAITING_ROOM).then(setRoom);
  //   // client.joinById('49W9FtPUq').then(setRoom);
  // }, []);

  /** TODO: Router */
  return (
    <div className={'app'}>
      <RouterProvider router={router} />
      {/* {game ? (
        <InGame />
      ) : room ? (
        <WaitingRoom
          room={room}
          host={true}
          onClickStart={() => {
            client.create(RoomType.GAME_ROOM);
          }}
          onGameCreated={roomId => {
            client.joinById(roomId).then(setGame);
          }}
        />
      ) : (
        'loading'
      )} */}
    </div>
  );
}

export default App;
