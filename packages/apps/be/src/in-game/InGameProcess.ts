import { type HmzMapInfo } from '@shared/types/map';
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
import { WebSocketServer } from 'ws';

const GAME_ENV: {
  PORT?: number;
  INITIAL_PLAYERS?: Record<string, InitialPlayerState>;
  MAP?: HmzMapInfo;
} = {};

process.once('message', message => {
  const { PORT, INITIAL_PLAYERS, MAP } = message as typeof GAME_ENV;

  if (!PORT || !INITIAL_PLAYERS || !MAP) {
    throw new Error(
      `Invalid GAME_ENV: ${JSON.stringify({ PORT, INITIAL_PLAYERS, MAP })}`
    );
  }

  GAME_ENV.PORT = PORT;
  GAME_ENV.INITIAL_PLAYERS = INITIAL_PLAYERS;
  GAME_ENV.MAP = MAP;

  initWebSocketServer();
});

export namespace Ipc {
  function postMessage(message: IpcMessage | unknown) {
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
  let wss: WebSocketServer;
  function broadcast(message: GameSystemMessage) {
    wss.clients.forEach(ws => {
      ws.send(JSON.stringify(message));
    });
  }
  export function initServer(initWss: WebSocketServer) {
    wss = initWss;
    const { host, port } = wss.options;
    Ipc.onInitServer(`ws://${host}:${port}`);
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

namespace ActionQueue {
  let queue: GameUserAction[] = [];
  export function push(action: GameUserAction) {
    queue.push(action);
  }
  export function popAll(): GameUserAction[] {
    const result = queue;
    queue = [];
    return result;
  }
}

function onMessage(data: string | Buffer): void | Promise<void> {
  const { type, payload } = JSON.parse(data as string) as GameSystemMessage;

  switch (type) {
    case GameSystemMessageType.USER_ENTRANCE:
      console.log('User entrance', payload);
      break;
    case GameSystemMessageType.USER_ACTION:
      ActionQueue.push(payload);
      break;
  }
}

async function initWebSocketServer(): Promise<WebSocketServer | undefined> {
  try {
    const wss = new WebSocketServer({
      host: 'localhost', // FIXME: 일단 개발용으로만
      port: GAME_ENV.PORT,
      clientTracking: true,
    });
    wss.on('connection', ws => {
      console.log('connection!');
      startGame();
      ws.on('message', onMessage);
      // TODO:FIXME: 모든 플레이어가 진입했을때 실행하도록
    });

    Comm.initServer(wss);
    return wss;
  } catch (e) {
    // TODO: send to parent for re-spawn process
    console.log('error', e);
  }
}

function runLoop(
  onUpdate: (delta: number, actions: GameUserAction[]) => void,
  getGameSceneState: () => GameSceneState
) {
  let prevTime = Date.now();
  return setInterval(() => {
    const now = Date.now();
    const actions = ActionQueue.popAll();
    onUpdate(now - prevTime, actions);
    prevTime = now;

    const sceneState = getGameSceneState();
    Comm.broadcastSceneState(sceneState);
  }, 33);
}

function initialPlayerStates(): Record<string, PlayerState> {
  const result: Record<string, PlayerState> = {};
  let currRedTeamPlayerIndex = 0;
  let currBlueTeamPlayerIndex = 0;
  const initialPlayers = GAME_ENV.INITIAL_PLAYERS as Record<
    string,
    InitialPlayerState
  >;
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

async function startGame() {
  const players = initialPlayerStates();
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
    map: GAME_ENV.MAP as HmzMapInfo,
  });
  runLoop(engine.update, engine.getGameSceneState);
}
