export const createMonkeyConfig = (config: {
  name: string
  displayName: string
  version: string
  author?: string
  description: string
  /** 通过语义化版本号描述core支持版本，通过`semver.satisfies`判定 */
  supportCoreVersion: string
  /** @default ['core'] */
  require?: ({
    id: string
    download?: string
  } | string)[]
  /** @default 'src/main.ts' */
  entry?: string
}, command: "build" | "serve") => ({
  entry: config.entry ?? 'src/main.ts',
  userscript: {
    name: {
      ds: config.displayName,
      default: config.name
    },
    version: {
      plugin: config.version,
      supportCore: config.supportCoreVersion
    },
    author: config.author,
    description: config.description,
    require: ['core', ...(config.require ?? [])].map(v => {
      if (typeof v == 'string') return {
        id: v
      }
      return v
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
} as any)


export const createExternalConfig = (command: "build" | "serve") => command == 'build' ? {} : {
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
} as any
