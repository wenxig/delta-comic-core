import { computed, shallowRef, type Component, shallowReactive } from 'vue'
import * as item from './item'
import * as ep from './ep'
import { PromiseContent } from '@/utils/data'
import { isString } from "lodash-es"
import { useGlobalVar } from '@/utils/plugin'
export type PreloadValue = item.Item | undefined
export type ContentPageLike = new (preload: PreloadValue, id: string, ep: string) => ContentPage
export abstract class ContentPage<T extends object = any> {
  private static viewLayout = useGlobalVar(shallowReactive(new Map<string, ViewLayoutComp>()), 'uni/contentPage/viewLayout')
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
  private static contentPage = useGlobalVar(shallowReactive(new Map<string, ContentPageLike>()), 'uni/contentPage/contentPage')
  public static setContentPage(contentType: ContentType_, page: ContentPageLike) {
    this.contentPage.set(this.toContentTypeStringOnly(contentType), page)
  }
  public static getContentPage(contentType: ContentType_) {
    const key = this.toContentTypeStringOnly(contentType)
    const v = this.contentPage.get(key)
    if (!v) throw new Error(`[ContentPage.getContentPage] not found ContentPage (contentType: ${contentType})`)
    return v
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
  /** without viewLayout */
  public static toContentTypeStringOnly(ct: ContentType_): string {
    if (isString(ct)) return ct
    return `${ct.plugin}:${ct.name}`
  }
  constructor(preload: PreloadValue, public id: string, public ep: string) {
    this.preload.value = preload
  }
  public abstract contentType: ContentType

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