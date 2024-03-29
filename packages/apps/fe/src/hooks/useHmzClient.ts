import { Client } from 'colyseus.js';

const client = new Client(
  `ws://${__SERVER_IP__ ? __SERVER_IP__ : 'localhost'}:${__SERVER_PORT__}`
);

export const useHmzClient = () => {
  return client;
};
