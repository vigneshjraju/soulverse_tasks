import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),tailwindcss(),
    nodePolyfills({
      include: [
        'crypto',
        'stream', 
        'util',
        'buffer',
        'process',
        'path',
        'fs',
        'os',
        'http',
        'https',
        'url',
        'zlib',
        'querystring'
      ],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: [
      '@credo-ts/core',
      '@credo-ts/askar', 
      '@credo-ts/anoncreds',
      '@credo-ts/indy-vdr',
      '@hyperledger/aries-askar-nodejs',
      '@hyperledger/anoncreds-nodejs',
      '@hyperledger/indy-vdr-nodejs'
    ],
    exclude: [
      '@credo-ts/node',
      '@digitalcredentials/vc',
      '@digitalcredentials/open-badges-context'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
    rollupOptions: {
      external: [],
    },
  },
  resolve: {
    alias: {
      'node:buffer': 'buffer',
      'node:stream': 'stream',
      'node:crypto': 'crypto',
      'node:util': 'util',
      'node:process': 'process',
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})