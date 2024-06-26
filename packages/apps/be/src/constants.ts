export const DEFAULT_GROUP = 0;
export const COLLISION_WITH_BALL_GROUP = 1;
export const PLAYER_GROUP = 2;

export const DEFAULT_MASK = 0xffffffff;
export const STADIUM_OUTLINE_MASK = 1 << 0;
export const GOAL_POST_MASK = 1 << 1;
export const GOAL_POST_NET_MASK = 1 << 2;
export const GROUND_CENTERLINE_MASK = 1 << 3;
export const GROUND_OUTLINE_MASK = 1 << 4;
export const BALL_MASK = 1 << 5;
export const RED_PLAYER_MASK = 1 << 6;
export const BLUE_PLAYER_MASK = 1 << 7;
export const PLAYER_MASK = (1 << 7) | (1 << 6);
