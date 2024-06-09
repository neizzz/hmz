/// <reference types="vite/client" />

// NOTE: 왜인지 모르겠는데, __SERVER_HOST__로 사용하면 vite빌드 과정에서 define object key가 이상하게 치환됨.
declare const __SERVER_HOST2__: string;
declare const __SERVER_PORT__: string;
declare const __MODE__: 'production' | 'development';
