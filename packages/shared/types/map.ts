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
      x: 750;
      y: 375;
    };
  };
  width: number;
  height: number;
};

export type HmzMapSize = 'SMALL';

export const HmzMap: Record<HmzMapSize, HmzMapInfo> = {
  SMALL: {
    width: 1500,
    height: 750,
    kickoff: {
      ball: {
        x: 750,
        y: 375,
      },
    },
    ground: {
      x: 150,
      y: 75,
      width: 1200,
      height: 600,
      goalPostWidth: 210,
      goalPostTopPositionY: (750 - 210) / 2,
      goalPostBottomPositionY: (750 + 210) / 2,
      goalPostNetThickness: 5,
      goalPostDepth: 50,
      goalPostNetCornerRadius: 50 * 0.75, // 'goalPostDepth' based
      goalPostRadius: 16,
    },
  } as const,
} as const;
