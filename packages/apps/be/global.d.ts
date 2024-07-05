declare global {
  namespace NodeJS {
    interface ProcessEnv {
      IN_GAME_PROCESS_PATH: string;
      NODE_ENV: 'test' | 'development' | 'production';
      PORT?: string;
    }
  }
}

export {};
