import type { PluginInstance } from "@/plugin"
import type { uni } from "@/struct"
import { random } from "lodash-es"
import mitt from "mitt"

export type EventBus = {
  networkError_unauth: any
  networkError_response: any
  networkError_emptyData: any
  networkError_request: any
}
export const eventBus = mitt<EventBus>()

export type SharedFunctions = {
 /** 重复调用需缓存(自行实现)(可不缓存) */ getUser(): PromiseLike<object>
  getRandomProvide(signal: AbortSignal): PromiseLike<uni.item.Item[]>

  addPlugin(ins: PluginInstance): void
}

export class SharedFunction {
  private static sharedFunctions = new Map<string, {
    fn: SharedFunctions[keyof SharedFunctions],
    plugin: string
  }[]>
  public static registerSharedFunction<TKey extends keyof SharedFunctions>(fn: SharedFunctions[TKey], plugin: string, name: TKey) {
    this.sharedFunctions.set(name, [...(this.sharedFunctions.get(name) ?? []), {
      fn,
      plugin
    }])
    return fn
  }
  public static call<TKey extends keyof SharedFunctions>(name: TKey, ...args: Parameters<SharedFunctions[TKey]>) {
    return this.sharedFunctions.get(name)?.map(v => {
      const result: ReturnType<SharedFunctions[TKey]> = (<any>v.fn)(...args)
      return {
        result,
        ...v
      }
    })
  }
  public static callRandom<TKey extends keyof SharedFunctions>(name: TKey, ...args: Parameters<SharedFunctions[TKey]>) {
    const all = this.sharedFunctions.get(name) ?? []
    const it = all[random(0, all.length)]
    const result: ReturnType<SharedFunctions[TKey]> = (<any>it.fn)(...args)
    return {
      result,
      ...it
    }
  }
}
