type InitParams = {
  sessionId: string;
  x: number;
  y: number;
  avatar: string;
  name?: string;
};

export class Player {
  sessionId: string;
  x: number;
  y: number;
  avatar: string;
  name?: string;

  constructor(params: InitParams) {
    this.sessionId = params.sessionId;
    this.x = params.x;
    this.y = params.y;
    this.avatar = params.avatar;
    this.name = params.name;
  }

  create() {}

  destroy() {}
}
