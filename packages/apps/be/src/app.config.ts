import { ConfigOptions } from '@colyseus/tools';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';
import { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Import your Room files
 */
import { WaitingRoom } from './rooms/WaitingRoom.js';
import { Server } from 'colyseus';
import { RoomType } from '@shared/types';

const { FE_PORT } = process.env;

const config: ConfigOptions = {
  initializeGameServer: (gameServer: Server) => {
    /**
     * Define your room handlers:
     */
    // TODO: LobbyRoom

    // @ts-ignore
    gameServer.define(RoomType.WAITING_ROOM, WaitingRoom);
  },

  initializeExpress: (app: Express) => {
    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use('/monitor', monitor());

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (FE_PORT) {
      app.use('/playground', playground);
      app.use(
        createProxyMiddleware('/', { target: `http://localhost:${FE_PORT}/` })
      );
    }
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
};

export default config;
