import { Team } from './index';
import { HmzMapInfo } from './map';

export type WaitingRoomCreateInfo = {
  hostJoinInfo: WaitingRoomJoinInfo;
  maxAwaiters: number;
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
