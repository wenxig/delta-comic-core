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
  // registerPlugin(config: any, ...others: any[]): PromiseLike<object>
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
}
