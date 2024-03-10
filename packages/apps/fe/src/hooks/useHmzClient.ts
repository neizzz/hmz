import { Client } from 'colyseus.js';

const client = new Client(`ws://localhost:${__SERVER_PORT__}`);

export const useHmzClient = () => {
  return client;
};
