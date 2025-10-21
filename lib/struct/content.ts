import { computed, shallowRef, type Component, shallowReactive, type StyleValue } from 'vue'
import * as item from './item'
import * as ep from './ep'
import { PromiseContent, type RStream } from '@/utils/data'
import { isString } from "es-toolkit/compat-es"
import { useGlobalVar } from '@/utils/plugin'
import type { uni } from '.'
import * as comment from './comment'
import type { PluginConfigSearchCategory, PluginConfigSearchTabbar } from '@/plugin/define'
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

  public static tabbar = useGlobalVar(shallowReactive(new Map<string, PluginConfigSearchTabbar[]>()), 'uni/contentPage/tabbar')
  public static setTabbar(plugin: string, ...tabbar: PluginConfigSearchTabbar[]) {
    this.tabbar.set(plugin, this.getTabbar(plugin).concat(tabbar))
  }
  public static getTabbar(plugin: string) {
    return this.tabbar.get(plugin) ?? []
  }

  public static categories = useGlobalVar(shallowReactive(new Map<string, PluginConfigSearchCategory[]>()), 'uni/contentPage/categories')
  public static setCategories(plugin: string, ...categories: PluginConfigSearchCategory[]) {
    this.categories.set(plugin, this.getCategories(plugin).concat(categories))
  }
  public static getCategories(plugin: string) {
    return this.categories.get(plugin) ?? []
  }

  private static itemCard = useGlobalVar(shallowReactive(new Map<string, ItemCardComp>()), 'uni/contentPage/itemCard')
  public static setItemCard(ct_: ContentType_, component: ItemCardComp): string {
    const fullName = this.toContentTypeString(ct_)
    this.itemCard.set(fullName, component)
    return fullName
  }
  public static getItemCard(ct_: ContentType_) {
    const ct = this.toContentTypeString(ct_)
    return this.itemCard.get(ct)
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

  public abstract comments: RStream<comment.Comment>

  public eps = PromiseContent.withResolvers<ep.Ep[]>()

  public abstract loadAll(signal?: AbortSignal): Promise<any>
  public abstract reloadAll(signal?: AbortSignal): Promise<any>

  public abstract plugin: string

  public abstract loadAllOffline(): Promise<T>
  public abstract exportOffline(save: T): Promise<any>

  public abstract ViewComp: ViewComp
}
export type ViewComp = Component<{
  page: ContentPage
  isFullScreen: boolean
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
  comp: {
    FavouriteSelect: Component<{ item: uni.item.Item }>
  }
}>

export type ItemCardComp = Component<{
  item: uni.item.Item
  freeHeight?: boolean
  disabled?: boolean
  type?: 'default' | 'big' | 'small'
  class?: any
  style?: StyleValue
}>