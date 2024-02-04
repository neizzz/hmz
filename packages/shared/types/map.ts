export type HmzMapInfo = {
  ground: { width: number; height: number };
  width: number;
  height: number;
};

export type HmzMapSize = 'SMALL';

export const HmzMap: Record<HmzMapSize, HmzMapInfo> = {
  SMALL: {
    width: 1500,
    height: 750,
    ground: {
      width: 1200,
      height: 570,
    },
  } as const,
} as const;
