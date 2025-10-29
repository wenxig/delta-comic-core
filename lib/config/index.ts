import { defineStore } from "pinia"
import { useLocalStorage, usePreferredDark } from "@vueuse/core"
import { computed, shallowReactive, type Ref } from "vue"
import { fromPairs } from "es-toolkit/compat"
import type { UniFormDescription, UniFormResult } from "@/plugin/define"
const defaultConfig = {
  'app.easyTitle': false
}
export type ConfigType = typeof defaultConfig
export type ConfigDescription = Record<string, Required<Pick<UniFormDescription, 'defaultValue'>> & UniFormDescription>
export class ConfigPointer<T extends ConfigDescription = ConfigDescription> {
  constructor(public pluginName: string, public config: T) {
    this.key = Symbol(pluginName)
  }
  public readonly key: symbol
}

export const resignerConfig = (pointer: ConfigPointer) => {
  const cfg = useConfig()
  const store = useLocalStorage(`${pointer.pluginName}.config`, fromPairs(Object.entries(pointer.config)
    .map(([name, desc]) => [name, desc.defaultValue])
  ))
  cfg.form.set(pointer.key, {
    form: pointer.config,
    value: store
  })
}

export const appConfig = new ConfigPointer('core', {
  recordHistory: {
    type: 'switch',
    defaultValue: false,
    info: '记录历史记录',
  },
  showAIProject: {
    type: 'switch',
    defaultValue: true,
    info: '展示AI作品',
  },
  darkMode: {
    type: 'radio',
    defaultValue: 'system',
    info: '暗色模式配置',
    comp: 'select',
    selects: [{
      label: '浅色',
      value: 'light'
    }, {
      label: '暗色',
      value: 'dark'
    }, {
      label: '跟随系统',
      value: 'system'
    }]
  },
  easilyTitle: {
    type: 'switch',
    defaultValue: false,
    info: '简化标题(实验)',
  }
})

resignerConfig(appConfig)

export const useConfig = defineStore('config', helper => {
  const form = shallowReactive(new Map<symbol, { form: ConfigDescription, value: Ref<any> }>())

  const $load = helper.action(<T extends ConfigPointer>(pointer: T): {
    [K in keyof T['config']]: UniFormResult<T['config'][K]>
  } => {
    const v = form.get(pointer.key)
    if (!v) throw new Error(`not found config by plugin "${pointer.pluginName}"`)
    return <any>v.value
  }, 'load')


  const isSystemDark = usePreferredDark()
  const isDark = computed(() => {
    const cfg = $load(appConfig)
    switch (cfg.darkMode) {
      case 'light':
        return false
      case 'dark':
        return true
      case 'system':
        return isSystemDark.value
      default:
        return false
    }
  })
  return {  isDark, form, $load }
})