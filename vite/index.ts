export const createMonkeyConfig = (config: {
  name: string
  displayName: string
  version: string
  author?: string
  description: string
   /** @default ['core'] */ require?: string[]
   /** @default 'src/main.ts' */ entry?: string
}, command: "build" | "serve") => ({
  entry: config.entry ?? 'src/main.ts',
  userscript: {
    name: {
      ds: config.displayName,
      default: config.name
    },
    version: config.version,
    author: config.author,
    description: config.description,
    require: ['core', ...(config.require ?? [])],
  },
  build: {
    externalGlobals: command == 'serve' ? undefined : {
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

export const createExternalConfig = (command: "build" | "serve") => command == 'build' ? undefined : {
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
