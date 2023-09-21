import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { compression } from 'vite-plugin-compression2';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import polyfillNode from 'rollup-plugin-node-polyfills';

export default defineConfig({
  server: {
    port: 3000,
  },

  resolve: {
    alias: [
      { find: '~', replacement: resolve(__dirname, 'src') },
      { find: 'events', replacement: 'events' },
      { find: 'crypto', replacement: 'crypto-browserify' },
      { find: 'stream', replacement: 'stream-browserify' },
      { find: 'http', replacement: 'stream-http' },
      { find: 'https', replacement: 'https-browserify' },
      { find: 'ws', replacement: 'xrpl/dist/npm/client/WSWrapper' },
    ],
  },

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },

  build: {
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      treeshake: 'safest',
      plugins: [polyfillNode()],
    },
  },

  plugins: [
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
