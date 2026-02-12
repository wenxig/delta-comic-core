import type { FormType } from '@delta-comic/ui'

import { usePreferredDark } from '@vueuse/core'
import { fromPairs } from 'es-toolkit/compat'
import { defineStore } from 'pinia'
import { computed, shallowReactive, type Ref } from 'vue'

import { type UseNativeStore } from '@delta-comic/utils'

export type ConfigDescription = Record<
  string,
  Required<Pick<FormType.SingleConfigure, 'defaultValue'>> & FormType.SingleConfigure
>
export class ConfigPointer<T extends ConfigDescription = ConfigDescription> {
  constructor(
    public pluginName: string,
    public config: T
  ) {
    this.key = Symbol.for(`config:${pluginName}`)
  }
  public readonly key: symbol
}

export const appConfig = new ConfigPointer('core', {
  recordHistory: { type: 'switch', defaultValue: true, info: '记录历史记录' },
  showAIProject: { type: 'switch', defaultValue: true, info: '展示AI作品' },
  darkMode: {
    type: 'radio',
    defaultValue: 'system',
    info: '暗色模式配置',
    comp: 'select',
    selects: [
      { label: '浅色', value: 'light' },
      { label: '暗色', value: 'dark' },
      { label: '跟随系统', value: 'system' }
    ]
  },
  easilyTitle: { type: 'switch', defaultValue: false, info: '简化标题(实验)' }
})

export const useConfig = defineStore('config', helper => {
  const form = shallowReactive(new Map<symbol, { form: ConfigDescription; value: Ref<any> }>())

  const $load = helper.action(
    <T extends ConfigPointer>(pointer: T): Ref<FormType.Result<T['config']>> => {
      const v = form.get(pointer.key)
      if (!v) throw new Error(`not found config by plugin "${pointer.pluginName}"`)
      return v.value
    },
    'load'
  )

  const isSystemDark = usePreferredDark()
  const isDark = computed(() => {
    if (!$isExistConfig(appConfig)) return isSystemDark.value
    const cfg = $load(appConfig).value
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
  const $isExistConfig = helper.action(
    (pointer: ConfigPointer) => form.has(pointer.key),
    'isExistConfig'
  )
  const $resignerConfig = helper.action((pointer: ConfigPointer) => {
    const useNativeStore = window.$api.useNativeStore as UseNativeStore
    const cfg = useConfig()
    const store = useNativeStore(
      pointer.pluginName,
      'config',
      fromPairs(Object.entries(pointer.config).map(([name, desc]) => [name, desc.defaultValue]))
    )
    cfg.form.set(pointer.key, { form: pointer.config, value: store })
  }, 'resignerConfig')
  return { isDark, form, $load, $isExistConfig, $resignerConfig }
})