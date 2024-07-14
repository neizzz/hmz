import { type HmzMapInfo } from '@shared/types/map';
import type { Server, ServerWebSocket } from 'bun';
import { IpcMessageType, type IpcMessage } from './ipc';
import {
  type GameSceneState,
  type InitialPlayerState,
  type PlayerState,
  type GameSystemMessage,
  GameSystemMessageType,
  GameState,
  PlayerEntityState,
  Team,
  type GameUserAction,
} from '@shared/types';
import { GameEngine } from './engine';
const { PORT, INITIAL_PLAYERS_SERIALIZED, MAP } = process.env;

/** env check */
if (!PORT || !INITIAL_PLAYERS_SERIALIZED || !MAP) {
  throw new Error(
    `Invalid env: ${JSON.stringify({ PORT, INITIAL_PLAYERS_SERIALIZED, MAP })}`
  );
}

export namespace Ipc {
  export function postMessage(message: IpcMessage | unknown) {
    process.send?.(message);
  }
  export function onError() {
    // TODO:
  }
  export function onInitServer(inGameUrl: string) {
    postMessage({
      type: IpcMessageType.INIT_SERVER,
      payload: { inGameUrl },
    });
  }
  export function onEndGame() {
    postMessage({
      type: IpcMessageType.END_GAME,
      payload: { test: 'test' },
    });
  }
}

// TODO:
// function layoutKickoff() {}

namespace Comm {
  const ws2id: Map<ServerWebSocket, string> = new Map();
  export const playersWs: ServerWebSocket[] = [];
  function broadcast(message: GameSystemMessage) {
    playersWs.forEach(ws => {
      ws.send(JSON.stringify(message));
    });
  }
  export function setId(ws: ServerWebSocket, id: string) {
    ws2id.set(ws, id);
  }
  export function getId(ws: ServerWebSocket): string {
    return ws2id.get(ws) as string;
  }
  export function broadcastSceneState(sceneState: GameSceneState) {
    broadcast({
      type: GameSystemMessageType.SCENE_UPDATE,
      payload: {
        state: sceneState,
      },
    });
  }
}

namespace Action {
  let actionsMap: Record<string, GameUserAction[]> = {};
  export function pushAction(id: string, action: GameUserAction) {
    actionsMap[id]?.push(action) ?? (actionsMap[id] = [action]);
  }
  export function popActions(): Record<string, GameUserAction[]> {
    const result = actionsMap;
    actionsMap = {};
    Object.keys(result).forEach(id => {
      actionsMap[id] = [];
    });
    return result;
  }
}

function onMessage(
  ws: ServerWebSocket,
  message: string | Buffer
): void | Promise<void> {
  const { type, payload } = JSON.parse(message as string) as GameSystemMessage;

  switch (type) {
    case GameSystemMessageType.USER_ENTRANCE:
      Comm.setId(ws, payload.id);
      break;
    case GameSystemMessageType.USER_ACTION:
      Action.pushAction(Comm.getId(ws), payload);
      break;
  }
}

async function initWebSocketServer(): Promise<Server | undefined> {
  try {
    const server = Bun.serve({
      port: PORT,
      fetch(req, server) {
        // upgrade the request to a WebSocket
        if (server.upgrade(req)) {
          return; // do not return a Response
        } else {
          return new Response('Upgrade failed', { status: 500 });
        }
      },
      websocket: {
        message: onMessage,
        open: ws => {
          Comm.playersWs.push(ws);
        },
        close: (ws, code, message) => {
          Ipc.postMessage(`websocket close: ${code}, ${message}`);
        },
        // drain: ws => {}, // the socket is ready to receive more data
      },
    });

    Ipc.onInitServer(`ws://${server.url.host}`);
    return server;
  } catch (e) {
    // TODO: send to parent for re-spawn process
    console.log('error', e);
  }
}

function runLoop(
  onUpdate: (delta: number, actions: Record<string, GameUserAction[]>) => void,
  getGameSceneState: () => GameSceneState
) {
  let prevTime = Date.now();
  return setInterval(() => {
    const now = Date.now();
    const actions = Action.popActions();
    // const values = Object.values(actions);
    // Ipc.postMessage(
    //   JSON.stringify({
    //     length: values.length,
    //     length2: values.pop()?.length ?? 123,
    //   })
    // );
    onUpdate(now - prevTime, actions);
    prevTime = now;

    const sceneState = getGameSceneState();
    Comm.broadcastSceneState(sceneState);
  }, 33);
}

function initialPlayerStates(
  initialPlayers: Record<string, InitialPlayerState>
): Record<string, PlayerState> {
  const result: Record<string, PlayerState> = {};
  let currRedTeamPlayerIndex = 0;
  let currBlueTeamPlayerIndex = 0;
  Object.entries(initialPlayers).map(([id, initaialPlayerState]) => {
    result[id] = {
      ...initaialPlayerState,
      index:
        initaialPlayerState.team === Team.RED
          ? currRedTeamPlayerIndex++
          : currBlueTeamPlayerIndex++,
      direction: '',
      x: 500, // FIXME:
      y: 500, // FIXME:
      radius: 30,
      entityState: PlayerEntityState.IDLE,
    };
  });
  return result;
}

const players = initialPlayerStates(JSON.parse(INITIAL_PLAYERS_SERIALIZED));
const engine = new GameEngine({
  initialSceneState: {
    state: GameState.PREPARATION,
    score: {
      [Team.RED]: 0,
      [Team.BLUE]: 0,
    },
    players,
    ball: {
      x: 1000,
      y: 800,
      radius: 20,
    },
  },
  map: JSON.parse(MAP) as HmzMapInfo,
});

await initWebSocketServer();
const loopHandler = runLoop(engine.update, engine.getGameSceneState);
