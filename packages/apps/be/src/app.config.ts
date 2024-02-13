import { ConfigOptions } from '@colyseus/tools';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';
import { Express } from 'express';

/**
 * Import your Room files
 */
import { WaitingRoom } from './rooms/WaitingRoom.ts';
import { Server } from 'colyseus';
import { RoomType } from '@shared/types';
import { GameRoom } from './rooms/GameRoom.ts';

const config: ConfigOptions = {
  initializeGameServer: (gameServer: Server) => {
    /**
     * Define your room handlers:
     */
    // TODO: LobbyRoom
    gameServer.define(RoomType.WAITING_ROOM, WaitingRoom);
    gameServer.define(RoomType.GAME_ROOM, GameRoom);
  },

  initializeExpress: (app: Express) => {
    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== 'production') {
      app.use('/', playground);
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use('/colyseus', monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
};

export default config;
