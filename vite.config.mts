import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'
import dts from 'vite-plugin-dts'
import _package from './package.json'
import { resolve } from 'node:path'
import Components from 'unplugin-vue-components/vite'
import MotionResolver from 'motion-v/resolver'
import { NaiveUiResolver, VantResolver } from 'unplugin-vue-components/resolvers'
export default defineConfig({
  plugins: [
    dts({ include: ['./lib'], tsconfigPath: './tsconfig.json' }),
    vue(),
    vueJsx(),
    Components({
      dts: true,
      resolvers: [
        VantResolver(),
        MotionResolver(),
        NaiveUiResolver()
      ],
    }),
    tailwindcss(),
  ],
  experimental: {
    enableNativePlugin: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./lib', import.meta.url)),
    },
    extensions: ['.ts', '.tsx', '.json', '.mjs', '.js', '.jsx', '.mts']
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('> 1%, last 2 versions, not ie <= 8')),
    }
  },
  base: "/",
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'Bundle',
      fileName: 'bundle',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue', 'axios', 'lodash-es', 'naive-ui', 'vant', "motion-v", 'pinia', 'vue-router', 'crypto-js'],
      output: {
        globals: {
          vue: 'window.$$lib$$.Vue',
          vant: 'window.$$lib$$.Vant',
          'naive-ui': 'window.$$lib$$.Naive',
          "motion-v": 'window.$$lib$$.Motion',
          axios: 'window.$$lib$$.Axios',
          'lodash-es': 'window.$$lib$$.Lodash',
          'pinia': 'window.$$lib$$.Pinia',
          'vue-router': 'window.$$lib$$.VR',
          'crypto-js': 'window.$$lib$$.Crypto'
        },
      },
    }
  }
})