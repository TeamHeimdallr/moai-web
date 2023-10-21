import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { compression } from 'vite-plugin-compression2';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  server: {
    port: 3000,
  },

  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [],
    },
  },

  build: {
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      treeshake: 'safest',
      onwarn() {
        return;
      },
      output: {
        manualChunks: id => {
          const module = id.split('node_modules/').pop().split('/')[0];

          const react = ['react', 'react-dom', 'react-router-dom'];
          const evm = ['ethers', 'viem', 'wagmi', '@balancer-labs/sdk'];
          const xrp = ['xrpl', '@gemwallet/api', '@crossmarkio/sdk'];

          if (react.includes(module)) return 'vendor-react';
          if (evm.includes(module)) return 'vendor-evm';
          if (xrp.includes(module)) return 'vendor-xrp';
          return 'vendor';
        },
      },
    },
  },

  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    svgr(),
    splitVendorChunkPlugin(),
    tsconfigPaths(),
    react({
      babel: {
        plugins: [
          'babel-plugin-macros',
          ['auto-import', { declarations: [{ default: 'React', path: 'react' }] }],
          [
            '@emotion/babel-plugin-jsx-pragmatic',
            { export: 'jsx', import: '__cssprop', module: '@emotion/react' },
          ],
          ['@babel/plugin-transform-react-jsx', { pragma: '__cssprop' }, 'twin.macro'],
        ],
      },
    }),
    compression({
      include: [/\.js$/, /\.css$/],
      threshold: 1400,
    }),
  ],
});
