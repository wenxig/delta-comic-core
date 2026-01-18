import { computed, shallowRef, type Component, shallowReactive } from 'vue'
import * as item from './item'
import * as ep from './ep'
import { PromiseContent, SourcedKeyMap, type RStream, type SourcedKeyType } from '@/utils/data'
import { useGlobalVar } from '@/utils/plugin'
import type { uni } from '.'
import * as comment from './comment'
import { type AudioSrc, type MediaSrc, type TextTrackInit } from "vidstack"
import type { PluginConfigSearchBarcode, PluginConfigSearchCategory, PluginConfigSearchHotPageLevelboard, PluginConfigSearchHotPageMainList, PluginConfigSearchHotPageTopButton, PluginConfigSearchTabbar, PluginShareInitiativeItem, PluginShareToken } from '@/plugin/define'
export type PreloadValue = item.Item | undefined
export type ContentPageLike = new (preload: PreloadValue, id: string, ep: string) => ContentPage

export type ContentType_ = SourcedKeyType<typeof ContentPage.contentPage>
export type ContentType = Exclude<ContentType_, string>

export type ViewComp = Component<{
  page: ContentPage
  isFullScreen: boolean
}>

export type ViewLayoutComp = Component<{
  page: ContentPage
}>


export abstract class ContentPage<T extends object = any> {
  public static viewLayout = useGlobalVar(SourcedKeyMap.create<ContentType, ViewLayoutComp>(), 'uni/contentPage/viewLayout')

  public static share = useGlobalVar(SourcedKeyMap.create<[plugin: string, key: string], PluginShareInitiativeItem>(), 'uni/contentPage/share')
  public static shareToken = useGlobalVar(SourcedKeyMap.create<[plugin: string, key: string], PluginShareToken>(), 'uni/contentPage/shareToken')

  public static tabbar = useGlobalVar(shallowReactive(new Map<string, PluginConfigSearchTabbar[]>()), 'uni/contentPage/tabbar')
  public static addTabbar(plugin: string, ...tabbar: PluginConfigSearchTabbar[]) {
    this.tabbar.set(plugin, (this.tabbar.get(plugin) ?? []).concat(tabbar))
  }


  public static categories = useGlobalVar(shallowReactive(new Map<string, PluginConfigSearchCategory[]>()), 'uni/contentPage/categories')
  public static addCategories(plugin: string, ...categories: PluginConfigSearchCategory[]) {
    this.categories.set(plugin, (this.categories.get(plugin) ?? []).concat(categories))
  }

  public static contentPage = useGlobalVar(SourcedKeyMap.create<[plugin: string, name: string], ContentPageLike>(), 'uni/contentPage/contentPage')

  public static barcode = useGlobalVar(shallowReactive(new Map<string, PluginConfigSearchBarcode[]>()), 'uni/contentPage/barcode')
  public static addBarcode(plugin: string, cfg: PluginConfigSearchBarcode): string {
    const old = this.barcode.get(plugin) ?? [] 
    old.push(cfg)
    this.barcode.set(plugin, old)
    return plugin
  }


  public static levelboard = useGlobalVar(shallowReactive(new Map<string, PluginConfigSearchHotPageLevelboard[]>()), 'uni/contentPage/levelboard')
  public static addLevelboard(plugin: string, cfg: PluginConfigSearchHotPageLevelboard): string {
    const old = this.levelboard.get(plugin) ?? []
    old.push(cfg)
    this.levelboard.set(plugin, old)
    return plugin
  }

  public static topButton = useGlobalVar(shallowReactive(new Map<string, PluginConfigSearchHotPageTopButton[]>()), 'uni/contentPage/topButton')
  public static addTopButton(plugin: string, cfg: PluginConfigSearchHotPageTopButton): string {
    const old = this.topButton.get(plugin) ?? []
    old.push(cfg)
    this.topButton.set(plugin, old)
    return plugin
  }

  public static mainLists = useGlobalVar(shallowReactive(new Map<string, PluginConfigSearchHotPageMainList[]>()), 'uni/contentPage/mainLists')
  public static addMainList(plugin: string, cfg: PluginConfigSearchHotPageMainList): string {
    const old = this.mainLists.get(plugin) ?? []
    old.push(cfg)
    this.mainLists.set(plugin, old)
    return plugin
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

  public abstract loadAllOffline(save: T): Promise<any>
  public abstract exportOffline(): Promise<T>

  public abstract ViewComp: ViewComp
}


export abstract class ContentImagePage extends ContentPage {
  public images = PromiseContent.withResolvers<uni.image.Image[]>()
}

export type VideoConfig = {
  textTrack?: TextTrackInit[]
} & (Exclude<MediaSrc, string | AudioSrc>[])
export abstract class ContentVideoPage extends ContentPage {
  public videos = PromiseContent.withResolvers<VideoConfig>()
}