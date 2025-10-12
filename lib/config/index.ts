import { defineStore } from "pinia"
import { useLocalStorage, usePreferredDark } from "@vueuse/core"
import { computed, shallowReactive, type Ref } from "vue"
import { entries, fromPairs } from "lodash-es"
import type { UniFormDescription, UniFormResult } from "@/plugin"
const defaultConfig = {
  'app.easyTitle': false
}
export type ConfigType = typeof defaultConfig
export const useConfig = defineStore('config', helper => {
  const form = shallowReactive(new Map<string, { form: Record<string, UniFormDescription>, value: Ref<any> }>())

  const $useCustomConfig = helper.action(<T extends Record<string, Required<Pick<UniFormDescription, 'defaultValue'>> & UniFormDescription>, TPlugin extends string>(plugin: TPlugin, desc: T): {
    [K in keyof T as `${TPlugin}.${Extract<K, string>}`]: UniFormResult<T[K]>
  } => {
    const store = useLocalStorage(`${plugin}.config`, <any>fromPairs(entries(desc)
      .map(([name, desc]) => [`${plugin}.${name}`, desc.defaultValue])
    ))
    form.set(plugin, {
      form: desc,
      value: store
    })
    return store.value
  }, 'useCustomConfig')


  const appConfig = $useCustomConfig('core', {
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

  const isSystemDark = usePreferredDark()
  const isDark = computed(() => {
    switch (appConfig["core.darkMode"]) {
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

  return { appConfig, isDark, form, $useCustomConfig }
})