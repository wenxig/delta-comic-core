import external from 'vite-plugin-external'
import monkey from 'vite-plugin-monkey'
/** vite插件，自动配置了库的外部化与脚本头 */
export const deltaComic = (config: {
  name: string
  displayName: string
  version: string
  author?: string
  description: string
  /** 通过语义化版本号描述core支持版本，通过`semver.satisfies`判定，所有的`>=`会替换为`^`，除非`lockCoreVersion为`true` */
  supportCoreVersion: string
  /** 如果为`true`，则`supportCoreVersion`的`>=`不会替换为`^` */
  lockCoreVersion?: boolean
  /** @default ['core'] */
  require?: ({
    id: string
    download?: string
  } | string)[]
  /** @default 'src/main.ts' */
  entry?: string
},
  command: "build" | "serve"): any => [
    command == 'build' ? false : external({
      externals: {
        vue: 'window.$$lib$$.Vue',
        vant: 'window.$$lib$$.Vant',
        'naive-ui': 'window.$$lib$$.Naive',
        axios: 'window.$$lib$$.Axios',
        'es-toolkit': 'window.$$lib$$.EsKits',
        'delta-comic-core': 'window.$$lib$$.Dcc',
        'vue-router': 'window.$$lib$$.VR',
        'crypto-js': 'window.$$lib$$.Crypto'
      }
    }),
    monkey({
      entry: config.entry ?? 'src/main.ts',
      userscript: {
        name: {
          display: config.displayName,
          id: config.name
        },
        version: `${config.version}/${config.supportCoreVersion}/${!!config.lockCoreVersion}`,
        author: config.author,
        description: config.description,
        require: ['core', ...(config.require ?? [])].map(v => {
          if (typeof v == 'string') return `${v}:`
          return `${v.id}:${v.download ?? ''}`
        }),
      },
      build: {
        externalGlobals: command == 'serve' ? {} : {
          vue: 'window.$$lib$$.Vue',
          vant: 'window.$$lib$$.Vant',
          'naive-ui': 'window.$$lib$$.Naive',
          axios: 'window.$$lib$$.Axios',
          'es-toolkit': 'window.$$lib$$.EsKits',
          'delta-comic-core': 'window.$$lib$$.Dcc',
          'vue-router': 'window.$$lib$$.VR',
          'crypto-js': 'window.$$lib$$.Crypto'
        },
      },
      server: {
        mountGmApi: false,
        open: false,
        prefix: false
      }
    })
  ]