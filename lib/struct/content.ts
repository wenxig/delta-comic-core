import { computed, shallowRef, type Component, shallowReactive, type StyleValue } from 'vue'
import * as item from './item'
import * as ep from './ep'
import { PromiseContent } from '@/utils/data'
import { isString } from "lodash-es"
import { useGlobalVar } from '@/utils/plugin'
import type { uni } from '.'
export type PreloadValue = item.Item | undefined
export type ContentPageLike = new (preload: PreloadValue, id: string, ep: string) => ContentPage
export abstract class ContentPage<T extends object = any> {
  private static viewLayout = useGlobalVar(shallowReactive(new Map<string, ViewLayoutComp>()), 'uni/contentPage/viewLayout')
  public static setViewLayout(ct_: ContentType_, component: ViewLayoutComp): string {
    const fullName = this.toContentTypeString(ct_)
    this.viewLayout.set(fullName, component)
    return fullName
  }
  public static getViewLayout(ct_: ContentType_) {
    const ct = this.toContentTypeString(ct_)
    return this.viewLayout.get(ct)
  }

  private static itemCard = useGlobalVar(shallowReactive(new Map<string, ItemCardComp>()), 'uni/contentPage/itemCard')
  public static setItemCard(ct_: ContentType_, component: ItemCardComp): string {
    const fullName = this.toContentTypeString(ct_)
    this.itemCard.set(fullName, component)
    return fullName
  }
  public static getItemCard(ct_: ContentType_) {
    const ct = this.toContentTypeString(ct_)
    return this.viewLayout.get(ct)
  }

  private static contentPage = useGlobalVar(shallowReactive(new Map<string, ContentPageLike>()), 'uni/contentPage/contentPage')
  public static setContentPage(contentType: ContentType_, page: ContentPageLike) {
    this.contentPage.set(this.toContentTypeString(contentType), page)
  }
  public static getContentPage(contentType: ContentType_) {
    const key = this.toContentTypeString(contentType)
    const v = this.contentPage.get(key)
    if (!v) throw new Error(`[ContentPage.getContentPage] not found ContentPage (contentType: ${contentType})`)
    return v
  }

  public static toContentType(ct: ContentType_): ContentType {
    if (isString(ct)) {
      const [plugin, name] = ct.split(':')
      return {
        name, plugin
      }
    }
    return ct
  }
  public static toContentTypeString(ct: ContentType_): string {
    if (isString(ct)) return ct
    return `${ct.plugin}:${ct.name}`
  }

  constructor(preload: PreloadValue, public id: string, public ep: string) {
    this.preload.value = preload
  }
  public abstract contentType: ContentType

  public pid = PromiseContent.withResolvers<string>()

  public preload = shallowRef<PreloadValue>(undefined)
  public detail = PromiseContent.withResolvers<item.Item>()
  public union = computed(() => this.detail.content.data.value ?? this.preload.value)

  public recommends = PromiseContent.withResolvers<item.Item[]>()

  public eps = PromiseContent.withResolvers<ep.Ep[]>()

  public abstract loadAll(): Promise<any>
  public abstract reloadAll(): Promise<any>

  public abstract plugin: string

  public abstract loadAllOffline(): Promise<T>
  public abstract exportOffline(save: T): Promise<any>

  public abstract ViewComp: ViewComp
}
export type ViewComp = Component<{
  page: ContentPage
}>

export interface ContentType {
  plugin: string
  name: string
}
/** 
 * @example "bika:comic"
 * "91video:video"
 * "jm:comic"
 */
export type ContentType_ = ContentType | string
export type ViewLayoutComp = Component<{
  page: ContentPage
}>

export type ItemCardComp = Component<{
  item: uni.item.Item
  freeHeight?: boolean
  disabled?: boolean
  type?: 'default' | 'big' | 'small'
  class?: any
  style?: StyleValue
}>