export type HmzMapInfo = {
  ground: {
    x: number;
    y: number;
    width: number;
    height: number;
    goalPostRadius: number;
    goalPostWidth: number;
    goalPostNetThickness: number;
    goalPostDepth: number;
    goalPostNetCornerRadius: number;
    goalPostTopPositionY: number;
    goalPostBottomPositionY: number;
  };
  tile: {
    width: number;
    height: number;
  };
  width: number;
  height: number;
};

export type HmzMapSize = 'SMALL' | 'MEDIUM';

export const HmzMap: Record<HmzMapSize, HmzMapInfo> = {
  SMALL: {
    tile: {
      width: 10,
      height: 5,
    },
    width: 1600,
    height: 800,
    ground: {
      x: 200,
      y: 100,
      width: 1200,
      height: 600,
      goalPostWidth: 210,
      goalPostTopPositionY: (800 - 210) / 2,
      goalPostBottomPositionY: (800 + 210) / 2,
      goalPostNetThickness: 10,
      goalPostDepth: 50,
      goalPostNetCornerRadius: 50 * 0.75, // 'goalPostDepth' based
      goalPostRadius: 16,
    },
  } as const,

  MEDIUM: {
    tile: {
      width: 12,
      height: 6,
    },
    width: 1840,
    height: 920,
    ground: {
      x: 200,
      y: 100,
      width: 1440,
      height: 720,
      goalPostWidth: 210,
      goalPostTopPositionY: (920 - 210) / 2,
      goalPostBottomPositionY: (920 + 210) / 2,
      goalPostNetThickness: 10,
      goalPostDepth: 50,
      goalPostNetCornerRadius: 50 * 0.75, // 'goalPostDepth' based
      goalPostRadius: 16,
    },
  } as const,
} as const;
