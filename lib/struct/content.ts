import { computed, shallowRef, type Component, shallowReactive } from 'vue'
import * as item from './item'
import * as ep from './ep'
import { PromiseContent } from '@/utils/data'
import { isString } from "lodash-es"
export type PreloadValue = item.Item | undefined
export abstract class ContentPage<T extends object = any> {
  private static viewLayout = shallowReactive(new Map<string, ViewLayoutComp>())
  public static setViewLayout(plugin: string, name: string, component: ViewLayoutComp): ViewLayout {
    const fullName = `${plugin}:${name}`
    this.viewLayout.set(fullName, component)
    return {
      componentPointer: fullName,
      name,
      plugin
    }
  }
  public static getViewLayout(vl_: ViewLayout_) {
    const vl = this.toViewLayout(vl_)
    return this.viewLayout.get(vl.componentPointer)
  }
  public static toViewLayout(vl: ViewLayout_): ViewLayout {
    if (isString(vl)) {
      const [plugin, name] = vl.split(':')
      return {
        name, plugin,
        componentPointer: `${plugin}:${name}`
      }
    }
    return vl
  }
  public static toViewLayoutString(vl: ViewLayout_): string {
    if (isString(vl)) return vl
    return `${vl.plugin}:${vl.name}`
  }
  public static toContentType(ct: ContentType_): ContentType {
    if (isString(ct)) {
      const [c, v] = ct.split('$')
      const [plugin, name] = c.split(':')
      return {
        name, plugin,
        layout: this.toViewLayout(v)
      }
    }
    return ct
  }
  public static toContentTypeString(ct: ContentType_): string {
    if (isString(ct)) return ct
    return `${ct.plugin}:${ct.name}$${this.toViewLayoutString(ct.layout)}`
  }

  constructor(preload: PreloadValue, public plugin: string, contentType: ContentType_, public id: string) {
    this.preload.value = preload
    this.contentType = ContentPage.toContentType(contentType)
  }
  public contentType: ContentType

  public pid = PromiseContent.withResolvers<string>(true)

  public preload = shallowRef<PreloadValue>(undefined)
  public detail = PromiseContent.withResolvers<item.Item>()
  public union = computed(() => this.detail.content.data.value ?? this.preload.value)

  public recommends = PromiseContent.withResolvers<item.Item[]>(true)

  public eps = PromiseContent.withResolvers<ep.Ep[]>()

  public abstract loadAll(): Promise<void>
  public abstract reloadAll(): Promise<void>

  public abstract loadAllOffline(): Promise<T>
  public abstract exportOffline(save: T): Promise<void>

  public abstract ViewComp: ViewComp
}
export type ViewComp = Component<{
  page: ContentPage
}>


export interface ViewLayout {
  plugin: string
  name: string
  componentPointer: string
}
export type ViewLayout_ = string | ViewLayout

export interface ContentType {
  plugin: string
  name: string
  layout: ViewLayout
}
/** 
 * @example "bika:comic$core:default"
 * "91video:video$core:default"
 * "bika:comic$jm:comic"
 */
export type ContentType_ = ContentType | string
export type ViewLayoutComp = Component<{
  page: ContentPage
}>