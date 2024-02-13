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
  kickoff: {
    ball: {
      x: number;
      y: number;
    };
  };
  width: number;
  height: number;
};

export type HmzMapSize = 'SMALL';

export const HmzMap: Record<HmzMapSize, HmzMapInfo> = {
  SMALL: {
    width: 1600,
    height: 800,
    kickoff: {
      ball: {
        x: 800,
        y: 400,
      },
    },
    ground: {
      x: 200,
      y: 100,
      width: 1200,
      height: 600,
      goalPostWidth: 210,
      goalPostTopPositionY: (800 - 210) / 2,
      goalPostBottomPositionY: (800 + 210) / 2,
      goalPostNetThickness: 5,
      goalPostDepth: 50,
      goalPostNetCornerRadius: 50 * 0.75, // 'goalPostDepth' based
      goalPostRadius: 16,
    },
  } as const,
} as const;
