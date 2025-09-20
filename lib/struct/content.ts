import { computed, shallowRef } from 'vue'
import * as item from './item'
import * as ep from './ep'
import { PromiseContent } from '@/utils/data'
export type PreloadValue = item.Item | undefined
export abstract class ContentPage {
  constructor(preload: PreloadValue, public $$plugin: string, public id: string, autoLoad = true) {
    this.preload.value = preload
    this.pid.resolve(id)
    if (autoLoad) this.loadAll()
  }


  public preload = shallowRef<PreloadValue>(undefined)
  public detail = PromiseContent.withResolvers<item.Item>()
  public union = computed(() => this.detail.content.data.value ?? this.preload.value)
  public recommends = PromiseContent.withResolvers<item.Item[]>(true)
  public pid = PromiseContent.withResolvers<string>(true)
  public eps = PromiseContent.withResolvers<ep.Ep[]>()

  public abstract loadAll(): Promise<void>
  public abstract reloadAll(): Promise<void>
}