import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

const { BE_HOST, BE_PORT, FE_PORT } = process.env;

console.log(`Server address: ${BE_HOST}:${BE_PORT}`);

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  console.log(`Vite mode: ${mode}`);
  const isDev = mode === 'development';
  return {
    build: {
      minify: !isDev,
    },
    server: {
      port: +FE_PORT,
      hmr: { port: +FE_PORT },
    },
    plugins: [tsconfigPaths(), react()],
    define: {
      __MODE__: `"${mode}"`,
      __SERVER_HOST2__: `"${BE_HOST}"`,
      __SERVER_PORT__: `"${BE_PORT}"`,
    },
  };
});
