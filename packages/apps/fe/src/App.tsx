import { useEffect, useState } from 'react';
import './App.css';
import { Client, Room } from 'colyseus.js';
import WaitingRoom from '@components/WaitingRoom';
import { RoomType } from '@shared/types';
import InGame from '@components/InGame';

const client = new Client('ws://localhost:2567');

function App() {
  const [room, setRoom] = useState<Room>();
  const [game, setGame] = useState<Room>();

  useEffect(() => {
    console.log(client);
    client.create(RoomType.WAITING_ROOM).then(setRoom);
    // client.joinById('49W9FtPUq').then(setRoom);
  }, []);

  /** TODO: Router */
  return (
    <div className={'app'}>
      {game ? (
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
      )}
    </div>
  );
}

export default App;
