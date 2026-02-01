import { isString, isUndefined } from 'es-toolkit'
import { isFunction } from 'es-toolkit/compat'

import { SharedFunction } from '@/utils/eventBus'

import type { PluginConfig } from './define'

export const definePlugin = async <T extends PluginConfig>(config: T | ((safe: boolean) => T)) => {
  if (isFunction(config)) var cfg = config(window.$$safe$$)
  else var cfg = config
  console.log('[definePlugin] new plugin defining...', cfg)
  await SharedFunction.call('addPlugin', cfg)
  return cfg
}
export type PluginExpose<T extends ReturnType<typeof definePlugin>> = Awaited<
  ReturnType<NonNullable<Awaited<T>['onBooted']>>
>

export interface RawPluginMeta {
  'name:display': string
  'name:id': string
  'version': string
  'author': string | undefined
  'description': string
  'require'?: string[] | string
}

export interface PluginMeta {
  name: { display: string; id: string }
  version: { plugin: string; supportCore: string }
  author: string
  description: string
  require: { id: string; download?: string | undefined }[]
  entry?: { jsPath: string; cssPath?: string }
  beforeBoot?: { path: string; slot: string }[]
}

export const decodePluginMeta = (v: RawPluginMeta): PluginMeta => ({
  name: { display: v['name:display'], id: v['name:id'] },
  author: v.author ?? '',
  description: v.description,
  require: (v.require ? (isString(v.require) ? [v.require] : v.require) : [])
    .map(dep => {
      const [name, ...download] = dep.split(':')
      if (!name.startsWith('dc|')) return
      return { id: name.replace(/^dc\|/, ''), download: download.join(':') }
    })
    .filter(v => !isUndefined(v)),
  version: {
    plugin: v.version.split('/')[0],
    supportCore: (() => {
      const raw = v.version.split('/')[1]
      if (v.version.split('/')[2]) {
        return raw.replaceAll('>=', '^')
      }
      return raw
    })()
  }
})