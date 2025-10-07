import { defineStore } from "pinia"
import { useLocalStorage, usePreferredDark } from "@vueuse/core"
import { computed } from "vue"
import { defaultsDeep, entries, fromPairs } from "lodash-es"
const defaultConfig = {
  'app.read.preloadImageNumbers': 2,
  'app.read.watchFullscreen': true,
  'app.read.twoImage': false,
  'app.search.showAIProject': true,
  'app.darkMode': false,
  "app.recordHistory": true,

}
export type ConfigType = typeof defaultConfig
export const useConfig = defineStore('config', helper => {
  const config = useLocalStorage('app.config', defaultConfig)
  config.value = defaultsDeep(config.value, defaultConfig)
  const isSystemDark = usePreferredDark()
  const isDark = computed(() => config.value['app.darkMode'] || isSystemDark.value)

  const $useCustomConfig = helper.action(<T extends Record<string, any>>(plugin: string, defaultConfig: T): T =>
    useLocalStorage(`${plugin}.config`, <T>fromPairs(entries(defaultConfig)
      .map(([name, defaultValue]) => [`${plugin}.${name}`, defaultValue])
    )).value, 'useCustomConfig')
  return { ...config.value, isDark, $useCustomConfig }
})
