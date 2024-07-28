import { HmzMapInfo, InitialPlayerState } from '@shared/types';
import { InGameController } from './controller';
import { IpcMessage, IpcMessageType } from './ipc';
import { sendMessage } from '@utils/ipc';

export type GameOptions = {
  roomId: string;
  players: Record<string, InitialPlayerState>;
  map: HmzMapInfo;
};

export namespace Ipc {
  function postMessage(message: IpcMessage) {
    sendMessage(0, message);
  }
  export function onCompleteInitGameInstance(payload: {
    roomId: string;
    inGameUrl: string;
  }) {
    postMessage({
      type: IpcMessageType.COMPLETE_INIT_GAME_INSTANCE,
      payload,
    });
  }
  export function onEndGame(payload: { roomId: string }) {
    postMessage({
      type: IpcMessageType.END_GAME,
      payload, // TODO:
    });
  }
}

const controller = new InGameController();

// from main
process.on('message', async ({ data }) => {
  if (data.type !== IpcMessageType.REQUEST_INIT_GAME_INSTANCE) {
    throw new Error(
      `message type must be ${IpcMessageType.REQUEST_INIT_GAME_INSTANCE}`
    );
  }

  const { roomId, players, map } = data.payload as GameOptions;
  const inGameUrl = await controller.startGame({ roomId, players, map });
  Ipc.onCompleteInitGameInstance({ roomId, inGameUrl });
});
