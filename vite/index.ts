import { mergeConfig, type Plugin, type UserConfig } from 'vite'
import external from 'vite-plugin-external'
import monkey from 'vite-plugin-monkey'

const externalDepends: Record<string, string> = {
  vue: 'window.$$lib$$.Vue',
  vant: 'window.$$lib$$.Vant',
  'naive-ui': 'window.$$lib$$.Naive',
  axios: 'window.$$lib$$.Axios',
  'delta-comic-core': 'window.$$lib$$.Dcc',
  'vue-router': 'window.$$lib$$.VR'
}

/** vite插件，自动配置了库的外部化与脚本头 */
export const deltaComic = (
  config: {
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
    require?: (
      | {
          id: string
          download?: string
        }
      | string
    )[]
    /** @default 'src/main.ts' */
    entry?: string
  },
  command: 'build' | 'serve',
  packageJson: { dependencies: Record<string, string>; devDependencies: Record<string, string> }
): any => {
  const allDependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
  const needExternalDepends = Object.fromEntries(
    Object.entries(externalDepends).filter(([key]) => key in allDependencies)
  )

  const result = [
    command == 'build'
      ? false
      : external({
          externals: externalDepends
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
          if (typeof v == 'string') return `dc|${v}:`
          return `dc|${v.id}:${v.download ?? ''}`
        })
      },
      build: {
        externalGlobals: command == 'serve' ? {} : needExternalDepends
      },
      server: {
        mountGmApi: false,
        open: false,
        prefix: false
      }
    })
  ]
  return result
}

export const deltaComicPlus = (
  meta: {
    name: {
      display: string
      id: string
    }
    version: {
      plugin: string
      supportCore: string
    }
    author: string
    description: string
    require: {
      id: string
      download?: string | undefined
    }[]
    entry: {
      jsPath: string
      cssPath?: string
    }
    beforeBoot?: {
      path: string
      slot: string
    }[]
  },
  command: 'build' | 'serve'
) => {
  const plugin: Plugin = {
    name: 'delta-comic-helper',
    config(config) {
      return mergeConfig(config, <UserConfig>{
        build: {
          lib: {
            entry: './src/main.ts',
            fileName: 'index',
            cssFileName: 'index',
            name: `$$lib$$.__DcPlugin__${meta.name.id.replace('-', '_')}__`,
            formats: ['es']
          },
          rollupOptions: {}
        }
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset', // 指定类型为资源文件
        fileName: 'manifest.json', // 输出的文件名
        source: JSON.stringify(meta, null, 2) // 将 meta 对象转换为格式化的 JSON 字符串
      })
    }
  }
  return command == 'build'
    ? ([
        external({
          externals: externalDepends
        }),
        plugin
      ] as any)
    : deltaComic(
        {
          description: meta.description,
          displayName: meta.name.display,
          name: meta.name.id,
          supportCoreVersion: meta.version.supportCore,
          version: meta.version.plugin,
          author: meta.author,
          entry: 'src/main.ts',
          require: meta.require
        },
        command,
        { dependencies: externalDepends, devDependencies: externalDepends }
      )
}
