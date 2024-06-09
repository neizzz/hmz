import { Client } from 'colyseus.js';

const client = new Client(
  `ws://${__SERVER_HOST2__ ? __SERVER_HOST2__ : 'localhost'}:${__SERVER_PORT__}`
);

export const useHmzClient = () => {
  return client;
};
