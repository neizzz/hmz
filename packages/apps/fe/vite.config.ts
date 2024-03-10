import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

const { PORT /** server port */, FE_PORT } = process.env;

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: +FE_PORT,
  },
  plugins: [tsconfigPaths(), react()],
  define: {
    __SERVER_PORT__: `${PORT}`,
  },
});
