import { defineConfig } from 'vite';
import { node } from '@liuli-util/vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command, mode, isPreview }) => {
  console.log(`Vite mode: ${mode}`);
  const isDev = mode === 'development';
  return {
    build: {
      sourcemap: isDev,
      minify: !isDev,
    },
    plugins: [tsconfigPaths(), node()],
  };
});
