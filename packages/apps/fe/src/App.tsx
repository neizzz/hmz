import { useEffect, useState } from 'react';
import './App.css';
import { Client, Room } from 'colyseus.js';
import WaitingRoom from '@components/WaitingRoom';

const client = new Client('ws://localhost:2567');

function App() {
  const [room, setRoom] = useState<Room>();

  useEffect(() => {
    console.log(client);
    client.joinOrCreate('my_room').then(setRoom).catch(console.error);
  }, []);

  return (
    <div className={'app'}>
      {room ? <WaitingRoom room={room} /> : 'loading'}
    </div>
  );
}

export default App;
