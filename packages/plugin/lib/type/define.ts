import type { uni } from '@delta-comic/model'
import type { RStream, RPromiseContent } from '@delta-comic/model'
import type { Component, MaybeRefOrGetter } from 'vue'

import type { ConfigPointer } from '@/config'

export type PluginDefineResult = { api?: Record<string, string | undefined | false> }

export interface PluginConfig {
  name: string
  content?: PluginConfigContent
  resource?: PluginConfigResource
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

  share?: PluginShare
}
export interface PluginShare {
  initiative: PluginShareInitiativeItem[]
  tokenListen: PluginShareToken[]
}

export interface PluginShareToken {
  key: string
  name: string
  patten(chipboard: string): boolean
  show(chipboard: string): Promise<PluginShareTokenPopup> | PluginShareTokenPopup
}

export interface PluginShareTokenPopup {
  title: string
  detail: string
  onPositive(): void
  onNegative(): void
}

export interface PluginShareInitiativeItem {
  key: string
  name: string
  icon: Component | uni.image.Image
  bgColor?: string
  call(page: uni.content.ContentPage): Promise<any>
  filter(page: uni.content.ContentPage): boolean
}

export interface PluginConfigSubscribe {
  getUpdateList(
    olds: { author: uni.item.Author; list: uni.item.Item[] }[],
    signal?: AbortSignal
  ): PromiseLike<{ isUpdated: boolean; whichUpdated: uni.item.Author[] }>
  onAdd?(author: uni.item.Author): any
  onRemove?(author: uni.item.Author): any
  getListStream(author: uni.item.Author): RStream<uni.item.Item>
}

export interface PluginOtherProgress {
  call: (setDescription: (description: string) => void) => PromiseLike<any>
  name: string
}

export interface PluginConfigUser {
  edit?: Component
  card?: uni.user.UserCardComp
  /**
   * 1. download
   * 2. upload (收藏那些云端未收藏的漫画)
   */
  syncFavourite?: {
    download: () => PromiseLike<uni.item.Item[]>
    upload: (items: uni.item.RawItem[]) => PromiseLike<any>
  }

  /**
   * 在用户界面，在历史记录那个板块的下方，你希望展示的自己的板块
   */
  userActionPages?: PluginUserActionPage[]

  authorActions?: Record<string, AuthorAction>

  authorIcon?: Record<string, Component>
}

export interface AuthorAction {
  call(author: uni.item.Author): any
  name: string
  icon?: Component
}

export interface PluginUserActionPage {
  title?: string
  items: PluginUserActionPageItem[]

  clickPage?: Component
  clickText?: string
}
export type PluginUserActionPageItem =
  | {
      name: string
      key: string
      type: 'button'
      icon: Component

      page: Component
    }
  | {
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

  barcode?: PluginConfigSearchBarcode[]
}

export type RouteToContent = (
  contentType_: uni.content.ContentType_,
  id: string,
  ep: string,
  preload?: uni.content.PreloadValue
) => PromiseLike<any>

export interface PluginConfigSearchBarcode {
  match: (searchText: string) => boolean
  /**
   * 选中后返回路由信息
   */
  getContent: (searchText: string, signal: AbortSignal) => PromiseLike<Parameters<RouteToContent>>
  name: string
}

export interface PluginConfigSearchHotPageLevelboard {
  name: string
  content: () => RStream<uni.item.Item> | RPromiseContent<any, uni.item.Item[]>
}
export interface PluginConfigSearchHotPageMainList {
  name: string
  content: () => RStream<uni.item.Item> | RPromiseContent<any, uni.item.Item[]>
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
  search: { methodId: string; input: string; sort: string }
}

export interface PluginConfigSearchTabbar {
  title: string
  id: string
  comp: Component<{ isActive: boolean; tabbar: PluginConfigSearchTabbar }>
}
export interface PluginConfigSearchMethod {
  name: string
  sorts: { text: string; value: string }[]
  defaultSort: string
  getStream(input: string, sort: string): RStream<uni.item.Item>
  getAutoComplete(
    input: string,
    signal: AbortSignal
  ): PromiseLike<({ text: string; value: string } | Component)[]>
}

export interface PluginConfigApi {
  forks: () => PromiseLike<string[]> | string[]
  /**
   * error -> 不可用
   * other -> 可用并比对时间
   */
  test: (fork: string, signal: AbortSignal) => PromiseLike<void>
}

export interface PluginConfigResource {
  process?: Record<string, uni.resource.ProcessInstance>
  types?: uni.resource.ResourceType[]
}

export type PluginConfigContent = Record<
  string,
  {
    /**
     * @description
     * key: contentType
     * value: component
     * 与`ContentPage.setItemCard(key, value)`等价
     */
    itemCard?: uni.item.ItemCardComp

    /**
     * @description
     * key: contentType
     * value: component
     * 与`Comment.setCommentRow(key, value)`等价
     */
    commentRow?: uni.comment.CommentRow

    /**
     * @description
     * key: contentType
     * value: component
     * 与`ContentPage.setViewLayout(key, value)`等价
     */
    layout?: uni.content.ViewLayoutComp

    /**
     * @description
     * key: name
     * value: ContentPage
     * 与`ContentPage.setContentPage(key, value)`等价
     * _不需要提供viewLayout_
     */
    contentPage?: uni.content.ContentPageLike

    /**
     * @description
     * 将原始对象转换为类
     */
    itemTranslator?: PluginConfigContentItemTranslator
  }
>
export type PluginConfigContentItemTranslator = (raw: uni.item.RawItem) => uni.item.Item

export type UniFormDescription = {
  info: string
  placeholder?: string
  /**
   * @default true
   */
  required?: boolean
} & (
  | { type: 'string'; patten?: RegExp; defaultValue?: string }
  | { type: 'number'; range?: [number, number]; float?: boolean; defaultValue?: number }
  | {
      type: 'radio'
      selects: { label: string; value: string }[]
      comp: 'radio' | 'select'
      defaultValue?: string
    }
  | {
      type: 'checkbox'
      selects: { label: string; value: string }[]
      comp: 'checkbox' | 'multipleSelect'
      defaultValue?: string[]
    }
  | { type: 'switch'; close?: string; open?: string; defaultValue?: boolean }
  | { type: 'date'; defaultValue?: number }
)
export type UniFormResult<T extends UniFormDescription> = T['type'] extends 'string'
  ? string
  : T['type'] extends 'number'
    ? number
    : T['type'] extends 'radio'
      ? string
      : T['type'] extends 'checkbox'
        ? string[]
        : T['type'] extends 'switch'
          ? boolean
          : T['type'] extends 'date'
            ? number
            : never
export type PluginConfigAuthMethod = {
  form<T extends Record<string, UniFormDescription>>(
    form: T
  ): Promise<{
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