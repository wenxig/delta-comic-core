import { extendsDepends } from '@delta-comic/utils'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'
import MotionResolver from 'motion-v/resolver'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { NaiveUiResolver, VantResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import _package from './package.json'

export default defineConfig({
  plugins: [
    dts({ include: ['./lib', './vite'], tsconfigPath: './tsconfig.json' }),
    vue(),
    vueJsx(),
    Components({ dts: true, resolvers: [VantResolver(), MotionResolver(), NaiveUiResolver()] }),
    tailwindcss()
  ],
  experimental: { enableNativePlugin: true },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./lib', import.meta.url)) },
    dedupe: ['vue', 'vue-router'],
    extensions: ['.ts', '.tsx', '.json', '.mjs', '.js', '.jsx', '.mts']
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('> 1%, last 2 versions, not ie <= 8'))
    }
  },
  base: '/',
  build: {
    lib: {
      entry: [resolve(__dirname, 'lib/index.ts'), resolve(__dirname, 'vite/index.ts')],
      name: 'DcUi',
      fileName: 'index'
    },
    sourcemap: true,
    rollupOptions: { external: Object.keys(extendsDepends), output: { globals: extendsDepends } }
  }
})