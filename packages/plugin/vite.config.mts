import { defineConfig } from 'vite'
import dtsPlugin from 'vite-plugin-dts'

import _package from './package.json'

export default defineConfig({
  plugins: [dtsPlugin({ include: ['./lib'], tsconfigPath: './tsconfig.json' })],
  build: { lib: { entry: './lib/index.ts', name: 'DcUtils', fileName: 'index' }, sourcemap: true }
})