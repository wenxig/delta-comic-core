import { extendsDepends } from '@delta-comic/utils'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import dtsPlugin from 'vite-plugin-dts'

import _package from './package.json'

export default defineConfig({
  plugins: [dtsPlugin({ include: ['./lib'], tsconfigPath: './tsconfig.json' })],
  experimental: { enableNativePlugin: true },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./lib', import.meta.url)) },
    dedupe: ['vue', 'vue-router'],
    extensions: ['.ts', '.tsx', '.json', '.mjs', '.js', '.jsx', '.mts']
  },
  build: {
    lib: { entry: ['./lib/index.ts'], name: 'DcPlugin', fileName: 'index', formats: ['es'] },
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(extendsDepends).concat(['lightningcss']),
      output: { globals: extendsDepends }
    }
  }
})