import { defineConfig } from 'vite';
import { node } from '@liuli-util/vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), node()],
});
