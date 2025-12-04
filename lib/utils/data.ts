import { until } from "@vueuse/core"
import { isEmpty, isError } from "es-toolkit/compat"
import { computed, markRaw, ref, shallowReactive, shallowRef, type Raw, type Ref } from "vue"
import { SmartAbortController } from "./request"
import { useGlobalVar } from "./plugin"
import mitt from "mitt"
import { isString } from "es-toolkit"

/**
 * 可以结构化的数据
*/
export class Struct<TRaw extends object> {
  public toJSON() {
    return <TRaw>JSON.parse(JSON.stringify(this.$$raw))
  }
  constructor(protected $$raw: TRaw) { }
}

export type MetaData = Record<string | number, any>

/**
 * 比如有很多需要注明来自哪个插件的值都可以用
*/
export class SourcedValue<T extends [string, string]> {
  public toJSON(value: T | string) {
    if (isString(value)) return this.parse(value)
    return value
  }
  public parse(value: string) {
    const splited = value.split(this.separator)
    return <T>[splited[0], splited.slice(1).join(this.separator)]
  }
  public toString(value: T | string) {
    if (isString(value)) return value
    return this.stringify(value)
  }
  public stringify(value: T) {
    return value.join(this.separator)
  }
  constructor(public separator = ':') { }
}
export type SourcedKeyType<T extends SourcedKeyMap<any, any> | SourcedValue<any>> = T extends SourcedKeyMap<any, any> ?
  Parameters<T['get']>[0]
  : Parameters<T['toJSON']>[0]
/**
 * 相比较于普通的Map，这个元素的key操作可以是`TKey | string`  
 * _但内部保存仍使用`SourcedValue.toString`作为key_
*/
export class SourcedKeyMap<TKey extends [string, string], TValue> extends SourcedValue<TKey> implements Map<string, TValue> {
  public static create<TKey extends [string, string], TValue>(separator = ':') {
    return shallowReactive(new this<TKey, TValue>(separator))
  }
  private constructor(separator = ':') {
    super(separator)
  }
  private store = shallowReactive(new Map<string, TValue>())
  public get size(): number {
    return this.store.size
  }
  public [Symbol.toStringTag] = 'SourcedKeyMap'
  public clear(): void {
    this.store.clear()
  }
  public delete(key: string | TKey): boolean {
    return this.store.delete(this.toString(key))
  }
  public forEach(callbackfn: (value: TValue, key: string, map: Map<string, TValue>) => void, thisArg?: any): void {
    // Map.prototype.forEach iterates value, key, map
    this.store.forEach((v, k) => {
      callbackfn.call(thisArg, v, k, this)
    })
  }
  public get(key: string | TKey): TValue | undefined {
    return this.store.get(this.toString(key))
  }
  public has(key: string | TKey): boolean {
    return this.store.has(this.toString(key))
  }
  public set(key: string | TKey, value: TValue): this {
    this.store.set(this.toString(key), value)
    return this
  }
  public entries() {
    return this.store.entries()
  }
  public keys() {
    return this.store.keys()
  }
  public values() {
    return this.store.values()
  }
  public [Symbol.iterator]() {
    return this.entries()
  }
}


type PromiseContentEmits<TR> = {
  success: TR
  error: any
  finial: void
}
/**
 * 扩展内容的`Promise`，可视为普通`Promise`使用
*/
export class PromiseContent<T, TPF extends any = T, TEmits extends PromiseContentEmits<TPF> = PromiseContentEmits<TPF>> implements PromiseLike<T> {
  [Symbol.toStringTag] = 'PromiseContent'
  private static _this
  static {
    this._this = useGlobalVar(this, 'data/PromiseContent')
  }
  public static isPromiseContent(value: unknown): value is PromiseContent<any> {
    return value instanceof this._this
  }
  public static fromPromise<T, TP = T>(promise: Promise<T>, processor: (val: T) => TP = v => <any>v): RPromiseContent<T, TP> {
    const v = new this._this<T, TP>(promise, processor)
    return markRaw(v)
  }
  /**
   * 使用`PromiseContent.fromPromise`或`PromiseContent.fromAsyncFunction`代替`new PromiseContent`
  */
  private constructor(private promise: Promise<T>, private processor: (v: T) => TPF = v => <any>v) {
    this.loadPromise(promise)
  }
  public async loadPromise(promise: Promise<T>) {
    this.data.value = undefined
    this.isLoading.value = true
    this.isError.value = false
    this.errorCause.value = undefined
    this.isEmpty.value = true
    try {
      const v = await promise
      this.data.value = this.processor(v)
      this.isLoading.value = false
      this.isError.value = false
      this.isEmpty.value = isEmpty(v)
      this.emitter.emit('success', this.data.value)
    } catch (err) {
      this.data.value = undefined
      this.isError.value = true
      this.errorCause.value = isError(err) ? err : new Error(String(err))
      console.error('Non-throw Error [PromiseContent]', err)
      this.emitter.emit('error', err)
    }
    this.emitter.emit('finial', undefined)
  }
  private emitter = mitt<TEmits>()

