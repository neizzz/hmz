import { Client, Room } from 'colyseus.js';
import { cli, Options } from '@colyseus/loadtest';

async function main(options: Options) {
  const client = new Client(options.endpoint);
  const room: Room = await client.joinOrCreate(options.roomName, {
    // your join options here...
  });

  console.log('joined successfully!');

  room.onMessage('*', (type, message) => {
    console.log('onMessage:', type, message);
  });

  room.onStateChange(state => {
    console.log(room.sessionId, 'new state:', state);
  });

  room.onError(err => {
    console.log(room.sessionId, '!! ERROR !!', err);
  });

  room.onLeave(code => {
    console.log(room.sessionId, 'left.');
  });
}

cli(main);
