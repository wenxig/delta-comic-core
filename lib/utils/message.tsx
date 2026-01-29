import { computed, isRef, shallowRef, watch, type CSSProperties, type MaybeRefOrGetter } from "vue"
import { isFunction } from "es-toolkit/compat"
import type { DialogOptions, DialogReactive } from "naive-ui"
import { noop } from "@vueuse/core"
import { until } from "@vueuse/core"
import { isError, isUndefined, delay } from "es-toolkit"
import { isNumber, toString } from "es-toolkit/compat"
import { motion } from "motion-v"
import { NProgress, NIcon, NButton, NIconWrapper } from "naive-ui"
import { Icon, Loading } from "vant"
import { nextTick, Transition, TransitionGroup, withDirectives, reactive, ref, type Reactive, vShow } from "vue"
import { useZIndex } from "./layout"
import { useGlobalVar } from "./plugin"
import { CloseRound, ReloadOutlined, DoneRound, FileDownloadRound } from "@/components/icons"

export type LoadingInstance = ReturnType<typeof createLoadingMessage>
export const createLoadingMessage = (text: MaybeRefOrGetter<string> = '加载中', api = window.$message) => {
  const data = computed(() => isRef(text) ? text.value : isFunction(text) ? text() : text)
  let loading = api.loading(data.value, {
    duration: 0,
  })
  const stop = watch(data, text => {
    loading.content = text
  })
  let isDestroy = false
  async function bind<T extends PromiseLike<any>,>(promise?: T, throwError?: false, successText?: string, failText?: string): Promise<Awaited<T>>
  async function bind<T extends PromiseLike<any>,>(promise?: T, throwError?: true, successText?: string, failText?: string): Promise<Awaited<T> | undefined>
  async function bind<T extends PromiseLike<any>,>(promise?: T, throwError = true, successText?: string, failText?: string): Promise<Awaited<T> | undefined> {
    try {
      const res = await promise
      ctx.success(successText)
      return res
    } catch (error) {
      ctx.fail(failText)
      if (throwError)
        throw error
      return undefined
    }
  }
  const ctx = {
    bind,
    async success(text = "成功！", delayTime = 500) {
      stop()
      if (isDestroy || !loading) return
      isDestroy = true
      loading.type = 'success'
      loading.content = text
      await delay(delayTime)
      loading.destroy()
    },
    async fail(text = "失败！", delayTime = 500) {
      stop()
      if (isDestroy || !loading) return
      isDestroy = true
      loading.type = 'error'
      loading.content = text
      await delay(delayTime)
      loading.destroy()
    },
    async info(text: string, delayTime = 500) {
      stop()
      if (isDestroy || !loading) return
      isDestroy = true
      loading.type = 'info'
      loading.content = text
      await delay(delayTime)
      loading.destroy()
    },
    destroy() {
      stop()
      if (isDestroy || !loading) return
      isDestroy = true
      loading.destroy()
    },
    [Symbol.dispose]() {
      this.destroy()
    },
    instance: loading
  }
  return ctx
}

type PromiseWith<T, D> = Promise<T> & Partial<D>
export const createDialog = (options: DialogOptions & { style?: CSSProperties }) => {
  let success = noop
  let fail = noop
  const result: PromiseWith<void, { ins: DialogReactive }> = new Promise<void>((s, f) => { success = s; fail = f })
  const show = shallowRef(true)
  const [zIndex, isLast, stopUse] = useZIndex(show)
  const stopStyleWatch = watch(zIndex, zIndex => (dialog.style as CSSProperties).zIndex = zIndex)
  const stopRouterBreak = window.$router.beforeEach(() => {
    if (isLast) return failStop()
    return true
  })
  const stop = () => {
    stopStyleWatch()
    stopUse()
    stopRouterBreak()
    dialog.destroy()
    return show.value = false
  }
  const failStop = () => {
    fail()
    stop()
    return false
  }
  const successStop = () => {
    success()
    stop()
  }
  const dialog = window.$dialog.create({
    positiveText: '确定',
    negativeText: '取消',
    ...options,
    style: {
      ...(options.style ?? {}),
      zIndex: zIndex.value
    },
    async onClose() {
      if ((await options.onClose?.()) === false) return false
      else show.value = false; failStop()
    },
    async onPositiveClick(e) {
      if ((await (options.onPositiveClick ?? noop)(e)) === false) return false
      else successStop()
    },
    async onNegativeClick(e) {
      const ret = await (options.onNegativeClick ?? noop)(e)
      if (ret) return ret
      else failStop()
    },
    onEsc() {
      options.onEsc?.()
      failStop()
    },
    onMaskClick(e) {
      options.onMaskClick?.(e)
      failStop()
    },
    onAfterLeave() {
      options.onAfterLeave?.()
      stop()
    }
  })
  result.ins = dialog
  return result
}