  public onError(processor: (err: TEmits['error']) => any) {
    this.emitter.on('error', processor)
    return () => this.emitter.off('error', processor)
  }
  public onSuccess(processor: (err: TEmits['success']) => any) {
    this.emitter.on('success', processor)
    return () => this.emitter.off('success', processor)
  }
  public onFinal(processor: (err: TEmits['finial']) => any) {
    this.emitter.on('finial', processor)
    return () => this.emitter.off('finial', processor)
  }

  /**
   * 对`this.data.value`做出处理，多次调用仅最后一次生效
  */
  public setProcessor<TP>(processor: (val: T) => TP): RPromiseContent<T, TP> {
    return PromiseContent.fromPromise(this.promise, processor)
  }
  public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
    return this.promise.catch<TResult>(onrejected)
  }
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.promise.then<TResult1, TResult2>(onfulfilled, onrejected)
  }
  public finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return this.promise.finally(onfinally)
  }
  public data = shallowRef<TPF>()
  public isLoading = shallowRef(true)
  public isError = shallowRef(false)
  public errorCause = shallowRef<Error>()
  public isEmpty = shallowRef(true)
  public static fromAsyncFunction<T extends (...args: any[]) => Promise<any>>(asyncFunction: T) {
    return (...args: Parameters<T>): RPromiseContent<Awaited<ReturnType<T>>> => this.fromPromise((() => asyncFunction(...args))())
  }
  public static resolve<T>(data: T) {
    const pc = this.fromPromise(Promise.resolve(data))
    pc.isLoading.value = false
    return pc
  }
  public static withResolvers<T>(isLoading = false): PromiseWithResolvers<T> {
    let withResolvers = Promise.withResolvers<T>()
    const content = new this._this<T>(withResolvers.promise)
    content.isLoading.value = isLoading
    return {
      content,
      reject: (reason?: any) => {
        withResolvers.reject(reason)
      },
      resolve: (value: T | PromiseLike<T>) => {
        withResolvers.resolve(value)
      },
      reset(isLoading = false) {
        withResolvers = Promise.withResolvers<T>()
        content.loadPromise(withResolvers.promise)
        content.isLoading.value = isLoading
      }
    }
  }
}
export type PromiseWithResolvers<T> = {
  content: RPromiseContent<T>
  reject: (reason?: any) => void
  resolve: (value: T | PromiseLike<T>) => void
  reset: (isLoading?: boolean) => void
}

