import type { useDialog, useLoadingBar, useMessage } from 'naive-ui'
import type { Router } from 'vue-router'
import {} from 'axios'

declare global {
  interface Window {
    $message: ReturnType<typeof useMessage>
    $loading: ReturnType<typeof useLoadingBar>
    $dialog: ReturnType<typeof useDialog>
    $api: Record<string, any>
    $$lib$$: Record<ExternalLibKey[keyof ExternalLibKey], any>
    $$safe$$: boolean
    $router: Router
    $isDev: boolean
  }
}

declare module 'axios' {
  interface AxiosRequestConfig {
    __retryCount?: number
    disretry?: boolean
    allowEmpty?: boolean
  }
}

export interface ExternalLibKey {
  'vue': 'Vue'
  'vant': 'Vant'
  'naive-ui': 'Naive'
  'axios': 'Axios'
  'vue-router': 'VR'
  'pinia': 'Pinia'
  '@delta-comic/ui': 'DcUi'
  '@delta-comic/model': 'DcModel'
}
export const extendsDepends: {
  [K in keyof ExternalLibKey]: `window.$$lib$$.${ExternalLibKey[K]}`
} = {
  'vue': 'window.$$lib$$.Vue',
  'vant': 'window.$$lib$$.Vant',
  'naive-ui': 'window.$$lib$$.Naive',
  'axios': 'window.$$lib$$.Axios',
  'pinia': 'window.$$lib$$.Pinia',
  'vue-router': 'window.$$lib$$.VR',
  '@delta-comic/ui': 'window.$$lib$$.DcUi',
  '@delta-comic/model': 'window.$$lib$$.DcModel'
}

export const useGlobalVar = <T>(val: T, key: string): T =>
  ((window.$api.__core_lib__ ??= {})[key] ??= val)

export { SmartAbortController } from './request'