import { ContentPage, type ContentPageLike, type ItemCardComp, type ViewLayoutComp } from "@/struct/content"
import { entries, isFunction } from "lodash-es"
import { Image, type ProcessInstance } from "./struct/image"
import type { Ref } from "vue"
import { SharedFunction } from "./utils/eventBus"

export interface PluginConfig {
  name: string
  content?: {
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
  image?: {
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
  api?: Record<string, {
    forks: () => (PromiseLike<string[]> | string[])
    /**
     * error -> 不可用
     * other -> 可用并比对时间
    */
    test: (fork: string, signal: AbortSignal) => PromiseLike<void>
  }>
  auth?: PluginConfigAuth
  otherProgress?: {
    call: (description: Ref<string>) => PromiseLike<boolean>
    name: string
  }[]
  onBooted?(ins: PluginDefineResult): PromiseLike<void> | void
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
    image
  } = cfg
  if (content) {
    for (const [ct, comp] of entries(content.layout)) ContentPage.setViewLayout(ct, comp)
    for (const [ct, comp] of entries(content.itemCard)) ContentPage.setItemCard(ct, comp)
    for (const [ct, page] of entries(content.contentPage)) ContentPage.setContentPage(ct, page)
  }
  if (image) {
    if (image.forks) for (const [name, url] of entries(image.forks)) Image.setFork(plugin, name, url)
    if (image.process) for (const [name, fn] of entries(image.process)) Image.setProcess(plugin, name, fn)
  }
  SharedFunction.callWitch('addPlugin', 'core', {
    name: cfg.name,
    api: cfg.api,
    auth: cfg.auth,
    otherProgress: cfg.otherProgress,
    onBooted: cfg.onBooted,
    image: cfg.image
  })
}

export type PluginInstance = Pick<PluginConfig, 'api' | 'auth' | 'otherProgress' | 'name' | 'onBooted' | 'image'>

export type PluginDefineResult = {
  api?: Record<string, string | undefined | false>
}