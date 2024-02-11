import { Team } from './index.ts';
import { HmzMapInfo } from './map.ts';

export type WaitingRoomCreateInfo = {
  maxAwaiters: number;
};

export type GameRoomSetting = {
  map: HmzMapInfo;
  redTeamCount: number;
  blueTeamCount: number;
};
export type GameRoomCreateInfo = {
  hostJoinInfo: GameRoomJoinInfo;
  setting: GameRoomSetting;
};
export type GameRoomJoinInfo = { team: Team; index: number; name: string };
