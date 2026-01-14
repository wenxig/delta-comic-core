import { ContentPage } from "@/struct/content"
import { isFunction } from "es-toolkit/compat"
import { Image } from "@/struct/image"
import { SharedFunction } from "@/utils/eventBus"
import { Comment } from "@/struct/comment"
import { User } from "@/struct/user"
import { Item } from "@/struct/item"
import type { PluginConfig } from "./define"
import { useConfig } from "@/config"
import { isString, isUndefined } from "es-toolkit"

export const definePlugin = (config: PluginConfig | ((safe: boolean) => PluginConfig)) => {
  if (isFunction(config)) var cfg = config(window.$$safe$$)
  else var cfg = config
  console.log('[definePlugin] new plugin defining...', cfg)
  const {
    name: plugin,
    content,
    resource,
    search,
    user,
    subscribe,
    share,
  } = cfg
  if (content)
    for (const [ct, { commentRow, contentPage, itemCard, layout, itemTranslator }] of Object.entries(content)) {
      if (layout) ContentPage.viewLayout.set(ct, layout)
      if (itemCard) Item.itemCard.set(ct, itemCard)
      if (contentPage) ContentPage.contentPage.set(ct, contentPage)
      if (commentRow) Comment.commentRow.set(ct, commentRow)
      if (itemTranslator) Item.itemTranslator.set(ct, itemTranslator)
    }

  if (resource) {
    if (resource.types) for (const type of resource.types) Image.fork.set([plugin, type.type], type)
    if (resource.process) for (const [name, fn] of Object.entries(resource.process)) Image.processInstances.set([plugin, name], fn)
  }
  if (search) {
    if (search.categories)
      for (const c of search.categories) ContentPage.addCategories(plugin, c)
    if (search.tabbar)
      for (const c of search.tabbar) ContentPage.addTabbar(plugin, c)
    if (search.hotPage) {
      for (const mlc of search.hotPage.mainListCard ?? []) ContentPage.addMainList(plugin, mlc)
      for (const lb of search.hotPage.levelBoard ?? []) ContentPage.addLevelboard(plugin, lb)
      for (const tb of search.hotPage.topButton ?? []) ContentPage.addTopButton(plugin, tb)
    }
    if (search.barcode) {
      for (const barcode of search.barcode ?? []) ContentPage.addBarcode(plugin, barcode)
    }
  }
  if (user) {
    if (user.edit) User.userEditorBase.set(plugin, user.edit)
    if (user.authorActions)
      for (const [type, value] of Object.entries(user.authorActions))
        User.authorActions.set([plugin, type], value)
    if (user.authorIcon)
      for (const [key, value] of Object.entries(user.authorIcon))
        Item.authorIcon.set([plugin, key], value)
  }
  if (subscribe) {
    for (const [key, value] of Object.entries(subscribe))
      User.subscribes.set([plugin, key], value)
  }
  if (cfg.config) {
    for (const config of cfg.config) {
      useConfig().$resignerConfig(config)
    }
  }
  if (share) {
    for (const v of share.initiative ?? [])
      ContentPage.share.set([plugin, v.key], v)
    for (const v of share.tokenListen ?? [])
      ContentPage.shareToken.set([plugin, v.key], v)
  }
  return SharedFunction.call('addPlugin', cfg)
}


export interface RawPluginMeta {
  'name:display': string
  'name:id': string
  version: string
  author: string | undefined
  description: string
  require?: string[] | string
}

export interface PluginMeta {
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
  entry?: {
    jsPath: string
    cssPath?: string
  }
  beforeBoot?: {
    path: string
    slot: string
  }[]
}

export const decodePluginMeta = (v: RawPluginMeta): PluginMeta => ({
  name: {
    display: v["name:display"],
    id: v["name:id"],
  },
  author: v.author ?? '',
  description: v.description,
  require: (v.require ? isString(v.require) ? [v.require] : v.require : []).map(dep => {
    const [name, ...download] = dep.split(':')
    if (!name.startsWith('dc|')) return
    return {
      id: name.replace(/^dc\|/, ''),
      download: download.join(':')
    }
  }).filter(v => !isUndefined(v)),
  version: {
    plugin: v.version.split('/')[0],
    supportCore: (() => {
      const raw = v.version.split('/')[1]
      if (Boolean(v.version.split('/')[2])) {
        return raw.replaceAll('>=', '^')
      }
      return raw
    })()
  }
})