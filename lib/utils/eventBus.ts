import type { PluginDefineResult, PluginInstance } from "@/plugin"
import type { uni } from "@/struct"
import { random, uniqBy } from "lodash-es"
import mitt from "mitt"
import { useGlobalVar } from "./plugin"

export type EventBus = {
  networkError_unauth: any
  networkError_response: any
  networkError_emptyData: any
  networkError_request: any
}
export const eventBus = useGlobalVar(mitt<EventBus>(), 'utils/eventBus')

export type SharedFunctions = {
 /** 重复调用需缓存(自行实现)(可不缓存) */ getUser(): PromiseLike<object>
  getRandomProvide(signal: AbortSignal): PromiseLike<uni.item.Item[]>

  addPlugin(ins: PluginInstance): Promise<PluginDefineResult>
}

export class SharedFunction {
  private static sharedFunctions = useGlobalVar(new Map<string, {
    fn: SharedFunctions[keyof SharedFunctions],
    plugin: string
  }[]>, 'utils/SharedFunction/sharedFunctions')
  public static define<TKey extends keyof SharedFunctions>(fn: SharedFunctions[TKey], plugin: string, name: TKey) {
    this.sharedFunctions.set(name, uniqBy([...(this.sharedFunctions.get(name) ?? []), {
      fn,
      plugin
    }], v => v.plugin))
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
    const index = random(0, all.length)
    const it = all[index]
    console.log(`[SharedFunction.callRandom] call index: ${index} in ${all.length}`, it)
    const result: ReturnType<SharedFunctions[TKey]> = (<any>it.fn)(...args)
    return {
      result,
      ...it
    }
  }
  public static callWitch<TKey extends keyof SharedFunctions>(name: TKey, plugin: string, ...args: Parameters<SharedFunctions[TKey]>) {
    const all = this.sharedFunctions.get(name) ?? []
    const it = all.find(c => c.plugin == plugin)
    if (!it) throw new Error(`[SharedFunction.callWitch] not found plugin function (plugin: ${plugin}, name: ${name})`)
    const result: ReturnType<SharedFunctions[TKey]> = (<any>it.fn)(...args)
    return {
      result,
      ...it
    }
  }
}
