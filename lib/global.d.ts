import { type useMessage, type useLoadingBar, type useDialog } from 'naive-ui'
import type { Router } from 'vue-router'
import { uni } from './struct'
import { Utils } from './utils'
import { Component } from 'vue'
import { ExternalLibKey } from '../external'
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

declare module 'vue-router' {
  interface Router {
    force: {
      push: Router['push']
      replace: Router['replace']
    }
  }
  interface RouteMeta {
    statusBar?: {
      style?: 'light' | 'dark' | 'auto'
    }
    force?: boolean
  }
}