export interface DownloadMessageProgress extends DownloadMessageLoading {
  /** 0~100 */  progress: number
}
export interface DownloadMessageLoading {
  description: string
  retryable: boolean
}
export interface DownloadMessageBind {
  createProgress<TResult>(title: string, fn: (ins: Reactive<DownloadMessageProgress>) => Promise<TResult>): Promise<TResult>
  createLoading<TResult>(title: string, fn: (ins: Reactive<DownloadMessageLoading>) => Promise<TResult>): Promise<TResult>
}
const allDownloadMessagesIsMinsize = useGlobalVar(reactive(new Array<boolean | undefined>()), 'utils/message/allDownloadMessagesIsMinsize')
export const createDownloadMessage = async <T,>(title: string, bind: (method: DownloadMessageBind) => Promise<T>): Promise<T> => {
  const index = allDownloadMessagesIsMinsize.length
  allDownloadMessagesIsMinsize[index] = false
  const isAllDone = ref(false)
  const messageList = reactive(new Array<{
    title: string
    description: string
    retry?: () => any
    progress?: number
    pc: PromiseWithResolvers<any>
  } & ({
    state: 'success' | undefined
  } | {
    state: 'error'
    error: Error
  })>())
  const minsize = ref(false)
  const minsizeWatcher = watch(minsize, min => {
    if (min) allDownloadMessagesIsMinsize[index] = true
    else allDownloadMessagesIsMinsize[index] = false
  }, { immediate: true })
  const indexOnMinList = computed(() => {
    const afters = allDownloadMessagesIsMinsize.slice(0, index)
    return afters.filter(v => v).length
  })

  const message = window.$message.create(title, {
    render: $props => (<motion.div drag="y"
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
      variants={{
        minsize: {
          borderRadius: '100%',
          width: '30px',
          height: '30px',
          paddingInline: '2px',
          paddingBlock: '2px',
          position: 'fixed',
          left: `${indexOnMinList.value * 40 + 8}px`,
          top: 'calc(var(--safe-area-inset-top) + 4px)',
        },
        maxsize: {
          borderRadius: '8px',
          width: '90vw',
          paddingInline: '8px',
          paddingBlock: '12px',
          height: 'fit-content'
        }
      }}
      onDragEnd={(_, { offset }) => (offset.y < -30) && (minsize.value = true)}
      animate={minsize.value ? 'minsize' : 'maxsize'}
      class="bg-(--n-color) overflow-hidden"
      style={{ boxShadow: 'var(--n-box-shadow)' }}
    >
      <Transition name="van-fade">
        {
          minsize.value ?
            <div class="size-full relative" onClick={() => minsize.value = false}>
              <Loading class="absolute top-0 left-0 size-full" color="var(--p-color)" />
              <NIcon class="absolute! top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " size="18px" color="var(--p-color)">
                {
                  messageList.some(v => v.state == 'error') ?
                    <Icon name="cross" />
                    : <FileDownloadRound />
                }
              </NIcon>
            </div>
            :
            <div class="w-full relative">
              <div class='font-semibold text-base flex items-center gap-2'>
                <span>{$props.content}</span>
                {isAllDone.value && <NIconWrapper size={18} color="var(--nui-success-color)" borderRadius={114514} >
                  <NIcon size={12}>
                    <DoneRound />
                  </NIcon>
                </NIconWrapper>}
              </div>
              {/* content */}
              {/* @ts-ignore class应当存在 */}
              <TransitionGroup name="list" tag="ul" class="w-full! h-fit ml-1!">
                {
                  messageList.map((v, index) => (
                    <div class="w-full py-1 van-hairline--bottom" key={index} >
                      <span class="font-semibold text-sm">{v.title}</span>
                      <div class="w-full h-fit relative">
                        <NProgress
                          percentage={isNumber(v.progress) ? v.progress : 100}
                          indicatorPlacement="inside"
                          processing={isUndefined(v.state)}
                          type="line"
                          showIndicator={false}
                          show-indicator={false}
                          class={["**:in-[.n-progress-graph-line-fill]:hidden! transition-all",
                            (v.state == 'error' && v.retry) ? 'w-[60%]!' : 'w-[95%]!'
                          ]}
                          height={7}
                          status={v.state}
                        />
                        <Transition name="van-slide-right">
                          {
                            withDirectives(
                              (<div class="absolute! ease-in-out! right-[4%] top-1/2 -translate-y-1/2 flex gap-3">
                                <NButton tertiary circle onClick={() => {
                                  if (v.state != 'error') return
                                  v.retry = undefined
                                  v.pc.reject(v.error)
                                }} class="size-10!">{{
                                  icon: () => (<NIcon>
                                    <CloseRound />
                                  </NIcon>)
                                }}</NButton>
                                <NButton tertiary circle onClick={v.retry} class="size-10!">{{
                                  icon: () => (<NIcon>
                                    <ReloadOutlined />
                                  </NIcon>)
                                }}</NButton>
                              </div>), [
                              [vShow, (v.state == 'error' && v.retry)]
                            ])
                          }
                        </Transition>
                      </div>
                      <div class="text-xs text-(--van-text-color-2) h-4!">{(v.state == 'error' && `${v.error.name}: ${v.error.message}`) || v.description || '...'}</div>
                    </div>
                  ))
                }
              </TransitionGroup>
              <div class="rounded-lg w-10 bg-(--nui-divider-color) h-1 absolute -bottom-2 left-1/2 -translate-x-1/2"></div>
            </div>
        }
      </Transition >
    </motion.div >),
    duration: 0,
  })

  const createLine = <T extends object, TResult extends PromiseLike<any>,>(title: string, config: T, fn: (config: Reactive<{ description: string, retryable: boolean } & T>) => TResult) => {
    const pc = Promise.withResolvers<Awaited<TResult>>()
    const state = ref<(typeof messageList)[number]['state']>()
    const _config = reactive({
      description: '',
      retryable: false,
      ...config
    })
    let error = new Error
    const index = messageList.length
    const watcher = watch([_config, state], ([, state]) => {
      messageList[index] = {
        title,
        state,
        error,
        pc,
        retry: _config.retryable ? call : undefined,
        ..._config
      }
    }, { immediate: true })
    const call = async () => {
      state.value = undefined
      _config.description = ''
      _config.retryable = false
      for (const key in config) {
        if (!Object.hasOwn(config, key)) continue
        const element = config[key]
        _config[key as keyof typeof _config] = element as any
      }
      try {
        const v = await fn(_config)
        state.value = 'success'
        await nextTick()
        watcher.stop()
        pc.resolve(v)
      } catch (err) {
        if (isError(err)) {
          error = err
        } else {
          error = new Error(toString(err))
        }
        state.value = 'error'
        await nextTick()
        if (!_config.retryable) {
          watcher.stop()
          pc.reject(err)
        }
      }
    }
    call()
    return pc.promise
  }

  const createProgress: DownloadMessageBind['createProgress'] = (title, fn) => {
    return createLine(title, { progress: 0 }, fn)
  }
  const createLoading: DownloadMessageBind['createLoading'] = (title, fn) => {
    return createLine(title, {}, fn)
  }
  const bindInstance = bind({
    createProgress,
    createLoading
  })
  const controller = Promise.withResolvers<T>()
  bindInstance
    .then(async result => {
      minsize.value = false // 最小化就展开提醒
      isAllDone.value = true // 展示完成标
      const maybeError = messageList.find(v => v.state == 'error')
      if (maybeError) throw maybeError.error
      controller.resolve(result)

      delay(3000).then(() => {
        minsize.value = true
      }) // 到时间自动关
      await nextTick()
      await until(minsize).toBeTruthy()

      minsizeWatcher.stop()
      message.destroy()
      allDownloadMessagesIsMinsize[index] = undefined

    })
  bindInstance
    .catch(async err => {
      controller.reject(err)
      minsize.value = false // 最小化就展开提醒

      delay(3000).then(() => {
        minsize.value = true
      }) // 到时间自动关
      await nextTick()
      await until(minsize).toBeTruthy()

      minsizeWatcher.stop()
      message.destroy()
      allDownloadMessagesIsMinsize[index] = undefined
    })

  return controller.promise
}
