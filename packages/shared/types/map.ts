export type HmzMapInfo = {
  ground: {
    goalPostRadius: number;
    goalPostWidth: number;
    width: number;
    height: number;
  };
  width: number;
  height: number;
};

export type HmzMapSize = 'SMALL';

export const HmzMap: Record<HmzMapSize, HmzMapInfo> = {
  SMALL: {
    width: 1500,
    height: 750,
    ground: {
      goalPostRadius: 13,
      goalPostWidth: 210,
      width: 1200,
      height: 560,
    },
  } as const,
} as const;
