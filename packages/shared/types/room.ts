import { Team } from './index';
import { type HmzMapInfo } from './map';

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
};

export type GameRoomSetting = {
  map: HmzMapInfo;
  redTeamCount: number;
  blueTeamCount: number;
  endScore: number;
};
export type GameRoomCreateInfo = {
  hostJoinInfo: GameRoomJoinInfo;
  setting: GameRoomSetting;
};
export type GameRoomJoinInfo = { team: Team; index: number; name: string };
