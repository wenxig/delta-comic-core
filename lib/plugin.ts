import { ContentPage, type ViewLayoutComp } from "@/struct/content"
import { entries, isFunction } from "lodash-es"
import { Image, type ProcessInstance } from "./struct/image"
import type { Ref } from "vue"
import { SharedFunction } from "./utils/eventBus"

export interface PluginConfig<TApiTestResult> {
  name: string
  content?: {
    /**
     * @description
     * key: name  
     * value: component  
     * 与`ContentPage.setViewLayout(name, key, value)`等价
    */
    layout?: Record<string, ViewLayoutComp>
  }
  image?: {
    /** 
     * @description
     * key: namespace  
     * value: url  
     * 与`Image.setFork(name, key, value)`等价
    */
    forks?: Record<string, string>
    /**
     * @description
     * key: reference name  
     * value: process function  
     * 与`Image.setProcess(name, key, value)`等价
    */
    process?: Record<string, ProcessInstance['func']>
  }
  api?: {
    forks: () => (PromiseLike<string[]> | string[])
    /**
     * error -> 不可用
     * other -> 可用并比对时间
    */
    test: (fork: string, signal: AbortSignal) => PromiseLike<TApiTestResult>
  }
  auth?: {
    call: () => PromiseLike<boolean>
  }
  otherProgress?: {
    call: (description: Ref<string>) => PromiseLike<boolean>
    name: string
  }[]
}

export const definePlugin = <T>(config: PluginConfig<T> | (() => PluginConfig<T>)) => {
  if (isFunction(config)) var cfg = config()
  else var cfg = config
  const {
    name: plugin,
    content,
    image
  } = cfg
  if (content) {
    for (const [name, comp] of entries(content.layout)) ContentPage.setViewLayout(plugin, name, comp)
  }
  if (image) {
    if (image.forks) for (const [name, url] of entries(image.forks)) Image.setFork(plugin, name, url)
    if (image.process) for (const [name, fn] of entries(image.process)) Image.setProcess(plugin, name, fn)
  }
  return <Promise<PluginDefineResult<T>>>SharedFunction.callWitch('addPlugin', 'core', {
    name: cfg.name,
    api: cfg.api,
    auth: cfg.auth,
    otherProgress: cfg.otherProgress
  }).result
}

export type PluginInstance<TResult> = Pick<PluginConfig<TResult>, 'api' | 'auth' | 'otherProgress' | 'name'>

export type PluginDefineResult<TResult> = {
  api: string | undefined | false
  apiTestResult?: TResult
}