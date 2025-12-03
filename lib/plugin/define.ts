import { ContentPageLike, ItemCardComp, ViewLayoutComp } from "@/struct/content"
import { ProcessInstance } from "@/struct/image"
import { CommentRow } from "@/struct/comment"
import { UserCardComp } from "@/struct/user"
import { RStream, type RPromiseContent } from "@/utils/data"
import { Item, RawItem, type Author } from "@/struct/item"
import { Component, type MaybeRefOrGetter } from "vue"
import type { ConfigPointer } from "@/config"

export type PluginDefineResult = {
  api?: Record<string, string | undefined | false>
}

export interface PluginConfig {
  name: string
  content?: PluginConfigContent
  image?: PluginConfigImage
  api?: Record<string, PluginConfigApi>
  user?: PluginConfigUser
  auth?: PluginConfigAuth
  otherProgress?: PluginOtherProgress[]
  /**
   * 返回值如果不为空，则会await后作为expose暴露
   */
  onBooted?(ins: PluginDefineResult): (PromiseLike<object> | object) | void
  search?: PluginConfigSearch
  /** 
   * 插件的配置项需在此处注册  
   * 传入`Store.ConfigPointer`
   */
  config?: ConfigPointer[]

  subscribe?: Record<string, PluginConfigSubscribe>
}

export interface PluginConfigSubscribe {
  getUpdateList(olds: { author: Author, list: Item[] }[], signal?: AbortSignal): PromiseLike<{
    isUpdated: boolean
    whichUpdated: Author[]
  }>
  onAdd?(author: Author): any
  onRemove?(author: Author): any
  getListStream(author: Author): RStream<Item>
}

export interface PluginOtherProgress {
  call: (setDescription: (description: string) => void) => PromiseLike<any>
  name: string
}

export interface PluginConfigUser {
  edit?: Component
  card?: UserCardComp
  /**
   * 1. download
   * 2. upload (收藏那些云端未收藏的漫画)
  */
  syncFavourite?: {
    download: () => PromiseLike<Item[]>
    upload: (items: RawItem[]) => PromiseLike<any>
  }

  /**
   * 在用户界面，在历史记录那个板块的下方，你希望展示的自己的板块
  */
  userActionPages?: PluginUserActionPage[]

  authorActions?: Record<string, AuthorAction>

  authorIcon?: Record<string, Component>
}

export interface AuthorAction {
  call(author: Author): any
  name: string
  icon?: Component
}

export interface PluginUserActionPage {
  title?: string
  items: PluginUserActionPageItem[]

  clickPage?: Component
  clickText?: string
}
export type PluginUserActionPageItem = {
  name: string
  key: string
  type: 'button'
  icon: Component

  page: Component
} | {
  name: string
  key: string
  type: 'statistic'
  icon?: Component

  value: MaybeRefOrGetter<string | number>
}

export interface PluginConfigSearch {
  /**
  * @description
  * key: id  
  */
  methods?: Record<string, PluginConfigSearchMethod>

  tabbar?: PluginConfigSearchTabbar[]

  categories?: PluginConfigSearchCategory[]

  hotPage?: {
    levelBoard?: PluginConfigSearchHotPageLevelboard[]
    topButton?: PluginConfigSearchHotPageTopButton[]
    mainListCard?: PluginConfigSearchHotPageMainList[]
  }
}
export interface PluginConfigSearchHotPageLevelboard {
  name: string
  content: () => (RStream<Item> | RPromiseContent<any, Item[]>)
}
export interface PluginConfigSearchHotPageMainList {
  name: string
  content: () => (RStream<Item> | RPromiseContent<any, Item[]>)
  onClick?(): any
}
export interface PluginConfigSearchHotPageTopButton {
  name: string
  icon: Component
  bgColor: string
  onClick?(): any
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
  getAutoComplete(input: string, signal: AbortSignal): PromiseLike<({
    text: string
    value: string
  } | Component)[]>
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
  process?: Record<string, ProcessInstance>
}

export type PluginConfigContent = Record<string, {
  /**
   * @description
   * key: contentType  
   * value: component  
   * 与`ContentPage.setItemCard(key, value)`等价
  */
  itemCard?: ItemCardComp

  /**
   * @description
   * key: contentType  
   * value: component  
   * 与`Comment.setCommentRow(key, value)`等价
  */
  commentRow?: CommentRow

  /**
   * @description
   * key: contentType  
   * value: component  
   * 与`ContentPage.setViewLayout(key, value)`等价
  */
  layout?: ViewLayoutComp

  /**
   * @description
   * key: name 
   * value: ContentPage  
   * 与`ContentPage.setContentPage(key, value)`等价  
   * _不需要提供viewLayout_
  */
  contentPage?: ContentPageLike

  /**
   * @description
   * 将原始对象转换为类
  */
  itemTranslator?: PluginConfigContentItemTranslator
}>
export type PluginConfigContentItemTranslator = (raw: RawItem) => Item

export type UniFormDescription = {
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
export type UniFormResult<T extends UniFormDescription> =
  T['type'] extends 'string' ? string :
  T['type'] extends 'number' ? number :
  T['type'] extends 'radio' ? string :
  T['type'] extends 'checkbox' ? string[] :
  T['type'] extends 'switch' ? boolean :
  T['type'] extends 'date' ? number :
  never
export type PluginConfigAuthMethod = {
  form<T extends Record<string, UniFormDescription>>(form: T): Promise<{
    [x in keyof T]: UniFormResult<T[x]>
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

export const _ = undefined