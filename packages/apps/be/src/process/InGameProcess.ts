import type { Server } from 'bun';

class InGameProcess {
  private _server: Server;

  constructor() {
    process.send?.('im child');
    process.on('message', message => {
      console.log('im child, receive', message);
    });
    this._server = this._initWebSocketServer();
  }

  private _initWebSocketServer() {
    return Bun.serve({
      fetch(req, server) {
        // upgrade the request to a WebSocket
        if (server.upgrade(req)) {
          return; // do not return a Response
        }
        return new Response('Upgrade failed', { status: 500 });
      },
      websocket: {
        message: (ws, message) => {}, // a message is received
        open: ws => {
          console.log('websocket opened:', this._server.url, this._server.port);
        }, // a socket is opened
        close: (ws, code, message) => {}, // a socket is closed
        drain: ws => {}, // the socket is ready to receive more data
      }, // handlers
    });
  }

  private _sendProcessInfo() {
    // TODO:
  }
}

new InGameProcess();
