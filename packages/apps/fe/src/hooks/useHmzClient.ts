import { Client } from 'colyseus.js';

const client = new Client('ws://localhost:2567');

export const useHmzClient = () => {
  return client;
};
