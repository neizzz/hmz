export const enum RoomType {
  WAITING_ROOM = 'waiting-room',
  GAME_ROOM = 'game-room',
}

export type WaitingRoomMetadata = {
  title: string;
};
export type WaitingRoomCreateInfo = WaitingRoomMetadata & {
  hostJoinInfo: WaitingRoomJoinInfo;
  maxPlayers: number;
};
export type WaitingRoomJoinInfo = {
  name: string;
  index: number;
};
