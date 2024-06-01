import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

const { IP_ADDR /** server ip */, PORT /** server port */, FE_PORT } =
  process.env;

console.log(`Server address: ${IP_ADDR}:${PORT}`);

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: +FE_PORT,
    hmr: { port: +FE_PORT },
  },
  plugins: [tsconfigPaths(), react()],
  define: {
    __SERVER_IP__: `"${IP_ADDR}"`,
    __SERVER_PORT__: `"${PORT}"`,
  },
});
