import { ContentPage, type ViewLayoutComp } from "@/struct/content"
import { entries, isFunction } from "lodash-es"
import { Image, type ProcessInstance } from "./struct/image"
import type { Ref } from "vue"

export interface PluginConfig {
  name: string
  content?: {
    /**
     * @description
     * key: name  
     * value: component
    */
    layout?: Record<string, ViewLayoutComp>
  }
  image?: {
    /** 
     * @description
     * key: namespace  
     * value: url
    */
    forks?: Record<string, string>
    /**
     * @description
     * key: reference name  
     * value: process function
    */
    process?: Record<string, ProcessInstance['func']>
  }
  api?: {
    forks: () => (PromiseLike<string[]> | string[])
    test: (fork: string, signal: AbortSignal) => PromiseLike<boolean>
  }
  auth?: {

  }
  otherProgress?: {
    call: (description: Ref<string>) => PromiseLike<boolean>
    name: string
  }[]
}

export const definePlugin = (config: PluginConfig | (() => PluginConfig)) => {
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

}

export interface PluginInstance {

}