export type RPromiseContent<T, PTF = T> = Raw<PromiseContent<T, PTF>>
type RawGenerator<T> = (abortSignal: AbortSignal, that: Stream<T>) => (IterableIterator<T[], void, Stream<T>> | AsyncIterableIterator<T[], void, Stream<T>>)
const generatorMap = new Map<Stream<any>, RawGenerator<any>>()
/**
 * _(网络)_ 数据流
*/
export type RStream<T> = Raw<Stream<T>>
/**
 * 可迭代 _(网络)_ 数据流
*/
export class Stream<T> implements AsyncIterableIterator<T[], void> {
  /** 
   * 使用`Stream.create`代替`new Stream`
   */
  private constructor(rawGenerator: RawGenerator<T>) {
    this.generator = rawGenerator(this.abortController.signal, this)
    generatorMap.set(this, rawGenerator)
    // console.trace('stream new', this)
  }
  private static _this
  static {
    this._this = useGlobalVar(this, 'data/Stream')
  }
  public static isStream(stream: any): stream is Stream<any> {
    return stream instanceof this._this
  }
  public static create<T>(generator: RawGenerator<T>): RStream<T> {
    const stream = new this._this<T>(generator)
    return markRaw(stream)
  }
  [x: symbol]: any
  private abortController = new SmartAbortController()
  private generator
  private _setupData = new Array<T>()
  /** 初始存在的数据(置顶) */
  public setupData(data: T[]) {
    this._setupData.push(...data)
    this.data.value.unshift(...data)
    return this
  }
  public async next(igRequesting = false): Promise<IteratorResult<T[], void>> {
    try {
      if (!igRequesting) {
        await until(this.isRequesting).toBe(false)
        this.isRequesting.value = true
      }
      if (this._isDone) {
        if (!igRequesting) this.isRequesting.value = false
        return { done: true, value: undefined }
      }
      if (igRequesting) console.log('igRequesting next')
      const { value, done } = await this.generator.next(this)
      this.isDone.value = done ?? false
      if (!igRequesting) this.isRequesting.value = false
      if (done) return { done: true, value: undefined }
      this.data.value.push(...value)
      return { value, done }
    } catch (error) {
      if (!igRequesting) this.isRequesting.value = false
      this.error.value = error as Error
      throw error
    }
  }
  public async return(): Promise<IteratorResult<T[], void>> {
    return await this.generator.return?.() ?? { value: undefined, done: true }
  }
  public async throw(e?: any): Promise<IteratorResult<T[], void>> {
    return await this.generator.throw?.(e) ?? { value: undefined, done: true }
  }
  /** 重置 */
  public reset() {
    const rawGenerator = generatorMap.get(this)!
    this.generator = rawGenerator(this.abortController.signal, this)
    this.total.value = NaN
    this.page.value = 0
    this.pageSize.value = NaN
    this.data.value = this._setupData
    this.isDone.value = false
    this.isRequesting.value = false
    this.error.value = undefined
  }
  /** 重试 */
  public async retry() {
    this.page.value--
    return this.next()
  }

  /** 一次性全部加载 */
  public async nextToDone() {
    if (isNaN(this._pages)) await this.next(true)
    const promises = []
    // e.g. p:1 ps:20 2->20
    for (let index = this._page + 1; index <= this._pages; index++)  promises.push(this.next(true))
    await Promise.all(promises)
    return this._data
  }

  /** 停止正在进行的请求 */
  public stop() {
    this.abortController.abort()
    this.isRequesting.value = false
  }
  public [Symbol.asyncIterator]() {
    return this
  }

  /** 错误(如果有) */
  public error = shallowRef<void | Error>()

  /** 数据 */
  public data = ref<T[]>([]) as Ref<T[]>
  /** 数据 */
  public get _data() {
    return this.data.value
  }
  /** 当前页 */
  public page = shallowRef(0)
  /** 当前页 */
  public get _page() {
    return this.page.value
  }
  /** 总页数 */
  public pages = shallowRef(NaN)
  /** 总页数 */
  public get _pages() {
    return this.pages.value
  }
  /** 总条目数 */
  public total = shallowRef(NaN)
  /** 总条目数 */
  public get _total() {
    return this.total.value
  }
  /** 单页条目数 */
  public pageSize = shallowRef(NaN)
  /** 单页条目数 */
  public get _pageSize() {
    return this.pageSize.value
  }
  /** 数据当前总数 */
  public length = computed(() => this.data.value.length)
  /** 数据当前总数 */
  public get _length() {
    return this.data.value.length
  }
  /** 是否正在网络请求 */
  public isRequesting = shallowRef(false)
  /** 是否正在网络请求 */
  public get _isRequesting() {
    return this.isRequesting.value
  }
  /** 是否全部获取完成 */
  public isDone = shallowRef(false)
  /** 是否全部获取完成 */
  public get _isDone() {
    return this.isDone.value
  }
  /** 是否无结果 */
  public isNoData = computed(() => this.isDone.value && this.isEmpty.value)
  /** 是否无结果 */
  public get _isNoData() {
    return this.isNoData.value
  }
  /** 是否当前为空 */
  public isEmpty = computed(() => this.length.value === 0)
  /** 是否当前为空 */
  public get _isEmpty() {
    return this.isEmpty.value
  }
}
export const callbackToPromise = <T = void>(fn: (resolve: (result: T | PromiseLike<T>) => void) => any) => {
  const { resolve, promise } = Promise.withResolvers<T>()
  fn(resolve)
  return promise
}