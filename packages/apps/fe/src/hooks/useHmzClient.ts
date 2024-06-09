import { Client } from 'colyseus.js';

const client = new Client(
  `ws://${__SERVER_HOST__ ? __SERVER_HOST__ : 'localhost'}:${__SERVER_PORT__}`
);

export const useHmzClient = () => {
  return client;
};
