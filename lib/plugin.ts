import { ContentPage, type ContentPageLike, type ItemCardComp, type ViewLayoutComp } from "@/struct/content"
import { entries, isFunction } from "lodash-es"
import { Image, type ProcessInstance } from "./struct/image"
import { SharedFunction } from "./utils/eventBus"
import { Comment, type CommentRow } from "./struct/comment"
import type { UserCardComp } from "./struct/user"
import type { RStream } from "./utils/data"
import type { Item, RawItem } from "./struct/item"
import type { Component } from "vue"

export interface PluginConfig {
  name: string
  content?: PluginConfigContent
  image?: PluginConfigImage
  api?: Record<string, PluginConfigApi>
  user?: PluginConfigUser
  auth?: PluginConfigAuth
  otherProgress?: {
    call: (setDescription: (description: string) => void) => PromiseLike<any>
    name: string
  }[]
  onBooted?(ins: PluginDefineResult): PromiseLike<void> | void
  search?: PluginConfigSearch
}

export interface PluginConfigUser {
  card: UserCardComp
  /**
   * 1. download
   * 2. (auto)clear cloud
   * 3. upload
  */
  syncFavourite?: {
    download: () => PromiseLike<Item[]>
    upload: (items: RawItem[]) => PromiseLike<any>
  }
}

export interface PluginConfigSearch {
  /**
  * @description
  * key: id  
  */
  methods?: Record<string, PluginConfigSearchMethod>

  tabbar?: PluginConfigSearchTabbar[]

  categories?: PluginConfigSearchCategory[]
}

export interface PluginConfigSearchCategory {
  title: string
  namespace: string
  search: {
    methodId: string
    input: string
    sort: string
  }
}

export interface PluginConfigSearchTabbar {
  title: string
  id: string
  comp: Component<{ isActive: boolean, tabbar: PluginConfigSearchTabbar }>
}
export interface PluginConfigSearchMethod {
  name: string
  sorts: {
    text: string
    value: string
  }[]
  defaultSort: string
  getStream(input: string, sort: string): RStream<Item>
  getAutoComplete(input: string, signal: AbortSignal): PromiseLike<{
    text: string
    value: string
  }[]>
}

export interface PluginConfigApi {
  forks: () => (PromiseLike<string[]> | string[])
  /**
   * error -> 不可用
   * other -> 可用并比对时间
  */
  test: (fork: string, signal: AbortSignal) => PromiseLike<void>
}

export interface PluginConfigImage {
  /** 
   * @description
   * key: namespace  
   * value: url  
   * 与`Image.setFork(name, key, value)`等价
  */
  forks: Record<string, string[]>
  test: string
  /**
   * @description
   * key: reference name  
   * value: process function  
   * 与`Image.setProcess(name, key, value)`等价
  */
  process?: Record<string, ProcessInstance['func']>
}

export interface PluginConfigContent {
  /**
   * @description
   * key: contentType  
   * value: component  
   * 与`ContentPage.setItemCard(key, value)`等价
  */
  itemCard?: Record<string, ItemCardComp>

  /**
   * @description
   * key: contentType  
   * value: component  
   * 与`Comment.setCommentRow(key, value)`等价
  */
  commentRow?: Record<string, CommentRow>

  /**
   * @description
   * key: contentType  
   * value: component  
   * 与`ContentPage.setViewLayout(key, value)`等价
  */
  layout?: Record<string, ViewLayoutComp>

  /**
   * @description
   * key: name 
   * value: ContentPage  
   * 与`ContentPage.setContentPage(key, value)`等价  
   * _不需要提供viewLayout_
  */
  contentPage?: Record<string, ContentPageLike>
}

export type PluginConfigAuthFormType = {
  info: string
  placeholder?: string
  /**
   * @default true
  */
  required?: boolean
} & ({
  type: 'string'
  patten?: RegExp
  defaultValue?: string
} | {
  type: 'number'
  range?: [number, number]
  float?: boolean
  defaultValue?: number
} | {
  type: 'radio'
  selects: { label: string, value: string }[]
  comp: 'radio' | 'select'
  defaultValue?: string
} | {
  type: 'checkbox'
  selects: { label: string, value: string }[]
  comp: 'checkbox' | 'multipleSelect'
  defaultValue?: string[]
} | {
  type: 'switch'
  close?: string
  open?: string
  defaultValue?: boolean
} | {
  type: 'date'
  defaultValue?: number
})
export type PluginConfigAuthFormResult<T extends PluginConfigAuthFormType> =
  T['type'] extends 'string' ? string :
  T['type'] extends 'number' ? number :
  T['type'] extends 'radio' ? string :
  T['type'] extends 'checkbox' ? string[] :
  T['type'] extends 'switch' ? boolean :
  T['type'] extends 'date' ? number :
  never
export type PluginConfigAuthMethod = {
  form<T extends Record<string, PluginConfigAuthFormType>>(form: T): Promise<{
    [x in keyof T]: PluginConfigAuthFormResult<T[x]>
  }>
  /**
   * sandbox: "allow-forms allow-modals allow-orientation-lock allow-popups-to-escape-sandbox  allow-pointer-lock"
  */
  website(url: string): Window
}
export interface PluginConfigAuth {
  signUp: (by: PluginConfigAuthMethod) => PromiseLike<any>
  logIn: (by: PluginConfigAuthMethod) => PromiseLike<any>

  passSelect: () => PromiseLike<'signUp' | 'logIn' | false>
}



export const definePlugin = (config: PluginConfig | ((safe: boolean) => PluginConfig)) => {
  if (isFunction(config)) var cfg = config(window.$$safe$$)
  else var cfg = config
  console.log('[definePlugin] new plugin defining...', cfg)
  const {
    name: plugin,
    content,
    image,
    search
  } = cfg
  if (content) {
    for (const [ct, comp] of entries(content.layout)) ContentPage.setViewLayout(ct, comp)
    for (const [ct, comp] of entries(content.itemCard)) ContentPage.setItemCard(ct, comp)
    for (const [ct, page] of entries(content.contentPage)) ContentPage.setContentPage(ct, page)
    for (const [ct, row] of entries(content.commentRow)) Comment.setCommentRow(ct, row)
  }
  if (image) {
    if (image.forks) for (const [name, url] of entries(image.forks)) Image.setFork(plugin, name, url)
    if (image.process) for (const [name, fn] of entries(image.process)) Image.setProcess(plugin, name, fn)
  }
  if (search) {
    if (search.categories)
      for (const c of search.categories) ContentPage.setCategories(plugin, c)
    if (search.tabbar)
      for (const c of search.tabbar) ContentPage.setTabbar(plugin, c)
  }
  SharedFunction.callWitch('addPlugin', 'core', cfg)
}

export type PluginDefineResult = {
  api?: Record<string, string | undefined | false>
}